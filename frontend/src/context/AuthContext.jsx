import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smart_schedule_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = (role, username, email) => {
    const roleTitles = {
      admin: 'Administrator',
      teacher: 'Faculty Teacher',
      student: 'Student'
    };
    
    const newUser = {
      role: role.toLowerCase(),
      name: username || `${roleTitles[role.toLowerCase()] || role}`,
      email: email || `${role.toLowerCase()}@college.edu`,
      department: 'Computer Engineering'
    };
    
    setUser(newUser);
    localStorage.setItem('smart_schedule_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smart_schedule_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
