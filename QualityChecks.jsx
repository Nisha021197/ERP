import React, { useEffect, useState } from 'react';
import { quality as qcApi, productionOrders as prodApi } from '../services/api';
import { Card, Modal, Input, Select, Button, Table, Tr, Td, Badge, SectionHeader, StatCard, Loading, ErrorMsg } from '../components/UI';

const EMPTY = { production_order_id: '', inspector: '', result: 'pass', defects_found: '', actions_taken: '', approved_qty: 0, rejected_qty: 0, notes: '' };

export default function QualityChecks() {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([qcApi.getAll(), qcApi.getStats(), prodApi.getAll()])
      .then(([qc, st, po]) => {
        setList(qc.data);
        setStats(st.data);
        setOrders(po.data.filter(o => o.status === 'quality_check'));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try { await qcApi.create(form); setModal(false); setForm(EMPTY); load(); }
    catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const passRate = stats ? (stats.passed / (stats.total_checks || 1) * 100).toFixed(1) : 0;

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <SectionHeader title="Quality Check" sub="Inspect and approve production batches" action={
        <Button onClick={() => { setForm(EMPTY); setModal(true); }}>+ Log QC Check</Button>
      } />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="🔍" label="Total Checks" value={stats.total_checks} color="blue" />
          <StatCard icon="✅" label="Passed" value={stats.passed || 0} sub={`${passRate}% pass rate`} color="green" />
          <StatCard icon="❌" label="Failed" value={stats.failed || 0} color="red" />
          <StatCard icon="🔄" label="Rework" value={stats.rework || 0} color="yellow" />
        </div>
      )}

      <Card>
        <Table headers={['Production Order', 'Product', 'Inspector', 'Date', 'Approved', 'Rejected', 'Result']}>
          {list.map(qc => (
            <Tr key={qc.id}>
              <Td className="font-mono text-blue-400 text-xs">{qc.order_number}</Td>
              <Td className="font-medium text-white">{qc.product_name}</Td>
              <Td>{qc.inspector}</Td>
              <Td className="text-xs">{new Date(qc.check_date).toLocaleDateString()}</Td>
              <Td className="text-emerald-400 font-bold">{qc.approved_qty}</Td>
              <Td className="text-red-400 font-bold">{qc.rejected_qty}</Td>
              <Td><Badge status={qc.result} /></Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Log Quality Check" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Production Order (in QC stage)" value={form.production_order_id} onChange={e => setForm({ ...form, production_order_id: e.target.value })} className="col-span-2">
            <option value="">-- Select Production Order --</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} — {o.product_name} (Qty: {o.quantity})</option>)}
          </Select>
          <Input label="Inspector Name" value={form.inspector} onChange={e => setForm({ ...form, inspector: e.target.value })} />
          <Select label="Result" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="rework">Rework Required</option>
          </Select>
          <Input label="Approved Quantity" type="number" value={form.approved_qty} onChange={e => setForm({ ...form, approved_qty: e.target.value })} />
          <Input label="Rejected Quantity" type="number" value={form.rejected_qty} onChange={e => setForm({ ...form, rejected_qty: e.target.value })} />
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Defects Found</label>
            <textarea value={form.defects_found} onChange={e => setForm({ ...form, defects_found: e.target.value })} rows={2}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Actions Taken</label>
            <textarea value={form.actions_taken} onChange={e => setForm({ ...form, actions_taken: e.target.value })} rows={2}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Submit QC Report'}</Button>
        </div>
      </Modal>
    </div>
  );
}
