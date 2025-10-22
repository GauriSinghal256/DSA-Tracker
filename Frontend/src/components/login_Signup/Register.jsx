// src/components/Register.jsx
import React, { useState } from "react";

const Register = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    year: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all required fields.");
      return;
    }

    // Simulate login/register success
    console.log(isLogin ? "Login data:" : "Register data:", formData);
    localStorage.setItem("dsa_isAuthenticated", "true");
    localStorage.setItem("dsa_user", JSON.stringify({ username: formData.username || "User" }));

    if (typeof onAuthSuccess === "function") {
      onAuthSuccess({ username: formData.username || formData.email });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b1120] text-white">
      {/* Left: Form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-20">
        <h1 className="text-3xl font-semibold mb-3 text-center">
          {isLogin ? "Login" : "Register"}
        </h1>
        <p className="text-center text-gray-400 mb-6">
          {isLogin
            ? "Welcome back — login to continue"
            : "Create an account to get started 🚀"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block mb-1 text-sm">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block mb-1 text-sm">Year of Study</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select year</option>
                <option value="school">School going</option>
                <option value="1st">1st year</option>
                <option value="2nd">2nd year</option>
                <option value="3rd">3rd year</option>
                <option value="4th">4th year</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:underline"
            type="button"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>

      {/* Right: Image */}
      <div
        className="hidden md:flex w-1/2 items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1000&q=80')",
        }}
      >
        <div className="bg-black/40 w-full h-full flex items-center justify-center">
          <h2 className="text-4xl font-bold">Welcome,<br/> Lets crack DSA</h2>
        </div>
      </div>
    </div>
  );
};

export default Register;
