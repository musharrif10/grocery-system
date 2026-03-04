import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  // Sync token changes (useful if using multiple tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUsername(localStorage.getItem('username'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      setToken(null);
      setUsername(null);
    }
  };

  // Modern Nav Link Styling
  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-2 transition-all duration-300 py-2.5 px-4 rounded-xl font-medium text-sm tracking-wide ${isActive
      ? 'bg-emerald-100 text-emerald-800 shadow-sm ring-1 ring-emerald-200'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 text-slate-800 relative overflow-x-hidden">

        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>

        {/* TOP NAVIGATION BAR */}
        {token && (
          <nav className="sticky top-4 z-50 mx-4 md:mx-8 mb-8">
            <div className="glass-panel rounded-2xl px-6 py-3 flex justify-between items-center max-w-7xl mx-auto">

              {/* BRANDING */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="bg-white rounded-xl shadow-lg shadow-emerald-100 border border-emerald-50 transition-transform group-hover:scale-110 duration-300 overflow-hidden">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-cover" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-800 group-hover:text-emerald-700 transition-colors">GFH Systems</h1>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Premium Analytics</p>
                </div>
              </div>

              {/* CENTERED NAV LINKS */}
              <div className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                <NavLink to="/" className={navLinkClass}>
                  <img src="/dashboards.png" alt="Dashboard" className="w-5 h-5 object-contain opacity-75" /> <span>Dashboard</span>
                </NavLink>
                <NavLink to="/inventory" className={navLinkClass}>
                  <img src="/inventory.png" alt="Inventory" className="w-8 h-8 object-contain opacity-75" /> <span>Inventory</span>
                </NavLink>
              </div>

              {/* USER PROFILE */}
              <div className="flex items-center space-x-4 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{username}</p>
                </div>
                <button
                  onClick={logout}
                  className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-xl border border-slate-100 hover:border-red-100 transition-all duration-300 shadow-sm active:scale-95 group"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="relative z-10 container mx-auto px-4 md:px-8 max-w-7xl animate-in pb-20">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={!token ? <Login setToken={setToken} setUsername={setUsername} /> : <Navigate to="/" />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
            <Route path="/inventory" element={token ? <Inventory token={token} /> : <Navigate to="/login" />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* MINIMALIST FOOTER */}
        {token && (
          <footer className="py-6 text-center text-slate-400 text-xs mt-auto">
            <div className="w-24 h-1 bg-slate-200 mx-auto rounded-full mb-4"></div>
            <p className="font-medium tracking-wide">© 2026 GFH Poultry Systems</p>
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;