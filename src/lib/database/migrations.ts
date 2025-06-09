import { supabase } from './connection';

/**
 * Database Migration Manager
 * Handles data migration and validation
 */
export class MigrationManager {
  /**
   * Migrate hard-coded data to database
   */
  public static async migrateHardCodedData(): Promise<void> {
    console.log('🔄 Starting data migration...');

    try {
      await this.migrateSkills();
      await this.migrateBadges();
      await this.migrateSampleData();
      
      console.log('✅ Data migration completed successfully');
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate skills data
   */
  private static async migrateSkills(): Promise<void> {
    const skills = [
      // Frontend
      { name: 'React', category: 'Frontend', description: 'JavaScript library for building user interfaces', icon: '⚛️' },
      { name: 'Vue.js', category: 'Frontend', description: 'Progressive JavaScript framework', icon: '💚' },
      { name: 'Angular', category: 'Frontend', description: 'Platform for building mobile and desktop web applications', icon: '🅰️' },
      { name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript', icon: '🔷' },
      { name: 'JavaScript', category: 'Frontend', description: 'Programming language for web development', icon: '🟨' },
      { name: 'HTML/CSS', category: 'Frontend', description: 'Markup and styling languages for web', icon: '🎨' },
      { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework', icon: '🎨' },
      
      // Backend
      { name: 'Node.js', category: 'Backend', description: 'JavaScript runtime for server-side development', icon: '🟢' },
      { name: 'Python', category: 'Backend', description: 'High-level programming language', icon: '🐍' },
      { name: 'Java', category: 'Backend', description: 'Object-oriented programming language', icon: '☕' },
      { name: 'PHP', category: 'Backend', description: 'Server-side scripting language', icon: '🐘' },
      { name: 'C#', category: 'Backend', description: 'Microsoft programming language', icon: '🔷' },
      { name: 'Go', category: 'Backend', description: 'Programming language developed by Google', icon: '🐹' },
      { name: 'Rust', category: 'Backend', description: 'Systems programming language', icon: '🦀' },
      
      // Database
      { name: 'PostgreSQL', category: 'Database', description: 'Advanced open source relational database', icon: '🐘' },
      { name: 'MongoDB', category: 'Database', description: 'NoSQL document database', icon: '🍃' },
      { name: 'MySQL', category: 'Database', description: 'Popular relational database', icon: '🐬' },
      { name: 'Redis', category: 'Database', description: 'In-memory data structure store', icon: '🔴' },
      { name: 'Supabase', category: 'Database', description: 'Open source Firebase alternative', icon: '⚡' },
      
      // Cloud & DevOps
      { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud platform', icon: '☁️' },
      { name: 'Google Cloud', category: 'Cloud', description: 'Google Cloud Platform', icon: '☁️' },
      { name: 'Azure', category: 'Cloud', description: 'Microsoft Azure cloud platform', icon: '☁️' },
      { name: 'Docker', category: 'DevOps', description: 'Containerization platform', icon: '🐳' },
      { name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration platform', icon: '⚓' },
      
      // Mobile
      { name: 'React Native', category: 'Mobile', description: 'Framework for building native mobile apps', icon: '📱' },
      { name: 'Flutter', category: 'Mobile', description: 'Google UI toolkit for mobile apps', icon: '🦋' },
      { name: 'Swift', category: 'Mobile', description: 'Programming language for iOS development', icon: '🍎' },
      { name: 'Kotlin', category: 'Mobile', description: 'Programming language for Android development', icon: '🤖' },
      
      // AI/ML
      { name: 'Machine Learning', category: 'AI/ML', description: 'Artificial intelligence and machine learning', icon: '🤖' },
      { name: 'TensorFlow', category: 'AI/ML', description: 'Open source machine learning framework', icon: '🧠' },
      { name: 'PyTorch', category: 'AI/ML', description: 'Machine learning library', icon: '🔥' },
      { name: 'OpenAI API', category: 'AI/ML', description: 'AI and language model APIs', icon: '🤖' },
      
      // Blockchain
      { name: 'Solidity', category: 'Blockchain', description: 'Programming language for Ethereum smart contracts', icon: '⛓️' },
      { name: 'Web3', category: 'Blockchain', description: 'Decentralized web technologies', icon: '🌐' },
      { name: 'Ethereum', category: 'Blockchain', description: 'Blockchain platform for smart contracts', icon: '💎' },
      { name: 'Algorand', category: 'Blockchain', description: 'Pure proof-of-stake blockchain', icon: '🔺' },
      
      // Design
      { name: 'UI/UX Design', category: 'Design', description: 'User interface and experience design', icon: '🎨' },
      { name: 'Figma', category: 'Design', description: 'Collaborative design tool', icon: '🎨' },
      { name: 'Adobe Creative Suite', category: 'Design', description: 'Creative software applications', icon: '🎨' },
      { name: 'Sketch', category: 'Design', description: 'Digital design toolkit', icon: '✏️' },
    ];

    for (const skill of skills) {
      const { error } = await supabase
        .from('skills')
        .upsert(skill, { onConflict: 'name' });

      if (error) {
        console.error(`Failed to migrate skill ${skill.name}:`, error);
      }
    }

    console.log('✅ Skills migration completed');
  }

  /**
   * Migrate badges data
   */
  private static async migrateBadges(): Promise<void> {
    const badges = [
      {
        name: 'Fast Deliverer',
        description: 'Completed 95% of projects before deadline',
        icon: '🚀',
        category: 'Performance',
        criteria: { metric: 'on_time_delivery', threshold: 0.95 }
      },
      {
        name: 'Code Quality Master',
        description: 'Maintained 4.8+ star rating across projects',
        icon: '✨',
        category: 'Quality',
        criteria: { metric: 'average_rating', threshold: 4.8 }
      },
      {
        name: 'Team Player',
        description: 'Excellent collaboration and communication skills',
        icon: '🤝',
        category: 'Collaboration',
        criteria: { metric: 'collaboration_score', threshold: 4.5 }
      },
      {
        name: 'Problem Solver',
        description: 'Successfully solved complex technical challenges',
        icon: '🧩',
        category: 'Technical',
        criteria: { metric: 'complexity_solved', threshold: 5 }
      },
      {
        name: 'First Project',
        description: 'Completed your first micro-internship',
        icon: '🎯',
        category: 'Milestone',
        criteria: { metric: 'projects_completed', threshold: 1 }
      },
      {
        name: 'Veteran Developer',
        description: 'Completed 10+ successful projects',
        icon: '🏆',
        category: 'Milestone',
        criteria: { metric: 'projects_completed', threshold: 10 }
      },
      {
        name: 'Top Rated',
        description: 'Achieved 5-star rating on multiple projects',
        icon: '⭐',
        category: 'Quality',
        criteria: { metric: 'five_star_projects', threshold: 3 }
      },
      {
        name: 'Quick Responder',
        description: 'Average response time under 2 hours',
        icon: '⚡',
        category: 'Communication',
        criteria: { metric: 'response_time_hours', threshold: 2 }
      },
      {
        name: 'Skill Verified',
        description: 'Completed skill verification process',
        icon: '✅',
        category: 'Verification',
        criteria: { metric: 'verified_skills', threshold: 1 }
      },
      {
        name: 'Multi-Tech Expert',
        description: 'Proficient in 5+ different technologies',
        icon: '🔧',
        category: 'Technical',
        criteria: { metric: 'skill_count', threshold: 5 }
      },
      {
        name: 'Client Favorite',
        description: 'Received repeat business from clients',
        icon: '💝',
        category: 'Relationship',
        criteria: { metric: 'repeat_clients', threshold: 2 }
      },
      {
        name: 'Innovation Award',
        description: 'Implemented creative solutions in projects',
        icon: '💡',
        category: 'Innovation',
        criteria: { metric: 'innovation_score', threshold: 4.5 }
      },
    ];

    for (const badge of badges) {
      const { error } = await supabase
        .from('badges')
        .upsert(badge, { onConflict: 'name' });

      if (error) {
        console.error(`Failed to migrate badge ${badge.name}:`, error);
      }
    }

    console.log('✅ Badges migration completed');
  }

  /**
   * Migrate sample data for development
   */
  private static async migrateSampleData(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // This would be handled by the database migration files
    // for creating sample profiles and projects
    console.log('✅ Sample data migration skipped (handled by SQL migrations)');
  }

  /**
   * Validate data integrity
   */
  public static async validateDataIntegrity(): Promise<boolean> {
    try {
      console.log('🔍 Validating data integrity...');

      // Check if required tables exist and have data
      const tables = ['profiles', 'skills', 'projects', 'badges'];
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error(`❌ Error checking table ${table}:`, error);
          return false;
        }

        console.log(`✅ Table ${table}: ${count} records`);
      }

      // Check for orphaned records
      await this.checkOrphanedRecords();

      console.log('✅ Data integrity validation completed');
      return true;
    } catch (error) {
      console.error('❌ Data integrity validation failed:', error);
      return false;
    }
  }

  /**
   * Check for orphaned records
   */
  private static async checkOrphanedRecords(): Promise<void> {
    // Check user_skills without valid user_id or skill_id
    const { data: orphanedUserSkills } = await supabase
      .from('user_skills')
      .select(`
        id,
        user_id,
        skill_id,
        profiles!user_skills_user_id_fkey(id),
        skills!user_skills_skill_id_fkey(id)
      `)
      .or('profiles.id.is.null,skills.id.is.null');

    if (orphanedUserSkills && orphanedUserSkills.length > 0) {
      console.warn(`⚠️ Found ${orphanedUserSkills.length} orphaned user_skills records`);
    }

    // Check projects without valid company_id
    const { data: orphanedProjects } = await supabase
      .from('projects')
      .select(`
        id,
        company_id,
        profiles!projects_company_id_fkey(id)
      `)
      .is('profiles.id', null)
      .not('company_id', 'is', null);

    if (orphanedProjects && orphanedProjects.length > 0) {
      console.warn(`⚠️ Found ${orphanedProjects.length} orphaned projects records`);
    }
  }

  /**
   * Rollback migration (for testing)
   */
  public static async rollbackMigration(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Rollback only allowed in development environment');
    }

    console.log('🔄 Rolling back migration...');

    // Delete sample data (keep skills and badges for now)
    await supabase.from('user_skills').delete().neq('id', '');
    await supabase.from('projects').delete().neq('id', '');
    
    console.log('✅ Migration rollback completed');
  }
}