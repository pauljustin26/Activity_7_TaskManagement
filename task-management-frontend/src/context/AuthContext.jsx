import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage immediately to prevent flicker
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const navigate = useNavigate();

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/dashboard'); // <--- CHANGED: Redirects to Dashboard after login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/'); // <--- CHANGED: Redirects to Login (Root) after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);