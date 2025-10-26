import React, { useState, useEffect } from 'react';
import { Calendar, Flame, Target, Trophy, TrendingUp, Clock, User, Mail, GraduationCap } from 'lucide-react';
import StreakCalendar from './StreakCalendar';
import StatsCard from './StatsCard';

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

interface UserData {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  year: string;
  createdAt: string;
}

interface DashboardProps {
  onNavigateToRecommendations?: () => void;
}

const Dashboard = ({ onNavigateToRecommendations }: DashboardProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [streakData, setStreakData] = useState<{ date: Date; count: number; intensity: number }[]>([]);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalProblems: 0,
    thisWeek: 0,
    thisMonth: 0,
    accuracy: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        
        const res = await fetch("http://localhost:8000/api/auth/current-user", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
          const problems: ProblemHistory[] = data.data;
          
          // Calculate streaks
          const { currentStreak, longestStreak } = calculateStreaks(problems);
          
          // Count problems
          const solvedProblems = problems.filter(p => p.status === 'Solved');
          const totalProblems = problems.length;
          
          // Calculate weekly and monthly problems
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const thisWeek = problems.filter(p => {
            const solvedDate = p.solvedAt || p.createdAt;
            return new Date(solvedDate) >= weekAgo;
          }).length;
          
          const thisMonth = problems.filter(p => {
            const solvedDate = p.solvedAt || p.createdAt;
            return new Date(solvedDate) >= monthAgo;
          }).length;
          
          // Calculate accuracy (solved vs total)
          const accuracy = totalProblems > 0 ? Math.round((solvedProblems.length / totalProblems) * 100) : 0;
          
          setStats({
            currentStreak,
            longestStreak,
            totalProblems,
            thisWeek,
            thisMonth,
            accuracy
          });
          
          // Set recent activity
          const recent = problems
            .sort((a, b) => {
              const dateA = new Date(a.solvedAt || a.createdAt);
              const dateB = new Date(b.solvedAt || b.createdAt);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 4)
            .map(p => ({
              problem: p.problem.title,
              platform: p.problem.platform,
              difficulty: p.problem.difficulty,
              solved: p.status === 'Solved',
              time: getTimeAgo(new Date(p.solvedAt || p.createdAt))
            }));
          
          setRecentActivity(recent);
          
          // Generate streak calendar data
          generateStreakCalendarData(problems);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    
    fetchDashboardData();
  }, []);

  const calculateStreaks = (problems: ProblemHistory[]) => {
    if (problems.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    const solvedDates = new Set<string>();
    problems
      .filter(p => p.status === 'Solved')
      .forEach(p => {
        const date = new Date(p.solvedAt || p.createdAt);
        solvedDates.add(date.toDateString());
      });
    
    const sortedDates = Array.from(solvedDates)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate current streak from today backwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak || (currentStreak === 0 && daysDiff === 0)) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak + 1);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak + 1);
    
    // If only one date, streak is at least 1
    if (sortedDates.length === 1) {
      const daysDiff = Math.floor((today.getTime() - sortedDates[0].getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 0) {
        currentStreak = 1;
      }
      longestStreak = 1;
    }
    
    return { currentStreak, longestStreak };
  };

  const generateStreakCalendarData = (problems: ProblemHistory[]) => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Count problems per day
    const dailyCounts = new Map<string, number>();
    
    problems
      .filter(p => p.status === 'Solved')
      .forEach(p => {
        const date = new Date(p.solvedAt || p.createdAt);
        const dateStr = date.toDateString();
        dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
      });
    
    const data = [];
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toDateString();
      const count = dailyCounts.get(dateStr) || 0;
      const intensity = count > 0 ? Math.min(Math.ceil(count / 3), 4) : 0;
      
      data.push({
        date: new Date(d),
        count,
        intensity
      });
    }
    
    setStreakData(data);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };



  return (
    
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">
      {/* Left Sidebar - User Profile (GitHub style) */}
      <div className="lg:w-80 space-y-6">
        {/* User Profile Card */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user?.avatar || "https://via.placeholder.com/150"}
                alt={user?.fullName}
                className="w-48 h-48 rounded-full border-4 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300"
              />
            </div>
            
            {/* User Info */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">{user?.fullName || "Loading..."}</h2>
              <p className="text-gray-400">@{user?.username || "username"}</p>
            </div>

            {/* Contact Info */}
            <div className="w-full space-y-3 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-sm">{user?.email || "email@example.com"}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <span className="text-sm capitalize">{user?.year || "Year"} Year</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-sm">Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Quick View */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Problems Solved</span>
              <span className="text-2xl font-bold text-blue-400">{stats.totalProblems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Current Streak</span>
              <span className="text-2xl font-bold text-orange-400">{stats.currentStreak} 🔥</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Accuracy</span>
              <span className="text-2xl font-bold text-green-400">{stats.accuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome back, {user?.fullName || "Coder"}! 🚀
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

      {/* Flying Robot */}
      <button
        onClick={onNavigateToRecommendations}
        className="fixed top-24 right-8 z-50 hover:scale-110 transition-transform duration-300 group"
        title="AI Recommendations"
      >
        <div className="relative">
          {/* Robot Emoji */}
          <div className="text-6xl animate-bounce group-hover:animate-spin">
            🤖
          </div>
          {/* Tooltip */}
          <div className="absolute -top-12 right-0 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
            Get AI Recommendations! 🚀
          </div>
          {/* Sparkles Animation */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-75 animation-delay-200"></div>
        </div>
      </button>
    </div>
  );
};

export default Dashboard;