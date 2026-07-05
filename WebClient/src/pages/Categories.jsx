import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormField, { inputClass } from '../components/ui/FormField';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useMemo } from 'react';
import SearchInput from '../components/ui/SearchInput';
import SortButton from '../components/ui/SortButton';

const tints = [
  { bg: 'from-amber-500/10 to-orange-500/5', ring: 'ring-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  { bg: 'from-emerald-500/10 to-teal-500/5', ring: 'ring-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  { bg: 'from-sky-500/10 to-indigo-500/5', ring: 'ring-sky-500/20', text: 'text-sky-400', dot: 'bg-sky-400' },
  { bg: 'from-rose-500/10 to-red-500/5', ring: 'ring-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
  { bg: 'from-violet-500/10 to-fuchsia-500/5', ring: 'ring-violet-500/20', text: 'text-violet-400', dot: 'bg-violet-400' },
  { bg: 'from-lime-500/10 to-emerald-500/5', ring: 'ring-lime-500/20', text: 'text-lime-400', dot: 'bg-lime-400' },
  { bg: 'from-cyan-500/10 to-blue-500/5', ring: 'ring-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  { bg: 'from-pink-500/10 to-rose-500/5', ring: 'ring-pink-500/20', text: 'text-pink-400', dot: 'bg-pink-400' },
  { bg: 'from-yellow-500/10 to-amber-500/5', ring: 'ring-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  { bg: 'from-teal-500/10 to-cyan-500/5', ring: 'ring-teal-500/20', text: 'text-teal-400', dot: 'bg-teal-400' },
];

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [ascending, setAscending] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await api.get('/Categories');
      setCategories(res.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setName('');
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setName(category.name);
    setEditingId(category.categoryId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/Categories/${editingId}`, { categoryId: editingId, name });
        toast.success('Category updated');
      } else {
        await api.post('/Categories', { name });
        toast.success('Category added');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err){
      toast.error(err.response?.data?.message || 'Save failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/Categories/${deleteTarget.categoryId}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      loadCategories();
    } catch {
      toast.error('Delete failed');
    }
  };

  const filteredCategories = useMemo(() => {
    let result = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return result;
  }, [categories, search, ascending]);  

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'} organizing your shelves`}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus size={18} /> Add Category
          </button>
        }
      />

    <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
        <SortButton ascending={ascending} onToggle={() => setAscending(!ascending)} />
    </div>      

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : filteredCategories.length === 0 ? (
        <EmptyState icon={Tag} message={search ? 'No categories match your search.' : 'No categories yet. Add your first one.'} />
      ) : (
        <div className="flex flex-wrap gap-3">
          {filteredCategories.map((c, i) => {
            const tint = tints[c.categoryId % tints.length];
            return (
              <div
                key={c.categoryId}
                className={`group flex items-center gap-3 bg-gradient-to-br ${tint.bg} ring-1 ${tint.ring} rounded-2xl pl-4 pr-2 py-2.5 animate-fade-in-up hover:scale-[1.03] transition-transform`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className={`w-2 h-2 rounded-full ${tint.dot}`} />
                <span className={`font-medium text-sm ${tint.text}`}>{c.name}</span>
                <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Category Name">
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </FormField>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 py-2.5 rounded-xl font-semibold mt-2 transition-all">
            {editingId ? 'Update' : 'Add'} Category
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete category?"
        message="This will also delete all books in this category."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Categories;