import { supabase } from '../connection';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Base Repository class implementing common database operations
 * Provides error handling, logging, and data validation
 */
export abstract class BaseRepository<T, TInsert, TUpdate> {
  protected tableName: string;
  protected logger: Console;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.logger = console;
  }

  /**
   * Handle database errors with proper logging and user-friendly messages
   */
  protected handleError(error: PostgrestError | Error, operation: string): never {
    this.logger.error(`❌ Database error in ${this.tableName}.${operation}:`, error);
    
    if ('code' in error) {
      // PostgreSQL error codes
      switch (error.code) {
        case '23505': // Unique violation
          throw new Error('A record with this information already exists');
        case '23503': // Foreign key violation
          throw new Error('Referenced record does not exist');
        case '23514': // Check constraint violation
          throw new Error('Data validation failed');
        case 'PGRST116': // No rows found
          throw new Error('Record not found');
        default:
          throw new Error(`Database operation failed: ${error.message}`);
      }
    }
    
    throw new Error(`Operation failed: ${error.message}`);
  }

  /**
   * Log successful operations
   */
  protected logSuccess(operation: string, data?: any): void {
    this.logger.log(`✅ ${this.tableName}.${operation} completed successfully`, data ? { count: Array.isArray(data) ? data.length : 1 } : {});
  }

  /**
   * Validate data before database operations
   */
  protected validateData(data: any, operation: string): void {
    if (!data) {
      throw new Error(`Invalid data provided for ${operation}`);
    }
    
    if (typeof data === 'object' && Object.keys(data).length === 0) {
      throw new Error(`Empty data object provided for ${operation}`);
    }
  }

  /**
   * Execute query with error handling and logging
   */
  protected async executeQuery<R>(
    queryBuilder: any,
    operation: string,
    expectSingle: boolean = false
  ): Promise<R> {
    try {
      const { data, error } = expectSingle 
        ? await queryBuilder.single()
        : await queryBuilder;

      if (error) {
        this.handleError(error, operation);
      }

      this.logSuccess(operation, data);
      return data as R;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      this.handleError(error as PostgrestError, operation);
    }
  }

  /**
   * Find record by ID
   */
  public async findById(id: string): Promise<T | null> {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id);

    try {
      const data = await this.executeQuery<T>(query, 'findById', true);
      return data;
    } catch (error) {
      if (error.message.includes('Record not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find all records with optional filtering
   */
  public async findAll(filters?: Record<string, any>): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    return this.executeQuery<T[]>(query, 'findAll');
  }

  /**
   * Create new record
   */
  public async create(data: TInsert): Promise<T> {
    this.validateData(data, 'create');

    const query = supabase
      .from(this.tableName)
      .insert(data)
      .select();

    return this.executeQuery<T>(query, 'create', true);
  }

  /**
   * Update existing record
   */
  public async update(id: string, data: TUpdate): Promise<T> {
    this.validateData(data, 'update');

    const query = supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select();

    return this.executeQuery<T>(query, 'update', true);
  }

  /**
   * Delete record
   */
  public async delete(id: string): Promise<void> {
    const query = supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    await this.executeQuery(query, 'delete');
  }

  /**
   * Count records with optional filtering
   */
  public async count(filters?: Record<string, any>): Promise<number> {
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      this.handleError(error, 'count');
    }

    return count || 0;
  }

  /**
   * Check if record exists
   */
  public async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);
    return record !== null;
  }
}