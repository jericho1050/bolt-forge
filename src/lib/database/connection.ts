import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

/**
 * Database Connection Manager
 * Handles secure database connections with proper error handling and connection pooling
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: SupabaseClient<Database>;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;

  private constructor() {
    this.client = this.initializeClient();
    this.testConnection();
  }

  /**
   * Singleton pattern to ensure single database connection instance
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize Supabase client with secure configuration
   */
  private initializeClient(): SupabaseClient<Database> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'bolt-forge-2.0',
        },
      },
    });
  }

  /**
   * Test database connection with retry logic
   */
  private async testConnection(): Promise<void> {
    try {
      const { error } = await this.client.from('profiles').select('count').limit(1);
      
      if (error) {
        throw error;
      }
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log('✅ Database connection established');
    } catch (error) {
      this.isConnected = false;
      this.connectionAttempts++;
      
      console.error(`❌ Database connection failed (attempt ${this.connectionAttempts}):`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        setTimeout(() => this.testConnection(), 2000 * this.connectionAttempts);
      } else {
        throw new Error('Failed to establish database connection after multiple attempts');
      }
    }
  }

  /**
   * Get the Supabase client instance
   */
  public getClient(): SupabaseClient<Database> {
    if (!this.isConnected) {
      console.warn('⚠️ Database connection not established, operations may fail');
    }
    return this.client;
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
}

export const dbConnection = DatabaseConnection.getInstance();
export const supabase = dbConnection.getClient();