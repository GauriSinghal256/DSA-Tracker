import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Target, Calendar, Filter } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  
  const mockData = {
    difficultyStats: {
      Easy: { solved: 120, total: 150, percentage: 80 },
      Medium: { solved: 85, total: 120, percentage: 71 },
      Hard: { solved: 25, total: 50, percentage: 50 }
    },
    platformStats: {
      'LeetCode': 145,
      'GeeksforGeeks': 98,
      'CodeForces': 67,
      'HackerRank': 45,
      'CodeChef': 32
    },
    topicStats: {
      'Array': 45,
      'Dynamic Programming': 38,
      'Tree': 32,
      'Graph': 28,
      'String': 25,
      'Hash Table': 22,
      'Binary Search': 18,
      'Greedy': 15
    },
    weeklyProgress: [
      { week: 'Week 1', problems: 12 },
      { week: 'Week 2', problems: 15 },
      { week: 'Week 3', problems: 18 },
      { week: 'Week 4', problems: 22 }
    ]
  };

  const ProgressBar = ({ label, value, total, color }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{value}/{total}</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 text-right">
        {Math.round((value / total) * 100)}% completed
      </div>
    </div>
  );

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Deep insights into your coding progress
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Problems Solved"
          value="387"
          change={12}
          icon={Target}
          color="bg-blue-500"
        />
        <StatCard
          title="Accuracy Rate"
          value="78%"
          change={5}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Current Streak"
          value="12 days"
          change={8}
          icon={Calendar}
          color="bg-orange-500"
        />
        <StatCard
          title="Weekly Average"
          value="18"
          change={-3}
          icon={BarChart3}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Difficulty Distribution */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <PieChart className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Difficulty Breakdown</h2>
          </div>
          
          <div className="space-y-6">
            <ProgressBar
              label="Easy Problems"
              value={mockData.difficultyStats.Easy.solved}
              total={mockData.difficultyStats.Easy.total}
              color="bg-gradient-to-r from-green-500 to-green-400"
            />
            <ProgressBar
              label="Medium Problems"
              value={mockData.difficultyStats.Medium.solved}
              total={mockData.difficultyStats.Medium.total}
              color="bg-gradient-to-r from-yellow-500 to-yellow-400"
            />
            <ProgressBar
              label="Hard Problems"
              value={mockData.difficultyStats.Hard.solved}
              total={mockData.difficultyStats.Hard.total}
              color="bg-gradient-to-r from-red-500 to-red-400"
            />
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Platform Usage</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(mockData.platformStats).map(([platform, count], index) => (
              <div key={platform} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-400' :
                    index === 1 ? 'bg-green-400' :
                    index === 2 ? 'bg-purple-400' :
                    index === 3 ? 'bg-orange-400' : 'bg-pink-400'
                  }`} />
                  <span className="text-gray-300 font-medium">{platform}</span>
                </div>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Mastery */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Topic Mastery</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(mockData.topicStats).map(([topic, count]) => (
            <div key={topic} className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {topic}
                </h3>
                <span className="text-gray-400 text-sm">{count}</span>
              </div>
              <div className="w-full bg-gray-600/50 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((count / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Weekly Progress</h2>
        </div>
        
        <div className="flex items-end space-x-4 h-64">
          {mockData.weeklyProgress.map((week, index) => (
            <div key={week.week} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-1000 hover:from-blue-500 hover:to-purple-500"
                style={{ height: `${(week.problems / 25) * 100}%` }}
              />
              <div className="mt-3 text-center">
                <div className="text-white font-bold text-lg">{week.problems}</div>
                <div className="text-gray-400 text-sm">{week.week}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;