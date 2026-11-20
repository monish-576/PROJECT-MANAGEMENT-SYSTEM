import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const login = (userData, authToken) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('userInfo', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
