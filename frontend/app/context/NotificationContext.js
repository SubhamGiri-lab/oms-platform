'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const id = Date.now();
      const newNotification = {
        id,
        ...notification,
        timestamp: new Date()
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 5000);

      return id;
    },
    [removeNotification]
  );

  const success = (message, title = 'Success') => {
    addNotification({ type: 'success', title, message });
  };

  const error = (message, title = 'Error') => {
    addNotification({ type: 'error', title, message });
  };

  const info = (message, title = 'Info') => {
    addNotification({ type: 'info', title, message });
  };

  const warning = (message, title = 'Warning') => {
    addNotification({ type: 'warning', title, message });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        info,
        warning
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
