// src/App.tsx
import React, { useEffect, useState } from "react";
import { Menu, X, BarChart3, Calendar, BookOpen, Zap, TrendingUp, FileText, Users, Bell, Check, Clock, NotebookPen } from "lucide-react";
import Dashboard from "./components/Dashboard";
import ProblemLogger from "./components/ProblemLogger";
import Problems from "./components/Problems";
import Analytics from "./components/Analytics";
import Recommendations from "./components/Recommendations";
import PlacementReadiness from "./components/PlacementReadiness";
import Community from "./components/Community";
import MySpace from "./components/MySpace";
// @ts-ignore: importing a JS (JSX) file without type declarations
import Register from "./components/login_Signup/Register.jsx";

interface Notification {
  _id: string;
  title: string;
  difficulty: string;
  redoAt: string;
  platform: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showTimerDialog, setShowTimerDialog] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    setIsLoaded(true);

    // restore auth from localStorage
    const saved = localStorage.getItem("dsa_isAuthenticated");
    const savedUser = localStorage.getItem("dsa_user");
    if (saved === "true") {
      setIsAuthenticated(true);
      if (savedUser) setUser(JSON.parse(savedUser));
      fetchNotifications();
      // Poll for notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/problems/notifications", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        setNotifications(data.data);
        setNotificationCount(data.data.length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkAsRedone = async (notification: Notification) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/problems/${notification._id}/redo`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Remove the notification from the list
        setNotifications(prev => prev.filter(n => n._id !== notification._id));
        setNotificationCount(prev => prev - 1);
        setShowTimerDialog(false);
        setSelectedNotification(null);
        
        // Dispatch event to update dashboard
        window.dispatchEvent(new CustomEvent('problemUpdated'));
        
        // Show success message
        alert("Problem marked as redone successfully!");
      } else {
        throw new Error(data.message || "Failed to mark as redone");
      }
    } catch (err: any) {
      console.error("Failed to mark as redone:", err);
      alert(`Error: ${err.message || "Failed to mark as redone"}`);
    }
  };

  const handleRedoClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowTimerDialog(true);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Trigger dashboard refresh when navigating to dashboard
    if (tabId === "dashboard") {
      setDashboardRefreshTrigger(prev => prev + 1);
    }
  };

  const handleAuthSuccess = (userData: { username?: string }) => {
    setIsAuthenticated(true);
    setUser(userData || { username: "user" });
    localStorage.setItem("dsa_isAuthenticated", "true");
    localStorage.setItem("dsa_user", JSON.stringify(userData || { username: "user" }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("dsa_isAuthenticated");
    localStorage.removeItem("dsa_user");
    // optionally redirect to default tab:
    setActiveTab("dashboard");
  };

  if (!isAuthenticated) {
    // show the Register / Login page
    return <Register onAuthSuccess={handleAuthSuccess} />;
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "logger", label: "Log Problem", icon: BookOpen },
    { id: "problems", label: "My Problems", icon: FileText },
    { id: "myspace", label: "MySpace", icon: NotebookPen },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "recommendations", label: "AI Recommendations", icon: Zap },
    { id: "community", label: "Community", icon: Users },
    { id: "readiness", label: "Placement Readiness", icon: Calendar },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard 
          onNavigateToRecommendations={() => setActiveTab("recommendations")} 
          onNavigateToLogger={() => setActiveTab("logger")}
          onNavigateToAnalytics={() => setActiveTab("analytics")}
          refreshTrigger={dashboardRefreshTrigger}
        />;
      case "logger":
        return <ProblemLogger />;
      case "problems":
        return <Problems />;
      case "myspace":
        return <MySpace />;
      case "analytics":
        return <Analytics />;
      case "recommendations":
        return <Recommendations />;
      case "community":
        return <Community />;
      case "readiness":
        return <PlacementReadiness />;
      default:
        return <Dashboard 
          onNavigateToRecommendations={() => setActiveTab("recommendations")}
          onNavigateToLogger={() => setActiveTab("logger")}
          onNavigateToAnalytics={() => setActiveTab("analytics")}
          refreshTrigger={dashboardRefreshTrigger}
        />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-1000 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DSA Tracker
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-600/20 text-blue-400 shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors relative"
                >
                  <Bell className="w-6 h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-h-96 overflow-auto z-50 notification-dropdown">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-lg font-bold text-white">Notifications</h3>
                      <p className="text-sm text-gray-400">Problems due for redo</p>
                    </div>
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No pending notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className="p-3 rounded-lg hover:bg-gray-700/50 mb-2 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-white font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.platform}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                notification.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                notification.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                notification.difficulty === 'Medium-Hard' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {notification.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-blue-400 mt-2">
                              Due: {new Date(notification.redoAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <button
                                onClick={() => {
                                  setActiveTab("problems");
                                  setShowNotifications(false);
                                }}
                                className="text-xs text-gray-400 hover:text-white hover:underline"
                              >
                                View Problem
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRedoClick(notification);
                                }}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-xs"
                              >
                                <Check className="w-3 h-3" />
                                <span>Mark as Redone</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logged-in user info */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm text-gray-300">
                  {user?.username ? `Hi, ${user.username}` : "Welcome"}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-white hover:underline"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800/90 backdrop-blur-md border-t border-gray-700/50">
            <div className="px-4 py-2 space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleTabChange(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-gray-700/50 pt-3">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">{renderActiveComponent()}</div>
      </main>

      {/* Timer Confirmation Dialog */}
      {showTimerDialog && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Mark as Redone</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                You've completed: <span className="text-white font-medium">{selectedNotification.title}</span>
              </p>
              <p className="text-sm text-gray-400">
                Platform: {selectedNotification.platform} • Difficulty: {selectedNotification.difficulty}
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm font-medium mb-2">🎯 Great job! Would you like to set a timer for your next problem?</p>
              <p className="text-gray-400 text-xs">
                This helps you maintain focus and track your problem-solving sessions.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  handleMarkAsRedone(selectedNotification);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Mark as Redone
              </button>
              <button
                onClick={() => {
                  setShowTimerDialog(false);
                  setSelectedNotification(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
