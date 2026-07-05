import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, UserCircle, Mail, Phone } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormField, { inputClass } from '../components/ui/FormField';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useMemo } from 'react';
import SearchInput from '../components/ui/SearchInput';
import SortButton from '../components/ui/SortButton';

const avatarGradients = [
  'from-sky-400 to-indigo-600', 'from-emerald-400 to-teal-600', 'from-amber-400 to-orange-600',
  'from-rose-400 to-red-600', 'from-violet-400 to-fuchsia-600', 'from-lime-400 to-emerald-600',
  'from-cyan-400 to-blue-600', 'from-pink-400 to-rose-600', 'from-yellow-400 to-amber-600',
  'from-teal-400 to-cyan-600', 'from-purple-400 to-violet-600', 'from-red-400 to-orange-600',
  'from-indigo-400 to-purple-600', 'from-fuchsia-400 to-pink-600', 'from-green-400 to-lime-600',
];

function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', membershipDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [ascending, setAscending] = useState(true);

  const loadMembers = async () => {
    try {
      const res = await api.get('/Members');
      setMembers(res.data);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const openCreate = () => {
    setForm({ fullName: '', email: '', phoneNumber: '', membershipDate: '' });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setForm({
      fullName: member.fullName, email: member.email,
      phoneNumber: member.phoneNumber || '', membershipDate: member.membershipDate.split('T')[0]
    });
    setEditingId(member.memberId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber,
      membershipDate: new Date(form.membershipDate).toISOString()
    };
    try {
      if (editingId) {
        await api.put(`/Members/${editingId}`, { memberId: editingId, ...payload });
        toast.success('Member updated');
      } else {
        await api.post('/Members', payload);
        toast.success('Member added');
      }
      setModalOpen(false);
      loadMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/Members/${deleteTarget.memberId}`);
      toast.success('Member deleted');
      setDeleteTarget(null);
      loadMembers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filteredMembers = useMemo(() => {
    let result = members.filter(m => m.fullName.toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => ascending ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName));
    return result;
  }, [members, search, ascending]);  

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.length} registered member${members.length !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus size={18} /> Add Member
          </button>
        }
      />

    <div className="flex flex-wrap gap-3 mb-5">
    <SearchInput value={search} onChange={setSearch} placeholder="Search members..." />
    <SortButton ascending={ascending} onToggle={() => setAscending(!ascending)} />
    </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : filteredMembers.length === 0 ? (
        <EmptyState icon={UserCircle} message={search ? 'No members match your search.' : 'No members yet. Add your first one.'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m, i) => (
            <div
              key={m.memberId}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/30 hover:-translate-y-0.5 transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradients[m.memberId % avatarGradients.length]} flex items-center justify-center font-bold text-slate-900 text-sm ring-4 ring-slate-800/50`}>
                  {m.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(m)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-slate-100 mt-3">{m.fullName}</p>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><Mail size={12} /> {m.email}</p>
              {m.phoneNumber && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Phone size={12} /> {m.phoneNumber}</p>}
              <p className="text-[11px] text-slate-600 mt-2">Member since {new Date(m.membershipDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Member' : 'Add Member'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Full Name">
            <input className={inputClass} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          </FormField>
          <FormField label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </FormField>
          <FormField label="Phone Number">
            <input className={inputClass} value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} required/>
          </FormField>
          <FormField label="Membership Date">
            <input type="date" className={inputClass} value={form.membershipDate} onChange={e => setForm({ ...form, membershipDate: e.target.value })} required />
          </FormField>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 py-2.5 rounded-xl font-semibold mt-2 transition-all">
            {editingId ? 'Update' : 'Add'} Member
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete member?"
        message="This will also delete their loan history."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Members;