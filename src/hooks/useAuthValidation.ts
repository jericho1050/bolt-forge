import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
}

export function useAuthValidation<T>(schema: ZodSchema<T>) {
  const [validation, setValidation] = useState<ValidationState>({
    errors: {},
    isValid: false,
    isValidating: false,
  });

  const validateField = useCallback(
    (fieldName: string, value: any, formData?: Partial<T>) => {
      try {
        // For single field validation, create a partial object
        const dataToValidate = formData || { [fieldName]: value };
        schema.parse(dataToValidate);
        
        setValidation(prev => ({
          ...prev,
          errors: { ...prev.errors, [fieldName]: '' },
        }));
        
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors.find(err => 
            err.path.includes(fieldName)
          );
          
          if (fieldError) {
            setValidation(prev => ({
              ...prev,
              errors: { ...prev.errors, [fieldName]: fieldError.message },
            }));
          }
        }
        return false;
      }
    },
    [schema]
  );

  const validateForm = useCallback(
    async (data: T): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
      setValidation(prev => ({ ...prev, isValidating: true }));
      
      try {
        await schema.parseAsync(data);
        setValidation({
          errors: {},
          isValid: true,
          isValidating: false,
        });
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string> = {};
          error.errors.forEach(err => {
            const fieldName = err.path[0] as string;
            errors[fieldName] = err.message;
          });
          
          setValidation({
            errors,
            isValid: false,
            isValidating: false,
          });
          
          return { isValid: false, errors };
        }
        
        setValidation(prev => ({ ...prev, isValidating: false }));
        return { isValid: false, errors: { general: 'Validation failed' } };
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setValidation({
      errors: {},
      isValid: false,
      isValidating: false,
    });
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidation(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: '' },
    }));
  }, []);

  return {
    ...validation,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
  };
}