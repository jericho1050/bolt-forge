import { BaseRepository } from './BaseRepository';
import { 
  Skill, 
  SkillInsert, 
  SkillUpdate, 
  UserSkill, 
  UserSkillInsert, 
  UserSkillUpdate 
} from '../appwrite-types';
import { appwriteDb } from '../connection';
import { DATABASE_ID, COLLECTION_IDS } from '../../appwrite';
import { Query } from 'appwrite';

/**
 * Skill Repository
 * Handles all skill-related database operations
 */
export class SkillRepository extends BaseRepository<Skill, SkillInsert, SkillUpdate> {
  constructor() {
    super('skills');
  }

  /**
   * Find skills by category
   */
  public async findByCategory(category: string): Promise<Skill[]> {
    try {
      const queries = [
        Query.equal('category', category),
        Query.orderAsc('name')
      ];
      
      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, queries);
      this.logSuccess('findByCategory', response.documents);
      return response.documents as Skill[];
    } catch (error) {
      this.handleError(error as Error, 'findByCategory');
    }
  }

  /**
   * Get all categories
   */
  public async getCategories(): Promise<string[]> {
    try {
      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, [
        Query.orderAsc('category')
      ]);
      
      const categories = [...new Set(response.documents.map(item => (item as Skill).category))];
      this.logSuccess('getCategories', categories);
      return categories;
    } catch (error) {
      this.handleError(error as Error, 'getCategories');
    }
  }

  /**
   * Search skills by name
   */
  public async search(searchTerm: string): Promise<Skill[]> {
    try {
      const queries = [
        Query.search('name', searchTerm),
        Query.orderAsc('name')
      ];
      
      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, queries);
      this.logSuccess('search', response.documents);
      return response.documents as Skill[];
    } catch (error) {
      this.handleError(error as Error, 'search');
    }
  }

  /**
   * Get popular skills (most used)
   */
  public async getPopular(limit: number = 20): Promise<Skill[]> {
    try {
      // In Appwrite, we'll need to get user skills and group by skill_id
      // This is a simplified version - in a real app you might want to use a function or aggregate
      const queries = [
        Query.limit(limit * 5), // Get more records to process
        Query.orderDesc('$createdAt')
      ];
      
      const response = await appwriteDb.listDocuments(DATABASE_ID, COLLECTION_IDS.USER_SKILLS, queries);
      
      // Group by skill_id and count occurrences
      const skillCounts: Record<string, number> = {};
      response.documents.forEach(doc => {
        const userSkill = doc as UserSkill;
        skillCounts[userSkill.skill_id] = (skillCounts[userSkill.skill_id] || 0) + 1;
      });
      
      // Sort by count and limit
      const popularSkillIds = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([skillId]) => skillId);
      
      // Get skill details for popular skills
      const popularSkills: Skill[] = [];
      for (const skillId of popularSkillIds) {
        try {
          const skill = await appwriteDb.getDocument(DATABASE_ID, COLLECTION_IDS.SKILLS, skillId);
          popularSkills.push(skill as Skill);
        } catch {
          // Skip if skill not found
          console.warn(`Skill ${skillId} not found`);
        }
      }
      
      this.logSuccess('getPopular', popularSkills);
      return popularSkills;
    } catch (error) {
      this.handleError(error as Error, 'getPopular');
    }
  }

  /**
   * Get skills grouped by category
   */
  public async getGroupedByCategory(): Promise<Record<string, Skill[]>> {
    const skills = await this.findAll();
    
    const grouped: Record<string, Skill[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });

    // Sort skills within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }
}

/**
 * User Skill Repository
 * Handles user skill associations
 */
export class UserSkillRepository extends BaseRepository<UserSkill, UserSkillInsert, UserSkillUpdate> {
  constructor() {
    super('user_skills');
  }

