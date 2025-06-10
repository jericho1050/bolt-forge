import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'bolt-forge-db';

// Skills data
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

// Badges data
const badges = [
  {
    name: 'Fast Deliverer',
    description: 'Completed 95% of projects before deadline',
    icon: '🚀',
    category: 'Performance',
    criteria: JSON.stringify({ metric: 'on_time_delivery', threshold: 0.95 })
  },
  {
    name: 'Code Quality Master',
    description: 'Maintained 4.8+ star rating across projects',
    icon: '✨',
    category: 'Quality',
    criteria: JSON.stringify({ metric: 'average_rating', threshold: 4.8 })
  },
  {
    name: 'Team Player',
    description: 'Excellent collaboration and communication skills',
    icon: '🤝',
    category: 'Collaboration',
    criteria: JSON.stringify({ metric: 'collaboration_score', threshold: 4.5 })
  },
  {
    name: 'Problem Solver',
    description: 'Successfully solved complex technical challenges',
    icon: '🧩',
    category: 'Technical',
    criteria: JSON.stringify({ metric: 'complexity_solved', threshold: 5 })
  },
  {
    name: 'First Project',
    description: 'Completed your first micro-internship',
    icon: '🎯',
    category: 'Milestone',
    criteria: JSON.stringify({ metric: 'projects_completed', threshold: 1 })
  },
  {
    name: 'Veteran Developer',
    description: 'Completed 10+ successful projects',
    icon: '🏆',
    category: 'Milestone',
    criteria: JSON.stringify({ metric: 'projects_completed', threshold: 10 })
  },
  {
    name: 'Top Rated',
    description: 'Achieved 5-star rating on multiple projects',
    icon: '⭐',
    category: 'Quality',
    criteria: JSON.stringify({ metric: 'five_star_projects', threshold: 3 })
  },
  {
    name: 'Quick Responder',
    description: 'Average response time under 2 hours',
    icon: '⚡',
    category: 'Communication',
    criteria: JSON.stringify({ metric: 'response_time_hours', threshold: 2 })
  },
  {
    name: 'Skill Verified',
    description: 'Completed skill verification process',
    icon: '✅',
    category: 'Verification',
    criteria: JSON.stringify({ metric: 'verified_skills', threshold: 1 })
  },
  {
    name: 'Multi-Tech Expert',
    description: 'Proficient in 5+ different technologies',
    icon: '🔧',
    category: 'Technical',
    criteria: JSON.stringify({ metric: 'skill_count', threshold: 5 })
  },
  {
    name: 'Client Favorite',
    description: 'Received repeat business from clients',
    icon: '💝',
    category: 'Relationship',
    criteria: JSON.stringify({ metric: 'repeat_clients', threshold: 2 })
  },
  {
    name: 'Innovation Award',
    description: 'Implemented creative solutions in projects',
    icon: '💡',
    category: 'Innovation',
    criteria: JSON.stringify({ metric: 'innovation_score', threshold: 4.5 })
  },
];

// Sample projects data
const sampleProjects = [
  {
    title: 'React E-commerce Cart Component',
    description: 'Build a responsive shopping cart component with local storage persistence and checkout flow integration. The component should handle product additions, removals, quantity updates, and price calculations.',
    requirements: 'Experience with React hooks, local storage APIs, and responsive design. Knowledge of e-commerce workflows preferred.',
    budget_min: 250.00,
    budget_max: 400.00,
    duration_days: 5,
    difficulty: 'intermediate',
    category: 'Frontend',
    status: 'open',
    is_featured: true,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    company_id: 'sample_company_1' // Placeholder - will be updated when real companies sign up
  },
  {
    title: 'Node.js API Authentication System',
    description: 'Implement JWT-based authentication with role-based access control for a SaaS platform. Include user registration, login, password reset, and session management.',
    requirements: 'Strong experience with Node.js, Express, JWT tokens, and database integration. Security best practices knowledge required.',
    budget_min: 400.00,
    budget_max: 600.00,
    duration_days: 7,
    difficulty: 'advanced',
    category: 'Backend',
    status: 'open',
    is_featured: false,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    company_id: 'sample_company_2'
  },
  {
    title: 'AI Chatbot Widget Integration',
    description: 'Create a conversational AI widget that can be embedded into websites with customizable styling. Should integrate with popular AI APIs and provide real-time responses.',
    requirements: 'Experience with AI/ML APIs, JavaScript widgets, and real-time communication. Knowledge of natural language processing preferred.',
    budget_min: 600.00,
    budget_max: 800.00,
    duration_days: 14,
    difficulty: 'expert',
    category: 'AI/ML',
    status: 'open',
    is_featured: true,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    company_id: 'sample_company_3'
  },
  {
    title: 'Mobile App UI Redesign',
    description: 'Modernize the user interface of a React Native app with new design system and smooth animations. Focus on improving user experience and visual appeal.',
    requirements: 'Experience with React Native, animation libraries, and mobile UI/UX principles. Figma design interpretation skills needed.',
    budget_min: 300.00,
    budget_max: 500.00,
    duration_days: 7,
    difficulty: 'intermediate',
    category: 'Mobile',
    status: 'open',
    is_featured: false,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    company_id: 'sample_company_4'
  },
  {
    title: 'Smart Contract Development',
    description: 'Develop and deploy smart contracts for a decentralized marketplace on Ethereum blockchain. Include testing and security audit preparation.',
    requirements: 'Strong experience with Solidity, Web3 technologies, and blockchain development. Security-first mindset required.',
    budget_min: 800.00,
    budget_max: 1200.00,
    duration_days: 21,
    difficulty: 'expert',
    category: 'Blockchain',
    status: 'open',
    is_featured: true,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    company_id: 'sample_company_5'
  },
  {
    title: 'Vue.js Dashboard Components',
    description: 'Create reusable dashboard components with charts and data visualization for analytics platform. Components should be modular and well-documented.',
    requirements: 'Experience with Vue.js, chart libraries, and data visualization. Component architecture and documentation skills needed.',
    budget_min: 350.00,
    budget_max: 550.00,
    duration_days: 7,
    difficulty: 'intermediate',
    category: 'Frontend',
    status: 'open',
    is_featured: false,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    company_id: 'sample_company_6'
  }
];

