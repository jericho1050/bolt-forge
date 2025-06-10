import { useState, useCallback } from 'react';
import { profileRepository } from '../lib/database/repositories/ProfileRepository';
import { dbCache } from '../lib/database/cache';

/**
 * Custom hook for database operations with loading states and error handling
 */
export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Executing ${operationName}...`);
      const result = await operation();
      
      console.log(`✅ ${operationName} completed successfully`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      console.error(`❌ ${operationName} failed:`, err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    executeOperation,
    clearError: () => setError(null),
  };
}

/**
 * Hook for profile operations using repository pattern
 */
export function useProfiles() {
  const { loading, error, executeOperation, clearError } = useDatabase();
  const [profiles, setProfiles] = useState<any[]>([]);

  const fetchProfiles = useCallback(async (userType?: 'developer' | 'company') => {
    const result = await executeOperation(
      () => userType 
        ? profileRepository.findByUserType(userType)
        : profileRepository.findAll(),
      'fetchProfiles'
    );

    if (result) {
      setProfiles(Array.isArray(result) ? result : result.data || []);
    }
  }, [executeOperation]);

  const fetchProfile = useCallback(async (id: string) => {
    return executeOperation(
      () => profileRepository.findById(id),
      'fetchProfile'
    );
  }, [executeOperation]);

  const updateProfile = useCallback(async (id: string, data: any) => {
    const result = await executeOperation(
      () => profileRepository.update(id, data),
      'updateProfile'
    );

    if (result) {
      // Update local state
      setProfiles(prev => prev.map(p => p.id === id ? result : p));
      // Clear cache
      dbCache.delete(`ProfileRepository.findById:["${id}"]`);
    }

    return result;
  }, [executeOperation]);

  const searchProfiles = useCallback(async (searchTerm: string, userType?: 'developer' | 'company') => {
    const result = await executeOperation(
      () => profileRepository.search(searchTerm, userType),
      'searchProfiles'
    );

    if (result) {
      setProfiles(result.data || []);
    }

    return result;
  }, [executeOperation]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    fetchProfile,
    updateProfile,
    searchProfiles,
    clearError,
  };
}
