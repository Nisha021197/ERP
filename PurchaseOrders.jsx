import React, { useEffect, useState } from 'react';
import { purchaseOrders as poApi, suppliers as supApi, materials as matApi } from './api';
import { Card, Modal, Input, Select, Button, Table, Tr, Td, Badge, SectionHeader, Loading, ErrorMsg } from './UI';

const STATUSES = ['draft', 'sent', 'confirmed', 'received', 'cancelled'];
const EMPTY_FORM = { supplier_id: '', order_date: new Date().toISOString().slice(0, 10), expected_delivery: '', notes: '', items: [] };
const EMPTY_ITEM = { material_id: '', quantity: 1, unit_price: 0 };

export default function PurchaseOrders() {
  const [list, setList] = useState([]);
  const [sups, setSups] = useState([]);
  const [mats, setMats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([poApi.getAll(), supApi.getAll(), matApi.getAll()])
      .then(([p, s, m]) => { setList(p.data); setSups(s.data); setMats(m.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    const r = await poApi.getOne(id);
    setDetail(r.data);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const setItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: val };
    if (field === 'material_id') {
      const mat = mats.find(m => m.id == val);
      if (mat) items[i].unit_price = mat.unit_cost;
    }
    setForm({ ...form, items });
  };

  const save = async () => {
    if (!form.supplier_id || form.items.length === 0) { alert('Add supplier and at least one item'); return; }
    setSaving(true);
    try { await poApi.create(form); setModal(false); setForm(EMPTY_FORM); load(); }
    catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    const actual_delivery = status === 'received' ? new Date().toISOString().slice(0, 10) : undefined;
    await poApi.updateStatus(id, { status, actual_delivery });
    if (detail) { const r = await poApi.getOne(id); setDetail(r.data); }
    load();
  };

  const total = form.items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <SectionHeader title="Purchase Orders" sub="Procure raw materials from suppliers" action={
        <Button onClick={() => { setForm(EMPTY_FORM); setModal(true); }}>+ New PO</Button>
      } />

      <Card>
        <Table headers={['PO Number', 'Supplier', 'Order Date', 'Expected', 'Amount', 'Items', 'Status', 'Actions']}>
          {list.map(po => (
            <Tr key={po.id} onClick={() => openDetail(po.id)}>
              <Td><span className="font-mono text-blue-400 text-xs">{po.po_number}</span></Td>
              <Td className="font-medium text-white">{po.supplier_name}</Td>
              <Td className="text-xs">{po.order_date?.slice(0, 10)}</Td>
              <Td className="text-xs">{po.expected_delivery?.slice(0, 10) || '—'}</Td>
              <Td className="font-mono text-sm">₹{Number(po.total_amount).toLocaleString('en-IN')}</Td>
              <Td>{po.item_count}</Td>
              <Td><Badge status={po.status} /></Td>
              <Td onClick={e => e.stopPropagation()}>
                {po.status !== 'received' && po.status !== 'cancelled' && (
                  <select
                    value={po.status}
                    onChange={e => updateStatus(po.id, e.target.value)}
                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Create Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Purchase Order" size="xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select label="Supplier" value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
            <option value="">-- Select Supplier --</option>
            {sups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input label="Order Date" type="date" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} />
          <Input label="Expected Delivery" type="date" value={form.expected_delivery} onChange={e => setForm({ ...form, expected_delivery: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Order Items</h4>
            <Button size="sm" variant="ghost" onClick={addItem}>+ Add Item</Button>
          </div>
          {form.items.length === 0 && <p className="text-slate-500 text-sm text-center py-4 border border-dashed border-slate-700 rounded-lg">No items yet. Click + Add Item.</p>}
          {form.items.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
              <div className="col-span-2">
                <Select label={i === 0 ? 'Material' : ''} value={item.material_id} onChange={e => setItem(i, 'material_id', e.target.value)}>
                  <option value="">-- Material --</option>
                  {mats.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                </Select>
              </div>
              <Input label={i === 0 ? 'Qty' : ''} type="number" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
              <div className="flex gap-1 items-end">
                <Input label={i === 0 ? '₹/Unit' : ''} type="number" value={item.unit_price} onChange={e => setItem(i, 'unit_price', e.target.value)} className="flex-1" />
                <button onClick={() => removeItem(i)} className="mb-0.5 text-red-400 hover:text-red-300 text-lg leading-none pb-2">×</button>
              </div>
            </div>
          ))}
          {form.items.length > 0 && (
            <div className="text-right text-sm font-bold text-white mt-2 pr-8">
              Total: ₹{total.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Creating...' : 'Create PO'}</Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      {detail && (
        <Modal open={!!detail} onClose={() => setDetail(null)} title={`PO: ${detail.po_number}`} size="lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><p className="text-slate-400 text-xs">Supplier</p><p className="text-white font-semibold">{detail.supplier_name}</p></div>
            <div><p className="text-slate-400 text-xs">Status</p><Badge status={detail.status} /></div>
            <div><p className="text-slate-400 text-xs">Order Date</p><p className="text-white">{detail.order_date?.slice(0, 10)}</p></div>
            <div><p className="text-slate-400 text-xs">Expected Delivery</p><p className="text-white">{detail.expected_delivery?.slice(0, 10) || '—'}</p></div>
          </div>
          <Table headers={['Material', 'SKU', 'Qty', 'Unit Price', 'Received', 'Subtotal']}>
            {detail.items?.map(item => (
              <Tr key={item.id}>
                <Td>{item.material_name}</Td>
                <Td className="font-mono text-xs text-blue-400">{item.sku}</Td>
                <Td>{item.quantity} {item.unit}</Td>
                <Td>₹{Number(item.unit_price).toLocaleString('en-IN')}</Td>
                <Td>{item.received_qty}</Td>
                <Td className="font-mono">₹{Number(item.subtotal).toLocaleString('en-IN')}</Td>
              </Tr>
            ))}
          </Table>
          <div className="text-right font-bold text-white mt-3">
            Total: ₹{Number(detail.total_amount).toLocaleString('en-IN')}
          </div>
          {detail.status !== 'received' && detail.status !== 'cancelled' && (
            <div className="flex justify-end gap-2 mt-4">
              {detail.status !== 'confirmed' && <Button variant="secondary" onClick={() => updateStatus(detail.id, 'confirmed')}>Mark Confirmed</Button>}
              <Button variant="success" onClick={() => updateStatus(detail.id, 'received')}>✓ Mark Received (Updates Stock)</Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
