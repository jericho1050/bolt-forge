/*
  # Initial Schema for Bolt-Forge Platform

  1. New Tables
    - `profiles` - User profiles for both developers and companies
    - `projects` - Project listings and details
    - `applications` - Project applications from developers
    - `messages` - Direct messaging between users
    - `conversations` - Message threads/conversations
    - `skills` - Available skills/technologies
    - `user_skills` - User skill associations with verification status
    - `badges` - Achievement badges
    - `user_badges` - User badge associations
    - `project_tags` - Project technology tags
    - `reviews` - Project completion reviews

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
*/

-- Create enum types
CREATE TYPE user_type AS ENUM ('developer', 'company');
CREATE TYPE project_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE message_type AS ENUM ('text', 'file', 'system');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  location text,
  website text,
  github_username text,
  linkedin_username text,
  phone text,
  company_name text, -- For company users
  company_industry text, -- For company users
  company_size text, -- For company users
  company_founded integer, -- For company users
  hourly_rate decimal(10,2), -- For developers
  availability_hours integer DEFAULT 40, -- For developers
  total_earnings decimal(12,2) DEFAULT 0,
  total_projects integer DEFAULT 0,
  success_rate decimal(5,2) DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0,
  response_time_hours integer DEFAULT 24,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- User skills junction table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level integer CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  budget_min decimal(10,2),
  budget_max decimal(10,2),
  duration_days integer,
  difficulty difficulty_level NOT NULL,
  category text NOT NULL,
  status project_status DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  deadline timestamptz,
  assigned_developer_id uuid REFERENCES profiles(id),
  application_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project tags junction table
CREATE TABLE IF NOT EXISTS project_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, skill_id)
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  developer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text,
  proposed_budget decimal(10,2),
  estimated_duration_days integer,
  status application_status DEFAULT 'pending',
  applied_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(project_id, developer_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_1_id, participant_2_id, project_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type message_type DEFAULT 'text',
  file_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  criteria jsonb, -- Flexible criteria for earning the badge
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL, -- Optional reference to earning project
  UNIQUE(user_id, badge_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_difficulty ON projects(difficulty);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_developer_id ON applications(developer_id);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Skills: Public read access
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

-- User Skills: Users can manage their own skills
CREATE POLICY "Users can view all user skills"
  ON user_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own skills"
  ON user_skills FOR ALL
  USING (auth.uid() = user_id);

-- Projects: Public read for open projects, companies can manage their own
CREATE POLICY "Open projects are viewable by everyone"
  ON projects FOR SELECT
  USING (status IN ('open', 'completed') OR auth.uid() = company_id);

CREATE POLICY "Companies can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = company_id);

-- Project Tags: Readable by everyone, manageable by project owner
CREATE POLICY "Project tags are viewable by everyone"
  ON project_tags FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage project tags"
  ON project_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- Applications: Viewable by project owner and applicant
CREATE POLICY "Applications viewable by involved parties"
  ON applications FOR SELECT
  USING (
    auth.uid() = developer_id OR 
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = applications.project_id 
      AND projects.company_id = auth.uid()
    )
  );

CREATE POLICY "Developers can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = developer_id);

CREATE POLICY "Project owners can update application status"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = applications.project_id 
      AND projects.company_id = auth.uid()
    )
  );

-- Conversations: Viewable by participants
CREATE POLICY "Conversations viewable by participants"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Messages: Viewable by conversation participants
CREATE POLICY "Messages viewable by conversation participants"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

-- Badges: Public read access
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (is_active = true);

-- User Badges: Public read access
CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- Reviews: Public read access, reviewers can create
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);