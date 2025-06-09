import { useState, useEffect } from 'react';
import { supabase, Project } from '../lib/supabase';

export function useProjects(filters?: {
  category?: string;
  difficulty?: string;
  search?: string;
  status?: string;
  companyId?: string;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('projects')
        .select(`
          *,
          company:profiles!projects_company_id_fkey(*),
          project_tags(
            *,
            skill:skills(*)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      let filteredData = data || [];

      // Apply search filter (client-side for now)
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(project =>
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.project_tags?.some(tag => 
            tag.skill?.name.toLowerCase().includes(searchTerm)
          )
        );
      }

      setProjects(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh projects list
      await fetchProjects();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create project') };
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh projects list
      await fetchProjects();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update project') };
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh projects list
      await fetchProjects();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to delete project') };
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}