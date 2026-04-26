import React, { useEffect, useState } from 'react';
import { suppliers as api } from '../services/api';
import { Card, Modal, Input, Select, Button, Table, Tr, Td, Badge, SectionHeader, Loading, ErrorMsg } from '../components/UI';

const EMPTY = { name: '', contact_person: '', email: '', phone: '', address: '', rating: 5, status: 'active' };

export default function Suppliers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.getAll().then(r => setList(r.data)).catch(e => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s) => { setForm({ ...s }); setEditId(s.id); setModal(true); };
  const close = () => setModal(false);

  const save = async () => {
    setSaving(true);
    try {
      if (editId) await api.update(editId, form);
      else await api.create(form);
      close(); load();
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    await api.remove(id);
    load();
  };

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <SectionHeader title="Suppliers" sub="Manage your raw material vendors" action={
        <Button onClick={openCreate}>+ Add Supplier</Button>
      } />

      <Card>
        <Table headers={['Supplier', 'Contact', 'Phone', 'Rating', 'Status', 'Actions']}>
          {list.map(s => (
            <Tr key={s.id}>
              <Td>
                <p className="font-semibold text-white">{s.name}</p>
                <p className="text-xs text-slate-400">{s.email}</p>
              </Td>
              <Td>{s.contact_person}</Td>
              <Td className="font-mono text-xs">{s.phone}</Td>
              <Td className="text-amber-400 text-sm">{stars(s.rating)}</Td>
              <Td><Badge status={s.status} /></Td>
              <Td>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(s.id)}>Del</Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <Modal open={modal} onClose={close} title={editId ? 'Edit Supplier' : 'New Supplier'}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="col-span-2" />
          <Input label="Contact Person" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Select label="Rating" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
          </Select>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Address</label>
            <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              rows={3} className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          {editId && (
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Supplier'}</Button>
        </div>
      </Modal>
    </div>
  );
}
