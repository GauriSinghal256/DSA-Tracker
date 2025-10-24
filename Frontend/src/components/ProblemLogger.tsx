import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Check, X } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  platform: string;
  difficulty: string;
  tags: string[];
}

interface ProblemHistory {
  _id: string;
  problem: Problem;
  status: string;
  solvedAt?: string;
  createdAt: string;
}

const ProblemLogger = () => {
  const [recentProblems, setRecentProblems] = useState<ProblemHistory[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    difficulty: '',
    tags: '',
    notes: '',
    solved: false,
    revisit: false,
    revisitDate: '',
    timeSpent: '',
    url: '',
    noteImage: null as File | null
  });

  const platforms = ['LeetCode', 'GeeksforGeeks', 'CodeForces', 'CodeChef', 'HackerRank', 'InterviewBit'];
  const difficulties = ['Easy', 'Medium', 'Medium-Hard', 'Hard'];

  // Fetch problems on mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch("http://localhost:8000/api/problems/allProblems", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setRecentProblems(data.data); // array of ProblemHistory
        }
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      }
    };
    fetchProblems();
  }, []);

  // Submit new problem
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const formToSend = new FormData();
      formToSend.append("title", formData.title);
      formToSend.append("platform", formData.platform);
      formToSend.append("Problem_URL", formData.url);
      formToSend.append("difficulty", formData.difficulty);
      formToSend.append(
        "tags",
        JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t))
      );
      formToSend.append("notes", formData.notes);
      formToSend.append("status", formData.solved ? "solved" : "unsolved");
      formToSend.append("redoAt", formData.revisit ? formData.revisitDate : "");
      if (formData.noteImage) formToSend.append("notesImage", formData.noteImage);

      const res = await fetch("http://localhost:8000/api/problems/log", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formToSend,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to log problem");

      // Prepend new problem history
      setRecentProblems([data.data.history, ...recentProblems]);

      // Reset form
      setFormData({
        title: '',
        platform: '',
        difficulty: '',
        tags: '',
        notes: '',
        solved: false,
        revisit: false,
        revisitDate: '',
        timeSpent: '',
        url: '',
        noteImage: null
      });
    } catch (err) {
      console.error("Error logging problem:", err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Medium-Hard': return 'text-orange-400 bg-orange-500/10';
      case 'Hard': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Log Your Progress
        </h1>
        <p className="text-gray-400 text-lg">
          Track every problem you solve to build your coding journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem Logger Form */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <Plus className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Add New Problem</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Problem Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter problem title"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Platform *</label>
                <select required value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select platform</option>
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty *</label>
                <select required value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select difficulty</option>
                  {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time Spent (minutes)</label>
                <input type="number" value={formData.timeSpent} onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 45"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
              <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Array, DP"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Problem URL</label>
              <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://leetcode.com/problems/..."/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Your thoughts, approach, or key learnings"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({
                  ...formData,
                  noteImage: e.target.files && e.target.files[0] ? e.target.files[0] : null
                })}
                className="w-full text-gray-200"
              />
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="solved" checked={formData.solved} onChange={(e) => setFormData({ ...formData, solved: e.target.checked })} className="w-5 h-5 text-blue-600 bg-gray-700/50 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"/>
                <label htmlFor="solved" className="text-gray-300 cursor-pointer">Problem solved successfully</label>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="revisit" checked={formData.revisit} onChange={(e) => setFormData({ ...formData, revisit: e.target.checked })} className="w-5 h-5 text-blue-600 bg-gray-700/50 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"/>
                <label htmlFor="revisit" className="text-gray-300 cursor-pointer">Mark for revisit</label>
              </div>

              {formData.revisit && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Revisit Date</label>
                  <input type="date" value={formData.revisitDate} onChange={(e) => setFormData({ ...formData, revisitDate: e.target.value })} className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5"/> <span>Log Problem</span>
            </button>
          </form>
        </div>

        {/* Recent Problems */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Recent Problems</h2>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentProblems.map((history) => (
              <div key={history._id} className="p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${history.status === 'solved' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {history.status === 'solved' ? <Check className="w-4 h-4 text-green-400"/> : <X className="w-4 h-4 text-red-400"/>}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{history.problem.title}</h3>
                      <p className="text-sm text-gray-400">{history.problem.platform}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(history.problem.difficulty)}`}>
                    {history.problem.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {history.problem.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs">{tag}</span>
                  ))}
                </div>

                <div className="text-xs text-gray-500">
                  Logged on {new Date(history.solvedAt || history.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemLogger;
