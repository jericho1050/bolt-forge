import { Client, Databases, Storage, Permission, Role, ID } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const APPWRITE_ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('- VITE_APPWRITE_ENDPOINT');
  console.error('- VITE_APPWRITE_PROJECT_ID');
  console.error('- APPWRITE_API_KEY');
  process.exit(1);
}

// Initialize Appwrite client with API key (server SDK)
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = 'bolt-forge-db';

// Default Permission Sets
const PERM_PUBLIC_READ_USERS_CREATE = [
  Permission.read(Role.any()),
  Permission.create(Role.users()),
  // Document-level permissions will handle update/delete for specific users
];

const PERM_USERS_READ_USERS_CREATE = [
  Permission.read(Role.users()),
  Permission.create(Role.users()),
  // Document-level permissions will handle update/delete for specific users
];

const PERM_PUBLIC_READ_ONLY = [
  Permission.read(Role.any()),
  // Create, Update, Delete typically admin/server-side only for these
];

// Collection definitions
const collections = [
  {
    id: 'profiles',
    name: 'Profiles',
    permissions: PERM_PUBLIC_READ_USERS_CREATE,
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'user_type', type: 'string', required: true, size: 50 },
      { key: 'full_name', type: 'string', required: true, size: 255 },
      { key: 'avatar_url', type: 'url', required: false },
      { key: 'bio', type: 'string', required: false, size: 1000 },
      { key: 'location', type: 'string', required: false, size: 255 },
      { key: 'website', type: 'url', required: false },
      { key: 'github_username', type: 'string', required: false, size: 100 },
      { key: 'linkedin_username', type: 'string', required: false, size: 100 },
      { key: 'phone', type: 'string', required: false, size: 50 },
      { key: 'company_name', type: 'string', required: false, size: 255 },
      { key: 'company_industry', type: 'string', required: false, size: 255 },
      { key: 'company_size', type: 'string', required: false, size: 100 },
      { key: 'company_founded', type: 'integer', required: false },
      { key: 'hourly_rate', type: 'float', required: false },
      { key: 'availability_hours', type: 'integer', required: false, default: 40 },
      { key: 'total_earnings', type: 'float', required: false, default: 0 },
      { key: 'total_projects', type: 'integer', required: false, default: 0 },
      { key: 'success_rate', type: 'float', required: false, default: 0 },
      { key: 'average_rating', type: 'float', required: false, default: 0 },
      { key: 'response_time_hours', type: 'integer', required: false, default: 24 },
      { key: 'is_verified', type: 'boolean', required: false, default: false },
      { key: 'is_featured', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'user_id_idx', type: 'unique', attributes: ['user_id'] },
      { key: 'user_type_idx', type: 'key', attributes: ['user_type'] },
      { key: 'location_idx', type: 'key', attributes: ['location'] },
    ]
  },
  {
    id: 'skills',
    name: 'Skills',
    permissions: PERM_PUBLIC_READ_ONLY,
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'category', type: 'string', required: true, size: 100 },
      { key: 'description', type: 'string', required: false, size: 500 },
      { key: 'icon', type: 'string', required: false, size: 50 },
    ],
    indexes: [
      { key: 'name_idx', type: 'unique', attributes: ['name'] },
      { key: 'category_idx', type: 'key', attributes: ['category'] },
    ]
  },
  {
    id: 'user_skills',
    name: 'User Skills',
    permissions: PERM_USERS_READ_USERS_CREATE,
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'skill_id', type: 'string', required: true, size: 255 },
      { key: 'proficiency_level', type: 'integer', required: false, min: 1, max: 100 },
      { key: 'is_verified', type: 'boolean', required: false, default: false },
      { key: 'verified_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
      { key: 'skill_id_idx', type: 'key', attributes: ['skill_id'] },
      { key: 'user_skill_idx', type: 'unique', attributes: ['user_id', 'skill_id'] },
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    permissions: PERM_PUBLIC_READ_USERS_CREATE,
    attributes: [
      { key: 'company_id', type: 'string', required: true, size: 255 }, // This should be a user_id of a company-type user
      { key: 'title', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: true, size: 2000 },
      { key: 'requirements', type: 'string', required: false, size: 2000 },
      { key: 'budget_min', type: 'float', required: false },
      { key: 'budget_max', type: 'float', required: false },
      { key: 'duration_days', type: 'integer', required: false },
      { key: 'difficulty', type: 'string', required: true, size: 50 },
      { key: 'category', type: 'string', required: true, size: 100 },
      { key: 'status', type: 'string', required: false, size: 50, default: 'draft' },
      { key: 'is_featured', type: 'boolean', required: false, default: false },
      { key: 'is_urgent', type: 'boolean', required: false, default: false },
      { key: 'deadline', type: 'datetime', required: false },
      { key: 'assigned_developer_id', type: 'string', required: false, size: 255 },
      { key: 'application_count', type: 'integer', required: false, default: 0 },
      { key: 'view_count', type: 'integer', required: false, default: 0 },
    ],
    indexes: [
      { key: 'status_idx', type: 'key', attributes: ['status'] },
      { key: 'category_idx', type: 'key', attributes: ['category'] },
      { key: 'difficulty_idx', type: 'key', attributes: ['difficulty'] },
      { key: 'company_id_idx', type: 'key', attributes: ['company_id'] },
      { key: 'created_at_idx', type: 'key', attributes: ['$createdAt'], orders: ['desc'] },
    ]
  },
  {
    id: 'project_tags',
    name: 'Project Tags',
    permissions: PERM_PUBLIC_READ_USERS_CREATE,
    attributes: [
      { key: 'project_id', type: 'string', required: true, size: 255 },
      { key: 'skill_id', type: 'string', required: true, size: 255 },
      { key: 'is_required', type: 'boolean', required: false, default: true },
    ],
    indexes: [
      { key: 'project_id_idx', type: 'key', attributes: ['project_id'] },
      { key: 'skill_id_idx', type: 'key', attributes: ['skill_id'] },
      { key: 'project_skill_idx', type: 'unique', attributes: ['project_id', 'skill_id'] },
    ]
  },
  {
    id: 'applications',
    name: 'Applications',
    permissions: PERM_USERS_READ_USERS_CREATE,
    attributes: [
      { key: 'project_id', type: 'string', required: true, size: 255 },
      { key: 'developer_id', type: 'string', required: true, size: 255 },
      { key: 'cover_letter', type: 'string', required: false, size: 2000 },
      { key: 'proposed_budget', type: 'float', required: false },
      { key: 'estimated_duration_days', type: 'integer', required: false },
      { key: 'status', type: 'string', required: false, size: 50, default: 'pending' },
      { key: 'applied_at', type: 'datetime', required: false },
      { key: 'responded_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'developer_id_idx', type: 'key', attributes: ['developer_id'] },
      { key: 'project_id_idx', type: 'key', attributes: ['project_id'] },
      { key: 'project_developer_idx', type: 'unique', attributes: ['project_id', 'developer_id'] },
    ]
  },
  {
    id: 'conversations',
    name: 'Conversations',
    permissions: PERM_USERS_READ_USERS_CREATE,
    attributes: [
      { key: 'participant_1_id', type: 'string', required: true, size: 255 },
      { key: 'participant_2_id', type: 'string', required: true, size: 255 },
      { key: 'project_id', type: 'string', required: false, size: 255 },
      { key: 'last_message_at', type: 'datetime', required: false },
    ],
    indexes: [
      { key: 'participant_1_idx', type: 'key', attributes: ['participant_1_id'] },
      { key: 'participant_2_idx', type: 'key', attributes: ['participant_2_id'] },
      { key: 'project_id_idx', type: 'key', attributes: ['project_id'] },
      { key: 'participants_project_idx', type: 'unique', attributes: ['participant_1_id', 'participant_2_id', 'project_id'] },
    ]
  },
  {
    id: 'messages',
    name: 'Messages',
    permissions: PERM_USERS_READ_USERS_CREATE,
    attributes: [
      { key: 'conversation_id', type: 'string', required: true, size: 255 },
      { key: 'sender_id', type: 'string', required: true, size: 255 },
      { key: 'content', type: 'string', required: true, size: 2000 },
      { key: 'message_type', type: 'string', required: false, size: 50, default: 'text' },
      { key: 'file_url', type: 'url', required: false },
      { key: 'is_read', type: 'boolean', required: false, default: false },
    ],
    indexes: [
      { key: 'conversation_id_idx', type: 'key', attributes: ['conversation_id'] },
      { key: 'created_at_idx', type: 'key', attributes: ['$createdAt'], orders: ['desc'] },
    ]
  },
  {
    id: 'badges',
    name: 'Badges',
    permissions: PERM_PUBLIC_READ_ONLY,
    attributes: [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'description', type: 'string', required: true, size: 500 },
      { key: 'icon', type: 'string', required: true, size: 50 },
      { key: 'category', type: 'string', required: true, size: 100 },
      { key: 'criteria', type: 'string', required: false, size: 1000 },
      { key: 'is_active', type: 'boolean', required: false, default: true },
    ],
    indexes: [
      { key: 'name_idx', type: 'unique', attributes: ['name'] },
      { key: 'category_idx', type: 'key', attributes: ['category'] },
    ]
  },
  {
    id: 'user_badges',
    name: 'User Badges',
    permissions: PERM_USERS_READ_USERS_CREATE, // System/Admin might create, user reads
    attributes: [
      { key: 'user_id', type: 'string', required: true, size: 255 },
      { key: 'badge_id', type: 'string', required: true, size: 255 },
      { key: 'earned_at', type: 'datetime', required: false },
      { key: 'project_id', type: 'string', required: false, size: 255 },
    ],
    indexes: [
      { key: 'user_id_idx', type: 'key', attributes: ['user_id'] },
      { key: 'badge_id_idx', type: 'key', attributes: ['badge_id'] },
      { key: 'user_badge_idx', type: 'unique', attributes: ['user_id', 'badge_id'] },
    ]
  },
  {
    id: 'reviews',
    name: 'Reviews',
    permissions: PERM_PUBLIC_READ_USERS_CREATE,
    attributes: [
      { key: 'project_id', type: 'string', required: true, size: 255 },
      { key: 'reviewer_id', type: 'string', required: true, size: 255 },
      { key: 'reviewee_id', type: 'string', required: true, size: 255 },
      { key: 'rating', type: 'integer', required: false, min: 1, max: 5 },
      { key: 'comment', type: 'string', required: false, size: 1000 },
      { key: 'is_public', type: 'boolean', required: false, default: true },
    ],
    indexes: [
      { key: 'project_id_idx', type: 'key', attributes: ['project_id'] },
      { key: 'reviewer_id_idx', type: 'key', attributes: ['reviewer_id'] },
      { key: 'reviewee_id_idx', type: 'key', attributes: ['reviewee_id'] },
      { key: 'project_reviewer_reviewee_idx', type: 'unique', attributes: ['project_id', 'reviewer_id', 'reviewee_id'] },
    ]
  }
];

