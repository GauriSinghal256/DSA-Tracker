import React, { useState } from 'react';
import { Target, Building, CheckCircle, Circle, Clock, Star, Trophy, ArrowRight } from 'lucide-react';

const CompanyRoadmaps = () => {
  const [selectedCompany, setSelectedCompany] = useState('google');
  const [selectedPhase, setSelectedPhase] = useState('foundation');

  const companies = [
    { id: 'google', name: 'Google', logo: '🟢', difficulty: 'Hard', avgRounds: 5 },
    { id: 'amazon', name: 'Amazon', logo: '🟠', difficulty: 'Medium-Hard', avgRounds: 4 },
    { id: 'microsoft', name: 'Microsoft', logo: '🔵', difficulty: 'Medium-Hard', avgRounds: 4 },
    { id: 'facebook', name: 'Meta', logo: '🔷', difficulty: 'Hard', avgRounds: 5 },
    { id: 'apple', name: 'Apple', logo: '⚫', difficulty: 'Hard', avgRounds: 4 },
    { id: 'netflix', name: 'Netflix', logo: '🔴', difficulty: 'Hard', avgRounds: 3 }
  ];

  const phases = [
    { id: 'foundation', name: 'Foundation', duration: '2-4 weeks' },
    { id: 'intermediate', name: 'Intermediate', duration: '4-6 weeks' },
    { id: 'advanced', name: 'Advanced', duration: '6-8 weeks' },
    { id: 'mockinterviews', name: 'Mock Interviews', duration: '2-3 weeks' }
  ];

  const roadmapData = {
    google: {
      foundation: {
        topics: [
          { name: 'Arrays & Strings', problems: ['Two Sum', 'Longest Substring', 'Merge Intervals'], completed: 2, total: 3 },
          { name: 'Linked Lists', problems: ['Reverse Linked List', 'Merge Two Lists', 'Cycle Detection'], completed: 3, total: 3 },
          { name: 'Hash Tables', problems: ['Group Anagrams', 'Valid Anagram', 'First Unique Character'], completed: 1, total: 3 },
          { name: 'Stacks & Queues', problems: ['Valid Parentheses', 'Min Stack', 'Implement Queue'], completed: 2, total: 3 }
        ],
        keySkills: ['Time Complexity Analysis', 'Space Optimization', 'Problem Pattern Recognition'],
        estimatedTime: '20-30 hours'
      },
      intermediate: {
        topics: [
          { name: 'Binary Trees', problems: ['Inorder Traversal', 'Max Depth', 'Path Sum'], completed: 2, total: 3 },
          { name: 'Binary Search', problems: ['Search Insert Position', 'Find Peak Element', 'Search Matrix'], completed: 1, total: 3 },
          { name: 'Two Pointers', problems: ['Container With Water', '3Sum', 'Remove Duplicates'], completed: 3, total: 3 },
          { name: 'Sliding Window', problems: ['Max Subarray', 'Min Window Substring', 'Longest Substring'], completed: 0, total: 3 }
        ],
        keySkills: ['Algorithm Optimization', 'Multiple Approaches', 'Edge Case Handling'],
        estimatedTime: '40-50 hours'
      },
      advanced: {
        topics: [
          { name: 'Dynamic Programming', problems: ['Climbing Stairs', 'Coin Change', 'LIS'], completed: 1, total: 3 },
          { name: 'Graph Algorithms', problems: ['Course Schedule', 'Number of Islands', 'Word Ladder'], completed: 0, total: 3 },
          { name: 'Backtracking', problems: ['N-Queens', 'Sudoku Solver', 'Generate Parentheses'], completed: 0, total: 3 },
          { name: 'Advanced Trees', problems: ['Serialize Tree', 'LCA', 'Tree Construction'], completed: 0, total: 3 }
        ],
        keySkills: ['Complex Problem Solving', 'System Design Basics', 'Optimization Techniques'],
        estimatedTime: '60-80 hours'
      }
    }
  };

  const currentRoadmap = roadmapData[selectedCompany]?.[selectedPhase] || roadmapData.google.foundation;

  const getCompletionPercentage = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  const getTopicColor = (completed, total) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'border-green-500/50 bg-green-500/10';
    if (percentage >= 50) return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-gray-700/50 bg-gray-700/10';
  };

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Company Roadmaps
        </h1>
        <p className="text-gray-400 text-lg">
          Structured preparation plans tailored for top tech companies
        </p>
      </div>

      {/* Company Selection */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <Building className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Select Target Company</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedCompany === company.id
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{company.logo}</span>
                <div className="text-left">
                  <h3 className="text-white font-semibold">{company.name}</h3>
                  <p className="text-sm text-gray-400">{company.difficulty}</p>
                  <p className="text-xs text-gray-500">{company.avgRounds} rounds avg</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Company Overview */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{selectedCompanyData?.logo}</span>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedCompanyData?.name} Preparation</h3>
              <p className="text-blue-300">Difficulty: {selectedCompanyData?.difficulty}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">85%</div>
            <div className="text-sm text-gray-400">Overall Progress</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">127</div>
            <div className="text-sm text-gray-400">Problems Solved</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">8 weeks</div>
            <div className="text-sm text-gray-400">Estimated Time</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">High</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Phase Selection */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Learning Path</h2>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {phases.map((phase, index) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                selectedPhase === phase.id
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedPhase === phase.id ? 'bg-purple-500/20' : 'bg-gray-700/50'
              }`}>
                <span className="text-sm font-bold text-white">{index + 1}</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">{phase.name}</div>
                <div className="text-xs text-gray-400">{phase.duration}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Phase Details */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {phases.find(p => p.id === selectedPhase)?.name} Phase
          </h2>
          <div className="text-sm text-gray-400">
            Estimated: {currentRoadmap.estimatedTime}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Topics & Problems</h3>
            
            {currentRoadmap.topics.map((topic, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl border-2 transition-all duration-200 ${getTopicColor(topic.completed, topic.total)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{topic.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {topic.completed}/{topic.total}
                    </span>
                    <div className="w-16 bg-gray-700/50 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${getCompletionPercentage(topic.completed, topic.total)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {topic.problems.map((problem, problemIndex) => (
                    <div
                      key={problemIndex}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                    >
                      {problemIndex < topic.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                      <span className={`flex-1 ${problemIndex < topic.completed ? 'text-green-300' : 'text-gray-300'}`}>
                        {problem}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-500 hover:text-white transition-colors cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-700/30 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Key Skills</h3>
              <div className="space-y-3">
                {currentRoadmap.keySkills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-300 text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-5 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-3">Phase Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Completion</span>
                  <span className="text-green-400 font-semibold">75%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <div className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 w-3/4" />
                </div>
                <div className="text-xs text-gray-400">
                  9/12 topics completed
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRoadmaps;