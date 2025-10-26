import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProblemHistory {
  _id: string;
  problem: {
    title: string;
    platform: string;
    difficulty: string;
    tags: string[];
  };
  solvedAt?: string;
  status: string;
  createdAt: string;
}

const Recommendations = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastProblem, setLastProblem] = useState<ProblemHistory | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch last solved problem
  useEffect(() => {
    fetchLastSolvedProblem();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchLastSolvedProblem = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/problems/allProblems", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        // Get last solved problem
        const solvedProblems = data.data.filter((p: ProblemHistory) => p.status === 'Solved');
        if (solvedProblems.length > 0) {
          const lastSolved = solvedProblems.sort((a: ProblemHistory, b: ProblemHistory) => {
            const dateA = new Date(a.solvedAt || a.createdAt).getTime();
            const dateB = new Date(b.solvedAt || b.createdAt).getTime();
            return dateB - dateA;
          })[0];
          
          setLastProblem(lastSolved);
          
          // Add welcome message with default prompt
          const defaultMessage: Message = {
            role: 'assistant',
            content: `Welcome! I'm your AI coding assistant. I see you last solved "${lastSolved.problem.title}". What would you like help with?\n\nYou can ask me to:\n• Suggest similar problems\n• Explain different approaches\n• Recommend next problems\n• Help with concepts\n\nOr just ask anything about your coding journey! 🚀`,
            timestamp: new Date()
          };
          setMessages([defaultMessage]);
        } else {
          setMessages([{
            role: 'assistant',
            content: 'Welcome! I\'m your AI coding assistant. Start solving problems and I\'ll provide personalized recommendations based on your progress!',
            timestamp: new Date()
          }]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch last problem:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call backend API to get AI response
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: inputMessage,
          lastProblem: lastProblem ? {
            title: lastProblem.problem.title,
            platform: lastProblem.problem.platform,
            difficulty: lastProblem.problem.difficulty,
            tags: lastProblem.problem.tags
          } : null
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Coding Assistant
        </h1>
        <p className="text-gray-400">
          Get personalized recommendations and guidance for your DSA journey
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-blue-500/20'
                    : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-blue-400" />
                ) : (
                  <Bot className="w-5 h-5 text-purple-400" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`flex-1 rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500/20 text-white'
                    : 'bg-gray-700/30 text-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 rounded-2xl p-4 bg-gray-700/30">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your coding journey..."
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;