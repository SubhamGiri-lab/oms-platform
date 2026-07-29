'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bell, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications/unread/count');
        setUnreadNotifications(response.data?.unreadCount || 0);
        const listResponse = await api.get('/api/notifications?unread=true');
        setNotifications(listResponse.data || []);
      } catch (error) {
        setUnreadNotifications(0);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const shortName = useMemo(() => {
    return (
      user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ||
      'US'
    );
  }, [user?.name]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-sm sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">Welcome back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here's what's happening today</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>

          <div className="relative">
            <button
              aria-label="Notifications"
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Bell size={24} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible hover:opacity-100 hover:visible transition-all duration-200 z-50 dark:bg-slate-800 dark:border-slate-700">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              </div>
              <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto dark:divide-slate-700">
                {notifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No unread alerts right now.</div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-all dark:hover:bg-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{notification.title || 'Notification'}</p>
                      <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 text-center border-t border-slate-200 dark:border-slate-700">
                <Link href="/notifications" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  View all notifications
                </Link>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-semibold">
                {shortName}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'Member'}</p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50 dark:bg-slate-800 dark:border-slate-700">
                <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'No email'}</p>
                </div>
                <div className="py-2">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-all">
                    <User size={18} />
                    <span className="text-sm">Profile Settings</span>
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-all">
                    <Settings size={18} />
                    <span className="text-sm">Settings</span>
                  </Link>
                </div>
                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-all rounded-lg dark:text-slate-300 dark:hover:bg-slate-700">
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
