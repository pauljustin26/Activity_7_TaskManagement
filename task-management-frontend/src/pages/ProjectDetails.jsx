import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import DatePicker from "react-datepicker"; 

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allDevs, setAllDevs] = useState([]); // Used for INVITING new members
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [inviteId, setInviteId] = useState('');
  
  // Modal State
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', deadline: new Date(), assignedToId: '', priority: 'medium'
  });

  useEffect(() => { 
    const fetchData = async () => {
      try {
        const [projRes, tasksRes, usersRes] = await Promise.all([
            api.get(`/projects/${id}`),
            api.get(`/tasks?projectId=${id}`),
            api.get('/users')
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
        // "allDevs" is used for the INVITE dropdown (people NOT YET in the project)
        // We filter out people who are already members to keep the list clean
        const currentMemberIds = projRes.data.members.map(m => m._id);
        setAllDevs(usersRes.data.filter(u => u.role === 'developer' && !currentMemberIds.includes(u._id)));
      } catch (err) { console.error("Error loading data"); }
    };
    fetchData();
  }, [id]);

  const handleAddMember = async () => {
    if (!inviteId) return;
    try {
      const res = await api.patch(`/projects/${id}/members`, { userId: inviteId });
      setProject(res.data);
      // Remove the added user from the invite list
      setAllDevs(prev => prev.filter(u => u._id !== inviteId));
      setInviteId('');
    } catch (err) { alert("Failed to add member"); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.assignedToId) return alert("Please assign a developer");
    try {
      const res = await api.post('/tasks', { ...taskForm, projectId: id, status: 'todo' });
      // We look up the user from the PROJECT MEMBERS list now, not allDevs
      const assignedUser = project.members.find(u => u._id === taskForm.assignedToId);
      const newTask = { ...res.data, assignedTo: assignedUser }; 
      setTasks([...tasks, newTask]); 
      setIsAddingTask(false);
      setTaskForm({ title: '', description: '', deadline: new Date(), assignedToId: '', priority: 'medium' });
    } catch (err) { alert("Failed to create task"); }
  };

  const handleMoveTask = async (taskId, nextStatus) => {
    const oldTasks = [...tasks];
    const now = new Date().toISOString();
    setTasks(tasks.map(t => {
        if (t._id === taskId) {
            const updates = { status: nextStatus };
            if (nextStatus === 'in-progress') updates.startedAt = now;
            if (nextStatus === 'review') updates.submittedAt = now;
            if (nextStatus === 'done') updates.completedAt = now;
            return { ...t, ...updates };
        }
        return t;
    }));

    try {
      await api.patch(`/tasks/${taskId}`, { status: nextStatus });
    } catch (err) {
      setTasks(oldTasks); 
      alert("Failed to move task");
    }
  };

  // --- DELETE LOGIC ---
  const initiateDelete = (taskId) => {
      setTaskToDelete(taskId);
  }

  const confirmDeleteTask = async () => {
    if(!taskToDelete) return;
    const oldTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== taskToDelete));
    setTaskToDelete(null);

    try { await api.delete(`/tasks/${taskToDelete}`); } 
    catch (err) { setTasks(oldTasks); alert("Failed to delete"); }
  };

  const handleCompleteProject = async () => {
    if(!confirm("Mark project completed?")) return;
    try {
        const res = await api.patch(`/projects/${id}`, { status: 'completed' }); 
        setProject(res.data);
    } catch (err) { alert("Failed to update"); }
  };

  if (!project) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">Loading System...</div>;

  const isPM = user.role === 'project_manager';
  const isAdmin = user.role === 'admin';

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-900 overflow-hidden text-slate-200 relative">
      
      {/* Header Section */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-6 flex justify-between items-center shrink-0 backdrop-blur-sm">
        <div>
          <Link to="/" className="text-xs text-slate-400 hover:text-indigo-400 font-bold uppercase tracking-wider transition">
             &larr; Back to Projects
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.status === 'completed' && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30">COMPLETED</span>}
          </div>
          <div className="text-sm text-slate-400 mt-2 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>Manager: <span className="text-slate-200 font-medium">{project.manager?.name}</span></span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Team: {project.members?.length > 0 ? project.members.map(m => m.name).join(', ') : 'Pending assignment'}</span>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-4 items-center">
            {isPM && project.status !== 'completed' && (
                <>
                    {/* INVITE DROPDOWN: Shows people NOT in the team yet */}
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <select className="bg-transparent text-sm px-3 py-1 outline-none text-slate-300 w-40" value={inviteId} onChange={e => setInviteId(e.target.value)}>
                            <option value="" className="bg-slate-800">Select Dev...</option>
                            {allDevs.map(d => <option key={d._id} value={d._id} className="bg-slate-800">{d.name}</option>)}
                        </select>
                        <button onClick={handleAddMember} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md text-xs font-bold transition">Invite</button>
                    </div>
                    <button onClick={() => setIsAddingTask(!isAddingTask)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg shadow-lg shadow-indigo-900/50 text-sm font-bold transition-all hover:scale-105 active:scale-95">
                        {isAddingTask ? 'Close' : '+ New Task'}
                    </button>
                </>
            )}
            {isAdmin && project.status !== 'completed' && (
                <button onClick={handleCompleteProject} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm transition-all">
                    ✓ Complete Project
                </button>
            )}
        </div>
      </div>

      {/* Add Task Form */}
      {isAddingTask && isPM && (
        <div className="bg-slate-800 border-b border-slate-700 p-6 animate-fade-in-down shrink-0">
          <form onSubmit={handleAddTask} className="max-w-5xl mx-auto flex gap-6 items-start">
            <div className="flex-1 space-y-4">
                <input placeholder="Task Title" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
                <textarea placeholder="Description" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-indigo-500 outline-none h-20 resize-none transition" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
            </div>
            <div className="w-72 space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Due Date</label>
                    <DatePicker selected={taskForm.deadline} onChange={(date) => setTaskForm({...taskForm, deadline: date})} showTimeSelect dateFormat="Pp" className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Assignee</label>
                        {/* ASSIGN DROPDOWN: Shows ONLY Project Members */}
                        <select className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg text-sm text-white outline-none" value={taskForm.assignedToId} onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})} required>
                            <option value="">Select Member...</option>
                            {project.members.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Priority</label>
                        <select className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg text-sm text-white outline-none" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg text-sm font-bold shadow-lg transition-all mt-1">Create Task</button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start custom-scrollbar">
            <Column title="To Do" status="todo" color="border-t-4 border-slate-500" 
                tasks={tasks.filter(t => t.status === 'todo')} 
                user={user} onMove={handleMoveTask} onDelete={initiateDelete} 
                btnText="Start" nextStatus="in-progress" btnColor="text-indigo-400 hover:text-indigo-300"
                canMove={(t) => t.assignedTo?._id === user._id}
            />
            <Column title="In Progress" status="in-progress" color="border-t-4 border-indigo-500" 
                tasks={tasks.filter(t => t.status === 'in-progress')} 
                user={user} onMove={handleMoveTask} onDelete={initiateDelete} 
                btnText="Submit Review" nextStatus="review" btnColor="text-purple-400 hover:text-purple-300"
                canMove={(t) => t.assignedTo?._id === user._id}
            />
            <Column title="Under Review" status="review" color="border-t-4 border-purple-500" 
                tasks={tasks.filter(t => t.status === 'review')} 
                user={user} onMove={handleMoveTask} onDelete={initiateDelete} 
                btnText="Approve" nextStatus="done" btnColor="text-emerald-400 hover:text-emerald-300"
                canMove={() => isPM}
            />
            <Column title="Done" status="done" color="border-t-4 border-emerald-500" 
                tasks={tasks.filter(t => t.status === 'done')} 
                user={user} onMove={handleMoveTask} onDelete={initiateDelete} 
                btnText="Reopen" nextStatus="todo" btnColor="text-slate-400 hover:text-slate-300"
                canMove={() => isPM}
            />
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-down">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500/20 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">Delete Task?</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete this task?</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                    <button onClick={confirmDeleteTask} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-red-900/20">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function Column({ title, tasks, color, user, onMove, onDelete, btnText, nextStatus, btnColor, canMove }) {
    const isPM = user.role === 'project_manager';
    const priorityBadge = {
        high: 'bg-red-500/20 text-red-400 border-red-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex-1 min-w-[320px] h-full flex flex-col bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm ${color}`}>
            <div className="p-4 flex justify-between items-center border-b border-slate-700/50">
                <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm">{title}</h3>
                <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-bold">{tasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {tasks.map(task => (
                    <div key={task._id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:shadow-md hover:border-slate-600 transition group relative">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${priorityBadge[task.priority] || priorityBadge.medium}`}>
                                {task.priority || 'medium'}
                            </span>
                            
                            {/* Trash Icon Button */}
                            {isPM && (
                                <button onClick={() => onDelete(task._id)} className="text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <h4 className="font-semibold text-slate-100 text-sm mb-2">{task.title}</h4>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.description || "No description."}</p>
                        
                        <div className="bg-slate-900/50 rounded p-2 mb-3 text-[10px] text-slate-400 border border-slate-700/50">
                            {title === 'To Do' && <span>Posted: {formatDate(task.createdAt)}</span>}
                            {title === 'In Progress' && <span>Started: {formatDate(task.startedAt) || 'Just now'}</span>}
                            {title === 'Under Review' && <span>Submitted: {formatDate(task.submittedAt) || 'Just now'}</span>}
                            {title === 'Done' && <span className="text-emerald-500">Completed: {formatDate(task.completedAt) || 'Just now'}</span>}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                                    {task.assignedTo?.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-xs text-slate-500">{task.assignedTo?.name.split(' ')[0]}</span>
                            </div>
                            {canMove(task) && (
                                <button onClick={() => onMove(task._id, nextStatus)} className={`text-xs font-bold transition-all hover:underline ${btnColor}`}>
                                    {btnText} &rarr;
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}