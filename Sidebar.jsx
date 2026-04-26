import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

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
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

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
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-500 hover:text-white transition-colors text-lg"
        >
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

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-slate-600 text-xs text-center">ManuERP v1.0 · WAMP + MySQL</p>
        </div>
      )}
    </aside>
  );
}
