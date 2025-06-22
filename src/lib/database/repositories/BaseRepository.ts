import { appwriteDb, dbConnection } from '../connection';
import { DATABASE_ID, COLLECTION_IDS } from '../../appwrite';
import type { AppwriteError, QueryOptions } from '../appwrite-types';
import { Query, Permission, Role } from 'appwrite';

/**
 * Base Repository class implementing common database operations for Appwrite
 * Provides error handling, logging, and data validation
 */
export abstract class BaseRepository<T, TInsert, TUpdate> {
  protected collectionName: string;
  protected collectionId: string;
  protected logger: Console;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collectionId = this.getCollectionId(collectionName);
    this.logger = console;
  }

  /**
   * Map collection names to IDs
   */
  private getCollectionId(collectionName: string): string {
    const mapping: Record<string, string> = {
      'profiles': COLLECTION_IDS.PROFILES,
      'skills': COLLECTION_IDS.SKILLS,
      'user_skills': COLLECTION_IDS.USER_SKILLS,
      'projects': COLLECTION_IDS.PROJECTS,
      'project_tags': COLLECTION_IDS.PROJECT_TAGS,
      'applications': COLLECTION_IDS.APPLICATIONS,
      'conversations': COLLECTION_IDS.CONVERSATIONS,
      'messages': COLLECTION_IDS.MESSAGES,
      'badges': COLLECTION_IDS.BADGES,
      'user_badges': COLLECTION_IDS.USER_BADGES,
      'reviews': COLLECTION_IDS.REVIEWS,
    };
    
    const id = mapping[collectionName];
    if (!id) {
      throw new Error(`Unknown collection: ${collectionName}`);
    }
    return id;
  }

  /**
   * Handle database errors with proper logging and user-friendly messages
   */
  protected handleError(error: AppwriteError | Error, operation: string): never {
    this.logger.error(`❌ Appwrite error in ${this.collectionName}.${operation}:`, error);
    
    if ('code' in error) {
      // Appwrite error codes
      switch (error.code) {
        case 400: // Bad Request
          throw new Error('Invalid request data');
        case 401: // Unauthorized
          throw new Error('Authentication required');
        case 403: // Forbidden
          throw new Error('Permission denied');
        case 404: // Not Found
          throw new Error('Record not found');
        case 409: // Conflict
          throw new Error('A record with this information already exists');
        case 429: // Too Many Requests
          throw new Error('Too many requests. Please try again later');
        case 500: // Internal Server Error
          throw new Error('Server error. Please try again later');
        default:
          throw new Error(`Database operation failed: ${error.message}`);
      }
    }
    
    throw new Error(`Operation failed: ${error.message}`);
  }

  /**
   * Log successful operations
   */
  protected logSuccess(operation: string, data?: unknown): void {
    this.logger.log(`✅ ${this.collectionName}.${operation} completed successfully`, data ? { count: Array.isArray(data) ? data.length : 1 } : {});
  }

  /**
   * Validate data before database operations
   */
  protected validateData(data: unknown, operation: string): void {
    if (!data) {
      throw new Error(`Invalid data provided for ${operation}`);
    }
    
    if (typeof data === 'object' && data !== null && Object.keys(data).length === 0) {
      throw new Error(`Empty data object provided for ${operation}`);
    }
  }

  /**
   * Build queries from options
   */
  protected buildQueries(options?: QueryOptions): string[] {
    return dbConnection.buildQueries(options);
  }

  /**
   * Find record by ID
   */
  public async findById(id: string): Promise<T | null> {
    try {
      const document = await appwriteDb.getDocument(DATABASE_ID, this.collectionId, id);
      this.logSuccess('findById', document);
      return document as T;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      this.handleError(error as AppwriteError, 'findById');
    }
  }

  /**
   * Find all records with optional filtering
   */
  public async findAll(options?: QueryOptions): Promise<T[]> {
    try {
      const queries = this.buildQueries(options);
      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, queries);
      this.logSuccess('findAll', response.documents);
      return response.documents as T[];
    } catch (error) {
      this.handleError(error as AppwriteError, 'findAll');
    }
  }

  /**
   * Create new record
   */
  public async create(data: TInsert, permissions?: string[]): Promise<T> {
    this.validateData(data, 'create');

    try {
      const document = await appwriteDb.createDocument(
        DATABASE_ID, 
        this.collectionId, 
        'unique()', 
        data as Record<string, unknown>,
        permissions // Pass permissions here
      );
      this.logSuccess('create', document);
      return document as T;
    } catch (error) {
      this.handleError(error as AppwriteError, 'create');
    }
  }

  /**
   * Update existing record
   */
  public async update(id: string, data: TUpdate): Promise<T> {
    this.validateData(data, 'update');

    try {
      const document = await appwriteDb.updateDocument(
        DATABASE_ID, 
        this.collectionId, 
        id, 
        data as Record<string, unknown>
      );
      this.logSuccess('update', document);
      return document as T;
    } catch (error) {
      this.handleError(error as AppwriteError, 'update');
    }
  }

  /**
   * Delete record
   */
  public async delete(id: string): Promise<void> {
    try {
      await appwriteDb.deleteDocument(DATABASE_ID, this.collectionId, id);
      this.logSuccess('delete');
    } catch (error) {
      this.handleError(error as AppwriteError, 'delete');
    }
  }

  /**
   * Count records with optional filtering
   */
  public async count(options?: QueryOptions): Promise<number> {
    try {
      const queries = this.buildQueries(options);
      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, queries);
      this.logSuccess('count', response.total);
      return response.total;
    } catch (error) {
      this.handleError(error as AppwriteError, 'count');
    }
  }

  /**
   * Check if record exists
   */
  public async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);
    return record !== null;
  }
}
