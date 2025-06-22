import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  touched: Record<string, boolean>;
}

export function useAuthValidation<T>(schema: ZodSchema<T>) {
  const [validation, setValidation] = useState<ValidationState>({
    errors: {},
    isValid: false,
    isValidating: false,
    touched: {},
  });

  const markFieldTouched = useCallback((fieldName: string) => {
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true },
    }));
  }, []);

  const validateField = useCallback(
    (fieldName: string, value: any, formData?: Partial<T>) => {
      try {
        // For single field validation, create a partial object
        const dataToValidate = formData || { [fieldName]: value };
        
        // Attempt to parse just this field with the schema
        // For partial validation, we'll use safeParse to avoid throwing
        const result = schema.safeParse(dataToValidate);
        
        if (result.success || !result.error.errors.some(err => err.path.includes(fieldName))) {
          // Clear error if validation passes or if no error for this field
          setValidation(prev => ({
            ...prev,
            errors: { ...prev.errors, [fieldName]: '' },
          }));
          return true;
        } else {
          // Find error for this specific field
          const fieldError = result.error.errors.find(err => 
            err.path.includes(fieldName)
          );
          
          if (fieldError) {
            setValidation(prev => ({
              ...prev,
              errors: { ...prev.errors, [fieldName]: fieldError.message },
            }));
          }
          return false;
        }
      } catch (error) {
        // Fallback error handling
        setValidation(prev => ({
          ...prev,
          errors: { ...prev.errors, [fieldName]: 'Validation error' },
        }));
        return false;
      }
    },
    [schema]
  );

  const validateForm = useCallback(
    async (data: T): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
      setValidation(prev => ({ ...prev, isValidating: true }));
      
      try {
        // Validate the entire form
        await schema.parseAsync(data);
        
        // If validation passes, clear all errors
        setValidation(prev => ({
          ...prev,
          errors: {},
          isValid: true,
          isValidating: false,
        }));
        
        return { isValid: true, errors: {} };
        
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {};
          const touched: Record<string, boolean> = {};
          
          // Process all validation errors
          error.errors.forEach(err => {
            const fieldName = err.path[0] as string;
            if (fieldName) {
              errors[fieldName] = err.message;
              touched[fieldName] = true;
            }
          });
          
          setValidation(prev => ({
            ...prev,
            errors,
            touched: { ...prev.touched, ...touched },
            isValid: false,
            isValidating: false,
          }));
          
          return { isValid: false, errors };
        }
        
        // Handle unexpected validation errors
        const generalError = { general: 'Validation failed. Please check your input.' };
        setValidation(prev => ({ 
          ...prev, 
          errors: generalError,
          isValidating: false,
          isValid: false 
        }));
        
        return { isValid: false, errors: generalError };
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setValidation({
      errors: {},
      isValid: false,
      isValidating: false,
      touched: {},
    });
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidation(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: '' },
    }));
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setValidation(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: error },
      touched: { ...prev.touched, [fieldName]: true },
    }));
  }, []);

  return {
    ...validation,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    markFieldTouched,
    setFieldError,
  };
}