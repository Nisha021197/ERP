import React, { useEffect, useState } from 'react';
import { dashboard } from './api';
import { StatCard, Card, Badge, Loading, ErrorMsg } from './UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STAGE_COLORS = {
  planned: '#64748b', material_check: '#eab308', in_progress: '#3b82f6',
  assembly: '#a855f7', quality_check: '#f97316', packing: '#ec4899',
  completed: '#22c55e', cancelled: '#ef4444',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboard.getSummary()
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={`API Error: ${error} — Make sure the backend is running on port 5000`} />;

  const stageCounts = {};
  data.recent_production.forEach(p => { stageCounts[p.status] = (stageCounts[p.status] || 0) + 1; });
  const pieData = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manufacturing Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time overview of your production pipeline</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard icon="🧱" label="Materials" value={data.materials.total} sub={`₹${Number(data.materials.inventory_value).toLocaleString('en-IN')} value`} color="blue" />
        <StatCard icon="📋" label="Active POs" value={data.purchase_orders.active} sub="Purchase orders" color="yellow" />
        <StatCard icon="⚙️" label="In Production" value={data.production.active} sub="Active orders" color="purple" />
        <StatCard icon="✅" label="QC Pass Rate" value={data.quality.pass_count} sub={`${data.quality.rejected || 0} rejected units`} color="green" />
        <StatCard icon="🚚" label="In Transit" value={data.shipments.in_transit} sub="Active shipments" color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Production pipeline chart */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Production Stage Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name.replace('_', ' ')}: ${value}`} labelLine={false}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={STAGE_COLORS[entry.name] || '#64748b'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-8">No production data yet</p>}
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">⚠️ Low Stock Alerts</h3>
          {data.low_stock_alerts.length === 0
            ? <p className="text-slate-500 text-sm">All materials well-stocked</p>
            : data.low_stock_alerts.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-400">{m.current_stock} {m.unit}</p>
                  <Badge status={m.status} />
                </div>
              </div>
            ))}
        </Card>
      </div>

      {/* Recent Production Orders */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Production Orders</h3>
        </div>
        <div className="divide-y divide-slate-700">
          {data.recent_production.map(p => (
            <div key={p.order_number} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{p.order_number}</p>
                  <p className="text-xs text-slate-400">{p.product} · Qty: {p.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={p.priority} />
                <Badge status={p.status} />
              </div>
            </div>
          ))}
          {data.recent_production.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">No production orders yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
