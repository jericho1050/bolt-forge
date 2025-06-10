import { databases, account, DATABASE_ID } from '../appwrite';
import type { QueryOptions } from './appwrite-types';
import { Query } from 'appwrite';

/**
 * Database Connection Manager for Appwrite
 * Handles secure database connections with proper error handling
 */
class AppwriteConnection {
  private static instance: AppwriteConnection;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;

  private constructor() {
    this.testConnection();
  }

  /**
   * Singleton pattern to ensure single database connection instance
   */
  public static getInstance(): AppwriteConnection {
    if (!AppwriteConnection.instance) {
      AppwriteConnection.instance = new AppwriteConnection();
    }
    return AppwriteConnection.instance;
  }

  /**
   * Test database connection with retry logic
   */
  private async testConnection(): Promise<void> {
    try {
      // Test connection by attempting to list skills (a lightweight operation)
      await databases.listDocuments(DATABASE_ID, 'skills', [Query.limit(1)]);
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log('✅ Appwrite database connection established');
    } catch (error) {
      this.isConnected = false;
      this.connectionAttempts++;
      
      console.error(`❌ Appwrite database connection failed (attempt ${this.connectionAttempts}):`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        setTimeout(() => this.testConnection(), 2000 * this.connectionAttempts);
      } else {
        console.error('Failed to establish database connection after multiple attempts');
        // Don't throw error to prevent app crash - Appwrite might be temporarily unavailable
      }
    }
  }

  /**
   * Get the Appwrite databases instance
   */
  public getDatabases() {
    if (!this.isConnected) {
      console.warn('⚠️ Database connection not established, operations may fail');
    }
    return databases;
  }

  /**
   * Get the Appwrite account instance
   */
  public getAccount() {
    return account;
  }

  /**
   * Check if database is connected
   */
  public isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Refresh connection
   */
  public async refreshConnection(): Promise<void> {
    this.connectionAttempts = 0;
    await this.testConnection();
  }

  /**
   * Build Appwrite queries from QueryOptions
   */
  public buildQueries(options?: QueryOptions): string[] {
    if (!options) return [];

    const queries: string[] = [];

    if (options.limit) {
      queries.push(Query.limit(options.limit));
    }

    if (options.offset) {
      queries.push(Query.offset(options.offset));
    }

    if (options.orderBy) {
      if (options.orderDirection === 'desc') {
        queries.push(Query.orderDesc(options.orderBy));
      } else {
        queries.push(Query.orderAsc(options.orderBy));
      }
    }

    if (options.where) {
      options.where.forEach(condition => {
        switch (condition.operator) {
          case '=':
            queries.push(Query.equal(condition.field, condition.value));
            break;
          case '!=':
            queries.push(Query.notEqual(condition.field, condition.value));
            break;
          case '<':
            queries.push(Query.lessThan(condition.field, condition.value));
            break;
          case '<=':
            queries.push(Query.lessThanEqual(condition.field, condition.value));
            break;
          case '>':
            queries.push(Query.greaterThan(condition.field, condition.value));
            break;
          case '>=':
            queries.push(Query.greaterThanEqual(condition.field, condition.value));
            break;
          case 'in':
            if (Array.isArray(condition.value)) {
              queries.push(Query.equal(condition.field, condition.value));
            }
            break;
          case 'not-in':
            if (Array.isArray(condition.value)) {
              queries.push(Query.notEqual(condition.field, condition.value));
            }
            break;
          case 'contains':
            queries.push(Query.search(condition.field, condition.value as string));
            break;
          case 'search':
            queries.push(Query.search(condition.field, condition.value as string));
            break;
        }
      });
    }

    return queries;
  }
}

export const dbConnection = AppwriteConnection.getInstance();
export const appwriteDb = dbConnection.getDatabases();
export const appwriteAccount = dbConnection.getAccount();

// Legacy export for compatibility
export const supabase = {
  auth: appwriteAccount,
  from: () => {
    throw new Error('Legacy Supabase API usage detected. Please migrate to Appwrite.');
  }
};
