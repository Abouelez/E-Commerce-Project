export default class Order {
    static url = 'http://localhost:3000/orders';
    
    static async getAll() {
        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            
            const orders = await response.json();
            
            // Fetch customer details for each order
            for (const order of orders) {
                if (order.customerId) {
                    try {
                        const customerResponse = await fetch(`http://localhost:3000/users/${order.customerId}`);
                        if (customerResponse.ok) {
                            const customer = await customerResponse.json();
                            order.customer = {
                                name: customer.name,
                                email: customer.email,
                                phone: customer.phone || 'N/A'
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching customer for order ${order.id}:`, error);
                    }
                }
                
                // Fetch product details for each order
                if (order.products && Array.isArray(order.products)) {
                    for (const item of order.products) {
                        if (item.productId) {
                            try {
                                const productResponse = await fetch(`http://localhost:3000/products/${item.productId}`);
                                if (productResponse.ok) {
                                    const product = await productResponse.json();
                                    item.name = product.name;
                                    item.price = product.price;
                                    item.image = product.image;
                                }
                            } catch (error) {
                                console.error(`Error fetching product for order ${order.id}:`, error);
                            }
                        }
                    }
                }
            }
            
            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }
    
    static async getById(id) {
        try {
            const response = await fetch(`${this.url}/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch order with id ${id}`);
            }
            
            const order = await response.json();
            
            // Fetch customer details
            if (order.customerId) {
                try {
                    const customerResponse = await fetch(`http://localhost:3000/users/${order.customerId}`);
                    if (customerResponse.ok) {
                        const customer = await customerResponse.json();
                        order.customer = {
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone || 'N/A'
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching customer for order ${id}:`, error);
                }
            }
            
            // Fetch product details
            if (order.products && Array.isArray(order.products)) {
                let subtotal = 0;
                
                for (const item of order.products) {
                    if (item.productId) {
                        try {
                            const productResponse = await fetch(`http://localhost:3000/products/${item.productId}`);
                            if (productResponse.ok) {
                                const product = await productResponse.json();
                                item.name = product.name;
                                item.price = product.price;
                                item.image = product.image;
                                
                                // Calculate item total
                                const itemTotal = item.price * item.quantity;
                                subtotal += itemTotal;
                            }
                        } catch (error) {
                            console.error(`Error fetching product for order ${id}:`, error);
                        }
                    }
                }
                
                // Calculate order totals if not already present
                if (!order.subtotal) {
                    order.subtotal = subtotal;
                    order.shipping = order.shipping || 0;
                    order.tax = order.tax || (subtotal * 0.1); // Assume 10% tax if not specified
                    order.total = order.subtotal + order.shipping + order.tax;
                }
            }
            
            return order;
        } catch (error) {
            console.error(`Error fetching order with id ${id}:`, error);
            return null;
        }
    }
    
    static async updateStatus(id, status, note) {
        try {
            // Get current order first
            const getResponse = await fetch(`${this.url}/${id}`);
            if (!getResponse.ok) {
                throw new Error(`Failed to fetch order with id ${id}`);
            }
            
            const order = await getResponse.json();
            
            // Update status fields
            order.status = status;
            order.statusNote = note || order.statusNote;
            order.statusUpdatedAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();
            
            // Send update to server
            const response = await fetch(`${this.url}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to update status for order with id ${id}`);
            }
            
            return true;
        } catch (error) {
            console.error(`Error updating status for order with id ${id}:`, error);
            throw error;
        }
    }
    
    static async create(orderData) {
        try {
            // Add timestamps
            orderData.createdAt = new Date().toISOString();
            orderData.updatedAt = new Date().toISOString();
            
            // Send to server
            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create order');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
}

