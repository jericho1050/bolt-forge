// Update the existing supabase.ts to use the new database connection
export { supabase } from './database/connection';
export type { 
  Profile, 
  Skill, 
  Project, 
  UserSkill, 
  Badge,
  Database 
} from './database/types';

// Re-export repositories for easy access
export { profileRepository } from './database/repositories/ProfileRepository';
export { projectRepository } from './database/repositories/ProjectRepository';
export { skillRepository, userSkillRepository } from './database/repositories/SkillRepository';

// Export migration manager
export { MigrationManager } from './database/migrations';