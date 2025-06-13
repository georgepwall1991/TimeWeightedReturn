// Input Validation Utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class InputValidator {
  // Validate date strings
  static validateDate(dateString: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!dateString) {
      errors.push('Date is required');
      return { isValid: false, errors, warnings };
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
      return { isValid: false, errors, warnings };
    }

    // Check if date is too far in the past (more than 50 years)
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);

    if (date < fiftyYearsAgo) {
      warnings.push('Date is more than 50 years ago');
    }

    // Check if date is in the future
    if (date > new Date()) {
      errors.push('Date cannot be in the future');
      return { isValid: false, errors, warnings };
    }

    return { isValid: true, errors, warnings };
  }

  // Validate date ranges
  static validateDateRange(startDate: string, endDate: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const startValidation = this.validateDate(startDate);
    const endValidation = this.validateDate(endDate);

    // Combine validation errors
    errors.push(...startValidation.errors, ...endValidation.errors);
    warnings.push(...startValidation.warnings, ...endValidation.warnings);

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      errors.push('Start date must be before end date');
      return { isValid: false, errors, warnings };
    }

    // Check for unreasonably long periods (more than 10 years)
    const daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference > 3650) { // 10 years
      warnings.push('Date range is longer than 10 years. Performance calculations may be slow.');
    }

    if (daysDifference < 1) {
      warnings.push('Date range is less than 1 day. Results may not be meaningful.');
    }

    return { isValid: true, errors, warnings };
  }

  // Validate GUID/UUID format
  static validateGuid(guid: string): ValidationResult {
    const errors: string[] = [];

    if (!guid) {
      errors.push('ID is required');
      return { isValid: false, errors, warnings: [] };
    }

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!guidRegex.test(guid)) {
      errors.push('Invalid ID format');
      return { isValid: false, errors, warnings: [] };
    }

    return { isValid: true, errors: [], warnings: [] };
  }

  // Validate numeric values
  static validateNumber(value: string | number, options?: {
    min?: number;
    max?: number;
    allowNegative?: boolean;
    allowZero?: boolean;
    decimals?: number;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value === '' || value === null || value === undefined) {
      errors.push('Value is required');
      return { isValid: false, errors, warnings };
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num) || !isFinite(num)) {
      errors.push('Invalid number format');
      return { isValid: false, errors, warnings };
    }

    const opts = { allowNegative: true, allowZero: true, ...options };

    if (!opts.allowNegative && num < 0) {
      errors.push('Negative values are not allowed');
    }

    if (!opts.allowZero && num === 0) {
      errors.push('Zero values are not allowed');
    }

    if (opts.min !== undefined && num < opts.min) {
      errors.push(`Value must be at least ${opts.min}`);
    }

    if (opts.max !== undefined && num > opts.max) {
      errors.push(`Value must be at most ${opts.max}`);
    }

    if (opts.decimals !== undefined) {
      const decimals = num.toString().split('.')[1]?.length || 0;
      if (decimals > opts.decimals) {
        warnings.push(`Value has ${decimals} decimal places, expected ${opts.decimals}`);
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Sanitize string input
  static sanitizeString(input: string): string {
    if (!input) return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[{}]/g, '') // Remove potential JSON injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  // Validate search terms
  static validateSearchTerm(searchTerm: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (searchTerm.length > 100) {
      errors.push('Search term is too long (maximum 100 characters)');
    }

    // Check for potentially malicious patterns
    const dangerousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
      /<[^>]*>/,
      /\{.*\}/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(searchTerm)) {
        errors.push('Search term contains invalid characters');
        break;
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Validate file uploads
  static validateFile(file: File, options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const opts = {
      maxSize: 10 * 1024 * 1024, // 10MB default
      allowedTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      allowedExtensions: ['.csv', '.xls', '.xlsx'],
      ...options
    };

    if (file.size > opts.maxSize) {
      errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(opts.maxSize / 1024 / 1024)}MB)`);
    }

    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
      errors.push(`File type "${file.type}" is not allowed`);
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (opts.allowedExtensions && !opts.allowedExtensions.includes(extension)) {
      errors.push(`File extension "${extension}" is not allowed`);
    }

    // Warn about potentially problematic files
    if (file.name.includes(' ')) {
      warnings.push('File name contains spaces. Consider using underscores or hyphens.');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}

// React hook for form validation
export const useFormValidation = () => {
  const validateForm = (formData: Record<string, unknown>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const sanitized = InputValidator.sanitizeString(value);
        if (sanitized !== value) {
          warnings.push(`Field "${key}" was sanitized`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  };

  return { validateForm };
};

// Validation messages for UI
export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  invalidDate: 'Please enter a valid date',
  invalidDateRange: 'Start date must be before end date',
  invalidNumber: 'Please enter a valid number',
  tooLarge: (max: number) => `Value cannot exceed ${max}`,
  tooSmall: (min: number) => `Value cannot be less than ${min}`,
  invalidFormat: 'Invalid format',
  networkError: 'Network connection failed. Please check your internet connection.',
  serverError: 'Server error occurred. Please try again later.',
} as const;
