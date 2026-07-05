import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Tag, BookOpen, UserCircle, Repeat,
  Menu, X, Library, Settings, ChevronDown
} from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import libraryMSLogo from '../assets/LibraryMS.png';

const topLinks = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
];

const setupLinks = [
  { path: '/authors', label: 'Authors', icon: Users },
  { path: '/categories', label: 'Categories', icon: Tag },
];

const bottomLinks = [
  { path: '/books', label: 'Books', icon: BookOpen },
  { path: '/members', label: 'Members', icon: UserCircle },
  { path: '/loans', label: 'Loans', icon: Repeat },
  { path: '/about', label: 'About', icon: Info },
];

function NavItem({ path, label, icon: Icon, end, nested = false }) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          nested ? 'pl-9 pr-3' : 'px-3'
        } ${
          isActive
            ? 'bg-gradient-to-r from-purple-500/15 to-fuchsia-500/5 text-purple-400'
            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gradient-to-b from-purple-400 to-fuchsia-500" />}
          <Icon size={nested ? 16 : 18} />
          {label}
        </>
      )}
    </NavLink>
  );
}

function SetupGroup({ mobile = false, onNavigate }) {
  const location = useLocation();
  const isChildActive = setupLinks.some(l => location.pathname === l.path);
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isChildActive ? 'text-purple-400' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
        }`}
      >
        <span className="flex items-center gap-3">
          <Settings size={18} />
          Setup
        </span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {setupLinks.map(link => (
            <div key={link.path} onClick={onNavigate}>
              <NavItem {...link} nested />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#0a0e17]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-slate-950/80 border-r border-slate-800/60 fixed h-screen">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img src={libraryMSLogo} alt="Library Management System logo" className="w-16 h-16 object-contain" />
          </div>
          <span className="font-bold text-slate-100 tracking-tight">LibraryMS</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {topLinks.map(link => <NavItem key={link.path} {...link} end={link.path === '/'} />)}
          <SetupGroup />
          {bottomLinks.map(link => <NavItem key={link.path} {...link} />)}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800/60">
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
            <LogOut size={18} />
            Logout
        </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800/60 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <img src={libraryMSLogo} alt="Library Management System logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="font-bold text-slate-100">LibraryMS</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-300">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-30 bg-slate-950 border-b border-slate-800/60 shadow-xl px-3 py-2 space-y-1">
          {topLinks.map(link => (
            <div key={link.path} onClick={() => setMobileOpen(false)}>
              <NavItem {...link} end={link.path === '/'} />
            </div>
          ))}
          <SetupGroup mobile onNavigate={() => setMobileOpen(false)} />
          {bottomLinks.map(link => (
            <div key={link.path} onClick={() => setMobileOpen(false)}>
              <NavItem {...link} />
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

export default Layout;