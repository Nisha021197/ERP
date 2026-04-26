import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Loading, ErrorMsg } from './UI';

const ROLES = ['admin', 'purchase', 'production'];

export default function UserRights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get('/api/user-rights')
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const isAllowed = (role, path) => {
    return data?.rights?.some(r => r.role === role && r.page_path === path);
  };

  const toggle = async (role, page_path, currentlyAllowed) => {
    await axios.post('/api/user-rights/update', { role, page_path, allowed: !currentlyAllowed });
    load();
  };

  const resetDefaults = async () => {
    if (!confirm('Reset all rights to defaults?')) return;
    await axios.post('/api/user-rights/reset');
    load();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Rights Management</h1>
          <p className="text-slate-400 text-sm mt-1">Control which role can access which ERP page</p>
        </div>
        <button onClick={resetDefaults} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Reset Defaults
        </button>
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase w-1/2">Page</th>
              {ROLES.map(role => (
                <th key={role} className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase">
                  {role.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data?.pages?.map(page => (
              <tr key={page.path} className="hover:bg-slate-700/30">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-white">{page.label}</p>
                  <p className="text-xs text-blue-400">{page.path}</p>
                </td>
                {ROLES.map(role => {
                  const allowed = isAllowed(role, page.path);
                  return (
                    <td key={role} className="px-5 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={allowed}
                        onChange={() => toggle(role, page.path, allowed)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}