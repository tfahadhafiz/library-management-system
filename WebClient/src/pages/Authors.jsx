import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
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
  'from-amber-400 to-orange-600', 'from-emerald-400 to-teal-600', 'from-sky-400 to-indigo-600',
  'from-rose-400 to-red-600', 'from-violet-400 to-fuchsia-600', 'from-lime-400 to-emerald-600',
  'from-cyan-400 to-blue-600', 'from-pink-400 to-rose-600', 'from-yellow-400 to-amber-600',
  'from-teal-400 to-cyan-600', 'from-purple-400 to-violet-600', 'from-red-400 to-orange-600',
  'from-indigo-400 to-purple-600', 'from-fuchsia-400 to-pink-600', 'from-green-400 to-lime-600',
];

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [ascending, setAscending] = useState(true);

  const loadAuthors = async () => {
    try {
      const res = await api.get('/Authors');
      setAuthors(res.data);
    } catch {
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAuthors(); }, []);

  const openCreate = () => {
    setForm({ firstName: '', lastName: '', bio: '' });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (author) => {
    setForm({ firstName: author.firstName, lastName: author.lastName, bio: author.bio || '' });
    setEditingId(author.authorId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/Authors/${editingId}`, { authorId: editingId, ...form });
        toast.success('Author updated');
      } else {
        await api.post('/Authors', form);
        toast.success('Author added');
      }
      setModalOpen(false);
      loadAuthors();
    } catch (err){
      toast.error(err.response?.data?.message || 'Save failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/Authors/${deleteTarget.authorId}`);
      toast.success('Author deleted');
      setDeleteTarget(null);
      loadAuthors();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filteredAuthors = useMemo(() => {
    let result = authors.filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return result;
  }, [authors, search, ascending]);  

  return (
    <div>
      <PageHeader
        title="Authors"
        subtitle={`${authors.length} author${authors.length !== 1 ? 's' : ''} in your collection`}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus size={18} /> Add Author
          </button>
        }
      />

    <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search authors..." />
        <SortButton ascending={ascending} onToggle={() => setAscending(!ascending)} />
    </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : filteredAuthors.length === 0 ? (
        <EmptyState icon={Users} message={search ? 'No authors match your search.' : 'No authors yet. Add your first one.'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAuthors.map((a, i) => (
            <div
              key={a.authorId}
              className="group bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/30 hover:-translate-y-0.5 transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarGradients[a.authorId % avatarGradients.length]} flex items-center justify-center font-bold text-slate-900 text-sm shadow-lg`}>
                  {a.firstName[0]}{a.lastName[0]}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(a)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-slate-100 mt-3">{a.firstName} {a.lastName}</p>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{a.bio || 'No biography available.'}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Author' : 'Add Author'}>
        <form onSubmit={handleSubmit}>
          <FormField label="First Name">
            <input className={inputClass} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
          </FormField>
          <FormField label="Last Name">
            <input className={inputClass} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
          </FormField>
          <FormField label="Bio">
            <textarea className={inputClass} rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          </FormField>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 py-2.5 rounded-xl font-semibold mt-2 transition-all">
            {editingId ? 'Update' : 'Add'} Author
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete author?"
        message="This will also delete all books by this author, and their loan history."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Authors;