import { useState, useEffect, useCallback } from 'react';
import { profileRepository } from '../lib/database/repositories/ProfileRepository';
import { projectRepository } from '../lib/database/repositories/ProjectRepository';
import { skillRepository, userSkillRepository } from '../lib/database/repositories/SkillRepository';
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
 * Hook for profile operations
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

/**
 * Hook for project operations
 */
export function useProjects() {
  const { loading, error, executeOperation, clearError } = useDatabase();
  const [projects, setProjects] = useState<any[]>([]);

  const fetchProjects = useCallback(async (status: string = 'open', options: any = {}) => {
    const result = await executeOperation(
      () => projectRepository.findByStatus(status as any, options),
      'fetchProjects'
    );

    if (result) {
      setProjects(result.data || []);
    }

    return result;
  }, [executeOperation]);

  const fetchProject = useCallback(async (id: string) => {
    return executeOperation(
      () => projectRepository.findWithDetails(id),
      'fetchProject'
    );
  }, [executeOperation]);

  const createProject = useCallback(async (data: any) => {
    const result = await executeOperation(
      () => projectRepository.create(data),
      'createProject'
    );

    if (result) {
      setProjects(prev => [result, ...prev]);
    }

    return result;
  }, [executeOperation]);

  const updateProject = useCallback(async (id: string, data: any) => {
    const result = await executeOperation(
      () => projectRepository.update(id, data),
      'updateProject'
    );

    if (result) {
      setProjects(prev => prev.map(p => p.id === id ? result : p));
    }

    return result;
  }, [executeOperation]);

  const searchProjects = useCallback(async (searchTerm: string, options: any = {}) => {
    const result = await executeOperation(
      () => projectRepository.search(searchTerm, options),
      'searchProjects'
    );

    if (result) {
      setProjects(result.data || []);
    }

    return result;
  }, [executeOperation]);

  const getFeaturedProjects = useCallback(async (limit: number = 10) => {
    return executeOperation(
      () => projectRepository.getFeatured(limit),
      'getFeaturedProjects'
    );
  }, [executeOperation]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    searchProjects,
    getFeaturedProjects,
    clearError,
  };
}

/**
 * Hook for skill operations
 */
export function useSkills() {
  const { loading, error, executeOperation, clearError } = useDatabase();
  const [skills, setSkills] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);

  const fetchSkills = useCallback(async () => {
    const result = await executeOperation(
      () => skillRepository.findAll(),
      'fetchSkills'
    );

    if (result) {
      setSkills(result);
    }

    return result;
  }, [executeOperation]);

  const fetchSkillsByCategory = useCallback(async (category: string) => {
    return executeOperation(
      () => skillRepository.findByCategory(category),
      'fetchSkillsByCategory'
    );
  }, [executeOperation]);

  const fetchUserSkills = useCallback(async (userId: string) => {
    const result = await executeOperation(
      () => userSkillRepository.findByUserId(userId),
      'fetchUserSkills'
    );

    if (result) {
      setUserSkills(result);
    }

    return result;
  }, [executeOperation]);

  const addUserSkill = useCallback(async (userId: string, skillId: string, proficiency: number) => {
    const result = await executeOperation(
      () => userSkillRepository.addUserSkill(userId, skillId, proficiency),
      'addUserSkill'
    );

    if (result) {
      // Refresh user skills
      await fetchUserSkills(userId);
    }

    return result;
  }, [executeOperation, fetchUserSkills]);

  const updateUserSkill = useCallback(async (userSkillId: string, proficiency: number) => {
    const result = await executeOperation(
      () => userSkillRepository.updateProficiency(userSkillId, proficiency),
      'updateUserSkill'
    );

    if (result) {
      setUserSkills(prev => prev.map(us => us.id === userSkillId ? result : us));
    }

    return result;
  }, [executeOperation]);

  const removeUserSkill = useCallback(async (userId: string, skillId: string) => {
    const result = await executeOperation(
      () => userSkillRepository.removeUserSkill(userId, skillId),
      'removeUserSkill'
    );

    if (result !== null) {
      setUserSkills(prev => prev.filter(us => us.skill_id !== skillId));
    }

    return result;
  }, [executeOperation]);

  const searchSkills = useCallback(async (searchTerm: string) => {
    return executeOperation(
      () => skillRepository.search(searchTerm),
      'searchSkills'
    );
  }, [executeOperation]);

  const getPopularSkills = useCallback(async (limit: number = 20) => {
    return executeOperation(
      () => skillRepository.getPopular(limit),
      'getPopularSkills'
    );
  }, [executeOperation]);

  return {
    skills,
    userSkills,
    loading,
    error,
    fetchSkills,
    fetchSkillsByCategory,
    fetchUserSkills,
    addUserSkill,
    updateUserSkill,
    removeUserSkill,
    searchSkills,
    getPopularSkills,
    clearError,
  };
}

/**
 * Hook for application configuration
 */
export function useAppConfig() {
  const [config, setConfig] = useState({
    categories: [] as string[],
    difficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
    userTypes: ['developer', 'company'],
    projectStatuses: ['draft', 'open', 'in_progress', 'completed', 'cancelled'],
  });

  const { executeOperation } = useDatabase();

  const loadConfig = useCallback(async () => {
    const categories = await executeOperation(
      () => skillRepository.getCategories(),
      'loadCategories'
    );

    if (categories) {
      setConfig(prev => ({ ...prev, categories }));
    }
  }, [executeOperation]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loadConfig,
  };
}