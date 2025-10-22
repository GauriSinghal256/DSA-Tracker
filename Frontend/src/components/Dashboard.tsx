import React, { useState, useEffect } from 'react';
import { Calendar, Flame, Target, Trophy, TrendingUp, Clock } from 'lucide-react';
import StreakCalendar from './StreakCalendar';
import StatsCard from './StatsCard';

const Dashboard = () => {
  const [streakData, setStreakData] = useState<{ date: Date; count: number; intensity: number }[]>([]);
  const [stats, setStats] = useState({
    currentStreak: 12,
    longestStreak: 25,
    totalProblems: 387,
    thisWeek: 8,
    thisMonth: 42,
    accuracy: 78
  });

  useEffect(() => {
    // Generate mock streak data for the past year
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const data = [];
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const intensity = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
      data.push({
        date: new Date(d),
        count: intensity === 0 ? 0 : intensity * Math.floor(Math.random() * 3) + 1,
        intensity
      });
    }
    setStreakData(data);
  }, []);

  const recentActivity = [
    { problem: "Two Sum", platform: "LeetCode", difficulty: "Easy", solved: true, time: "2 hours ago" },
    { problem: "Binary Tree Inorder", platform: "GeeksforGeeks", difficulty: "Medium", solved: true, time: "5 hours ago" },
    { problem: "Longest Palindrome", platform: "CodeForces", difficulty: "Hard", solved: false, time: "1 day ago" },
    { problem: "Merge K Sorted Lists", platform: "LeetCode", difficulty: "Hard", solved: true, time: "2 days ago" },
  ];

  return (
    
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Welcome back, Coder! 🚀
        </h1>
        <p className="text-gray-400 text-lg">
          Keep pushing your limits and achieve your placement goals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Current Streak"
          value={stats.currentStreak}
          suffix="days"
          icon={Flame}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
        />
        <StatsCard
          title="Longest Streak"
          value={stats.longestStreak}
          suffix="days"
          icon={Trophy}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
        <StatsCard
          title="Total Problems"
          value={stats.totalProblems}
          suffix=""
          icon={Target}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatsCard
          title="This Week"
          value={stats.thisWeek}
          suffix="solved"
          icon={Calendar}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatsCard
          title="This Month"
          value={stats.thisMonth}
          suffix="solved"
          icon={TrendingUp}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatsCard
          title="Accuracy"
          value={stats.accuracy}
          suffix="%"
          icon={Target}
          color="text-pink-400"
          bgColor="bg-pink-500/10"
        />
      </div>

      {/* Streak Calendar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Flame className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Your Coding Journey</h2>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <StreakCalendar data={streakData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${activity.solved ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {activity.problem}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {activity.platform} • {activity.difficulty}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Log New Problem</h3>
          </div>
          <p className="text-gray-400 text-sm">Track your latest coding challenge</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">View Analytics</h3>
          </div>
          <p className="text-gray-400 text-sm">Analyze your progress and patterns</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Get Recommendations</h3>
          </div>
          <p className="text-gray-400 text-sm">AI-powered problem suggestions</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;