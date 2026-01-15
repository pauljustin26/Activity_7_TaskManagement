import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'developer' // Default role
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      alert("Registration successful! Please login.");
      navigate('/login'); 
    } catch (err) {
      setError('Registration failed. Email might be taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Create Account</h1>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            placeholder="Full Name" required
            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white focus:border-indigo-500 outline-none transition"
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Email" required
            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white focus:border-indigo-500 outline-none transition"
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white focus:border-indigo-500 outline-none transition"
            onChange={e => setForm({...form, password: e.target.value})}
          />
          
          <div className="text-sm text-slate-400">
            <label className="block mb-1 font-medium">Select Role:</label>
            <select 
              className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-white focus:border-indigo-500 outline-none transition"
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
            >
              <option value="developer">Developer</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-indigo-900/20">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:underline hover:text-indigo-300 transition">Login</Link>
        </p>
      </div>
    </div>
  );
}