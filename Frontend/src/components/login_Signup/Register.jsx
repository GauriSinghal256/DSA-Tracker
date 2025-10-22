// src/components/Register.jsx
import React, { useState } from "react";
import axios from "axios";

const Register = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    year: "",
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] }); // handle file input
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (isLogin) {
        // 🟢 LOGIN API
        const res = await axios.post("http://localhost:8000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        alert("Login Successful!");
        localStorage.setItem("dsa_isAuthenticated", "true");
        localStorage.setItem("dsa_user", JSON.stringify(res.data.user));

        if (typeof onAuthSuccess === "function") {
          onAuthSuccess(res.data.user);
        }

      } else {
        // 🟢 REGISTER API with avatar (FormData)
        const data = new FormData();
        data.append("username", formData.username);
        data.append("fullName", formData.fullName);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("year", formData.year);
        if (formData.avatar) data.append("avatar", formData.avatar);

        const res = await axios.post("http://localhost:8000/api/auth/register", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert("Registration Successful!");
        localStorage.setItem("dsa_isAuthenticated", "true");
        localStorage.setItem("dsa_user", JSON.stringify(res.data.user));

        if (typeof onAuthSuccess === "function") {
          onAuthSuccess(res.data.user);
        }
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert(`Something went wrong: ${err.response?.data?.message || err.message}`);
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

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          {!isLogin && (
            <>
              <div>
                <label className="block mb-1 text-sm">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Your username"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Avatar</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-300"
                />
              </div>
            </>
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
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          <h2 className="text-4xl font-bold text-center">Welcome,<br/> Let's crack DSA!</h2>
        </div>
      </div>
    </div>
  );
};

export default Register;
