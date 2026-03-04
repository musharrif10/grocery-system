import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UNITS = ['pcs', 'kg', 'g', 'L', 'box'];
const CATEGORIES = [
  'Fresh Poultry',
  'Eggs',
  'Dairy Products',
  'Beverages',
  'Ice Cream & Frozen',
  'Rice & Grains',
  'Canned Goods',
  'Snacks',
  'Packaged Food'
];

export default function Inventory({ token }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  // Added 'unit' to form state
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], unit: 'pcs', stock: '', price: '', expiryDate: '', threshold: 10, supplier: '' });
  const [loading, setLoading] = useState(true);

  // EDIT MODAL STATE
  const [editingProduct, setEditingProduct] = useState(null);

  const config = { headers: { 'x-auth-token': token } };

  // --- API CALLS ---
  const load = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/products', config)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products', form, config);
      load();
      // Reset form
      setForm({ name: '', category: CATEGORIES[0], unit: 'pcs', stock: '', price: '', expiryDate: '', threshold: 10, supplier: '' });
    } catch (err) { alert("Failed to add product"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, editingProduct, config);
      setEditingProduct(null); // Close modal
      load(); // Refresh list
    } catch (err) {
      alert("Failed to update product");
    }
  };

  const updateStock = async (id, currentStock, change) => {
    const newStock = parseFloat((currentStock + change).toFixed(3)); // Handle float precision
    if (newStock >= 0) {
      // Optimistic Update
      setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
      try {
        await axios.put(`http://localhost:5000/api/products/${id}`, { stock: newStock }, config);
      } catch (err) {
        load(); // Revert on error
      }
    }
  };

  const sellItem = async (product) => {
    // For measured units (kg, L), maybe sell 1 or 0.1? For now, keep it 1.
    const qtyToSell = 1;
    try {
      await axios.post('http://localhost:5000/api/sales', { productId: product._id, quantity: qtyToSell }, config);
      load();
    } catch (err) {
      alert("Failed to record sale: " + (err.response?.data?.msg || err.message));
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to remove this item from the system?")) {
      await axios.delete(`http://localhost:5000/api/products/${id}`, config);
      load();
    }
  };

  // --- SEARCH & FILTER LOGIC ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in relative">

      {/* EDIT MODAL OVERLAY */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-800">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Product Name</label>
                <input
                  className="input-field"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                <select
                  className="input-field appearance-none"
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Supplier</label>
                <input
                  className="input-field"
                  placeholder="Supplier Name"
                  value={editingProduct.supplier || ""}
                  onChange={e => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Stock</label>
                  <div className="flex space-x-2">
                    <input
                      className="input-field w-2/3"
                      type="number"
                      step="0.001"
                      value={editingProduct.stock}
                      onChange={e => setEditingProduct({ ...editingProduct, stock: parseFloat(e.target.value) })}
                      required
                    />
                    <select
                      className="input-field w-1/3 p-0 text-center"
                      value={editingProduct.unit || 'pcs'}
                      onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Price (LKR)</label>
                  <input
                    className="input-field"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Expiry Date</label>
                  <input
                    className="input-field text-slate-500"
                    type="date"
                    value={editingProduct.expiryDate ? editingProduct.expiryDate.split('T')[0] : ''}
                    onChange={e => setEditingProduct({ ...editingProduct, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Threshold</label>
                  <input
                    className="input-field"
                    type="number"
                    value={editingProduct.threshold}
                    onChange={e => setEditingProduct({ ...editingProduct, threshold: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
                <button className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Track stock, manage prices, and monitor expiry.</p>
        </div>
      </div>

      {/* 1. ADD NEW DELIVERY FORM */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">

        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-emerald-500/5 blur-2xl"></div>

        <div className="flex items-center space-x-3 mb-6 relative z-10">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Add New Inventory</h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          <div className="lg:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Product Name</label>
            <input className="input-field" placeholder="e.g. Whole Chicken" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
            <select className="input-field appearance-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Supplier</label>
            <input className="input-field" placeholder="Supplier name" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Measurement</label>
            <div className="flex space-x-1">
              <input
                className="input-field w-2/3"
                type="number"
                step="0.001"
                placeholder="0"
                required
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
              <select
                className="input-field w-1/3 p-0 text-center text-xs font-bold"
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Price (LKR)</label>
            <input className="input-field" type="number" step="0.01" placeholder="0.00" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Expiry Date</label>
            <input className="input-field text-slate-500" type="date" required value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Threshold</label>
            <input className="input-field" type="number" placeholder="5" required value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} />
          </div>

          <div className="lg:col-span-4 flex justify-end mt-2">
            <button className="btn-primary flex items-center space-x-2">
              <span>Add to Inventory</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-1/3 group">
          <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none shadow-sm"
            placeholder="Search items by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterCategory === cat
                ? 'bg-slate-800 text-white shadow-lg'
                : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. INVENTORY TABLE */}
      <div className="glass-panel overflow-hidden rounded-3xl">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Product Details</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Stock</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Price</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider">Expiry Status</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-slate-400">Loading...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic font-medium">No products found matching your search.</td></tr>
            ) : filteredProducts.map(p => (
              <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-6">
                  <p className="font-bold text-slate-800 text-lg">{p.name}</p>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-widest">{p.category}</span>
                </td>
                <td className="p-6 text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full font-mono font-bold text-sm ${p.stock <= p.threshold ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                    {p.stock} <span className="ml-1 text-[10px] opacity-70 uppercase">{p.unit || 'pcs'}</span>
                  </div>
                </td>
                <td className="p-6 font-bold text-slate-600">LKR {p.price.toFixed(2)}</td>
                <td className="p-6">
                  <p className="text-sm text-slate-600 font-medium">{new Date(p.expiryDate).toLocaleDateString()}</p>
                  {(new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) < 7 && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wide">
                      Expires Soon
                    </span>
                  )}
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <ActionButton
                      onClick={() => updateStock(p._id, p.stock, 1)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      }
                      color="text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                    />
                    <ActionButton
                      onClick={() => sellItem(p)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      }
                      color="text-orange-600 bg-orange-50 hover:bg-orange-100"
                    />
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                    <ActionButton
                      onClick={() => setEditingProduct(p)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      }
                      color="text-blue-400 hover:text-blue-600"
                    />
                    <ActionButton
                      onClick={() => deleteProduct(p._id)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      }
                      color="text-red-400 hover:text-red-600"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-slate-400 text-sm font-medium">Showing {filteredProducts.length} items</p>
    </div>
  );
}

function ActionButton({ onClick, icon, color }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-lg transition-all active:scale-95 ${color}`}
    >
      {icon}
    </button>
  );
}