import React, { useState } from 'react';
import { Code, Briefcase, Shield, Zap, Users, Award } from 'lucide-react';
import EnhancedAuthModal from './EnhancedAuthModal';

interface LandingPageProps {
  onSignIn: (type: 'developer' | 'company') => void;
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onNavigate }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUserType, setAuthUserType] = useState<'developer' | 'company'>('developer');

  const handleAuthClick = (userType: 'developer' | 'company') => {
    setAuthUserType(userType);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-white font-bold text-xl">Bolt-Forge</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleAuthClick('developer')}
              className="text-white hover:text-purple-200 transition-colors"
            >
              For Developers
            </button>
            <button
              onClick={() => handleAuthClick('company')}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              For Companies
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Micro-Internships for
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Junior Developers</span>
          </h1>
          <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect talented junior developers with companies through secure, blockchain-powered micro-internships. 
            Build experience, earn credentials, and grow your career with AI-powered mentorship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleAuthClick('developer')}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Start as Developer
            </button>
            <button
              onClick={() => handleAuthClick('company')}
              className="bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-400 transition-all transform hover:scale-105 shadow-lg border-2 border-purple-400"
            >
              Post Projects
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose Bolt-Forge?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Blockchain Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Secure escrow payments and verifiable credentials powered by Algorand blockchain technology.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Mentorship</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized guidance from AI mentors with video avatars and voice assistance.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gamified Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Earn badges, build reputation, and unlock achievements as you complete projects.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Active Developers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">25K+</div>
              <div className="text-gray-400">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">$2M+</div>
              <div className="text-gray-400">Paid to Developers</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Development Career?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of developers building their future with Bolt-Forge
          </p>
          <button
            onClick={() => handleAuthClick('developer')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </div>

      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultUserType={authUserType}
      />
    </div>
  );
};

export default LandingPage;