// Storage buckets
const buckets = [
  { id: 'avatars', name: 'Avatars', permissions: [Permission.read(Role.any()), Permission.create(Role.users()), Permission.update(Role.users()), Permission.delete(Role.users())] }, // Users manage their own avatars
  { id: 'project_files', name: 'Project Files', permissions: [Permission.read(Role.any()), Permission.create(Role.users())] }, // Project owners (users) upload, anyone can read
  { id: 'message_files', name: 'Message Files', permissions: [Permission.read(Role.users()), Permission.create(Role.users())] }, // Only involved users
];

async function createDatabase() {
  try {
    console.log('🗄️ Creating database...');
    await databases.create(DATABASE_ID, 'Bolt Forge Database');
    console.log('✅ Database created successfully');
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️ Database already exists');
    } else {
      console.error('❌ Error creating database:', error);
      throw error;
    }
  }
}

async function createCollection(collection) {
  try {
    console.log(`📁 Creating collection: ${collection.name}`);
    // Pass permissions array to createCollection, defaulting to empty array if not provided
    await databases.createCollection(DATABASE_ID, collection.id, collection.name, collection.permissions || []);
    console.log(`✅ Collection ${collection.name} created successfully`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️ Collection ${collection.name} already exists`);
    } else {
      console.error(`❌ Error creating collection ${collection.name}:`, error);
      throw error;
    }
  }
}

async function createAttribute(collectionId, attribute) {
  try {
    const { key, type, required = false, ...options } = attribute;
    
    switch (type) {
      case 'string':
        await databases.createStringAttribute(DATABASE_ID, collectionId, key, options.size || 255, required, options.default);
        break;
      case 'integer':
        await databases.createIntegerAttribute(DATABASE_ID, collectionId, key, required, options.min, options.max, options.default);
        break;
      case 'float':
        await databases.createFloatAttribute(DATABASE_ID, collectionId, key, required, options.min, options.max, options.default);
        break;
      case 'boolean':
        await databases.createBooleanAttribute(DATABASE_ID, collectionId, key, required, options.default);
        break;
      case 'datetime':
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, key, required, options.default);
        break;
      case 'url':
        await databases.createUrlAttribute(DATABASE_ID, collectionId, key, required, options.default);
        break;
      default:
        console.warn(`⚠️ Unknown attribute type: ${type}`);
    }
    
    console.log(`  ✅ Attribute ${key} (${type}) created`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️ Attribute ${attribute.key} already exists`);
    } else {
      console.error(`  ❌ Error creating attribute ${attribute.key}:`, error);
      throw error;
    }
  }
}

