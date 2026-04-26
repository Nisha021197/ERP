import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Loading, ErrorMsg } from './UI';

const DEPARTMENTS = ['Admin', 'Procurement', 'Production', 'Quality', 'Logistics', 'HR', 'Finance'];
const ROLES = ['admin', 'purchase', 'production'];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState({
    emp_code: '', name: '', email: '', phone: '', department: 'Admin',
    designation: '', role: 'admin', password: ''
  });

  const load = () => {
    setLoading(true);
    axios.get('/api/employees')
      .then(r => setEmployees(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEmp) {
        await axios.put(`/api/employees/${editEmp.id}`, form);
      } else {
        await axios.post('/api/employees', form);
      }
      setShowForm(false);
      setEditEmp(null);
      setForm({ emp_code: '', name: '', email: '', phone: '', department: 'Admin', designation: '', role: 'admin', password: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving employee');
    }
  };

  const handleEdit = (emp) => {
    setEditEmp(emp);
    setForm({ emp_code: emp.emp_code, name: emp.name, email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation, role: emp.role || 'admin', password: '' });
    setShowForm(true);
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this employee?')) return;
    await axios.delete(`/api/employees/${id}`);
    load();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-slate-400 text-sm mt-1">Manage employee accounts and roles</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditEmp(null); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Employee
        </button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">{editEmp ? 'Edit Employee' : 'Add New Employee'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Employee Code</label>
              <input value={form.emp_code} onChange={e => setForm({...form, emp_code: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="EMP-001" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="john@company.com" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="9999999999" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Designation</label>
              <input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="Manager" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password {editEmp && '(leave blank to keep)'}</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="••••••••" required={!editEmp} />
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                {editEmp ? 'Update' : 'Create Employee'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Employee</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Department</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-700/30">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-white">{emp.name}</p>
                  <p className="text-xs text-slate-400">{emp.email} · {emp.emp_code}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-slate-300">{emp.department}</p>
                  <p className="text-xs text-slate-400">{emp.designation}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">{emp.role || 'N/A'}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${emp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(emp)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    <button onClick={() => handleDeactivate(emp.id)} className="text-xs text-red-400 hover:text-red-300">Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}