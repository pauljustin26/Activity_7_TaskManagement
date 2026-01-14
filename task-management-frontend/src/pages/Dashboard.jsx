import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [pms, setPms] = useState([]);
  
  // Admin Create Form
  const [newProject, setNewProject] = useState({ name: '', managerId: '' });

  useEffect(() => {
    api.get(`/projects?userId=${user._id}&role=${user.role}`).then(res => setProjects(res.data));
    
    if (user.role === 'admin') {
       api.get('/users').then(res => setPms(res.data.filter(u => u.role === 'project_manager')));
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/projects', { ...newProject, manager: newProject.managerId });
    const res = await api.get(`/projects?userId=${user._id}&role=${user.role}`);
    setProjects(res.data);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
      <p className="text-gray-500 mb-8 capitalize">Role: {user.role.replace('_', ' ')}</p>

      {/* ADMIN ONLY: Create Project */}
      {user.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow mb-8 border border-indigo-100">
          <h3 className="font-bold text-lg mb-4">Create Project & Assign Manager</h3>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input 
              placeholder="Project Name" className="border p-2 rounded flex-1"
              onChange={e => setNewProject({...newProject, name: e.target.value})}
            />
            <select 
              className="border p-2 rounded w-64"
              onChange={e => setNewProject({...newProject, managerId: e.target.value})}
            >
              <option value="">Select Project Manager...</option>
              {pms.map(pm => <option key={pm._id} value={pm._id}>{pm.name}</option>)}
            </select>
            <button className="bg-indigo-600 text-white px-6 rounded">Create</button>
          </form>
        </div>
      )}

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map(proj => (
          <Link key={proj._id} to={`/projects/${proj._id}`} className="bg-white p-6 rounded-lg shadow hover:shadow-lg border-t-4 border-indigo-500 block">
            <h3 className="text-xl font-bold">{proj.name}</h3>
            <div className="mt-4 text-sm text-gray-600">
              <p>Manager: <span className="font-semibold text-indigo-600">{proj.manager?.name || 'Unassigned'}</span></p>
              <p>Team Size: {proj.members?.length || 0} Developers</p>
            </div>
          </Link>
        ))}
        {projects.length === 0 && <p>No projects found for you.</p>}
      </div>
    </div>
  );
}