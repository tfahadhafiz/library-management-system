import { useState, useEffect } from 'react';
import api from '../api/axios';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 800;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

function StatCard({ label, value, gradient, delay }) {
  return (
    <div
      className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-5 overflow-hidden animate-fade-in-up hover:border-slate-700 transition-colors"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${gradient}`} />
      <p className="text-sm text-slate-500 relative">{label}</p>
      <p className={`text-3xl font-bold mt-1 relative bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        <CountUp value={value} />
      </p>
    </div>
  );
}

// Purely decorative, hand-built bookshelf — colorful spines of varying height/width
function BookShelf() {
  const spines = [
    'from-rose-500 to-rose-700 h-20', 'from-amber-400 to-amber-600 h-24', 'from-emerald-500 to-emerald-700 h-16',
    'from-sky-500 to-sky-700 h-28', 'from-violet-500 to-violet-700 h-20', 'from-orange-400 to-orange-600 h-24',
    'from-teal-500 to-teal-700 h-16', 'from-fuchsia-500 to-fuchsia-700 h-24', 'from-yellow-400 to-yellow-600 h-20',
    'from-indigo-500 to-indigo-700 h-28', 'from-red-500 to-red-700 h-20', 'from-lime-500 to-lime-700 h-16',
  ];
  return (
    <div className="flex items-end gap-1.5 h-28">
      {spines.map((s, i) => (
        <div
          key={i}
          className={`w-3.5 sm:w-4 rounded-t-sm bg-gradient-to-b ${s} shadow-lg animate-fade-in-up`}
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalBooks: 0, activeLoans: 0, overdueLoans: 0, totalMembers: 0 });
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [booksRes, loansRes, membersRes] = await Promise.all([
          api.get('/Books'), api.get('/Loans'), api.get('/Members')
        ]);
        const now = new Date();
        setStats({
          totalBooks: booksRes.data.length,
          totalMembers: membersRes.data.length,
          activeLoans: loansRes.data.filter(l => !l.returnDate).length,
          overdueLoans: loansRes.data.filter(l => !l.returnDate && new Date(l.dueDate) < now).length
        });

        // Build a 7-day loan trend from real loan dates
        const days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });
        const trendData = days.map(day => {
          const count = loansRes.data.filter(l => {
            const ld = new Date(l.loanDate);
            return ld.toDateString() === day.toDateString();
          }).length;
          return { day: day.toLocaleDateString('en-US', { weekday: 'short' }), loans: count };
        });
        setTrend(trendData);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-slate-900/60 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-10 right-10 w-56 h-56 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />

        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
          <p className="text-purple-400/80 text-sm font-medium mb-1">{greeting}, {user?.fullName?.split(' ')[0] || 'there'}</p>            <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 tracking-tight">
              Your library, <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">at a glance</span>
            </h1>
          </div>
          <BookShelf />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading stats...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Books" value={stats.totalBooks} gradient="from-purple-400 to-fuchsia-500" delay={0} />
            <StatCard label="Total Members" value={stats.totalMembers} gradient="from-emerald-400 to-teal-500" delay={80} />
            <StatCard label="Active Loans" value={stats.activeLoans} gradient="from-sky-400 to-indigo-500" delay={160} />
            <StatCard label="Overdue Loans" value={stats.overdueLoans} gradient="from-rose-500 to-red-600" delay={240} />
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            <p className="text-sm font-medium text-slate-300 mb-4">Loans over the last 7 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="loanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', fontSize: '13px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="loans" stroke="#c084fc" strokeWidth={2} fill="url(#loanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;