import React, { useEffect, useState } from 'react';
import { productionOrders as api, products as prodApi } from '../services/api';
import { Card, Modal, Input, Select, Button, Table, Tr, Td, Badge, SectionHeader, Loading, ErrorMsg } from '../components/UI';

const STAGES = ['planned', 'material_check', 'in_progress', 'assembly', 'quality_check', 'packing', 'completed'];
const STAGE_LABELS = {
  planned: '1. Planned', material_check: '2. Material Check', in_progress: '3. Manufacturing',
  assembly: '4. Assembly', quality_check: '5. Quality Check', packing: '6. Packing', completed: '✓ Completed',
};
const STAGE_COLORS = {
  planned: 'bg-slate-600', material_check: 'bg-yellow-600', in_progress: 'bg-blue-600',
  assembly: 'bg-purple-600', quality_check: 'bg-orange-600', packing: 'bg-pink-600', completed: 'bg-emerald-600',
};

const EMPTY = { product_id: '', quantity: 1, priority: 'medium', planned_start: '', planned_end: '', notes: '' };

export default function ProductionOrders() {
  const [list, setList] = useState([]);
  const [prods, setProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [advanceNote, setAdvanceNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([api.getAll(), prodApi.getAll()])
      .then(([p, pr]) => { setList(p.data); setProds(pr.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    const r = await api.getOne(id); setDetail(r.data);
  };

  const save = async () => {
    setSaving(true);
    try { await api.create(form); setModal(false); setForm(EMPTY); load(); }
    catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const advance = async () => {
    setSaving(true);
    try {
      const r = await api.advance(detail.id, { notes: advanceNote, operator: 'Operator' });
      alert(`✓ Advanced to: ${r.data.stage}`);
      setAdvanceNote('');
      const updated = await api.getOne(detail.id); setDetail(updated.data);
      load();
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this production order?')) return;
    await api.cancel(id); load();
  };

  const stageIdx = detail ? STAGES.indexOf(detail.status) : -1;

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <SectionHeader title="Production Orders" sub="Manufacturing pipeline management" action={
        <Button onClick={() => { setForm(EMPTY); setModal(true); }}>+ New Production Order</Button>
      } />

      <Card>
        <Table headers={['Order #', 'Product', 'Qty', 'Priority', 'Stage', 'Planned Start', 'Planned End', 'Actions']}>
          {list.map(o => (
            <Tr key={o.id} onClick={() => openDetail(o.id)}>
              <Td><span className="font-mono text-blue-400 text-xs">{o.order_number}</span></Td>
              <Td className="font-medium text-white">{o.product_name}</Td>
              <Td>{o.quantity}</Td>
              <Td><Badge status={o.priority} /></Td>
              <Td><Badge status={o.status} /></Td>
              <Td className="text-xs">{o.planned_start?.slice(0, 10)}</Td>
              <Td className="text-xs">{o.planned_end?.slice(0, 10)}</Td>
              <Td onClick={e => e.stopPropagation()}>
                {o.status !== 'completed' && o.status !== 'cancelled' && (
                  <Button size="sm" variant="danger" onClick={() => cancel(o.id)}>Cancel</Button>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Create Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Production Order" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Product" value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} className="col-span-2">
            <option value="">-- Select Product --</option>
            {prods.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </Select>
          <Input label="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
          <Input label="Planned Start" type="date" value={form.planned_start} onChange={e => setForm({ ...form, planned_start: e.target.value })} />
          <Input label="Planned End" type="date" value={form.planned_end} onChange={e => setForm({ ...form, planned_end: e.target.value })} />
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Creating...' : 'Create Order'}</Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      {detail && (
        <Modal open={!!detail} onClose={() => setDetail(null)} title={`Production: ${detail.order_number}`} size="xl">
          {/* Pipeline Visual */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Pipeline Stage</p>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {STAGES.map((s, i) => {
                const active = i === stageIdx;
                const done = i < stageIdx;
                return (
                  <React.Fragment key={s}>
                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active ? `${STAGE_COLORS[s]} text-white ring-2 ring-white/30` : done ? 'bg-slate-600 text-slate-300' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                      {s.replace('_', ' ')}
                    </div>
                    {i < STAGES.length - 1 && <div className={`w-4 h-0.5 flex-shrink-0 ${done ? 'bg-slate-500' : 'bg-slate-700'}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div><p className="text-slate-400 text-xs">Product</p><p className="text-white font-semibold">{detail.product_name}</p></div>
            <div><p className="text-slate-400 text-xs">Quantity</p><p className="text-white font-semibold">{detail.quantity}</p></div>
            <div><p className="text-slate-400 text-xs">Priority</p><Badge status={detail.priority} /></div>
            <div><p className="text-slate-400 text-xs">Planned Start</p><p className="text-white">{detail.planned_start?.slice(0,10)}</p></div>
            <div><p className="text-slate-400 text-xs">Planned End</p><p className="text-white">{detail.planned_end?.slice(0,10)}</p></div>
            <div><p className="text-slate-400 text-xs">Actual Start</p><p className="text-white">{detail.actual_start ? new Date(detail.actual_start).toLocaleDateString() : '—'}</p></div>
          </div>

          {/* Advance Stage */}
          {detail.status !== 'completed' && detail.status !== 'cancelled' && (
            <div className="bg-slate-900 rounded-xl p-4 mb-5 border border-slate-700">
              <p className="text-sm font-semibold text-white mb-3">
                Advance to: <span className="text-blue-400">{STAGE_LABELS[STAGES[stageIdx + 1]] || '—'}</span>
              </p>
              <div className="flex gap-3 items-end">
                <Input label="Notes for this stage" value={advanceNote} onChange={e => setAdvanceNote(e.target.value)} className="flex-1" placeholder="Optional notes..." />
                <Button variant="success" onClick={advance} disabled={saving || stageIdx >= STAGES.length - 1}>
                  {saving ? 'Advancing...' : '→ Advance Stage'}
                </Button>
              </div>
              {stageIdx === 1 && <p className="text-amber-400 text-xs mt-2">⚠️ Advancing to "In Progress" will deduct raw materials from stock.</p>}
              {stageIdx + 1 === STAGES.length - 1 && <p className="text-emerald-400 text-xs mt-2">✓ Completing this order will add finished goods to product stock.</p>}
            </div>
          )}

          {/* Stage Log */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stage History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {detail.logs?.map(log => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <Badge status={log.stage} />
                  <div className="flex-1">
                    <span className="text-slate-300">{log.notes}</span>
                    <span className="text-slate-500 text-xs ml-2">{new Date(log.logged_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
