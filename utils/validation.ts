export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

export interface ValidationErrors {
  [key: string]: string[]
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const commonRules = {
  required: (message: string): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message
  }),
  email: (message: string): ValidationRule => ({
    test: (value) => emailRegex.test(value),
    message
  }),
  minLength: (length: number, message: string): ValidationRule => ({
    test: (value) => value.length >= length,
    message
  }),
  maxLength: (length: number, message: string): ValidationRule => ({
    test: (value) => value.length <= length,
    message
  })
}

export function validateField(value: string, rules: ValidationRule[]): string[] {
  return rules
    .filter(rule => !rule.test(value))
    .map(rule => rule.message)
}

export function validateForm(values: { [key: string]: string }, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {}

  Object.keys(rules).forEach(field => {
    const fieldErrors = validateField(values[field], rules[field])
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
    }
  })

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

export function getFirstError(fieldErrors: string[] | undefined): string {
  return fieldErrors?.[0] || ''
}

// Example usage:
/*
const contactFormRules = {
  name: [
    commonRules.required('Name is required'),
    commonRules.maxLength(50, 'Name must be less than 50 characters')
  ],
  email: [
    commonRules.required('Email is required'),
    commonRules.email('Please enter a valid email address')
  ],
  message: [
    commonRules.required('Message is required'),
    commonRules.minLength(10, 'Message must be at least 10 characters'),
    commonRules.maxLength(1000, 'Message must be less than 1000 characters')
  ]
}
*/