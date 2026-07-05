import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormField, { inputClass } from '../components/ui/FormField';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useMemo } from 'react';
import SearchInput from '../components/ui/SearchInput';
import SortButton from '../components/ui/SortButton';
import SelectFilter from '../components/ui/SelectFilter';

const spineGradients = [
  'from-amber-400 to-orange-600', 'from-emerald-400 to-teal-600', 'from-sky-400 to-indigo-600',
  'from-rose-400 to-red-600', 'from-violet-400 to-fuchsia-600', 'from-lime-400 to-emerald-600',
  'from-cyan-400 to-blue-600', 'from-pink-400 to-rose-600',
];

function Books() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: '', isbn: '', publishedYear: '', totalCopies: '', availableCopies: '', authorId: '', categoryId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortBy, setSortBy] = useState('title'); // title | total | available | author | category
  const [ascending, setAscending] = useState(true);

  const loadAll = async () => {
    try {
      const [booksRes, authorsRes, categoriesRes] = await Promise.all([
        api.get('/Books'), api.get('/Authors'), api.get('/Categories')
      ]);
      setBooks(booksRes.data);
      setAuthors(authorsRes.data);
      setCategories(categoriesRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const availableYears = useMemo(() => {
    const years = [...new Set(books.map(b => b.publishedYear))].sort((a, b) => b - a);
    return years;
  }, [books]);
  
  const filteredBooks = useMemo(() => {
    let result = books.filter(b => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.toLowerCase().includes(search.toLowerCase());
      const matchesAuthor = !filterAuthor || b.authorId === Number(filterAuthor);
      const matchesCategory = !filterCategory || b.categoryId === Number(filterCategory);
      const matchesYear = !filterYear || b.publishedYear === Number(filterYear);
      return matchesSearch && matchesAuthor && matchesCategory && matchesYear;
    });
  
    result.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'total': valA = a.totalCopies; valB = b.totalCopies; break;
        case 'available': valA = a.availableCopies; valB = b.availableCopies; break;
        case 'author': valA = a.author ? `${a.author.firstName} ${a.author.lastName}` : ''; valB = b.author ? `${b.author.firstName} ${b.author.lastName}` : ''; break;
        case 'category': valA = a.category ? a.category.name : ''; valB = b.category ? b.category.name : ''; break;
        default: valA = a.title; valB = b.title;
      }
      if (typeof valA === 'number') {
        return ascending ? valA - valB : valB - valA;
      }
      return ascending
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  
    return result;
  }, [books, search, filterAuthor, filterCategory, filterYear, sortBy, ascending]);  

  const openCreate = () => {
    setForm({ title: '', isbn: '', publishedYear: '', totalCopies: '', availableCopies: '', authorId: '', categoryId: '' });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setForm({
      title: book.title, isbn: book.isbn, publishedYear: book.publishedYear,
      totalCopies: book.totalCopies, availableCopies: book.availableCopies,
      authorId: book.authorId, categoryId: book.categoryId
    });
    setEditingId(book.bookId);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title, isbn: form.isbn,
      publishedYear: Number(form.publishedYear),
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
      authorId: Number(form.authorId),
      categoryId: Number(form.categoryId)
    };
    try {
      if (editingId) {
        await api.put(`/Books/${editingId}`, { bookId: editingId, ...payload });
        toast.success('Book updated');
      } else {
        await api.post('/Books', payload);
        toast.success('Book added');
      }
      setModalOpen(false);
      loadAll();
    } catch {
      toast.error('Save failed. Check Author/Category selection.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/Books/${deleteTarget.bookId}`);
      toast.success('Book deleted');
      setDeleteTarget(null);
      loadAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Books"
        subtitle={`${books.length} title${books.length !== 1 ? 's' : ''} in your catalog`}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus size={18} /> Add Book
          </button>
        }
      />

    <div className="flex flex-wrap gap-3 mb-5">
    <SearchInput value={search} onChange={setSearch} placeholder="Search by title or ISBN..." />

    <SelectFilter value={filterAuthor} onChange={setFilterAuthor}>
        <option value="">All Authors</option>
        {authors.map(a => <option key={a.authorId} value={a.authorId}>{a.firstName} {a.lastName}</option>)}
    </SelectFilter>

    <SelectFilter value={filterCategory} onChange={setFilterCategory}>
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
    </SelectFilter>

    <SelectFilter value={filterYear} onChange={setFilterYear}>
        <option value="">All Years</option>
        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
    </SelectFilter>

    <SelectFilter value={sortBy} onChange={setSortBy}>
        <option value="title">Sort: Title</option>
        <option value="total">Sort: Total Copies</option>
        <option value="available">Sort: Available Copies</option>
        <option value="author">Sort: Author</option>
        <option value="category">Sort: Category</option>
    </SelectFilter>

    <SortButton ascending={ascending} onToggle={() => setAscending(!ascending)} numeric={sortBy === 'total' || sortBy === 'available'} />
    </div>      

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : filteredBooks.length === 0 ? (
        <EmptyState icon={BookOpen} message={search || filterAuthor || filterCategory || filterYear ? 'No books match your filters.' : 'No books yet. Add your first one.'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((b, i) => {
            const spine = spineGradients[b.bookId % spineGradients.length];
            const pct = b.totalCopies > 0 ? (b.availableCopies / b.totalCopies) * 100 : 0;
            const availTone = pct === 0 ? 'bg-red-400' : pct < 40 ? 'bg-purple-400' : 'bg-emerald-400';
            return (
              <div
                key={b.bookId}
                className="group relative flex bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:-translate-y-0.5 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`w-2 bg-gradient-to-b ${spine}`} />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-100 leading-snug">{b.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.author ? `${b.author.firstName} ${b.author.lastName}` : '—'} · {b.publishedYear}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {b.category && (
                    <span className="inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {b.category.name}
                    </span>
                  )}

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Availability</span>
                      <span>{b.availableCopies}/{b.totalCopies}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${availTone} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Book' : 'Add Book'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Title">
            <input className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </FormField>
          <FormField label="ISBN">
            <input className={inputClass} value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} required />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Year">
              <input type="number" className={inputClass} value={form.publishedYear} onChange={e => setForm({ ...form, publishedYear: e.target.value })} required />
            </FormField>
            <FormField label="Total">
              <input type="number" className={inputClass} value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} required />
            </FormField>
            <FormField label="Available">
              <input type="number" className={inputClass} value={form.availableCopies} onChange={e => setForm({ ...form, availableCopies: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Author">
            <select className={inputClass} value={form.authorId} onChange={e => setForm({ ...form, authorId: e.target.value })} required>
              <option value="">Select Author</option>
              {authors.map(a => <option key={a.authorId} value={a.authorId}>{a.firstName} {a.lastName}</option>)}
            </select>
          </FormField>
          <FormField label="Category">
            <select className={inputClass} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
            </select>
          </FormField>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 py-2.5 rounded-xl font-semibold mt-2 transition-all">
            {editingId ? 'Update' : 'Add'} Book
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete book?"
        message="This will also delete its loan history."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Books;