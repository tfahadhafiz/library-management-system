import PageHeader from '../components/ui/PageHeader';
import libraryMSLogo from '../assets/LibraryMS.png';

const techStack = [
  { label: '.NET 10 Web API', slug: 'dotnet', tint: 'from-purple-500/20 to-fuchsia-500/10' },
  { label: 'Entity Framework Core', slug: 'entityframeworkcore', tint: 'from-emerald-500/20 to-teal-500/10' },
  { label: 'Azure SQL Database', slug: 'azure-sql-database', tint: 'from-sky-500/20 to-blue-500/10' },
  { label: 'Azure App Service', slug: 'azure', tint: 'from-blue-500/20 to-indigo-500/10' },
  { label: 'JWT Authentication', slug: 'jwt', tint: 'from-rose-500/20 to-red-500/10' },
  { label: 'React', slug: 'react', tint: 'from-cyan-500/20 to-sky-500/10' },
  { label: 'Vite', slug: 'vite', tint: 'from-violet-500/20 to-purple-500/10' },
  { label: 'Tailwind CSS', slug: 'tailwindcss', tint: 'from-teal-500/20 to-cyan-500/10' },
];

const features = [
  { title: 'Full CRUD Management', desc: 'Create, read, update, and delete Authors, Categories, Books, Members, and Loans.' },
  { title: 'Secure by Default', desc: 'JWT bearer authentication protects every endpoint, with encrypted credentials stored in the database.' },
  { title: 'Real-Time Availability', desc: 'Book copy counts automatically update as items are borrowed, returned, or undone.' },
  { title: 'Modern Interface', desc: 'A responsive, dark-themed dashboard with search, filtering, and sorting across every module.' },
];

function About() {
  return (
    <div>
      <PageHeader title="About" subtitle="Library Management System" />

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-slate-900/60 border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-22 h-22 rounded-2xl flex items-center justify-center  flex-shrink-0">
            <img src={libraryMSLogo} alt="Library Management System logo" className="w-40 h-40 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
              Library <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Management System</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
              A full-stack web application for managing a library's books, authors, categories, members, and loan transactions — built as a technical assessment project.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/30 transition-colors animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="font-semibold text-slate-100">{f.title}</p>
            <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold text-slate-200 mb-4">Built With</p>
        <div className="flex flex-wrap gap-2.5">
          {techStack.map((t) => (
            <div
              key={t.label}
              className={`flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-xl bg-gradient-to-r ${t.tint} ring-1 ring-slate-700/60`}
            >
              <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                <img
                  src={`https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${t.slug}/default.svg`}
                  // src={`https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${t.slug}.svg`}
                  alt=""
                  className="w-3.5 h-3.5"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </span>
              <span className="text-xs font-medium text-slate-200">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Author + GitHub */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Created by</p>
          <p className="text-lg font-semibold text-slate-100 mt-0.5">Tengku Fahad</p>
        </div>
        <a
          href="https://github.com/tfahadhafiz/library-management-system"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
        >          
          View on GitHub
        </a>
      </div>
    </div>
  );
}

export default About;