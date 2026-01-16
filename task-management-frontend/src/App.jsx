import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Users from './pages/Users';
import Login from './pages/Login';
import Register from './pages/Register';

// 1. Wrapper: Only allows access if Logged In
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />; // Redirect to Login (Root) if not authenticated
  return children;
};

// 2. Wrapper: Only allows access if Logged OUT (Prevents login loop)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />; // Redirect to Dashboard if already logged in
  return children;
};

// 3. Layout: The Navigation Bar
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
       <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
          <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                TaskFlow <span className="text-indigo-500">Pro</span>
              </h1>
              <div className="flex gap-1 text-sm font-medium">
                <Link to="/dashboard" className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition">Projects</Link>
                <Link to="/users" className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition">Team</Link>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right hidden sm:block">
                <span className="block text-sm font-bold text-white">{user?.name}</span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</span>
              </div>
              <button 
                onClick={logout} 
                className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-xs px-3 py-2 rounded-lg transition font-bold border border-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="container mx-auto py-6 px-4 flex-1">
          {children}
        </div>
    </div>
  )
}

// 4. Main App Router
function App() {
  return (
    <BrowserRouter>
      <AuthProvider> 
        <Routes>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><Layout><ProjectDetails /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;