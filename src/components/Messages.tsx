import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  User,
  Circle
} from 'lucide-react';

interface MessagesProps {
  onNavigate: (page: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ onNavigate }) => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Project Manager at TechCorp",
      lastMessage: "Great work on the React component! When can we schedule the next milestone?",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      avatar: "👩‍💼"
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      role: "CTO at StartupXYZ",
      lastMessage: "I've reviewed your proposal for the API integration. Let's discuss the timeline.",
      timestamp: "1 hour ago",
      unread: 0,
      online: true,
      avatar: "👨‍💻"
    },
    {
      id: 3,
      name: "InnovateLab Team",
      role: "AI/ML Company",
      lastMessage: "Thanks for submitting the chatbot prototype. We'll have feedback by tomorrow.",
      timestamp: "3 hours ago",
      unread: 1,
      online: false,
      avatar: "🚀"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Senior Developer at DevFlow",
      lastMessage: "The mobile app redesign looks fantastic! Really impressed with the animations.",
      timestamp: "1 day ago",
      unread: 0,
      online: false,
      avatar: "👨‍🎨"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Product Owner at DataViz",
      lastMessage: "Can you add the chart filtering feature we discussed? Budget approved.",
      timestamp: "2 days ago",
      unread: 0,
      online: true,
      avatar: "📊"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Sarah Chen",
      content: "Hi Alex! I hope you're doing well. I wanted to check in on the React e-commerce component project.",
      timestamp: "10:30 AM",
      isOwn: false
    },
    {
      id: 2,
      sender: "You",
      content: "Hi Sarah! Everything is going smoothly. I've completed the cart functionality and I'm currently working on the checkout flow integration.",
      timestamp: "10:32 AM",
      isOwn: true
    },
    {
      id: 3,
      sender: "You",
      content: "I should have the first version ready for review by tomorrow morning. Would you like me to set up a demo?",
      timestamp: "10:33 AM",
      isOwn: true
    },
    {
      id: 4,
      sender: "Sarah Chen",
      content: "That sounds perfect! Yes, a demo would be great. How about we schedule it for tomorrow at 2 PM?",
      timestamp: "10:45 AM",
      isOwn: false
    },
    {
      id: 5,
      sender: "Sarah Chen",
      content: "Also, I've been really impressed with your progress so far. The component architecture looks clean and well-documented.",
      timestamp: "10:46 AM",
      isOwn: false
    },
    {
      id: 6,
      sender: "You",
      content: "Thank you! I really appreciate the feedback. 2 PM tomorrow works perfectly for me. I'll send you a calendar invite with the demo link.",
      timestamp: "11:15 AM",
      isOwn: true
    },
    {
      id: 7,
      sender: "Sarah Chen",
      content: "Great work on the React component! When can we schedule the next milestone?",
      timestamp: "2:28 PM",
      isOwn: false
    }
  ];

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-gray-900">Messages</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat === conversation.id ? 'bg-purple-50 border-purple-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                        {conversation.avatar}
                      </div>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{conversation.role}</p>
                      <p className="text-sm text-gray-700 truncate">{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <div className="flex justify-end mt-1">
                          <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unread}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {selectedConversation.avatar}
                      </div>
                      {selectedConversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                      <p className="text-sm text-gray-600">{selectedConversation.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isOwn ? 'text-purple-200' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Smile className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;