async function createIndex(collectionId, index) {
  try {
    await databases.createIndex(DATABASE_ID, collectionId, index.key, index.type, index.attributes, index.orders);
    console.log(`  ✅ Index ${index.key} created`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️ Index ${index.key} already exists`);
    } else {
      console.error(`  ❌ Error creating index ${index.key}:`, error);
      throw error;
    }
  }
}

async function createBucket(bucket) {
  try {
    console.log(`🪣 Creating bucket: ${bucket.name}`);
    await storage.createBucket(bucket.id, bucket.name, bucket.permissions);
    console.log(`✅ Bucket ${bucket.name} created successfully`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️ Bucket ${bucket.name} already exists`);
    } else {
      console.error(`❌ Error creating bucket ${bucket.name}:`, error);
      throw error;
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting Appwrite schema setup...\n');

    // Create database
    await createDatabase();

    // Create collections
    for (const collection of collections) {
      // Delete collection if it exists, to ensure permissions are applied
      try {
        await databases.getCollection(DATABASE_ID, collection.id);
        console.log(`🗑️ Deleting existing collection: ${collection.name} to re-apply permissions...`);
        await databases.deleteCollection(DATABASE_ID, collection.id);
        console.log(`✅ Collection ${collection.name} deleted.`);
        // Wait a bit for deletion to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code !== 404) { // If error is not "not found", then it's an issue
          console.error(`❌ Error checking/deleting collection ${collection.name}:`, error);
          throw error;
        }
        // If 404, collection doesn't exist, so proceed to create
      }

      await createCollection(collection);
      
      // Wait a bit for collection to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create attributes
      console.log(`  📝 Adding attributes to ${collection.name}...`);
      for (const attribute of collection.attributes) {
        await createAttribute(collection.id, attribute);
        // Small delay between attributes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Create indexes
      if (collection.indexes && collection.indexes.length > 0) {
        console.log(`  🔍 Adding indexes to ${collection.name}...`);
        // Wait for attributes to be ready before creating indexes
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        for (const index of collection.indexes) {
          await createIndex(collection.id, index);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log('');
    }

    // Create storage buckets
    console.log('📦 Creating storage buckets...');
    for (const bucket of buckets) {
       try {
        await storage.getBucket(bucket.id);
        console.log(`🗑️ Deleting existing bucket: ${bucket.name} to re-apply permissions...`);
        await storage.deleteBucket(bucket.id);
        console.log(`✅ Bucket ${bucket.name} deleted.`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        if (error.code !== 404) {
          console.error(`❌ Error checking/deleting bucket ${bucket.name}:`, error);
          throw error;
        }
      }
      await createBucket(bucket);
    }

    console.log('\n🎉 Appwrite schema setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the data migration script to populate initial data (if applicable).');
    console.log('2. Test your application thoroughly, especially user sign-up and data creation.');
    
  } catch (error) {
    console.error('\n💥 Schema setup failed:', error);
    process.exit(1);
  }
}

main();
