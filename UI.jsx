import React from 'react';

// ── Status Badge ──────────────────────────────────────────────
const STATUS_COLORS = {
  active: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 ring-slate-500/30',
  available: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  low_stock: 'bg-amber-500/20 text-amber-400 ring-amber-500/30',
  out_of_stock: 'bg-red-500/20 text-red-400 ring-red-500/30',
  draft: 'bg-slate-500/20 text-slate-400 ring-slate-500/30',
  sent: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
  confirmed: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/30',
  received: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 ring-red-500/30',
  planned: 'bg-slate-500/20 text-slate-400 ring-slate-500/30',
  material_check: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
  assembly: 'bg-purple-500/20 text-purple-400 ring-purple-500/30',
  quality_check: 'bg-orange-500/20 text-orange-400 ring-orange-500/30',
  packing: 'bg-pink-500/20 text-pink-400 ring-pink-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  pass: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  fail: 'bg-red-500/20 text-red-400 ring-red-500/30',
  rework: 'bg-amber-500/20 text-amber-400 ring-amber-500/30',
  dispatched: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  in_transit: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/30',
  ready: 'bg-teal-500/20 text-teal-400 ring-teal-500/30',
  returned: 'bg-red-500/20 text-red-400 ring-red-500/30',
  high: 'bg-red-500/20 text-red-400 ring-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 ring-slate-500/30',
  urgent: 'bg-rose-500/20 text-rose-400 ring-rose-500/30',
};

export const Badge = ({ status, label }) => {
  const cls = STATUS_COLORS[status] || 'bg-slate-500/20 text-slate-400 ring-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${cls}`}>
      {label || status?.replace(/_/g, ' ')}
    </span>
  );
};

// ── Card ──────────────────────────────────────────────────────
export const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl ${className}`}>{children}</div>
);

// ── Stat Card ─────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-600/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    green: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    yellow: 'from-amber-600/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    purple: 'from-purple-600/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    red: 'from-red-600/20 to-red-500/5 border-red-500/30 text-red-400',
    cyan: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
        </div>
        <div className="text-2xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-slate-800 border border-slate-700 rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── Input ─────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">{label}</label>}
    <input
      {...props}
      className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ── Select ────────────────────────────────────────────────────
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">{label}</label>}
    <select
      {...props}
      className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ── Button ────────────────────────────────────────────────────
export const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white border-transparent',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600',
    danger: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent',
    ghost: 'bg-transparent hover:bg-slate-700 text-slate-300 border-slate-600',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button
      {...props}
      className={`${variants[variant]} ${sizes[size]} border rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
};

// ── Table ─────────────────────────────────────────────────────
export const Table = ({ headers, children, empty = 'No data' }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-700">
          {headers.map((h) => (
            <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
    {!children || (Array.isArray(children) && children.length === 0) ? (
      <div className="text-center py-12 text-slate-500">{empty}</div>
    ) : null}
  </div>
);

export const Tr = ({ children, onClick }) => (
  <tr onClick={onClick} className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${onClick ? 'cursor-pointer' : ''}`}>
    {children}
  </tr>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-slate-300 ${className}`}>{children}</td>
);

// ── Loading / Error ───────────────────────────────────────────
export const Loading = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ErrorMsg = ({ msg }) => (
  <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-400 text-sm">{msg}</div>
);

// ── Section Header ────────────────────────────────────────────
export const SectionHeader = ({ title, sub, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {sub && <p className="text-slate-400 text-sm mt-1">{sub}</p>}
    </div>
    {action}
  </div>
);
