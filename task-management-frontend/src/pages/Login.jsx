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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">TaskFlow Login</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" required
            className="w-full border p-2 rounded"
            onChange={e => setForm({...form, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full border p-2 rounded"
            onChange={e => setForm({...form, password: e.target.value})}
          />
          <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-indigo-600">Register</Link>
        </p>
      </div>
    </div>
  );
}