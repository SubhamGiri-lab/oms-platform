'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const defaultSettings = {
  darkMode: false,
  emailNotifications: true,
  systemAlerts: true,
  autoLogout: false
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem('omsSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleToggle = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    localStorage.setItem('omsSettings', JSON.stringify(next));
    if (key === 'darkMode') {
      setDarkMode(!darkMode);
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Configure your account and application preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="card-body flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{key === 'darkMode' ? 'Dark Mode' : key === 'emailNotifications' ? 'Email Notifications' : key === 'systemAlerts' ? 'System Alerts' : 'Auto Logout'}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {key === 'darkMode'
                    ? 'Enable a darker UI for low-light environments.'
                    : key === 'emailNotifications'
                    ? 'Receive email updates for orders and customers.'
                    : key === 'systemAlerts'
                    ? 'Receive in-app system alerts and warnings.'
                    : 'Log out after a period of inactivity to improve security.'}
                </p>
              </div>
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">{value ? 'On' : 'Off'}</span>
                <input type="checkbox" checked={value} onChange={() => handleToggle(key)} className="toggle" />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <p className="text-sm">Your preferences are stored locally in the browser.</p>
        {saved && <p className="mt-2 text-sm font-semibold text-green-700">Settings saved.</p>}
      </div>
    </div>
  );
}
