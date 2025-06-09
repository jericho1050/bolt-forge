// Database type definitions generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: 'developer' | 'company';
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          github_username: string | null;
          linkedin_username: string | null;
          phone: string | null;
          company_name: string | null;
          company_industry: string | null;
          company_size: string | null;
          company_founded: number | null;
          hourly_rate: number | null;
          availability_hours: number | null;
          total_earnings: number | null;
          total_projects: number | null;
          success_rate: number | null;
          average_rating: number | null;
          response_time_hours: number | null;
          is_verified: boolean | null;
          is_featured: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          user_type: 'developer' | 'company';
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          github_username?: string | null;
          linkedin_username?: string | null;
          phone?: string | null;
          company_name?: string | null;
          company_industry?: string | null;
          company_size?: string | null;
          company_founded?: number | null;
          hourly_rate?: number | null;
          availability_hours?: number | null;
          total_earnings?: number | null;
          total_projects?: number | null;
          success_rate?: number | null;
          average_rating?: number | null;
          response_time_hours?: number | null;
          is_verified?: boolean | null;
          is_featured?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_type?: 'developer' | 'company';
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          github_username?: string | null;
          linkedin_username?: string | null;
          phone?: string | null;
          company_name?: string | null;
          company_industry?: string | null;
          company_size?: string | null;
          company_founded?: number | null;
          hourly_rate?: number | null;
          availability_hours?: number | null;
          total_earnings?: number | null;
          total_projects?: number | null;
          success_rate?: number | null;
          average_rating?: number | null;
          response_time_hours?: number | null;
          is_verified?: boolean | null;
          is_featured?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          icon: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          company_id: string | null;
          title: string;
          description: string;
          requirements: string | null;
          budget_min: number | null;
          budget_max: number | null;
          duration_days: number | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          category: string;
          status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | null;
          is_featured: boolean | null;
          is_urgent: boolean | null;
          deadline: string | null;
          assigned_developer_id: string | null;
          application_count: number | null;
          view_count: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          title: string;
          description: string;
          requirements?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          duration_days?: number | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          category: string;
          status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | null;
          is_featured?: boolean | null;
          is_urgent?: boolean | null;
          deadline?: string | null;
          assigned_developer_id?: string | null;
          application_count?: number | null;
          view_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          title?: string;
          description?: string;
          requirements?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          duration_days?: number | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
          category?: string;
          status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | null;
          is_featured?: boolean | null;
          is_urgent?: boolean | null;
          deadline?: string | null;
          assigned_developer_id?: string | null;
          application_count?: number | null;
          view_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_skills: {
        Row: {
          id: string;
          user_id: string | null;
          skill_id: string | null;
          proficiency_level: number | null;
          is_verified: boolean | null;
          verified_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          skill_id?: string | null;
          proficiency_level?: number | null;
          is_verified?: boolean | null;
          verified_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          skill_id?: string | null;
          proficiency_level?: number | null;
          is_verified?: boolean | null;
          verified_at?: string | null;
          created_at?: string | null;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          criteria: any | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          criteria?: any | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: string;
          criteria?: any | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_type: 'developer' | 'company';
      project_status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
      application_status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
      difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      message_type: 'text' | 'file' | 'system';
    };
  };
}

// Convenience type exports
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Skill = Database['public']['Tables']['skills']['Row'];
export type SkillInsert = Database['public']['Tables']['skills']['Insert'];
export type SkillUpdate = Database['public']['Tables']['skills']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type UserSkill = Database['public']['Tables']['user_skills']['Row'];
export type UserSkillInsert = Database['public']['Tables']['user_skills']['Insert'];
export type UserSkillUpdate = Database['public']['Tables']['user_skills']['Update'];

export type Badge = Database['public']['Tables']['badges']['Row'];
export type BadgeInsert = Database['public']['Tables']['badges']['Insert'];
export type BadgeUpdate = Database['public']['Tables']['badges']['Update'];