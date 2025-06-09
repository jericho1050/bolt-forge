import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Code, 
  Clock, 
  DollarSign, 
  Star, 
  MapPin,
  Bookmark,
  ArrowLeft,
  Zap
} from 'lucide-react';

interface ProjectMarketplaceProps {
  onNavigate: (page: string) => void;
}

const ProjectMarketplace: React.FC<ProjectMarketplaceProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = [
    'All', 'Frontend', 'Backend', 'Mobile', 'Design', 'AI/ML', 'Blockchain'
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const projects = [
    {
      id: 1,
      title: "React E-commerce Cart Component",
      company: "ShopTech Solutions",
      description: "Build a responsive shopping cart component with local storage persistence and checkout flow integration.",
      budget: "$250 - $400",
      duration: "3-5 days",
      difficulty: "Intermediate",
      category: "Frontend",
      tags: ["React", "JavaScript", "CSS", "LocalStorage"],
      postedTime: "2 hours ago",
      applicants: 12,
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      title: "Node.js API Authentication System",
      company: "SecureApp Inc",
      description: "Implement JWT-based authentication with role-based access control for a SaaS platform.",
      budget: "$400 - $600",
      duration: "1 week",
      difficulty: "Advanced",
      category: "Backend",
      tags: ["Node.js", "JWT", "MongoDB", "Express"],
      postedTime: "4 hours ago",
      applicants: 8,
      rating: 4.9,
      featured: false
    },
    {
      id: 3,
      title: "AI Chatbot Widget Integration",
      company: "InnovateTech",
      description: "Create a conversational AI widget that can be embedded into websites with customizable styling.",
      budget: "$600 - $800",
      duration: "2 weeks",
      difficulty: "Expert",
      category: "AI/ML",
      tags: ["Python", "OpenAI", "JavaScript", "Embeddings"],
      postedTime: "1 day ago",
      applicants: 15,
      rating: 4.7,
      featured: true
    },
    {
      id: 4,
      title: "Mobile App UI Redesign",
      company: "DesignFlow Studio",
      description: "Modernize the user interface of a React Native app with new design system and animations.",
      budget: "$300 - $500",
      duration: "1 week",
      difficulty: "Intermediate",
      category: "Mobile",
      tags: ["React Native", "UI/UX", "Animation", "Figma"],
      postedTime: "3 days ago",
      applicants: 22,
      rating: 4.6,
      featured: false
    },
    {
      id: 5,
      title: "Smart Contract Development",
      company: "CryptoVentures",
      description: "Develop and deploy smart contracts for a decentralized marketplace on Ethereum blockchain.",
      budget: "$800 - $1200",
      duration: "2-3 weeks",
      difficulty: "Expert",
      category: "Blockchain",
      tags: ["Solidity", "Ethereum", "Web3", "Hardhat"],
      postedTime: "1 week ago",
      applicants: 6,
      rating: 4.9,
      featured: true
    },
    {
      id: 6,
      title: "Vue.js Dashboard Components",
      company: "DataViz Pro",
      description: "Create reusable dashboard components with charts and data visualization for analytics platform.",
      budget: "$350 - $550",
      duration: "5-7 days",
      difficulty: "Intermediate",
      category: "Frontend",
      tags: ["Vue.js", "Chart.js", "CSS", "Data Visualization"],
      postedTime: "2 days ago",
      applicants: 18,
      rating: 4.5,
      featured: false
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           project.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             project.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Project Marketplace</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, skills, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty.toLowerCase()}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Projects</h1>
            <p className="text-gray-600">{filteredProjects.length} projects found</p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>Sort by: Latest</option>
              <option>Sort by: Budget (High to Low)</option>
              <option>Sort by: Budget (Low to High)</option>
              <option>Sort by: Deadline</option>
            </select>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer ${
                project.featured ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {project.featured && (
                        <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Zap className="w-3 h-3" />
                          <span>Featured</span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm font-medium mb-2">{project.company}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bookmark className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{project.budget}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{project.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{project.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{project.postedTime}</span>
                    <span>•</span>
                    <span>{project.applicants} applicants</span>
                  </div>
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectMarketplace;