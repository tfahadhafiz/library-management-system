import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Trash2, CheckCircle2, Clock, AlertTriangle, RotateCcw, Undo2 } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormField, { inputClass } from '../components/ui/FormField';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import SearchInput from '../components/ui/SearchInput';
import SortButton from '../components/ui/SortButton';
import SelectFilter from '../components/ui/SelectFilter';

function StatusBadge({ loan }) {
  const overdue = !loan.returnDate && new Date(loan.dueDate) < new Date();
  if (loan.returnDate) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
        <CheckCircle2 size={12} /> Returned
      </span>
    );
  }
  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
        <AlertTriangle size={12} /> Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
      <Clock size={12} /> Active
    </span>
  );
}

// Format a Date object as "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function addOneMonth(dateStr) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function Loans() {
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnDateTime, setReturnDateTime] = useState('');
  const [undoTarget, setUndoTarget] = useState(null);
  const [form, setForm] = useState({
    bookId: '', memberId: '', loanDate: todayStr(), dueDate: addOneMonth(todayStr())
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [ascending, setAscending] = useState(true);


  const loadAll = async () => {
    try {
      const [loansRes, booksRes, membersRes] = await Promise.all([
        api.get('/Loans'), api.get('/Books'), api.get('/Members')
      ]);
      setLoans(loansRes.data);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Loans', {
        bookId: Number(form.bookId), memberId: Number(form.memberId),
        loanDate: new Date(form.loanDate).toISOString(),
        dueDate: new Date(form.dueDate).toISOString(),
        returnDate: null
      });
      toast.success('Book borrowed successfully');
      setForm({ bookId: '', memberId: '', loanDate: todayStr(), dueDate: addOneMonth(todayStr()) });
      loadAll();
    } catch {
      toast.error('Failed to create loan');
    }
  };

  const openReturnModal = (loan) => {
    setReturnTarget(loan);
    setReturnDateTime(toDatetimeLocal(new Date()));
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/Loans/${returnTarget.loanId}`, {
        loanId: returnTarget.loanId,
        bookId: returnTarget.bookId,
        memberId: returnTarget.memberId,
        loanDate: returnTarget.loanDate,
        dueDate: returnTarget.dueDate,
        returnDate: new Date(returnDateTime).toISOString()
      });
      toast.success('Marked as returned');
      setReturnTarget(null);
      loadAll();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleUndoReturn = async () => {
    try {
      await api.put(`/Loans/${undoTarget.loanId}`, {
        loanId: undoTarget.loanId,
        bookId: undoTarget.bookId,
        memberId: undoTarget.memberId,
        loanDate: undoTarget.loanDate,
        dueDate: undoTarget.dueDate,
        returnDate: null
      });
      toast.success('Return undone — loan marked active again');
      setUndoTarget(null);
      loadAll();
    } catch {
      toast.error('Failed to undo return');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/Loans/${deleteTarget.loanId}`);
      toast.success('Loan record deleted');
      setDeleteTarget(null);
      loadAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  const getStatus = (loan) => {
    if (loan.returnDate) return 'returned';
    if (new Date(loan.dueDate) < new Date()) return 'overdue';
    return 'active';
  };

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => a.title.localeCompare(b.title));
  }, [books]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [members]);

  const filteredLoans = useMemo(() => {
    let result = loans.filter(l => {
      const bookTitle = l.book ? l.book.title : '';
      const memberName = l.member ? l.member.fullName : '';
      const matchesSearch = `${bookTitle} ${memberName}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || getStatus(l) === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      const dateA = new Date(sortBy === 'loanDate' ? a.loanDate : a.dueDate);
      const dateB = new Date(sortBy === 'loanDate' ? b.loanDate : b.dueDate);
      return ascending ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [loans, search, statusFilter, sortBy, ascending]);

  return (
    <div>
      <PageHeader title="Loans" subtitle={`${loans.length} loan record${loans.length !== 1 ? 's' : ''}`} />

      <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
        <p className="text-sm font-semibold text-slate-200 mb-4 relative">Borrow a Book</p>
        <form onSubmit={handleSubmit} className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <FormField label="Book">
            <select className={inputClass} value={form.bookId} onChange={e => setForm({ ...form, bookId: e.target.value })} required>
              <option value="">Select Book</option>
              {sortedBooks.map(b => (
                <option key={b.bookId} value={b.bookId} disabled={b.availableCopies === 0}>
                  {b.title} ({b.availableCopies === 0 ? 'No copies available' : `${b.availableCopies} avail.`})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Member">
            <select className={inputClass} value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })} required>
              <option value="">Select Member</option>
              {sortedMembers.map(m => <option key={m.memberId} value={m.memberId}>{m.fullName}</option>)}
            </select>
          </FormField>
          <FormField label="Loan Date">
            <input
              type="date"
              className={inputClass}
              value={form.loanDate}
              onChange={e => setForm({ ...form, loanDate: e.target.value, dueDate: addOneMonth(e.target.value) })}
              required
            />
          </FormField>
          <FormField label="Due Date">
            <input
              type="date"
              className={inputClass}
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </FormField>
          <button type="submit" className="bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 py-2.5 rounded-xl font-semibold transition-all mb-4 sm:mb-4">
            Borrow
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by book or member..." />

        <SelectFilter value={statusFilter} onChange={setStatusFilter}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="returned">Returned</option>
        </SelectFilter>

        <SelectFilter value={sortBy} onChange={setSortBy}>
          <option value="dueDate">Sort: Due Date</option>
          <option value="loanDate">Sort: Loan Date</option>
        </SelectFilter>

        <SortButton ascending={ascending} onToggle={() => setAscending(!ascending)} numeric />
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : filteredLoans.length === 0 ? (
        <EmptyState icon={Clock} message={search || statusFilter ? 'No loans match your filters.' : 'No loans recorded yet.'} />
      ) : (
        <div className="space-y-2.5">
          {filteredLoans.map((l, i) => {
            const overdue = !l.returnDate && new Date(l.dueDate) < new Date();
            return (
              <div
                key={l.loanId}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-slate-900/60 border rounded-2xl p-4 animate-fade-in-up transition-colors ${
                  overdue ? 'border-red-500/20' : 'border-slate-800'
                }`}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <div className={`w-1 self-stretch rounded-full ${overdue ? 'bg-red-500' : l.returnDate ? 'bg-emerald-500' : 'bg-amber-500'} hidden sm:block`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-100 truncate">{l.book ? l.book.title : `Book #${l.bookId}`}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Borrowed by {l.member ? l.member.fullName : `Member #${l.memberId}`}</p>
                </div>
                <div className="text-xs text-slate-500 flex gap-4 sm:gap-6">
                  <div>
                    <p className="text-slate-600">Loaned</p>
                    <p className="text-slate-300">{new Date(l.loanDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Due</p>
                    <p className="text-slate-300">{new Date(l.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Returned</p>
                    {l.returnDate ? (
                        <>
                        <p className="text-slate-300">{new Date(l.returnDate).toLocaleDateString()}</p>
                        <p className="text-slate-300">{new Date(l.returnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </>
                    ) : (
                        <p className="text-slate-600 italic">TBC</p>
                    )}
                  </div>
                </div>
                <StatusBadge loan={l} />
                <div className="flex gap-1">
                  {!l.returnDate ? (
                    <button
                      onClick={() => openReturnModal(l)}
                      className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400"
                      title="Mark as returned"
                    >
                      <RotateCcw size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setUndoTarget(l)}
                      className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-400"
                      title="Undo return"
                    >
                      <Undo2 size={16} />
                    </button>
                  )}
                  <button onClick={() => setDeleteTarget(l)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return date/time modal */}
      <Modal isOpen={!!returnTarget} onClose={() => setReturnTarget(null)} title="Mark as Returned">
        <form onSubmit={handleConfirmReturn}>
          <p className="text-sm text-slate-400 mb-4">
            Returning "<span className="text-slate-200 font-medium">{returnTarget?.book?.title}</span>" from{' '}
            <span className="text-slate-200 font-medium">{returnTarget?.member?.fullName}</span>
          </p>
          <FormField label="Return Date & Time">
            <input
              type="datetime-local"
              className={inputClass}
              value={returnDateTime}
              onChange={e => setReturnDateTime(e.target.value)}
              required
            />
          </FormField>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-900 py-2.5 rounded-xl font-semibold mt-2 transition-all"
          >
            Confirm Return
          </button>
        </form>
      </Modal>

      {/* Undo return confirmation */}
      <ConfirmDialog
        isOpen={!!undoTarget}
        title="Undo this return?"
        message="This will mark the loan as active again and reduce the book's available copies by one."
        onConfirm={handleUndoReturn}
        onCancel={() => setUndoTarget(null)}
        confirmLabel="Undo Return"
        confirmClass="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:opacity-90"
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete loan record?"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Loans;