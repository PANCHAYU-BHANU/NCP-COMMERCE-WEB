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

          const isNIC = (val) => /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(val || '');
          let initialName = authData.name;
          if (!initialName || isNIC(initialName)) {
            if (primaryRole === 'ZONAL_DIRECTOR') {
              initialName = authData.zoneName ? `${authData.zoneName} Zonal Director` : 'Zonal Director';
            } else if (primaryRole === 'DIVISIONAL_DIRECTOR') {
              initialName = authData.divisionName ? `${authData.divisionName} Divisional Director` : 'Divisional Director';
            } else if (primaryRole === 'PRINCIPAL') {
              initialName = authData.schoolName ? `${authData.schoolName} Principal` : 'School Principal';
            } else if (primaryRole === 'PROVINCIAL_DIRECTOR') {
              initialName = 'Provincial Director';
            }
          }
            
          const initialUser = {
            ...authData,
            name: initialName || authData.name || authData.username,
            role: primaryRole,
            location: authData.location || 'North Central Province'
          };
          setCurrentUser(initialUser);

          // Background sync to fetch fresh full name & details from database
          fetch('http://localhost:8080/api/auth/users')
            .then(res => res.json())
            .then(usersList => {
              if (Array.isArray(usersList)) {
                const me = usersList.find(u => u.username === authData.username || u.id === authData.id);
                if (me && me.name) {
                  setCurrentUser(prev => ({
                    ...prev,
                    name: me.name,
                    location: me.location || prev?.location,
                    zoneName: me.zoneName || prev?.zoneName,
                    divisionName: me.divisionName || prev?.divisionName,
                    schoolName: me.schoolName || prev?.schoolName,
                    schoolId: me.schoolId || prev?.schoolId,
                    divisionId: me.divisionId || prev?.divisionId,
                    zoneId: me.zoneId || prev?.zoneId,
                    districtId: me.districtId || prev?.districtId
                  }));
                  localStorage.setItem('auth', JSON.stringify({
                    ...authData,
                    name: me.name,
                    zoneName: me.zoneName || authData.zoneName,
                    divisionName: me.divisionName || authData.divisionName,
                    schoolName: me.schoolName || authData.schoolName,
                    schoolId: me.schoolId || authData.schoolId,
                    divisionId: me.divisionId || authData.divisionId,
                    zoneId: me.zoneId || authData.zoneId,
                    districtId: me.districtId || authData.districtId
                  }));
                }
              }
            })
            .catch(() => {});
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
      
      const primaryRole = data.roles && data.roles.length > 0 
            ? data.roles[0].replace('ROLE_', '') 
            : 'USER';

      const isNIC = (val) => /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(val || '');
      let computedName = data.name;
      if (!computedName || isNIC(computedName)) {
        if (primaryRole === 'ZONAL_DIRECTOR') {
          computedName = data.zoneName ? `${data.zoneName} Zonal Director` : 'Zonal Director';
        } else if (primaryRole === 'DIVISIONAL_DIRECTOR') {
          computedName = data.divisionName ? `${data.divisionName} Divisional Director` : 'Divisional Director';
        } else if (primaryRole === 'PROVINCIAL_DIRECTOR') {
          computedName = 'Provincial Director';
        }
      }

      const userToStore = {
        ...data,
        name: computedName || data.name || data.username,
        role: primaryRole,
        location: data.location || 'North Central Province'
      };

      localStorage.setItem('auth', JSON.stringify(userToStore));
      setCurrentUser(userToStore);
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
