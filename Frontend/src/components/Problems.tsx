import React, { useState, useEffect } from 'react';
import { Tag, Edit3, Save, X, FileText, Clock, TrendingUp, Filter, ChevronDown, ChevronUp, Code2, CheckCircle2 } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  platform: string;
  difficulty: string;
  tags: string[];
  Problem_URL?: string;
}

interface ProblemHistory {
  _id: string;
  problem: Problem;
  status: string;
  solvedAt?: string;
  createdAt: string;
  notes?: string;
  noteImage?: string;
  timeTaken?: number;
}

const Problems = () => {
  const [problems, setProblems] = useState<ProblemHistory[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<ProblemHistory[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [tags, setTags] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [expandedProblems, setExpandedProblems] = useState<Set<string>>(new Set());

  // Fetch problems
  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
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
        setProblems(data.data);
        setFilteredProblems(data.data);
        
        // Extract unique tags
        const allTags = new Set<string>();
        data.data.forEach((p: ProblemHistory) => {
          p.problem.tags?.forEach(tag => allTags.add(tag));
        });
        setTags(Array.from(allTags));
      }
    } catch (err) {
      console.error("Failed to fetch problems:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter problems by tag
  useEffect(() => {
    if (selectedTag === 'All') {
      setFilteredProblems(problems);
    } else {
      setFilteredProblems(
        problems.filter(p => 
          p.problem.tags?.includes(selectedTag)
        )
      );
    }
  }, [selectedTag, problems]);

  const handleEditClick = (problem: ProblemHistory) => {
    setEditingId(problem._id);
    setEditNotes(problem.notes || '');
  };

  const handleSaveNotes = async (problemHistoryId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // Update notes
      const res = await fetch(`http://localhost:8000/api/problems/${problemHistoryId}/notes`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notes: editNotes }),
      });

      const data = await res.json();
      
      if (data.success) {
        // Update local state
        setProblems(prev =>
          prev.map(p => p._id === problemHistoryId ? { ...p, notes: editNotes } : p)
        );
        setFilteredProblems(prev =>
          prev.map(p => p._id === problemHistoryId ? { ...p, notes: editNotes } : p)
        );
        setEditingId(null);
        setEditNotes('');
        alert("Notes updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update notes:", err);
      alert("Failed to update notes");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
  };

  const toggleExpand = (problemId: string) => {
    setExpandedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Medium-Hard': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved': return 'bg-green-500/20 text-green-400';
      case 'To Do': return 'bg-gray-500/20 text-gray-400';
      case 'Attempted': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          My Problems Collection
        </h1>
        <p className="text-gray-400 text-lg">
          All your solved problems organized by tags
        </p>
      </div>

      {/* Filter Tags */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Filter by Tag</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedTag('All')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedTag === 'All'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({problems.length})
          </button>
          {tags.map(tag => {
            const count = problems.filter(p => p.problem.tags?.includes(tag)).length;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {filteredProblems.map((problemHistory) => {
          const isExpanded = expandedProblems.has(problemHistory._id);
          
          return (
            <div
              key={problemHistory._id}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-700 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      problemHistory.status === 'Solved' 
                        ? 'bg-green-500/20 border-2 border-green-500' 
                        : problemHistory.status === 'Attempted'
                        ? 'bg-yellow-500/20 border-2 border-yellow-500'
                        : 'bg-orange-500/20 border-2 border-orange-500'
                    }`}>
                      {problemHistory.status === 'Solved' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Code2 className="w-5 h-5 text-orange-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {problemHistory.problem.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(problemHistory.status)}`}>
                      {problemHistory.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-400 text-sm mb-3">
                    <span>{problemHistory.problem.platform}</span>
                    <span className={`px-2 py-1 rounded border text-xs font-medium border-current ${getDifficultyColor(problemHistory.problem.difficulty)}`}>
                      {problemHistory.problem.difficulty}
                    </span>
                    {problemHistory.solvedAt && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(problemHistory.solvedAt).toLocaleDateString()}</span>
                      </span>
                    )}
                    {problemHistory.timeTaken && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{problemHistory.timeTaken} min</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {problemHistory.problem.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm flex items-center space-x-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Problem URL */}
                  {problemHistory.problem.Problem_URL && (
                    <a
                      href={problemHistory.problem.Problem_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 mb-3"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>View Problem</span>
                    </a>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpand(problemHistory._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Hide Details</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Show Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Details Section */}
              {isExpanded && (
                <div>
                  {/* Notes Section */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Notes</span>
                    </h4>
                    {editingId !== problemHistory._id && (
                      <button
                        onClick={() => handleEditClick(problemHistory)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-1 text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {editingId === problemHistory._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Add your notes..."
                      />
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleSaveNotes(problemHistory._id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-700/30 rounded-lg p-4 min-h-[80px]">
                      {problemHistory.notes ? (
                        <p className="text-gray-300 whitespace-pre-wrap">{problemHistory.notes}</p>
                      ) : (
                        <p className="text-gray-500 italic">No notes added yet. Click Edit to add notes.</p>
                      )}
                    </div>
                  )}

                  {/* Notes Image */}
                  {problemHistory.noteImage && (
                    <div className="mt-3">
                      <img
                        src={problemHistory.noteImage}
                        alt="Problem notes"
                        className="max-w-full h-auto rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {selectedTag === 'All' ? 'No problems found. Start logging problems!' : `No problems with tag "${selectedTag}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
