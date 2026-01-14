// src/App.jsx
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Users from './pages/Users';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
       <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight text-indigo-400">TaskFlow <span className="text-white">Pro</span></h1>
              <div className="space-x-1 flex text-sm font-medium">
                <Link to="/" className="hover:bg-slate-800 px-3 py-2 rounded transition">Projects</Link>
                <Link to="/users" className="hover:bg-slate-800 px-3 py-2 rounded transition">Team</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-sm font-bold">{user?.name}</span>
                <span className="block text-xs text-gray-400 uppercase">{user?.role?.replace('_', ' ')}</span>
              </div>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded transition"
              >
                Logout
              </button>
            </div>

          </div>
        </nav>
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><Layout><ProjectDetails /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;