  /**
   * Find user skills with skill details
   */
  public async findByUserId(userId: string): Promise<UserSkill[]> {
    try {
      const queries = [
        Query.equal('user_id', userId),
        Query.orderDesc('proficiency_level')
      ];
      
      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, queries);
      
      // Get skill details for each user skill
      const userSkillsWithDetails = await Promise.all(
        response.documents.map(async (doc) => {
          const userSkill = doc as UserSkill;
          try {
            const skill = await appwriteDb.getDocument(DATABASE_ID, COLLECTION_IDS.SKILLS, userSkill.skill_id);
            return {
              ...userSkill,
              skill: skill as Skill
            };
          } catch {
            return userSkill;
          }
        })
      );
      
      this.logSuccess('findByUserId', userSkillsWithDetails);
      return userSkillsWithDetails;
    } catch (error) {
      this.handleError(error as Error, 'findByUserId');
    }
  }

  /**
   * Find users by skill
   */
  public async findUsersBySkill(
    skillId: string,
    options: {
      minProficiency?: number;
      verified?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: UserSkill[]; count: number }> {
    const { minProficiency = 0, verified, limit = 20, offset = 0 } = options;

    try {
      const queries = [
        Query.equal('skill_id', skillId),
        Query.greaterThanEqual('proficiency_level', minProficiency),
        Query.orderDesc('proficiency_level'),
        Query.limit(limit),
        Query.offset(offset)
      ];

      if (verified !== undefined) {
        queries.push(Query.equal('is_verified', verified));
      }

      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, queries);
      
      // Get user profile details for each user skill
      const userSkillsWithProfiles = await Promise.all(
        response.documents.map(async (doc) => {
          const userSkill = doc as UserSkill;
          try {
            const profile = await appwriteDb.getDocument(DATABASE_ID, COLLECTION_IDS.PROFILES, userSkill.user_id);
            return {
              ...userSkill,
              user: profile
            };
          } catch {
            return userSkill;
          }
        })
      );

      this.logSuccess('findUsersBySkill', userSkillsWithProfiles);
      return { data: userSkillsWithProfiles, count: response.total };
    } catch (error) {
      this.handleError(error as Error, 'findUsersBySkill');
    }
  }

  /**
   * Add skill to user
   */
  public async addUserSkill(
    userId: string,
    skillId: string,
    proficiencyLevel: number
  ): Promise<UserSkill> {
    const data: UserSkillInsert = {
      user_id: userId,
      skill_id: skillId,
      proficiency_level: proficiencyLevel,
      is_verified: false,
    };

    return this.create(data);
  }

  /**
   * Update user skill proficiency
   */
  public async updateProficiency(
    userSkillId: string,
    proficiencyLevel: number
  ): Promise<UserSkill> {
    const updateData: UserSkillUpdate = {
      proficiency_level: proficiencyLevel,
    };

    return this.update(userSkillId, updateData);
  }

  /**
   * Verify user skill
   */
  public async verifySkill(userSkillId: string): Promise<UserSkill> {
    const updateData: UserSkillUpdate = {
      is_verified: true,
      verified_at: new Date().toISOString(),
    };

    return this.update(userSkillId, updateData);
  }

  /**
   * Remove user skill
   */
  public async removeUserSkill(userId: string, skillId: string): Promise<void> {
    try {
      const queries = [
        Query.equal('user_id', userId),
        Query.equal('skill_id', skillId)
      ];
      
      const response = await appwriteDb.listDocuments(DATABASE_ID, this.collectionId, queries);
      
      if (response.documents.length > 0) {
        await appwriteDb.deleteDocument(DATABASE_ID, this.collectionId, response.documents[0].$id);
        this.logSuccess('removeUserSkill');
      } else {
        throw new Error('User skill not found');
      }
    } catch (error) {
      this.handleError(error as Error, 'removeUserSkill');
    }
  }

  /**
   * Get user skill statistics
   */
  public async getUserSkillStats(userId: string): Promise<{
    total: number;
    verified: number;
    averageProficiency: number;
    topSkills: UserSkill[];
  }> {
    const userSkills = await this.findByUserId(userId);

    const total = userSkills.length;
    const verified = userSkills.filter(us => us.is_verified).length;
    const averageProficiency = total > 0 
      ? userSkills.reduce((sum, us) => sum + (us.proficiency_level || 0), 0) / total 
      : 0;
    const topSkills = userSkills
      .sort((a, b) => (b.proficiency_level || 0) - (a.proficiency_level || 0))
      .slice(0, 5);

    return {
      total,
      verified,
      averageProficiency: Math.round(averageProficiency),
      topSkills,
    };
  }
}

export const skillRepository = new SkillRepository();
export const userSkillRepository = new UserSkillRepository();
