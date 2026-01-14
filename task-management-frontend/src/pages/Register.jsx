// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'developer'
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">Create Account</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            placeholder="Full Name" required
            className="w-full border p-2 rounded"
            onChange={e => setForm({...form, name: e.target.value})}
          />
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
          
          {/* Role Selection for testing purposes */}
          <div className="text-sm text-gray-600">
            <label className="block mb-1">Select Role:</label>
            <select 
              className="w-full border p-2 rounded"
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
            >
              <option value="developer">Developer</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
        </p>
      </div>
    </div>
  );
}