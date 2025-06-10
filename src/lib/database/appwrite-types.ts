// Appwrite database types for Bolt Forge
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

// Profile types
export interface Profile extends AppwriteDocument {
  user_id: string;
  user_type: 'developer' | 'company';
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  github_username?: string;
  linkedin_username?: string;
  phone?: string;
  company_name?: string;
  company_industry?: string;
  company_size?: string;
  company_founded?: number;
  hourly_rate?: number;
  availability_hours?: number;
  total_earnings?: number;
  total_projects?: number;
  success_rate?: number;
  average_rating?: number;
  response_time_hours?: number;
  is_verified?: boolean;
  is_featured?: boolean;
}

export interface ProfileInsert {
  user_id: string;
  user_type: 'developer' | 'company';
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  github_username?: string;
  linkedin_username?: string;
  phone?: string;
  company_name?: string;
  company_industry?: string;
  company_size?: string;
  company_founded?: number;
  hourly_rate?: number;
  availability_hours?: number;
  total_earnings?: number;
  total_projects?: number;
  success_rate?: number;
  average_rating?: number;
  response_time_hours?: number;
  is_verified?: boolean;
  is_featured?: boolean;
}

export interface ProfileUpdate extends Partial<ProfileInsert> {
  $id?: string;
}

// Skill types
export interface Skill extends AppwriteDocument {
  name: string;
  category: string;
  description?: string;
  icon?: string;
}

export interface SkillInsert {
  name: string;
  category: string;
  description?: string;
  icon?: string;
}

export interface SkillUpdate extends Partial<SkillInsert> {
  $id?: string;
}

// Project types
export interface Project extends AppwriteDocument {
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  budget_min?: number;
  budget_max?: number;
  duration_days?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  is_featured?: boolean;
  is_urgent?: boolean;
  deadline?: string;
  assigned_developer_id?: string;
  application_count?: number;
  view_count?: number;
}

export interface ProjectInsert {
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  budget_min?: number;
  budget_max?: number;
  duration_days?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  status?: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  is_featured?: boolean;
  is_urgent?: boolean;
  deadline?: string;
  assigned_developer_id?: string;
  application_count?: number;
  view_count?: number;
}

export interface ProjectUpdate extends Partial<ProjectInsert> {
  $id?: string;
}

// User Skill types
export interface UserSkill extends AppwriteDocument {
  user_id: string;
  skill_id: string;
  proficiency_level?: number;
  is_verified?: boolean;
  verified_at?: string;
}

export interface UserSkillInsert {
  user_id: string;
  skill_id: string;
  proficiency_level?: number;
  is_verified?: boolean;
  verified_at?: string;
}

export interface UserSkillUpdate extends Partial<UserSkillInsert> {
  $id?: string;
}

// Badge types
export interface Badge extends AppwriteDocument {
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria?: string;
  is_active?: boolean;
}

export interface BadgeInsert {
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria?: string;
  is_active?: boolean;
}

export interface BadgeUpdate extends Partial<BadgeInsert> {
  $id?: string;
}

// User Badge types
export interface UserBadge extends AppwriteDocument {
  user_id: string;
  badge_id: string;
  earned_at?: string;
  project_id?: string;
}

export interface UserBadgeInsert {
  user_id: string;
  badge_id: string;
  earned_at?: string;
  project_id?: string;
}

export interface UserBadgeUpdate extends Partial<UserBadgeInsert> {
  $id?: string;
}

// Project Tag types
export interface ProjectTag extends AppwriteDocument {
  project_id: string;
  skill_id: string;
  is_required?: boolean;
}

export interface ProjectTagInsert {
  project_id: string;
  skill_id: string;
  is_required?: boolean;
}

export interface ProjectTagUpdate extends Partial<ProjectTagInsert> {
  $id?: string;
}

// Application types
export interface Application extends AppwriteDocument {
  project_id: string;
  developer_id: string;
  cover_letter?: string;
  proposed_budget?: number;
  estimated_duration_days?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at?: string;
  responded_at?: string;
}

export interface ApplicationInsert {
  project_id: string;
  developer_id: string;
  cover_letter?: string;
  proposed_budget?: number;
  estimated_duration_days?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at?: string;
  responded_at?: string;
}

export interface ApplicationUpdate extends Partial<ApplicationInsert> {
  $id?: string;
}

// Conversation types
export interface Conversation extends AppwriteDocument {
  participant_1_id: string;
  participant_2_id: string;
  project_id?: string;
  last_message_at?: string;
}

export interface ConversationInsert {
  participant_1_id: string;
  participant_2_id: string;
  project_id?: string;
  last_message_at?: string;
}

export interface ConversationUpdate extends Partial<ConversationInsert> {
  $id?: string;
}

// Message types
export interface Message extends AppwriteDocument {
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'file' | 'system';
  file_url?: string;
  is_read?: boolean;
}

export interface MessageInsert {
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'file' | 'system';
  file_url?: string;
  is_read?: boolean;
}

export interface MessageUpdate extends Partial<MessageInsert> {
  $id?: string;
}

// Review types
export interface Review extends AppwriteDocument {
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating?: number;
  comment?: string;
  is_public?: boolean;
}

export interface ReviewInsert {
  project_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating?: number;
  comment?: string;
  is_public?: boolean;
}

export interface ReviewUpdate extends Partial<ReviewInsert> {
  $id?: string;
}

// Query types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: Array<{
    field: string;
    operator: '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'contains' | 'search';
    value: string | number | boolean | string[] | number[];
  }>;
}

// Response types
export interface AppwriteListResponse<T> {
  total: number;
  documents: T[];
}

// Error types
export interface AppwriteError {
  message: string;
  code: number;
  type: string;
  version: string;
}
