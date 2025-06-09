import { BaseRepository } from './BaseRepository';
import { Skill, SkillInsert, SkillUpdate, UserSkill, UserSkillInsert, UserSkillUpdate } from '../types';
import { supabase } from '../connection';

/**
 * Skill Repository
 * Handles all skill-related database operations
 */
export class SkillRepository extends BaseRepository<Skill, SkillInsert, SkillUpdate> {
  constructor() {
    super('skills');
  }

  /**
   * Find skills by category
   */
  public async findByCategory(category: string): Promise<Skill[]> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    return this.executeQuery<Skill[]>(query, 'findByCategory');
  }

  /**
   * Get all categories
   */
  public async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('category')
      .order('category', { ascending: true });

    if (error) {
      this.handleError(error, 'getCategories');
    }

    const categories = [...new Set(data?.map(item => item.category) || [])];
    this.logSuccess('getCategories', categories);
    return categories;
  }

  /**
   * Search skills by name
   */
  public async search(searchTerm: string): Promise<Skill[]> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true });

    return this.executeQuery<Skill[]>(query, 'search');
  }

  /**
   * Get popular skills (most used)
   */
  public async getPopular(limit: number = 20): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        skills(name, category, icon),
        count()
      `)
      .not('skill_id', 'is', null)
      .order('count', { ascending: false })
      .limit(limit);

    if (error) {
      this.handleError(error, 'getPopular');
    }

    this.logSuccess('getPopular', data);
    return data || [];
  }

  /**
   * Get skills grouped by category
   */
  public async getGroupedByCategory(): Promise<Record<string, Skill[]>> {
    const skills = await this.findAll();
    
    const grouped: Record<string, Skill[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });

    // Sort skills within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }
}

/**
 * User Skill Repository
 * Handles user skill associations
 */
export class UserSkillRepository extends BaseRepository<UserSkill, UserSkillInsert, UserSkillUpdate> {
  constructor() {
    super('user_skills');
  }

  /**
   * Find user skills with skill details
   */
  public async findByUserId(userId: string): Promise<any[]> {
    const query = supabase
      .from(this.tableName)
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('user_id', userId)
      .order('proficiency_level', { ascending: false });

    return this.executeQuery(query, 'findByUserId');
  }

  /**
   * Find users by skill
   */
  public async findUsersBySkill(
    skillId: string,
    options: {
      minProficiency?: number;
      verified?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: any[]; count: number }> {
    const { minProficiency = 0, verified, limit = 20, offset = 0 } = options;

    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        user:profiles(*)
      `, { count: 'exact' })
      .eq('skill_id', skillId)
      .gte('proficiency_level', minProficiency)
      .order('proficiency_level', { ascending: false })
      .range(offset, offset + limit - 1);

    if (verified !== undefined) {
      query = query.eq('is_verified', verified);
    }

    const { data, error, count } = await query;

    if (error) {
      this.handleError(error, 'findUsersBySkill');
    }

    this.logSuccess('findUsersBySkill', data);
    return { data: data || [], count: count || 0 };
  }

  /**
   * Add skill to user
   */
  public async addUserSkill(
    userId: string,
    skillId: string,
    proficiencyLevel: number
  ): Promise<UserSkill> {
    const data: UserSkillInsert = {
      user_id: userId,
      skill_id: skillId,
      proficiency_level: proficiencyLevel,
      is_verified: false,
    };

    return this.create(data);
  }

  /**
   * Update user skill proficiency
   */
  public async updateProficiency(
    userSkillId: string,
    proficiencyLevel: number
  ): Promise<UserSkill> {
    const updateData: UserSkillUpdate = {
      proficiency_level: proficiencyLevel,
    };

    return this.update(userSkillId, updateData);
  }

  /**
   * Verify user skill
   */
  public async verifySkill(userSkillId: string): Promise<UserSkill> {
    const updateData: UserSkillUpdate = {
      is_verified: true,
      verified_at: new Date().toISOString(),
    };

    return this.update(userSkillId, updateData);
  }

  /**
   * Remove user skill
   */
  public async removeUserSkill(userId: string, skillId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillId);

    if (error) {
      this.handleError(error, 'removeUserSkill');
    }

    this.logSuccess('removeUserSkill');
  }

  /**
   * Get user skill statistics
   */
  public async getUserSkillStats(userId: string): Promise<{
    total: number;
    verified: number;
    averageProficiency: number;
    topSkills: any[];
  }> {
    const userSkills = await this.findByUserId(userId);

    const total = userSkills.length;
    const verified = userSkills.filter(us => us.is_verified).length;
    const averageProficiency = total > 0 
      ? userSkills.reduce((sum, us) => sum + (us.proficiency_level || 0), 0) / total 
      : 0;
    const topSkills = userSkills
      .sort((a, b) => (b.proficiency_level || 0) - (a.proficiency_level || 0))
      .slice(0, 5);

    return {
      total,
      verified,
      averageProficiency: Math.round(averageProficiency),
      topSkills,
    };
  }
}

export const skillRepository = new SkillRepository();
export const userSkillRepository = new UserSkillRepository();