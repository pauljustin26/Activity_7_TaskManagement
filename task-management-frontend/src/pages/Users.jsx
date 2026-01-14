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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Team Directory</h1>
          <p className="text-gray-500">View all registered members in the system.</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-100">
          Total Members: {users.length}
        </span>
      </div>

      {/* Clean List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user._id} className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm
              ${user.role === 'admin' ? 'bg-purple-500' : 
                user.role === 'project_manager' ? 'bg-indigo-500' : 'bg-teal-500'}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800">{user.name}</h3>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-1 inline-block
                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                  user.role === 'project_manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}