import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from local storage
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        // Ensure token exists and user object is well-formed
        if (authData && authData.token) {
          // Normalize the role for frontend mapping (e.g., ROLE_PRINCIPAL -> PRINCIPAL)
          const primaryRole = authData.roles && authData.roles.length > 0 
            ? authData.roles[0].replace('ROLE_', '') 
            : 'USER';
            
          setCurrentUser({
            ...authData,
            role: primaryRole,
            location: authData.location || 'North Central Province'
          });
        }
      } catch (e) {
        console.error("Failed to parse auth data", e);
        localStorage.removeItem('auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/signin', { username, password });
      const data = response.data;
      
      localStorage.setItem('auth', JSON.stringify(data));
      
      const primaryRole = data.roles && data.roles.length > 0 
            ? data.roles[0].replace('ROLE_', '') 
            : 'USER';

      setCurrentUser({
        ...data,
        role: primaryRole,
        location: data.location || 'North Central Province'
      });
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
