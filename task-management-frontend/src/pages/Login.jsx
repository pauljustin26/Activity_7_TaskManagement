import { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/login', form);
      login(res.data);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">TaskFlow <span className="text-indigo-500">Pro</span></h1>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-indigo-900/20">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          No account? <Link to="/register" className="text-indigo-400 hover:underline hover:text-indigo-300 transition">Register</Link>
        </p>
      </div>
    </div>
  );
}