import React, { useState } from 'react';
import axios from 'axios';
import { Card } from './UI';

export default function ChangePassword({ user }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/change-password', {
        user_id: user.id,
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setMsg('Password changed successfully!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Change Password</h1>
        <p className="text-slate-400 text-sm mt-1">Update your account password</p>
      </div>
      <div className="max-w-md">
        <Card className="p-6">
          {msg && <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 mb-4 text-sm">{msg}</div>}
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Current Password</label>
              <input type="password" value={form.old_password} onChange={e => setForm({...form, old_password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">New Password</label>
              <input type="password" value={form.new_password} onChange={e => setForm({...form, new_password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
              <input type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors text-sm">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}