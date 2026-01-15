import { useState, useEffect } from 'react';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-slate-950 text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Directory</h1>
          <p className="text-slate-400">View all registered members in the system.</p>
        </div>
        <span className="bg-slate-800 text-indigo-400 px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 shadow-sm">
          Total Members: {users.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user._id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg hover:border-indigo-500/50 hover:shadow-indigo-900/20 transition-all duration-300 flex items-center gap-4 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform group-hover:scale-110
              ${user.role === 'admin' ? 'bg-linear-to-br from-purple-600 to-purple-800' : 
                user.role === 'project_manager' ? 'bg-linear-to-br from-indigo-600 to-indigo-800' : 'bg-linear-to-br from-teal-600 to-teal-800'}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{user.name}</h3>
              <p className="text-slate-500 text-sm mb-2">{user.email}</p>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border
                ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                  user.role === 'project_manager' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}