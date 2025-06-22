import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  User, 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Star,
  Award,
  Code,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  userType: 'developer' | 'company';
}

const Dashboard: React.FC<DashboardProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Dashboard: Starting sign out process...');
      
      // Call the sign out function from AuthContext
      await signOut();
      
      console.log('✅ Dashboard: Sign out successful, redirecting to homepage...');
      
      // Navigate to homepage after successful sign out
      navigate({ to: '/', replace: true });
      
      console.log('🎯 Dashboard: Navigation to homepage completed');
      
    } catch (error) {
      console.error('❌ Dashboard: Sign out error:', error);
      
      // Even if there's an error, still try to redirect to homepage
      // since the AuthContext should have cleared the local state
      console.log('⚠️ Dashboard: Redirecting to homepage despite error...');
      navigate({ to: '/', replace: true });
    }
  };

  const navigation = [
    { id: 'overview', label: 'Overview', icon: Home, to: '/dashboard' },
    { id: 'marketplace', label: 'Marketplace', icon: Search, to: '/marketplace' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, to: '/messages' },
    { id: 'profile', label: 'Profile', icon: User, to: '/profile' },
  ];

  const mockProjects = [
    {
      id: 1,
      title: "React E-commerce Component",
      company: "TechCorp",
      budget: "$250",
      deadline: "3 days",
      difficulty: "Intermediate",
      status: "In Progress"
    },
    {
      id: 2,
      title: "API Integration Dashboard",
      company: "StartupXYZ",
      budget: "$400",
      deadline: "1 week",
      difficulty: "Advanced",
      status: "Available"
    },
    {
      id: 3,
      title: "Mobile App Prototype",
      company: "InnovateLab",
      budget: "$600",
      deadline: "2 weeks",
      difficulty: "Expert",
      status: "Completed"
    }
  ];

  const getDeveloperStats = () => (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Projects Completed</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">$3,240</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">96%</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Active Projects</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const getCompanyStats = () => (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Posted Projects</p>
            <p className="text-2xl font-bold text-gray-900">28</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Code className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Developers Hired</p>
            <p className="text-2xl font-bold text-gray-900">84</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">$24,680</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">94%</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Bolt-Forge</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/marketplace"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{userType === 'developer' ? 'Find Projects' : 'Post Project'}</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  {userType === 'developer' ? 'Developer Dashboard' : 'Company Dashboard'}
                </h3>
              </div>
              <nav className="p-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        window.location.pathname === item.to
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userType === 'developer' ? 'Alex' : 'TechCorp'}!
              </h1>
              <p className="text-gray-600">
                {userType === 'developer' 
                  ? "Here's your development progress and available opportunities."
                  : "Manage your projects and find talented developers."}
              </p>
            </div>

            {/* Stats */}
            {userType === 'developer' ? getDeveloperStats() : getCompanyStats()}

            {/* Recent Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {userType === 'developer' ? 'Your Projects' : 'Recent Projects'}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <p className="text-gray-600">{project.company}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{project.budget}</p>
                          <p className="text-sm text-gray-600">{project.deadline}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          project.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {project.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;