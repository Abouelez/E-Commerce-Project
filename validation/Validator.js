
export default class Validator {
    static async validate(data, rules) {
        const errors = {};
        for (let field in rules) {
            let _rules = rules[field];
            let val = data[field];

            // Split rules to apply each rule
            let ruleArr = _rules.split('|');
            for (let rule of ruleArr) {
                let [ruleName, param] = rule.split(':');
                
                if (ruleName === 'required') {
                    if (val === undefined || (typeof val === 'string' && val.trim() === "") || val === null) {
                        errors[field] = `${field} is required.`;
                        break;
                    }
                }

                if (ruleName === 'type') {
                    if (val !== undefined && typeof val !== param) {
                        errors[field] = `${field} must be a ${param}.`;
                        break;
                    }
                }

                if (ruleName === 'minLength') {
                    if (typeof val === 'string' && val.length < parseInt(param)) {
                        errors[field] = `${field} must be at least ${param} characters.`;
                        break;
                    }
                }

                if (ruleName === 'maxLength') {
                    if (typeof val === 'string' && val.length > parseInt(param)) {
                        errors[field] = `${field} must be no more than ${param} characters.`;
                        break;
                    }
                }

                if (ruleName === 'regex') {
                    const regex = new RegExp(param);
                    if (typeof val === 'string' && !regex.test(val)) {
                        errors[field] = `${field} format is invalid.`;
                        break;
                    }
                }
                
                if (ruleName === 'unique') {
                    // Format: unique:ModelClass,field,id
                    const [modelClass, fieldName, id] = param.split(',');
                    try {
                        const Model = await import(`../models/${modelClass}.js`).then(m => m.default);
                        const existing = await Model.getAll();
                        const isDuplicate = existing.some(item => 
                            item[fieldName] === val && (!id || item.id !== parseInt(id))
                        );
                        
                        if (isDuplicate) {
                            errors[field] = `${field} must be unique.`;
                            break;
                        }
                    } catch (error) {
                        console.error('Validation error:', error);
                        errors[field] = `Error validating ${field}.`;
                        break;
                    }
                }
            }
        }
        return Object.keys(errors).length === 0 ? null : errors;
    }
}