import { BaseRepository } from './BaseRepository';
import { Profile, ProfileInsert, ProfileUpdate } from '../types';
import { supabase } from '../connection';

/**
 * Profile Repository
 * Handles all profile-related database operations
 */
export class ProfileRepository extends BaseRepository<Profile, ProfileInsert, ProfileUpdate> {
  constructor() {
    super('profiles');
  }

  /**
   * Find profile by user ID (same as profile ID in our schema)
   */
  public async findByUserId(userId: string): Promise<Profile | null> {
    return this.findById(userId);
  }

  /**
   * Find profiles by user type with pagination
   */
  public async findByUserType(
    userType: 'developer' | 'company',
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    } = {}
  ): Promise<{ data: Profile[]; count: number }> {
    const { limit = 20, offset = 0, orderBy = 'created_at', ascending = false } = options;

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('user_type', userType)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.handleError(error, 'findByUserType');
    }

    this.logSuccess('findByUserType', data);
    return { data: data || [], count: count || 0 };
  }

  /**
   * Find featured profiles
   */
  public async findFeatured(userType?: 'developer' | 'company'): Promise<Profile[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('is_featured', true)
      .order('average_rating', { ascending: false });

    if (userType) {
      query = query.eq('user_type', userType);
    }

    return this.executeQuery<Profile[]>(query, 'findFeatured');
  }

  /**
   * Search profiles by name, location, or skills
   */
  public async search(
    searchTerm: string,
    userType?: 'developer' | 'company',
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: Profile[]; count: number }> {
    const { limit = 20, offset = 0 } = options;

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .or(`full_name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
      .order('average_rating', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userType) {
      query = query.eq('user_type', userType);
    }

    const { data, error, count } = await query;

    if (error) {
      this.handleError(error, 'search');
    }

    this.logSuccess('search', data);
    return { data: data || [], count: count || 0 };
  }

  /**
   * Update profile statistics
   */
  public async updateStats(
    userId: string,
    stats: {
      total_earnings?: number;
      total_projects?: number;
      success_rate?: number;
      average_rating?: number;
    }
  ): Promise<Profile> {
    this.validateData(stats, 'updateStats');

    const updateData: ProfileUpdate = {
      ...stats,
      updated_at: new Date().toISOString(),
    };

    return this.update(userId, updateData);
  }

  /**
   * Get top-rated profiles
   */
  public async getTopRated(
    userType: 'developer' | 'company',
    limit: number = 10
  ): Promise<Profile[]> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_type', userType)
      .not('average_rating', 'is', null)
      .order('average_rating', { ascending: false })
      .order('total_projects', { ascending: false })
      .limit(limit);

    return this.executeQuery<Profile[]>(query, 'getTopRated');
  }

  /**
   * Get profiles by location
   */
  public async findByLocation(
    location: string,
    userType?: 'developer' | 'company'
  ): Promise<Profile[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .ilike('location', `%${location}%`)
      .order('average_rating', { ascending: false });

    if (userType) {
      query = query.eq('user_type', userType);
    }

    return this.executeQuery<Profile[]>(query, 'findByLocation');
  }

  /**
   * Verify profile
   */
  public async verify(userId: string): Promise<Profile> {
    const updateData: ProfileUpdate = {
      is_verified: true,
      updated_at: new Date().toISOString(),
    };

    return this.update(userId, updateData);
  }

  /**
   * Feature/unfeature profile
   */
  public async setFeatured(userId: string, featured: boolean): Promise<Profile> {
    const updateData: ProfileUpdate = {
      is_featured: featured,
      updated_at: new Date().toISOString(),
    };

    return this.update(userId, updateData);
  }
}

export const profileRepository = new ProfileRepository();