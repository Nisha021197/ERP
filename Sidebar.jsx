import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⬛', exact: true },
  { section: 'Procurement' },
  { to: '/suppliers', label: 'Suppliers', icon: '🏢' },
  { to: '/materials', label: 'Raw Materials', icon: '🧱' },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: '📋' },
  { section: 'Production' },
  { to: '/products', label: 'Product Design', icon: '📐' },
  { to: '/production', label: 'Production Orders', icon: '⚙️' },
  { section: 'Output' },
  { to: '/quality', label: 'Quality Check', icon: '✅' },
  { to: '/shipments', label: 'Packing & Distribution', icon: '📦' },
  { section: 'Admin' },
  { to: '/employees', label: 'Employees', icon: '👥', adminOnly: false },
  { to: '/user-rights', label: 'User Rights', icon: '🔐', adminOnly: true },
];

export default function Sidebar({ user, onLogout, allowedPages = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const canSee = (item) => {
    if (!item.to) return true;
    if (user?.role === 'admin') return true;
    return allowedPages.includes(item.to);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} transition-all duration-300 bg-slate-900 border-r border-slate-700 flex flex-col min-h-screen flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">M</div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">ManuERP</p>
            <p className="text-slate-500 text-xs">Manufacturing Suite</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-500 hover:text-white transition-colors text-lg">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {NAV.map((item, i) => {
          if (item.section) {
            if (collapsed) return <div key={i} className="border-t border-slate-700 my-2" />;
            return (
              <p key={i} className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 pt-4 pb-1">
                {item.section}
              </p>
            );
          }
          if (!canSee(item)) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700">
        {!collapsed && user && (
          <div className="px-4 py-3">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-slate-500 text-xs truncate">{user.email}</p>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">{user.role}</span>
          </div>
        )}
        <div className="px-2 pb-3 space-y-1">
          <NavLink to="/change-password"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }>
            <span className="flex-shrink-0">🔑</span>
            {!collapsed && <span>Change Password</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <span className="flex-shrink-0">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}