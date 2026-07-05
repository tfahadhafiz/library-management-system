import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Library, Lock, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FormField, { inputClass } from '../components/ui/FormField';
import libraryMSLogo from '../assets/LibraryMS.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/Auth/login`, {
        username,
        password
      });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-3">
            <img src={libraryMSLogo} alt="Library Management System logo" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">LibraryMS</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your library</p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormField label="Username">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className={`${inputClass} pl-9`}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </FormField>
          <FormField label="Password">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                className={`${inputClass} pl-9`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </FormField>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-400 to-fuchsia-500 hover:from-purple-300 hover:to-fuchsia-400 text-slate-900 py-2.5 rounded-xl font-semibold mt-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;