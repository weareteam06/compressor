import { useState } from 'react';
import { Lock, User, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { loginAdmin, setAuthToken } from '@/lib/data';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function LoginPage({ onLoginSuccess, onBack }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await loginAdmin(username.trim(), password);
      setAuthToken(session.token);
      onLoginSuccess();
    } catch {
      setError('Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-[#fff8df] via-[#ffd765] to-[#f9b916] py-12 sm:px-6 lg:px-8">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back link */}
        <button 
          onClick={onBack}
          className="group absolute -top-12 left-0 flex items-center gap-2 text-sm font-bold text-slate-700 transition-colors hover:text-red-700"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Public Website
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-700 bg-red-600 shadow-2xl shadow-red-700/20">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Backend Portal Login</h2>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Certified Administration & Content Management Layer
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-8 border border-amber-400 bg-white/95 py-8 px-4 shadow-2xl shadow-amber-900/15 backdrop-blur-xl sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Administrator Username
              </label>
              <div className="relative rounded-2xl overflow-hidden shadow-inner">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-2xl border border-amber-200 bg-white pl-11 pr-4 py-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter username..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Administrator Password
              </label>
              <div className="relative rounded-2xl overflow-hidden shadow-inner">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-amber-200 bg-white pl-11 pr-4 py-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl text-sm font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 shadow-xl shadow-red-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Session...</span>
                  </div>
                ) : (
                  'Access Portal Dashboard'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-amber-200 pt-6 text-center">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Database-backed administrator access
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs font-medium text-slate-700">
            Secure 256-bit AES Encryption Layer &copy; firstAir Compressed Air Systems
          </p>
        </div>
      </div>
    </div>
  );
}
