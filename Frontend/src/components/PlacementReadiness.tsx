import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Brain, 
  Award,
  BarChart3,
  Users,
  Calendar,
  ArrowRight,
  Star,
  Zap,
  Loader2
} from 'lucide-react';

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

const PlacementReadiness = () => {
  const [selectedCompany, setSelectedCompany] = useState('google');
  const [readinessScore, setReadinessScore] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (analyticsData) {
      calculateReadinessScore();
    }
  }, [selectedCompany, analyticsData]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/problems/analytics", {
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

  const calculateReadinessScore = () => {
    if (!analyticsData) return;

    const { solvedProblems, totalProblems, accuracy, currentStreak, difficultyStats, topicStats } = analyticsData;
    
    // Base score from total problems solved
    let baseScore = Math.min((solvedProblems / 100) * 30, 30);
    
    // Accuracy bonus
    const accuracyBonus = (accuracy / 100) * 20;
    
    // Streak bonus
    const streakBonus = Math.min((currentStreak / 30) * 15, 15);
    
    // Difficulty distribution score
    const { Easy, Medium, Hard } = difficultyStats;
    const totalDiff = Easy + Medium + Hard;
    let difficultyScore = 0;
    if (totalDiff > 0) {
      // Balanced distribution is better (not too many easy)
      const easyRatio = Easy / totalDiff;
      const mediumRatio = Medium / totalDiff;
      const hardRatio = Hard / totalDiff;
      
      if (mediumRatio > 0.3 && hardRatio > 0.1) {
        difficultyScore = 20; // Well balanced
      } else if (mediumRatio > 0.2) {
        difficultyScore = 15;
      } else if (easyRatio < 0.7) {
        difficultyScore = 10;
      } else {
        difficultyScore = 5;
      }
    }
    
    // Topic diversity score
    const topicCount = Object.keys(topicStats).length;
    const diversityScore = Math.min((topicCount / 15) * 15, 15);
    
    const calculatedScore = baseScore + accuracyBonus + streakBonus + difficultyScore + diversityScore;
    
    // Animate to the calculated score
    const timer = setTimeout(() => {
      setReadinessScore(Math.round(calculatedScore));
    }, 300);
    
    return () => clearTimeout(timer);
  };

  const companies = [
    { 
      id: 'google', 
      name: 'Google', 
      logo: '🟢', 
      readiness: 76, 
      difficulty: 'Very Hard',
      avgSalary: '$180k',
      requirements: ['System Design', 'Advanced Algorithms', 'Behavioral']
    },
    { 
      id: 'amazon', 
      name: 'Amazon', 
      logo: '🟠', 
      readiness: 82, 
      difficulty: 'Hard',
      avgSalary: '$165k',
      requirements: ['Leadership Principles', 'Scale Problems', 'Optimization']
    },
    { 
      id: 'microsoft', 
      name: 'Microsoft', 
      logo: '🔵', 
      readiness: 88, 
      difficulty: 'Hard',
      avgSalary: '$170k',
      requirements: ['Problem Solving', 'Design Patterns', 'Collaboration']
    },
    { 
      id: 'meta', 
      name: 'Meta', 
      logo: '🔷', 
      readiness: 71, 
      difficulty: 'Very Hard',
      avgSalary: '$185k',
      requirements: ['Product Sense', 'Scale Architecture', 'Innovation']
    },
    { 
      id: 'apple', 
      name: 'Apple', 
      logo: '⚫', 
      readiness: 74, 
      difficulty: 'Hard',
      avgSalary: '$175k',
      requirements: ['Attention to Detail', 'User Experience', 'Performance']
    },
    { 
      id: 'netflix', 
      name: 'Netflix', 
      logo: '🔴', 
      readiness: 69, 
      difficulty: 'Very Hard',
      avgSalary: '$190k',
      requirements: ['High Performance', 'Streaming Tech', 'Culture Fit']
    }
  ];

  const getSkillAssessment = (): Record<string, { score: number; required: number; status: string }> => {
    if (!analyticsData) return {};
    
    const { topicStats } = analyticsData;
    const skills: Record<string, { score: number; required: number; status: string }> = {};
    
    // Common important topics for placement
    const importantTopics = [
      'Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'BST',
      'Binary Search', 'Backtracking', 'Greedy', 'Heap', 'Stack', 'Queue',
      'Linked List', 'Hash Table', 'Sorting', 'Two Pointers'
    ];
    
    importantTopics.forEach(topic => {
      // Check if topic exists in any form (case insensitive)
      const matchingTopic = Object.keys(topicStats).find(t => 
        t.toLowerCase().includes(topic.toLowerCase()) || 
        topic.toLowerCase().includes(t.toLowerCase())
      );
      
      if (matchingTopic) {
        const count = topicStats[matchingTopic];
        // Calculate score based on count (10 problems = 100%)
        const score = Math.min((count / 10) * 100, 100);
        // Required varies by company
        const required = selectedCompany === 'google' || selectedCompany === 'meta' ? 90 : 80;
        
        let status = 'excellent';
        if (score < required * 0.5) status = 'critical';
        else if (score < required * 0.7) status = 'needs_work';
        else if (score < required * 0.85) status = 'almost_ready';
        else if (score < required) status = 'good';
        else status = 'excellent';
        
        skills[topic] = { score: Math.round(score), required, status };
      } else {
        // Topic not attempted yet
        const required = selectedCompany === 'google' || selectedCompany === 'meta' ? 90 : 80;
        skills[topic] = { score: 0, required, status: 'critical' };
      }
    });
    
    return skills;
  };

  const currentCompany = companies.find(c => c.id === selectedCompany);
  const currentSkills = getSkillAssessment();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/20';
      case 'good': return 'text-blue-400 bg-blue-500/20';
      case 'almost_ready': return 'text-yellow-400 bg-yellow-500/20';
      case 'needs_work': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400', icon: Award };
    if (score >= 80) return { label: 'Good', color: 'text-blue-400', icon: CheckCircle };
    if (score >= 70) return { label: 'Fair', color: 'text-yellow-400', icon: Clock };
    if (score >= 60) return { label: 'Needs Work', color: 'text-orange-400', icon: AlertTriangle };
    return { label: 'Critical', color: 'text-red-400', icon: AlertTriangle };
  };

  const readinessLevel = getReadinessLevel(readinessScore);
  const ReadinessIcon = readinessLevel.icon;

  const getImprovementAreas = () => {
    if (!analyticsData) return [];
    
    const areas = Object.entries(currentSkills)
      .filter(([_, data]) => data.status === 'critical' || data.status === 'needs_work')
      .map(([topic, data]) => {
        const problemCount = Math.ceil(data.required / 10 - data.score / 10);
        const weeks = Math.ceil(problemCount / 7);
        
        return {
          area: topic,
          priority: data.status === 'critical' ? 'Critical' : 
                   data.status === 'needs_work' ? 'High' : 'Medium',
          problemCount,
          estimatedTime: `${weeks}-${weeks + 1} weeks`,
          score: data.score,
          required: data.required
        };
      })
      .sort((a, b) => {
        if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
        if (a.priority !== 'Critical' && b.priority === 'Critical') return 1;
        return b.problemCount - a.problemCount;
      })
      .slice(0, 3);
    
    return areas;
  };

  const improvementAreas = getImprovementAreas();

  const mockInterviews = [
    { company: 'Google', date: '2024-01-20', score: 75, feedback: 'Good problem solving, work on optimization' },
    { company: 'Amazon', date: '2024-01-15', score: 82, feedback: 'Excellent approach, minor edge case missed' },
    { company: 'Microsoft', date: '2024-01-10', score: 68, feedback: 'Need to improve communication during coding' }
  ];

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
        <p className="text-gray-400">No analytics data available. Start logging problems to see your placement readiness!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Placement Readiness
        </h1>
        <p className="text-gray-400 text-lg">
          AI-powered assessment of your interview readiness for top tech companies
        </p>
      </div>

      {/* Company Selection */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Select Target Company</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompany(company.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                selectedCompany === company.id
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg'
                  : 'border-gray-700/50 bg-gray-700/20 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{company.logo}</span>
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{company.name}</h3>
                    <p className="text-sm text-gray-400">{company.difficulty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    company.readiness >= 80 ? 'text-green-400' :
                    company.readiness >= 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {company.readiness}%
                  </div>
                  <div className="text-xs text-gray-500">Readiness</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-2">{company.avgSalary} avg salary</div>
              <div className="flex flex-wrap gap-1">
                {company.requirements.slice(0, 2).map((req, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                    {req}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Readiness Overview */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{currentCompany?.logo}</span>
            <div>
              <h3 className="text-3xl font-bold text-white">{currentCompany?.name} Readiness</h3>
              <p className="text-purple-300">Difficulty: {currentCompany?.difficulty}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - readinessScore / 100)}`}
                  className={readinessLevel.color}
                  style={{
                    transition: 'stroke-dashoffset 2s ease-in-out'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${readinessLevel.color}`}>
                  {readinessScore}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <ReadinessIcon className={`w-5 h-5 ${readinessLevel.color}`} />
              <span className={`font-semibold ${readinessLevel.color}`}>
                {readinessLevel.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{analyticsData?.solvedProblems || 0}</div>
            <div className="text-sm text-gray-400">Problems Solved</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{analyticsData?.accuracy || 0}%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              {readinessScore >= 80 ? 'Ready!' : readinessScore >= 70 ? '2-3' : readinessScore >= 60 ? '4-6' : '6-8'}
            </div>
            <div className="text-sm text-gray-400">Weeks to Ready</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Assessment */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Skills Assessment</h2>
          </div>
          
          <div className="space-y-5">
            {Object.entries(currentSkills).map(([skill, data]) => (
              <div key={skill} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{skill}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400">{data.score}/{data.required}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                      {data.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        data.status === 'excellent' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        data.status === 'good' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        data.status === 'almost_ready' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        data.status === 'needs_work' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                        'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${(data.score / data.required) * 100}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-0 w-1 h-3 bg-white/50"
                    style={{ left: `${(data.required / 100) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Target: {data.required}% • Gap: {Math.max(0, data.required - data.score)} points
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Focus Areas</h2>
          </div>
          
          <div className="space-y-4">
            {improvementAreas.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">Great job! You're on track with all key topics.</p>
              </div>
            ) : (
              improvementAreas.map((area, index) => (
              <div key={index} className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {area.area}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        area.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {area.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{area.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>{area.problemCount} problems needed</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        Current: {area.score}%
                      </span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        Target: {area.required}%
                      </span>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mock Interview Results */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Recent Mock Interviews</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockInterviews.map((interview, index) => (
            <div key={index} className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{interview.company}</h3>
                <div className={`text-xl font-bold ${
                  interview.score >= 80 ? 'text-green-400' :
                  interview.score >= 70 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {interview.score}%
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">{interview.feedback}</p>
              <div className="text-xs text-gray-500">
                {new Date(interview.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Recommended Action Plan</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Next 2 Weeks</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Focus on Dynamic Programming (5 problems/week)</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Complete System Design course</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Practice 2 mock interviews</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Next 4 Weeks</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Master Graph Algorithms</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Complete company-specific rounds</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Achieve 85%+ readiness score</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold mb-1">Estimated Timeline to Interview Ready</h4>
              <p className="text-green-300 text-sm">Based on your current progress and dedication</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">
                {readinessScore >= 80 ? 'Ready!' : readinessScore >= 70 ? '2-3' : readinessScore >= 60 ? '4-6' : '6-8'}
              </div>
              <div className="text-sm text-gray-400">weeks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementReadiness;