import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login({ setToken, setUsername }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username: form.username,
        password: form.password
      });

      // Catch the token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setToken(res.data.token);
      setUsername(res.data.username);
      // alert("Login Successful!"); // Removed for smoother UX
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.msg || "Check terminal"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in">

        {/* Decorative Background Blur */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

        <div className="text-center mb-10">
          <div className="bg-white p-3 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 border border-emerald-50">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to manage your inventory</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
            <input
              className="input-field"
              type="text"
              placeholder="Store Manager ID"
              required
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              required
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center py-3.5 text-lg group"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            ) : (
              <span className="flex items-center group-hover:translate-x-1 transition-transform">
                Access Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-slate-500 text-sm">
            New to the system? <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-all">Register Store</Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-xs font-medium">© 2024 GFH Secured Systems</p>
    </div>
  );
}