// src/App.tsx
import React, { useEffect, useState } from "react";
import { Menu, X, BarChart3, Target, Calendar, BookOpen, Zap, TrendingUp, FileText } from "lucide-react";
import Dashboard from "./components/Dashboard";
import ProblemLogger from "./components/ProblemLogger";
import Problems from "./components/Problems";
import Analytics from "./components/Analytics";
import Recommendations from "./components/Recommendations";
import CompanyRoadmaps from "./components/CompanyRoadmaps";
import PlacementReadiness from "./components/PlacementReadiness";
// @ts-ignore: importing a JS (JSX) file without type declarations
import Register from "./components/login_Signup/Register.jsx";

function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ username?: string } | null>(null);

  useEffect(() => {
    setIsLoaded(true);

    // restore auth from localStorage
    const saved = localStorage.getItem("dsa_isAuthenticated");
    const savedUser = localStorage.getItem("dsa_user");
    if (saved === "true") {
      setIsAuthenticated(true);
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, []);

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
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "recommendations", label: "AI Recommendations", icon: Zap },
    { id: "roadmaps", label: "Company Roadmaps", icon: Target },
    { id: "readiness", label: "Placement Readiness", icon: Calendar },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigateToRecommendations={() => setActiveTab("recommendations")} />;
      case "logger":
        return <ProblemLogger />;
      case "problems":
        return <Problems />;
      case "analytics":
        return <Analytics />;
      case "recommendations":
        return <Recommendations />;
      case "roadmaps":
        return <CompanyRoadmaps />;
      case "readiness":
        return <PlacementReadiness />;
      default:
        return <Dashboard onNavigateToRecommendations={() => setActiveTab("recommendations")} />;
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
                DSA Tracker Pro
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
                      setActiveTab(tab.id);
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
    </div>
  );
}

export default App;
