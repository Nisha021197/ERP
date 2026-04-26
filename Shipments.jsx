import React, { useEffect, useState } from 'react';
import { shipments as shipApi, productionOrders as prodApi } from './api';
import { Card, Modal, Input, Select, Button, Table, Tr, Td, Badge, SectionHeader, Loading, ErrorMsg } from './UI';

const STATUSES = ['packing', 'ready', 'dispatched', 'in_transit', 'delivered', 'returned'];
const EMPTY = { production_order_id: '', customer_name: '', customer_address: '', quantity: 1, carrier: '', notes: '' };

export default function Shipments() {
  const [list, setList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [tracking, setTracking] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([shipApi.getAll(), prodApi.getAll()])
      .then(([s, p]) => {
        setList(s.data);
        setOrders(p.data.filter(o => o.status === 'packing' || o.status === 'completed'));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    const r = await shipApi.getOne(id); setDetail(r.data);
  };

  const save = async () => {
    setSaving(true);
    try { await shipApi.create(form); setModal(false); setForm(EMPTY); load(); }
    catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await shipApi.updateStatus(id, { status, tracking_number: tracking || undefined });
    if (detail) { const r = await shipApi.getOne(id); setDetail(r.data); }
    setTracking(''); load();
  };

  const statusFlow = {
    packing: 'ready',
    ready: 'dispatched',
    dispatched: 'in_transit',
    in_transit: 'delivered',
  };
  const nextStatus = detail ? statusFlow[detail.status] : null;
  const nextLabels = { ready: 'Mark Ready to Ship', dispatched: 'Mark Dispatched', in_transit: 'Mark In Transit', delivered: 'Mark Delivered' };

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <SectionHeader title="Packing & Distribution" sub="Pack, dispatch and track shipments" action={
        <Button onClick={() => { setForm(EMPTY); setModal(true); }}>+ New Shipment</Button>
      } />

      <Card>
        <Table headers={['Shipment #', 'Production Order', 'Customer', 'Qty', 'Carrier', 'Tracking', 'Status', 'Actions']}>
          {list.map(s => (
            <Tr key={s.id} onClick={() => openDetail(s.id)}>
              <Td className="font-mono text-blue-400 text-xs">{s.shipment_number}</Td>
              <Td className="text-xs text-slate-400">{s.order_number || '—'}</Td>
              <Td>
                <p className="font-medium text-white">{s.customer_name}</p>
                <p className="text-xs text-slate-500">{s.customer_address?.slice(0, 30)}</p>
              </Td>
              <Td>{s.quantity}</Td>
              <Td>{s.carrier || '—'}</Td>
              <Td className="font-mono text-xs">{s.tracking_number || '—'}</Td>
              <Td><Badge status={s.status} /></Td>
              <Td onClick={e => e.stopPropagation()}>
                {statusFlow[s.status] && (
                  <Button size="sm" variant="ghost" onClick={() => { setDetail(s); setTracking(''); }}>Manage →</Button>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Create Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Shipment" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Production Order" value={form.production_order_id} onChange={e => setForm({ ...form, production_order_id: e.target.value })} className="col-span-2">
            <option value="">-- Select Production Order (optional) --</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} — {o.product_name}</option>)}
          </Select>
          <Input label="Customer Name" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="col-span-2" />
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Customer Address</label>
            <textarea value={form.customer_address} onChange={e => setForm({ ...form, customer_address: e.target.value })} rows={2}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <Input label="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          <Input label="Carrier / Courier" value={form.carrier} onChange={e => setForm({ ...form, carrier: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="col-span-2" />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Creating...' : 'Create Shipment'}</Button>
        </div>
      </Modal>

      {/* Detail / Status Update Modal */}
      {detail && (
        <Modal open={!!detail} onClose={() => setDetail(null)} title={`Shipment: ${detail.shipment_number}`} size="lg">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div><p className="text-slate-400 text-xs">Customer</p><p className="text-white font-semibold">{detail.customer_name}</p></div>
            <div><p className="text-slate-400 text-xs">Carrier</p><p className="text-white">{detail.carrier || '—'}</p></div>
            <div><p className="text-slate-400 text-xs">Quantity</p><p className="text-white font-bold">{detail.quantity} units</p></div>
            <div><p className="text-slate-400 text-xs">Status</p><Badge status={detail.status} /></div>
            <div><p className="text-slate-400 text-xs">Tracking #</p><p className="text-blue-400 font-mono">{detail.tracking_number || '—'}</p></div>
            <div><p className="text-slate-400 text-xs">Dispatched</p><p className="text-white">{detail.dispatched_at ? new Date(detail.dispatched_at).toLocaleString() : '—'}</p></div>
            <div><p className="text-slate-400 text-xs">Delivered</p><p className="text-white">{detail.delivered_at ? new Date(detail.delivered_at).toLocaleString() : '—'}</p></div>
          </div>

          {nextStatus && (
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <p className="text-sm font-semibold text-white mb-3">Update Status → <span className="text-blue-400">{nextStatus}</span></p>
              {(nextStatus === 'dispatched' || nextStatus === 'in_transit') && (
                <Input label="Tracking Number (optional)" value={tracking} onChange={e => setTracking(e.target.value)} className="mb-3" placeholder="Enter tracking number..." />
              )}
              <Button variant="success" onClick={() => updateStatus(detail.id, nextStatus)} disabled={saving}>
                {saving ? 'Updating...' : nextLabels[nextStatus]}
              </Button>
            </div>
          )}

          {detail.status === 'delivered' && (
            <div className="bg-emerald-900/20 border border-emerald-700 rounded-xl p-4 text-emerald-400 text-sm">
              ✓ Shipment successfully delivered to customer.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
