import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  
  // Data States
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allDevs, setAllDevs] = useState([]); 

  // UI States
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [inviteId, setInviteId] = useState('');
  
  // Form State
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', deadline: '', assignedToId: '', priority: 'medium'
  });

  useEffect(() => { refreshData(); }, [id]);

  const refreshData = async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?projectId=${id}`),
          api.get('/users')
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setAllDevs(usersRes.data.filter(u => u.role === 'developer'));
    } catch (err) {
      console.error("Failed to load project data");
    }
  };

  const handleAddMember = async () => {
    if (!inviteId) return;
    try {
      await api.patch(`/projects/${id}/members`, { userId: inviteId });
      setInviteId('');
      refreshData();
    } catch (err) { alert("Failed to add member"); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.assignedToId) return alert("Please assign a developer");
    try {
      await api.post('/tasks', { ...taskForm, projectId: id, status: 'todo' });
      setIsAddingTask(false);
      setTaskForm({ title: '', description: '', deadline: '', assignedToId: '', priority: 'medium' });
      refreshData();
    } catch (err) { alert("Failed to create task"); }
  };

  // --- NEW: Admin Only Action ---
  const handleCompleteProject = async () => {
    if(!confirm("Mark this project as fully completed?")) return;
    try {
        await api.patch(`/projects/${id}`, { status: 'completed' }); 
        refreshData();
    } catch (err) { alert("Failed to update project"); }
  };

  if (!project) return <div className="p-10 text-center text-gray-500">Loading Project...</div>;

  // --- PERMISSION CHECKS ---
  const isPM = user.role === 'project_manager';
  const isAdmin = user.role === 'admin';

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 border-b flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Link to="/" className="text-xs text-gray-500 hover:text-indigo-600 font-medium uppercase tracking-wide">
               &larr; Projects
             </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {project.name}
            {project.status === 'completed' && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">COMPLETED</span>}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">Manager: {project.manager?.name}</span>
            <span className="text-gray-300">|</span>
            <span>Team: {project.members?.length > 0 ? project.members.map(m => m.name).join(', ') : 'No members yet'}</span>
          </p>
        </div>
        
        {/* CONTROLS: Project Manager Only */}
        {isPM && project.status !== 'completed' && (
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border">
              <select className="bg-transparent text-sm px-2 outline-none w-40" value={inviteId} onChange={e => setInviteId(e.target.value)}>
                <option value="">Select Developer...</option>
                {allDevs.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <button onClick={handleAddMember} className="bg-white text-indigo-600 px-3 py-1.5 rounded-md text-xs font-bold shadow-sm border hover:bg-gray-50 transition">+ Invite</button>
            </div>
            <button onClick={() => setIsAddingTask(!isAddingTask)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-200 text-sm font-bold transition">
              {isAddingTask ? 'Close Form' : '+ New Task'}
            </button>
          </div>
        )}

        {/* CONTROLS: Admin Only */}
        {isAdmin && project.status !== 'completed' && (
            <button onClick={handleCompleteProject} className="bg-green-600 text-white px-4 py-2 rounded shadow font-bold hover:bg-green-700">
                ✓ Mark Project Done
            </button>
        )}
      </div>

      {/* Add Task Form (Only Visible to Project Manager) */}
      {isAddingTask && isPM && (
        <div className="bg-gray-50 border-b p-6 animate-fade-in-down shrink-0">
          <form onSubmit={handleAddTask} className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex gap-4 items-start">
            <div className="flex-1 space-y-3">
                <input placeholder="Task Title" className="w-full border-gray-200 bg-gray-50 p-3 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
                <textarea placeholder="Description" className="w-full border-gray-200 bg-gray-50 p-3 rounded-lg text-sm outline-none resize-none h-20" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
            </div>
            <div className="w-64 space-y-3">
                <input type="datetime-local" className="w-full border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} required />
                <select className="w-full border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm" value={taskForm.assignedToId} onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})} required>
                    <option value="">Assign To...</option>
                    {allDevs.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
                <select className="w-full border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold shadow hover:bg-green-700 h-full self-stretch flex items-center justify-center min-w-25">Create</button>
          </form>
        </div>
      )}

      {/* Task Board */}
      <div className="flex-1 p-6 overflow-hidden">
        <KanbanBoard tasks={tasks} currentUser={user} /> 
      </div>
    </div>
  );
}


function KanbanBoard({ tasks, currentUser }) {
  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const isPM = currentUser.role === 'project_manager';

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start">
      {/* 1. TO DO: Only the Assignee can start the task */}
      <Column 
        title="To Do" 
        tasks={getTasksByStatus('todo')} 
        nextStatus="in-progress"
        btnText="Start Work" 
        btnColor="text-blue-600 bg-blue-50 hover:bg-blue-100"
        color="bg-gray-100"
        currentUser={currentUser}
        showAction={ (task) => task.assignedTo?._id === currentUser._id } 
      />

      {/* 2. IN PROGRESS: Only the Assignee can submit for review */}
      <Column 
        title="In Progress" 
        tasks={getTasksByStatus('in-progress')} 
        nextStatus="review"
        btnText="Submit for Review" 
        btnColor="text-purple-600 bg-purple-50 hover:bg-purple-100"
        color="bg-blue-50/50 border border-blue-100"
        currentUser={currentUser}
        showAction={ (task) => task.assignedTo?._id === currentUser._id }
      />

      {/* 3. UNDER REVIEW: Only PM can approve */}
      <Column 
        title="Under Review" 
        tasks={getTasksByStatus('review')} 
        nextStatus="done"
        btnText="Approve & Close" 
        btnColor="text-green-600 bg-green-50 hover:bg-green-100"
        color="bg-purple-50/50 border border-purple-100"
        currentUser={currentUser}
        showAction={ () => isPM }
      />

      {/* 4. DONE: Only PM can reopen */}
      <Column 
        title="Done" 
        tasks={getTasksByStatus('done')} 
        nextStatus="todo"
        btnText="Reopen" 
        btnColor="text-gray-500 bg-gray-100 hover:bg-gray-200"
        color="bg-green-50/50 border border-green-100"
        currentUser={currentUser}
        showAction={ () => isPM }
      />
    </div>
  );
}

function Column({ title, tasks, color, nextStatus, btnText, btnColor, currentUser, showAction }) {
  const [loading, setLoading] = useState(false);

  const handleMove = async (taskId) => {
    if(loading) return;
    setLoading(true);
    try {
        await api.patch(`/tasks/${taskId}`, { status: nextStatus });
        window.location.reload(); 
    } catch(err) { alert("Failed to move task"); }
    setLoading(false);
  };

  const handleDelete = async (taskId) => {
    if(!confirm("Delete task?")) return;
    await api.delete(`/tasks/${taskId}`);
    window.location.reload();
  };

  // Only PMs can delete tasks
  const canDelete = currentUser.role === 'project_manager';

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  return (
    <div className={`flex-1 ${color} rounded-2xl p-4 flex flex-col h-full min-w-75`}>
      <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center px-1">
        {title} <span className="bg-white px-2.5 py-0.5 rounded-full text-xs text-gray-600 font-extrabold shadow-sm border border-gray-100">{tasks.length}</span>
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {tasks.map(task => (
          <div key={task._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-2">
               <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${priorityColors[task.priority] || priorityColors.medium}`}>
                 {task.priority || 'medium'}
               </span>
               {canDelete && (
                 <button onClick={() => handleDelete(task._id)} className="text-gray-300 hover:text-red-500 font-bold px-2 text-lg leading-none opacity-0 group-hover:opacity-100 transition">×</button>
               )}
            </div>

            <h4 className="font-bold text-gray-800 text-sm mb-1 leading-snug">{task.title}</h4>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{task.description}</p>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
               <div className="flex items-center gap-2" title={`Assigned to: ${task.assignedTo?.name}`}>
                 <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                   {task.assignedTo?.name?.charAt(0) || '?'}
                 </div>
                 <span className="text-xs text-gray-400 font-medium truncate max-w-20">
                    {task.assignedTo?.name || 'Unassigned'}
                 </span>
               </div>
               
               {/* THE KEY PERMISSION CHECK */}
               {showAction(task) && (
                   <button 
                      onClick={() => handleMove(task._id)}
                      className={`text-xs px-3 py-1.5 rounded-md font-bold transition ${btnColor}`}
                   >
                      {btnText}
                   </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 