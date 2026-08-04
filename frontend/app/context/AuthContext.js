'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../../lib/api';
import { msalInstance, isAzureConfigured, loginRequest } from '../../lib/msalConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setAuthToken(token);
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setAuthToken(token);
  };

  const azureLogin = async () => {
    if (!isAzureConfigured) {
      throw new Error('Azure AD is not configured');
    }

    const response = await msalInstance.loginPopup(loginRequest);
    const account = response.account;
    const tokenResponse = await msalInstance.acquireTokenSilent({ ...loginRequest, account });

    const authUser = {
      id: account.localAccountId,
      name: account.name,
      email: account.username,
      role: 'manager',
    };

    login(authUser, tokenResponse.accessToken);

    return authUser;
  };

  const updateUser = (updatedUserData) => {
    const merged = { ...(user || {}), ...(updatedUserData || {}) };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);

    const account = msalInstance.getActiveAccount();
    if (account) {
      await msalInstance.logoutPopup({ account });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser, azureLogin, isAzureConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