async function migrateSkills() {
  console.log('🎯 Migrating skills...');
  
  for (const skill of skills) {
    try {
      await databases.createDocument(DATABASE_ID, 'skills', 'unique()', skill);
      console.log(`  ✅ Skill "${skill.name}" created`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ℹ️ Skill "${skill.name}" already exists`);
      } else {
        console.error(`  ❌ Error creating skill "${skill.name}":`, error.message);
      }
    }
  }
  
  console.log('✅ Skills migration completed\n');
}

async function migrateBadges() {
  console.log('🏆 Migrating badges...');
  
  for (const badge of badges) {
    try {
      await databases.createDocument(DATABASE_ID, 'badges', 'unique()', badge);
      console.log(`  ✅ Badge "${badge.name}" created`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ℹ️ Badge "${badge.name}" already exists`);
      } else {
        console.error(`  ❌ Error creating badge "${badge.name}":`, error.message);
      }
    }
  }
  
  console.log('✅ Badges migration completed\n');
}

async function migrateSampleProjects() {
  console.log('📋 Migrating sample projects...');
  
  for (const project of sampleProjects) {
    try {
      await databases.createDocument(DATABASE_ID, 'projects', 'unique()', project);
      console.log(`  ✅ Project "${project.title}" created`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ℹ️ Project "${project.title}" already exists`);
      } else {
        console.error(`  ❌ Error creating project "${project.title}":`, error.message);
      }
    }
  }
  
  console.log('✅ Sample projects migration completed\n');
}

async function createProjectTags() {
  console.log('🏷️ Creating project tags...');
  
  // Get all skills and projects to create tags
  try {
    const skillsResponse = await databases.listDocuments(DATABASE_ID, 'skills');
    const projectsResponse = await databases.listDocuments(DATABASE_ID, 'projects');
    
    const skillsMap = {};
    skillsResponse.documents.forEach(skill => {
      skillsMap[skill.name] = skill.$id;
    });
    
    // Define tags for each sample project
    const projectTags = [
      { projectTitle: 'React E-commerce Cart Component', skills: ['React', 'JavaScript', 'HTML/CSS'] },
      { projectTitle: 'Node.js API Authentication System', skills: ['Node.js', 'JavaScript', 'MongoDB'] },
      { projectTitle: 'AI Chatbot Widget Integration', skills: ['Python', 'OpenAI API', 'JavaScript'] },
      { projectTitle: 'Mobile App UI Redesign', skills: ['React Native', 'UI/UX Design', 'Figma'] },
      { projectTitle: 'Smart Contract Development', skills: ['Solidity', 'Ethereum', 'Web3'] },
      { projectTitle: 'Vue.js Dashboard Components', skills: ['Vue.js', 'JavaScript', 'HTML/CSS'] },
    ];
    
    for (const tagGroup of projectTags) {
      const project = projectsResponse.documents.find(p => p.title === tagGroup.projectTitle);
      if (!project) continue;
      
      for (const skillName of tagGroup.skills) {
        const skillId = skillsMap[skillName];
        if (!skillId) continue;
        
        try {
          await databases.createDocument(DATABASE_ID, 'project_tags', 'unique()', {
            project_id: project.$id,
            skill_id: skillId,
            is_required: true
          });
          console.log(`  ✅ Tag "${skillName}" added to "${project.title}"`);
        } catch (error) {
          if (error.code === 409) {
            console.log(`  ℹ️ Tag "${skillName}" already exists for "${project.title}"`);
          } else {
            console.error(`  ❌ Error creating tag:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Project tags migration completed\n');
  } catch (error) {
    console.error('❌ Error creating project tags:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting data migration...\n');

    await migrateSkills();
    await migrateBadges();
    await migrateSampleProjects();
    await createProjectTags();

    console.log('🎉 Data migration completed successfully!');
    console.log('\nYour Appwrite database is now populated with:');
    console.log('- Skills and technologies');
    console.log('- Achievement badges');
    console.log('- Sample projects');
    console.log('- Project skill tags');
    console.log('\nNext: Update your application code to use Appwrite instead of Supabase');
    
  } catch (error) {
    console.error('\n💥 Data migration failed:', error);
    process.exit(1);
  }
}

main();
