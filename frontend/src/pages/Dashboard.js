import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ token }) {
  const [items, setItems] = useState([]);
  const [salesStats, setSalesStats] = useState({ totalRevenue: 0, categorySales: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { 'x-auth-token': token } };
        const [productsRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products', config),
          axios.get('http://localhost:5000/api/sales/stats', config)
        ]);
        setItems(productsRes.data);
        setSalesStats(statsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // --- ANALYTICS LOGIC ---
  const expiringSoon = items.filter(i => {
    const daysLeft = (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 7;
  });

  const lowStock = items.filter(i => i.stock <= i.threshold);

  const totalInventoryValue = items.reduce((acc, curr) => acc + (curr.stock * curr.price), 0);

  const categories = ["Fresh Poultry", "Eggs", "Dairy Products", "Beverages", "Ice Cream & Frozen", "Rice & Grains", "Canned Goods", "Snacks", "Packaged Food"];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Store Overview</h2>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">
            <span className="h-2 w-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            System Online
          </span>
        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={items.length}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Units"
          value={items.reduce((acc, curr) => acc + curr.stock, 0)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Inventory Value"
          value={`LKR ${totalInventoryValue.toLocaleString()}`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Actions Needed"
          value={expiringSoon.length + lowStock.length}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color={expiringSoon.length + lowStock.length > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MAIN REVENUE CARD */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-2xl p-8 transform transition hover:scale-[1.01] duration-500">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-emerald-300 font-bold uppercase tracking-widest text-xs mb-1">Total Revenue</p>
                <h3 className="text-5xl font-black tracking-tight">LKR {salesStats.totalRevenue.toLocaleString()}</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-sm">
                  {salesStats.categorySales.length > 0
                    ? `Driven primarily by ${salesStats.categorySales[0]._id} sales this month.`
                    : "Start recording sales to generate revenue insights."}
                </p>
              </div>
              <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 h-10 w-10 rounded-full flex items-center justify-center text-xl font-bold text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-200 font-bold uppercase">Top Category</p>
                    <p className="font-bold text-lg">{salesStats.categorySales.length > 0 ? salesStats.categorySales[0]._id : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Bar Chart Visualization */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Category Performance</h4>
              <div className="space-y-4">
                {salesStats.categorySales.slice(0, 3).map((cat) => (
                  <div key={cat._id}>
                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-300">
                      <span>{cat._id}</span>
                      <span>LKR {cat.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-2 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000"
                        style={{ width: `${(cat.totalSales / (salesStats.totalRevenue || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {salesStats.categorySales.length === 0 && <p className="text-sm text-slate-500 italic">No sales data available yet.</p>}
              </div>
            </div>
          </div>

          {/* RECENT INVENTORY TABLE */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 pl-2">Item Name</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Total Value</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {items.slice(0, 5).map((item, idx) => (
                    <tr key={item._id} className="border-b last:border-0 border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-2 font-medium text-slate-700">{item.name}</td>
                      <td className="py-3">
                        <StockBadge stock={item.stock} threshold={item.threshold} />
                      </td>
                      <td className="py-3 pr-2 text-right font-mono text-slate-500">
                        LKR {(item.stock * item.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-4 text-slate-400 italic">No inventory items found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDEBAR: ALERTS & DISTRIBUTION */}
        <div className="space-y-6">

          {/* CATEGORY DISTRIBUTION */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory Mix</h3>
            <div className="space-y-5">
              {categories.map(cat => {
                const catItems = items.filter(i => i.category === cat);
                const count = catItems.reduce((acc, curr) => acc + curr.stock, 0);
                const percentage = items.length > 0 ? Math.min((count / 200) * 100, 100) : 0;

                return (
                  <div key={cat} className="group">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-600 group-hover:text-emerald-600 transition-colors">{cat}</span>
                      <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-md">{count} units</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${count < 20 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ALERTS SECTION */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2 text-xl text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </span>
              Needs Attention
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {expiringSoon.length === 0 && lowStock.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-emerald-500 mb-2 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Everything looks great!</p>
                </div>
              ) : (
                <>
                  {expiringSoon.map(i => (
                    <AlertItem key={i._id} item={i} type="expiry" />
                  ))}
                  {lowStock.map(i => (
                    <AlertItem key={i._id} item={i} type="stock" />
                  ))}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ title, value, icon, color }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 card-hover">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function StockBadge({ stock, threshold }) {
  if (stock <= threshold) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Low Stock</span>
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">In Stock</span>
}

function AlertItem({ item, type }) {
  const isExpiry = type === 'expiry';
  const isExpired = isExpiry && new Date(item.expiryDate) < new Date();

  return (
    <div className={`p-3 rounded-xl border ${isExpiry ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'} flex items-start space-x-3`}>
      <div className={`mt-0.5 h-2 w-2 rounded-full ${isExpiry ? 'bg-red-500' : 'bg-orange-500'}`}></div>
      <div>
        <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
        <p className={`text-xs mt-1 font-medium ${isExpiry ? 'text-red-600' : 'text-orange-600'}`}>
          {isExpiry
            ? `${isExpired ? 'Expired' : 'Expires'}: ${new Date(item.expiryDate).toLocaleDateString()}`
            : `Low Stock: ${item.stock} left`
          }
        </p>
      </div>
    </div>
  );
}