import React, { useEffect, useState } from 'react';
import { materials as matApi, suppliers as supApi } from '../services/api';
import { Card, Modal, Input, Select, Button, Table, Tr, Td, Badge, SectionHeader, Loading, ErrorMsg } from '../components/UI';

const EMPTY = { name: '', sku: '', category: '', unit: 'kg', current_stock: 0, min_stock_level: 0, unit_cost: 0, supplier_id: '', description: '' };

export default function Materials() {
  const [list, setList] = useState([]);
  const [sups, setSups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [adj, setAdj] = useState({ quantity: 0, type: 'adjustment', notes: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    Promise.all([matApi.getAll(), supApi.getAll()])
      .then(([m, s]) => { setList(m.data); setSups(s.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.sku.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (m) => { setForm({ ...m }); setEditId(m.id); setModal(true); };
  const close = () => setModal(false);

  const save = async () => {
    setSaving(true);
    try {
      if (editId) await matApi.update(editId, form);
      else await matApi.create(form);
      close(); load();
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const doAdjust = async () => {
    setSaving(true);
    try {
      await matApi.adjustStock(adjustModal.id, adj);
      setAdjustModal(null); load();
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    await matApi.remove(id); load();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <SectionHeader title="Raw Materials" sub="Inventory & stock management" action={
        <div className="flex gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..." className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52" />
          <Button onClick={openCreate}>+ Add Material</Button>
        </div>
      } />

      <Card>
        <Table headers={['Material', 'SKU', 'Category', 'Stock', 'Min Level', 'Unit Cost', 'Supplier', 'Status', 'Actions']}>
          {filtered.map(m => (
            <Tr key={m.id}>
              <Td>
                <p className="font-semibold text-white">{m.name}</p>
                <p className="text-xs text-slate-500">{m.description?.slice(0, 30)}</p>
              </Td>
              <Td className="font-mono text-xs text-blue-400">{m.sku}</Td>
              <Td>{m.category}</Td>
              <Td>
                <span className={`font-bold ${m.current_stock <= m.min_stock_level ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {m.current_stock} {m.unit}
                </span>
              </Td>
              <Td className="text-slate-400">{m.min_stock_level} {m.unit}</Td>
              <Td className="font-mono text-xs">₹{Number(m.unit_cost).toLocaleString('en-IN')}</Td>
              <Td className="text-slate-400 text-xs">{m.supplier_name}</Td>
              <Td><Badge status={m.status} /></Td>
              <Td>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>Edit</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setAdjustModal(m); setAdj({ quantity: 0, type: 'adjustment', notes: '' }); }}>±Adjust</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(m.id)}>Del</Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modal} onClose={close} title={editId ? 'Edit Material' : 'New Raw Material'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Material Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="col-span-2" />
          <Input label="SKU Code" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Input label="Unit (kg, litre, piece...)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          <Input label="Current Stock" type="number" value={form.current_stock} onChange={e => setForm({ ...form, current_stock: e.target.value })} />
          <Input label="Min Stock Level" type="number" value={form.min_stock_level} onChange={e => setForm({ ...form, min_stock_level: e.target.value })} />
          <Input label="Unit Cost (₹)" type="number" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} />
          <Select label="Supplier" value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
            <option value="">-- Select Supplier --</option>
            {sups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Material'}</Button>
        </div>
      </Modal>

      {/* Stock Adjust Modal */}
      <Modal open={!!adjustModal} onClose={() => setAdjustModal(null)} title={`Adjust Stock: ${adjustModal?.name}`} size="sm">
        <p className="text-slate-400 text-sm mb-4">Current stock: <span className="text-white font-bold">{adjustModal?.current_stock} {adjustModal?.unit}</span></p>
        <div className="flex flex-col gap-4">
          <Input label="Quantity (+/-)" type="number" value={adj.quantity} onChange={e => setAdj({ ...adj, quantity: e.target.value })} />
          <Select label="Type" value={adj.type} onChange={e => setAdj({ ...adj, type: e.target.value })}>
            <option value="adjustment">Manual Adjustment</option>
            <option value="return">Return to Stock</option>
          </Select>
          <Input label="Notes" value={adj.notes} onChange={e => setAdj({ ...adj, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setAdjustModal(null)}>Cancel</Button>
          <Button onClick={doAdjust} disabled={saving}>{saving ? 'Saving...' : 'Apply Adjustment'}</Button>
        </div>
      </Modal>
    </div>
  );
}
