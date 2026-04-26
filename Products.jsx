import React, { useEffect, useState } from 'react';
import { products as prodApi, materials as matApi } from '../services/api';
import { Card, Modal, Input, Button, Table, Tr, Td, Badge, SectionHeader, Loading, ErrorMsg } from '../components/UI';

const EMPTY = { name: '', sku: '', category: '', description: '', unit_price: 0, bom: [] };
const EMPTY_BOM = { material_id: '', quantity_required: 1, unit: 'kg', notes: '' };

export default function Products() {
  const [list, setList] = useState([]);
  const [mats, setMats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([prodApi.getAll(), matApi.getAll()])
      .then(([p, m]) => { setList(p.data); setMats(m.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = async (p) => {
    const r = await prodApi.getOne(p.id);
    setForm({ ...r.data, bom: r.data.bom || [] });
    setEditId(p.id); setModal(true);
  };
  const openDetail = async (id) => {
    const r = await prodApi.getOne(id); setDetail(r.data);
  };

  const addBOM = () => setForm({ ...form, bom: [...form.bom, { ...EMPTY_BOM }] });
  const removeBOM = (i) => setForm({ ...form, bom: form.bom.filter((_, idx) => idx !== i) });
  const setBOM = (i, field, val) => {
    const bom = [...form.bom];
    bom[i] = { ...bom[i], [field]: val };
    if (field === 'material_id') {
      const mat = mats.find(m => m.id == val);
      if (mat) bom[i].unit = mat.unit;
    }
    setForm({ ...form, bom });
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editId) await prodApi.update(editId, form);
      else await prodApi.create(form);
      setModal(false); load();
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete product?')) return;
    await prodApi.remove(id); load();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <SectionHeader title="Product Design & BOM" sub="Define finished goods and their Bill of Materials" action={
        <Button onClick={openCreate}>+ New Product</Button>
      } />

      <Card>
        <Table headers={['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
          {list.map(p => (
            <Tr key={p.id} onClick={() => openDetail(p.id)}>
              <Td>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-xs text-slate-500">{p.description?.slice(0, 40)}</p>
              </Td>
              <Td className="font-mono text-xs text-blue-400">{p.sku}</Td>
              <Td>{p.category}</Td>
              <Td className="font-mono text-sm">₹{Number(p.unit_price).toLocaleString('en-IN')}</Td>
              <Td><span className="font-bold text-emerald-400">{p.current_stock}</span> units</Td>
              <Td><Badge status={p.status} /></Td>
              <Td onClick={e => e.stopPropagation()}>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(p.id)}>Del</Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Product' : 'New Product'} size="xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="col-span-2" />
          <Input label="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Input label="Unit Price (₹)" type="number" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} />
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Bill of Materials</h4>
            <Button size="sm" variant="ghost" onClick={addBOM}>+ Add Material</Button>
          </div>
          {form.bom.length === 0 && <p className="text-slate-500 text-sm text-center py-4 border border-dashed border-slate-700 rounded-lg">No BOM items yet.</p>}
          {form.bom.map((b, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
              <div className="col-span-2">
                <select value={b.material_id} onChange={e => setBOM(i, 'material_id', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="">-- Select Material --</option>
                  {mats.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                </select>
              </div>
              <Input type="number" value={b.quantity_required} onChange={e => setBOM(i, 'quantity_required', e.target.value)} />
              <div className="flex gap-1">
                <Input value={b.unit} onChange={e => setBOM(i, 'unit', e.target.value)} placeholder="unit" className="flex-1" />
                <button onClick={() => removeBOM(i)} className="text-red-400 hover:text-red-300 text-xl leading-none pb-1.5">×</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      {detail && (
        <Modal open={!!detail} onClose={() => setDetail(null)} title={detail.name} size="lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><p className="text-slate-400 text-xs">SKU</p><p className="text-blue-400 font-mono">{detail.sku}</p></div>
            <div><p className="text-slate-400 text-xs">Category</p><p className="text-white">{detail.category}</p></div>
            <div><p className="text-slate-400 text-xs">Unit Price</p><p className="text-white font-bold">₹{Number(detail.unit_price).toLocaleString('en-IN')}</p></div>
            <div><p className="text-slate-400 text-xs">Current Stock</p><p className="text-emerald-400 font-bold">{detail.current_stock} units</p></div>
          </div>
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Bill of Materials</h4>
          <Table headers={['Material', 'SKU', 'Required Qty', 'Available', 'Cost/Unit']}>
            {detail.bom?.map(b => (
              <Tr key={b.id}>
                <Td>{b.material_name}</Td>
                <Td className="font-mono text-xs text-blue-400">{b.sku}</Td>
                <Td>{b.quantity_required} {b.unit}</Td>
                <Td className={b.current_stock < b.quantity_required ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {b.current_stock} {b.material_unit}
                </Td>
                <Td>₹{Number(b.unit_cost).toLocaleString('en-IN')}</Td>
              </Tr>
            ))}
          </Table>
        </Modal>
      )}
    </div>
  );
}
