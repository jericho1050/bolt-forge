import { useState, useEffect } from 'react';
import { supabase, Skill, UserSkill } from '../lib/supabase';

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        setError(error.message);
        return;
      }

      setSkills(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    skills,
    loading,
    error,
    refetch: fetchSkills,
  };
}

export function useUserSkills(userId?: string) {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserSkills();
    }
  }, [userId]);

  const fetchUserSkills = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('user_id', userId)
        .order('proficiency_level', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setUserSkills(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addUserSkill = async (skillId: string, proficiencyLevel: number) => {
    if (!userId) return { error: new Error('No user ID provided') };

    try {
      const { data, error } = await supabase
        .from('user_skills')
        .insert([
          {
            user_id: userId,
            skill_id: skillId,
            proficiency_level: proficiencyLevel,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh user skills
      await fetchUserSkills();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to add skill') };
    }
  };

  const updateUserSkill = async (userSkillId: string, proficiencyLevel: number) => {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .update({ proficiency_level })
        .eq('id', userSkillId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh user skills
      await fetchUserSkills();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to update skill') };
    }
  };

  const removeUserSkill = async (userSkillId: string) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', userSkillId);

      if (error) {
        throw error;
      }

      // Refresh user skills
      await fetchUserSkills();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to remove skill') };
    }
  };

  return {
    userSkills,
    loading,
    error,
    refetch: fetchUserSkills,
    addUserSkill,
    updateUserSkill,
    removeUserSkill,
  };
}