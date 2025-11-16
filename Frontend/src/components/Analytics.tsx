import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Target, Calendar, Filter, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import API_BASE_URL from '../config/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AnalyticsData {
  totalProblems: number;
  solvedProblems: number;
  attemptedProblems: number;
  toDoProblems: number;
  accuracy: number;
  currentStreak: number;
  weeklyAverage: number;
  difficultyStats: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  platformStats: Record<string, number>;
  topicStats: Record<string, number>;
  weeklyProgress: Array<{ week: string; problems: number }>;
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/problems/analytics`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        setAnalyticsData(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-sm text-gray-400">{value}/{total}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 text-right">
          {Math.round(percentage)}% completed
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: { title: string; value: string | number; change?: number; icon: any; color: string }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No analytics data available. Start logging problems to see your progress!</p>
      </div>
    );
  }

  const maxWeeklyProblems = Math.max(...analyticsData.weeklyProgress.map(w => w.problems), 1);

  const weeklyChanges = analyticsData.weeklyProgress.map((week, idx, arr) => {
    const prev = idx === 0 ? 0 : arr[idx - 1].problems;
    const diff = week.problems - prev;
    const percent = prev === 0 ? (week.problems === 0 ? 0 : 100) : Math.round((diff / prev) * 100);
    return { diff, percent };
  });

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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Problems Solved"
          value={analyticsData.solvedProblems}
          icon={Target}
          color="bg-blue-500"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${analyticsData.accuracy}%`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Current Streak"
          value={`${analyticsData.currentStreak} days`}
          icon={Calendar}
          color="bg-orange-500"
        />
        <StatCard
          title="Weekly Average"
          value={analyticsData.weeklyAverage}
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
              value={analyticsData.difficultyStats.Easy}
              total={analyticsData.solvedProblems}
              color="bg-gradient-to-r from-green-500 to-green-400"
            />
            <ProgressBar
              label="Medium Problems"
              value={analyticsData.difficultyStats.Medium}
              total={analyticsData.solvedProblems}
              color="bg-gradient-to-r from-yellow-500 to-yellow-400"
            />
            <ProgressBar
              label="Hard Problems"
              value={analyticsData.difficultyStats.Hard}
              total={analyticsData.solvedProblems}
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
            {Object.entries(analyticsData.platformStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([platform, count], index) => (
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
      {Object.keys(analyticsData.topicStats).length > 0 && (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Topic Mastery</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analyticsData.topicStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([topic, count]) => (
                <div key={topic} className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200 group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm">
                      {topic}
                    </h3>
                    <span className="text-gray-400 text-sm">{count}</span>
                  </div>
                  <div className="w-full bg-gray-600/50 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((count / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Weekly Progress Chart */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Weekly Progress</h2>
        </div>
        
        {analyticsData.weeklyProgress.every(w => w.problems === 0) ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            No weekly activity yet — start logging problems to see progress here.
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-3">
              {analyticsData.weeklyProgress.map((week, index) => (
                <div key={week.week} className="flex-1 text-center">
                  {index === 0 ? (
                    <span className="text-gray-400 text-xs">—</span>
                  ) : weeklyChanges[index].diff > 0 ? (
                    <span className="text-green-400 text-sm flex items-center justify-center">
                      <ArrowUp className="w-3 h-3 mr-1" />+{weeklyChanges[index].percent}%
                    </span>
                  ) : weeklyChanges[index].diff < 0 ? (
                    <span className="text-red-400 text-sm flex items-center justify-center">
                      <ArrowDown className="w-3 h-3 mr-1" />{Math.abs(weeklyChanges[index].percent)}%
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">0%</span>
                  )}
                </div>
              ))}
            </div>

            <div className="h-56">
              {/* Chart.js line chart */}
              <Line
                data={{
                  labels: analyticsData.weeklyProgress.map(w => w.week),
                  datasets: [
                    {
                      label: 'Problems',
                      data: analyticsData.weeklyProgress.map(w => w.problems),
                      borderColor: 'rgba(99,102,241,1)',
                      backgroundColor: 'rgba(99,102,241,0.12)',
                      tension: 0.35,
                      fill: true,
                      pointRadius: 4,
                      pointBackgroundColor: 'rgba(99,102,241,1)'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
                    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#9CA3AF' }, grid: { color: 'rgba(148,163,184,0.06)' } }
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;