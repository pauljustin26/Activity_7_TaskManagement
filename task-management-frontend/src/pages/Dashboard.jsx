import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [pms, setPms] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', managerId: '' });
  
  // UI States
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    loadProjects();
    if (user.role === 'admin') {
       api.get('/users').then(res => setPms(res.data.filter(u => u.role === 'project_manager')));
    }
  }, [user]);

  const loadProjects = async () => {
     try {
        const res = await api.get(`/projects?userId=${user._id}&role=${user.role}`);
        setProjects(res.data);
     } catch(err) { console.error("Error") }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
        await api.post('/projects', { ...newProject, manager: newProject.managerId });
        await loadProjects(); 
        setNewProject({ name: '', managerId: '' });
    } catch (err) { alert("Error creating project"); }
  };

  const confirmDelete = (e, id) => {
      e.preventDefault(); // Prevent Link navigation
      setProjectToDelete(id);
      setShowDeleteModal(true);
  };

  const executeDelete = async () => {
      if (!projectToDelete) return;
      try {
        await api.delete(`/projects/${projectToDelete}`);
        setProjects(projects.filter(p => p._id !== projectToDelete));
        setShowDeleteModal(false);
        setProjectToDelete(null);
      } catch (err) {
          alert("Failed to delete");
      }
  };

  // --- FILTERING ---
  const getFilteredProjects = () => {
    let result = [...projects];
    if (filterStatus === 'active') result = result.filter(p => p.status !== 'completed');
    else if (filterStatus === 'completed') result = result.filter(p => p.status === 'completed');

    result.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  };

  const displayedProjects = getFilteredProjects();

  return (
    <div className="p-8 min-h-screen bg-slate-900 text-slate-200 relative">
      <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Welcome back, <span className="text-indigo-400 font-semibold">{user.name}</span></p>
          </div>
          <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-400">
              Role: {user.role.replace('_', ' ')}
          </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm items-center">
          <div className="flex gap-2">
              {['all', 'active', 'completed'].map(status => (
                  <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg text-xs font-bold transition capitalize ${filterStatus === status ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                      {status}
                  </button>
              ))}
          </div>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-slate-800 text-slate-300 text-xs font-bold p-2 rounded-lg border border-slate-600 outline-none focus:border-indigo-500">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
          </select>
      </div>

      {user.role === 'admin' && (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 mb-10">
          <h3 className="font-bold text-lg mb-4 text-white">Create New Project</h3>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input placeholder="Project Name" className="border border-slate-600 bg-slate-900 p-3 rounded-lg flex-1 text-white outline-none focus:border-indigo-500 transition" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
            <select className="border border-slate-600 bg-slate-900 p-3 rounded-lg w-64 text-white outline-none focus:border-indigo-500 transition" value={newProject.managerId} onChange={e => setNewProject({...newProject, managerId: e.target.value})} required>
              <option value="">Select Manager...</option>
              {pms.map(pm => <option key={pm._id} value={pm._id}>{pm.name}</option>)}
            </select>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-lg font-bold shadow-lg transition-all hover:scale-105">Create</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProjects.map(proj => (
          <Link key={proj._id} to={`/projects/${proj._id}`} className="group bg-slate-800 p-6 rounded-xl shadow-md border border-slate-700 hover:border-indigo-500 hover:shadow-indigo-900/20 transition-all duration-300 block overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                {/* Left: Icon */}
                <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xl shrink-0">
                    {proj.name.charAt(0)}
                </div>

                {/* Right: Status & Actions (Stacked properly) */}
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        {proj.status === 'completed' ? 
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30 font-bold">DONE</span> :
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30 font-bold">ACTIVE</span>
                        }
                        
                        {/* Admin Delete Icon (SVG Bin) */}
                        {user.role === 'admin' && (
                            <button 
                                onClick={(e) => confirmDelete(e, proj._id)} 
                                className="text-slate-500 hover:text-red-500 transition p-1 rounded hover:bg-slate-700/50"
                                title="Delete Project"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {/* Date moved here to avoid overlap */}
                    <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors truncate">{proj.name}</h3>
            <p className="text-sm text-slate-400">Manager: {proj.manager?.name || 'Unassigned'}</p>
            
            <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between text-sm">
                <span className="text-slate-500">{proj.members?.length || 0} Members</span>
                <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">View Board &rarr;</span>
            </div>
          </Link>
        ))}
        
        {/* Empty State */}
        {displayedProjects.length === 0 && (
            <div className="col-span-full py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center">
                <div className="bg-slate-800 p-4 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                </div>
                <p className="text-slate-400 font-medium">No projects found.</p>
                {user.role === 'developer' && (
                    <p className="text-xs text-slate-500 mt-2 max-w-md text-center">
                        You can't see projects yet? <br/> Ask a Project Manager to open a project and click <b>"Invite"</b> to add you to the team.
                    </p>
                )}
            </div>
        )}
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-down">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500/20 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">Delete Project?</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                    <button onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-red-900/20">Delete Project</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}