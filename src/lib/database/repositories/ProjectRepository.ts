import { BaseRepository } from './BaseRepository';
import { Project, ProjectInsert, ProjectUpdate } from '../types';
import { supabase } from '../connection';

/**
 * Project Repository
 * Handles all project-related database operations
 */
export class ProjectRepository extends BaseRepository<Project, ProjectInsert, ProjectUpdate> {
  constructor() {
    super('projects');
  }

  /**
   * Find projects with company and skills information
   */
  public async findWithDetails(id: string): Promise<any> {
    const query = supabase
      .from(this.tableName)
      .select(`
        *,
        company:profiles!projects_company_id_fkey(*),
        project_tags(
          *,
          skill:skills(*)
        ),
        assigned_developer:profiles!projects_assigned_developer_id_fkey(*)
      `)
      .eq('id', id);

    return this.executeQuery(query, 'findWithDetails', true);
  }

  /**
   * Find projects by status with pagination and filtering
   */
  public async findByStatus(
    status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled',
    options: {
      limit?: number;
      offset?: number;
      companyId?: string;
      category?: string;
      difficulty?: string;
      featured?: boolean;
    } = {}
  ): Promise<{ data: any[]; count: number }> {
    const { 
      limit = 20, 
      offset = 0, 
      companyId, 
      category, 
      difficulty, 
      featured 
    } = options;

    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        company:profiles!projects_company_id_fkey(full_name, company_name, avatar_url),
        project_tags(
          *,
          skill:skills(name, icon)
        )
      `, { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    const { data, error, count } = await query;

    if (error) {
      this.handleError(error, 'findByStatus');
    }

    this.logSuccess('findByStatus', data);
    return { data: data || [], count: count || 0 };
  }

  /**
   * Search projects by title, description, or skills
   */
  public async search(
    searchTerm: string,
    options: {
      status?: string;
      category?: string;
      difficulty?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: any[]; count: number }> {
    const { status = 'open', category, difficulty, limit = 20, offset = 0 } = options;

    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        company:profiles!projects_company_id_fkey(full_name, company_name, avatar_url),
        project_tags(
          *,
          skill:skills(name, icon)
        )
      `, { count: 'exact' })
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,requirements.ilike.%${searchTerm}%`)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error, count } = await query;

    if (error) {
      this.handleError(error, 'search');
    }

    this.logSuccess('search', data);
    return { data: data || [], count: count || 0 };
  }

  /**
   * Get featured projects
   */
  public async getFeatured(limit: number = 10): Promise<any[]> {
    const query = supabase
      .from(this.tableName)
      .select(`
        *,
        company:profiles!projects_company_id_fkey(full_name, company_name, avatar_url),
        project_tags(
          *,
          skill:skills(name, icon)
        )
      `)
      .eq('is_featured', true)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(limit);

    return this.executeQuery(query, 'getFeatured');
  }

  /**
   * Get projects by company
   */
  public async findByCompany(
    companyId: string,
    options: {
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: any[]; count: number }> {
    const { status, limit = 20, offset = 0 } = options;

    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        project_tags(
          *,
          skill:skills(name, icon)
        ),
        assigned_developer:profiles!projects_assigned_developer_id_fkey(full_name, avatar_url)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      this.handleError(error, 'findByCompany');
    }

    this.logSuccess('findByCompany', data);
    return { data: data || [], count: count || 0 };
  }

  /**
   * Assign developer to project
   */
  public async assignDeveloper(projectId: string, developerId: string): Promise<Project> {
    const updateData: ProjectUpdate = {
      assigned_developer_id: developerId,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    };

    return this.update(projectId, updateData);
  }

  /**
   * Update project status
   */
  public async updateStatus(
    projectId: string,
    status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<Project> {
    const updateData: ProjectUpdate = {
      status,
      updated_at: new Date().toISOString(),
    };

    return this.update(projectId, updateData);
  }

  /**
   * Increment view count
   */
  public async incrementViewCount(projectId: string): Promise<void> {
    const query = supabase
      .from(this.tableName)
      .update({ 
        view_count: supabase.sql`view_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    await this.executeQuery(query, 'incrementViewCount');
  }

  /**
   * Get project statistics
   */
  public async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
  }> {
    const [total, byStatus, byCategory, byDifficulty] = await Promise.all([
      this.count(),
      this.getCountByField('status'),
      this.getCountByField('category'),
      this.getCountByField('difficulty'),
    ]);

    return {
      total,
      byStatus,
      byCategory,
      byDifficulty,
    };
  }

  /**
   * Helper method to get count by field
   */
  private async getCountByField(field: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`${field}, count()`)
      .not(field, 'is', null);

    if (error) {
      this.handleError(error, `getCountBy${field}`);
    }

    const result: Record<string, number> = {};
    data?.forEach((item: any) => {
      result[item[field]] = item.count;
    });

    return result;
  }
}

export const projectRepository = new ProjectRepository();