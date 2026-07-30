'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const { success, error } = useNotification();
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setFormError('');

      try {
        const response = await api.get('/api/users/me');
        setValues({ name: response.data.name || '', email: response.data.email || '', password: '' });
      } catch (err) {
        setFormError(err.response?.data?.error || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!values.name || !values.email) {
      setFormError('Name and email are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = { name: values.name, email: values.email };
      if (values.password) payload.password = values.password;

      const response = await api.patch('/api/users/me', payload);
      success('Profile updated successfully.');
      updateUser(response.data.user);
      setValues((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to update profile.';
      setFormError(message);
      error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-600">Update your account name, email, and password.</p>
      </div>

      <div className="card">
        <div className="card-body">
          {formError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading profile…</div>
          ) : (
            <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input mt-2 w-full"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input mt-2 w-full"
                  required
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-700">New Password</span>
                <input
                  type="password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="input mt-2 w-full"
                  placeholder="Leave blank to keep current password"
                />
              </label>

              <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <p className="text-sm text-slate-500">Your email is used to sign in and receive notifications.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
