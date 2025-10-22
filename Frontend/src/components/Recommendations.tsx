import React, { useState } from 'react';
import { Zap, Target, Star, Clock, TrendingUp, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

const Recommendations = () => {
  const [selectedGoal, setSelectedGoal] = useState('faang');
  const [difficulty, setDifficulty] = useState('medium');

  const goals = [
    { id: 'faang', label: 'FAANG Preparation', icon: Star, color: 'text-yellow-400' },
    { id: 'startup', label: 'Startup Interview', icon: TrendingUp, color: 'text-green-400' },
    { id: 'competitive', label: 'Competitive Programming', icon: Target, color: 'text-blue-400' },
    { id: 'general', label: 'General Improvement', icon: BookOpen, color: 'text-purple-400' }
  ];

  const weakAreas = [
    { topic: 'Dynamic Programming', percentage: 45, problems: 12 },
    { topic: 'Graph Algorithms', percentage: 52, problems: 8 },
    { topic: 'Tree Traversal', percentage: 68, problems: 15 },
    { topic: 'Binary Search', percentage: 71, problems: 10 }
  ];

  const aiRecommendations = [
    {
      title: "Longest Increasing Subsequence",
      platform: "LeetCode",
      difficulty: "Medium",
      tags: ["Dynamic Programming", "Binary Search"],
      reason: "Strengthen your DP skills with a classic problem",
      estimatedTime: "45 min",
      priority: "High",
      companies: ["Google", "Amazon", "Microsoft"]
    },
    {
      title: "Course Schedule II",
      platform: "LeetCode",
      difficulty: "Medium",
      tags: ["Graph", "Topological Sort"],
      reason: "Practice graph traversal and cycle detection",
      estimatedTime: "35 min",
      priority: "High",
      companies: ["Facebook", "Amazon"]
    },
    {
      title: "Binary Tree Maximum Path Sum",
      platform: "LeetCode",
      difficulty: "Hard",
      tags: ["Tree", "DFS", "Recursion"],
      reason: "Advanced tree problem for FAANG preparation",
      estimatedTime: "60 min",
      priority: "Medium",
      companies: ["Google", "Apple"]
    },
    {
      title: "Find Median from Data Stream",
      platform: "LeetCode",
      difficulty: "Hard",
      tags: ["Heap", "Design"],
      reason: "System design component with data structures",
      estimatedTime: "50 min",
      priority: "Medium",
      companies: ["Netflix", "Amazon"]
    }
  ];

  const dailyChallenge = {
    title: "Rotate Array",
    platform: "LeetCode",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers"],
    description: "Given an array, rotate the array to the right by k steps",
    streak: 7,
    participants: 1247
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Low': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI-Powered Recommendations
        </h1>
        <p className="text-gray-400 text-lg">
          Personalized problem suggestions based on your progress and goals
        </p>
      </div>

      {/* Goal Selection */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Your Current Goal</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal) => {
            const IconComponent = goal.icon;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedGoal === goal.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-lg bg-gray-700/50 flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${goal.color}`} />
                  </div>
                  <span className="text-white font-medium text-center">{goal.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Daily Challenge</h2>
          </div>
          <div className="text-sm text-purple-300">
            {dailyChallenge.participants.toLocaleString()} participants today
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{dailyChallenge.title}</h3>
            <p className="text-gray-300">{dailyChallenge.description}</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{dailyChallenge.platform}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(dailyChallenge.difficulty)}`}>
                {dailyChallenge.difficulty}
              </span>
              <div className="flex flex-wrap gap-1">
                {dailyChallenge.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{dailyChallenge.streak}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Start Challenge
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weak Areas */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Focus Areas</h2>
          </div>
          
          <div className="space-y-4">
            {weakAreas.map((area, index) => (
              <div key={area.topic} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">{area.topic}</span>
                  <span className="text-sm text-gray-400">{area.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      area.percentage < 50 ? 'bg-red-500' :
                      area.percentage < 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${area.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {area.problems} problems solved
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Recommended Problems</h2>
          </div>
          
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {rec.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">{rec.reason}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">{rec.platform}</span>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{rec.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rec.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Popular at: {rec.companies.join(', ')}
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;