import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Github, 
  Linkedin, 
  Globe,
  Star,
  Code,
  Edit3,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';

interface ProfileProps {
  userType: 'developer' | 'company';
  onNavigate: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ userType, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Profile: Starting sign out process...');
      
      // Call the sign out function from AuthContext
      await signOut();
      
      console.log('✅ Profile: Sign out successful, redirecting to homepage...');
      
      // Navigate to homepage after successful sign out
      navigate({ to: '/', replace: true });
      
      console.log('🎯 Profile: Navigation to homepage completed');
      
    } catch (error) {
      console.error('❌ Profile: Sign out error:', error);
      
      // Even if there's an error, still try to redirect to homepage
      // since the AuthContext should have cleared the local state
      console.log('⚠️ Profile: Redirecting to homepage despite error...');
      navigate({ to: '/', replace: true });
    }
  };

  const developerProfile = {
    name: "Alex Johnson",
    title: "Full-Stack Developer",
    location: "San Francisco, CA",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    github: "alexjohnson",
    linkedin: "alex-johnson-dev",
    website: "alexjohnson.dev",
    bio: "Passionate full-stack developer with 3+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies. Love working on challenging projects that make a real impact.",
    skills: [
      { name: "React", level: 90, verified: true },
      { name: "Node.js", level: 85, verified: true },
      { name: "TypeScript", level: 88, verified: false },
      { name: "Python", level: 75, verified: true },
      { name: "AWS", level: 70, verified: false },
      { name: "MongoDB", level: 80, verified: true }
    ],
    badges: [
      { name: "Fast Deliverer", icon: "🚀", description: "Completed 95% of projects before deadline" },
      { name: "Code Quality", icon: "✨", description: "Maintained 4.8+ star rating" },
      { name: "Team Player", icon: "🤝", description: "Excellent collaboration skills" },
      { name: "Problem Solver", icon: "🧩", description: "Solved complex technical challenges" }
    ],
    stats: {
      projectsCompleted: 12,
      totalEarnings: 3240,
      averageRating: 4.8,
      responseTime: "< 2 hours"
    }
  };

  const companyProfile = {
    name: "TechCorp Solutions",
    industry: "Software Development",
    location: "New York, NY",
    email: "hiring@techcorp.com",
    phone: "+1 (555) 987-6543",
    website: "techcorp.com",
    description: "Leading software development company specializing in enterprise solutions and digital transformation. We're committed to fostering innovation and providing growth opportunities for talented developers.",
    teamSize: "50-200 employees",
    founded: "2018",
    projects: [
      { title: "E-commerce Platform", budget: "$5,000", completed: true },
      { title: "Mobile App Development", budget: "$8,000", completed: true },
      { title: "AI Dashboard", budget: "$12,000", completed: false },
      { title: "API Integration", budget: "$3,500", completed: true }
    ],
    stats: {
      projectsPosted: 28,
      developersHired: 84,
      totalSpent: 24680,
      successRate: 94
    }
  };

  const profile = userType === 'developer' ? developerProfile : companyProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-24"></div>
              <div className="p-6 -mt-12">
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                  <p className="text-gray-600 mb-4">
                    {userType === 'developer' ? developerProfile.title : companyProfile.industry}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-1 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>

                  {userType === 'developer' && (
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-gray-900">{developerProfile.stats.averageRating}</span>
                        </div>
                        <span className="text-xs text-gray-600">Rating</span>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{developerProfile.stats.projectsCompleted}</div>
                        <span className="text-xs text-gray-600">Projects</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
                {userType === 'developer' && (
                  <>
                    <div className="flex items-center space-x-3">
                      <Github className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{developerProfile.github}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{developerProfile.linkedin}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{profile.website}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About/Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {userType === 'developer' ? 'About Me' : 'Company Description'}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {userType === 'developer' ? developerProfile.bio : companyProfile.description}
              </p>
              {userType === 'company' && (
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="text-sm text-gray-600">Team Size</span>
                    <p className="font-medium text-gray-900">{companyProfile.teamSize}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Founded</span>
                    <p className="font-medium text-gray-900">{companyProfile.founded}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Skills or Projects */}
            {userType === 'developer' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Skills & Expertise</h3>
                <div className="space-y-4">
                  {developerProfile.skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          {skill.verified && (
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Verified
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Projects</h3>
                <div className="space-y-4">
                  {companyProfile.projects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.budget}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.completed ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badges or Stats */}
            {userType === 'developer' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements & Badges</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {developerProfile.badges.map((badge, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Statistics</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Code className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{companyProfile.stats.projectsPosted}</div>
                    <div className="text-sm text-gray-600">Projects Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{companyProfile.stats.developersHired}</div>
                    <div className="text-sm text-gray-600">Developers Hired</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${companyProfile.stats.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{companyProfile.stats.successRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;