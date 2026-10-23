import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  RoleIcon,
  BuildingIcon,
  CheckIcon,
} from '../components/Icons';
import { ROLE_CONFIG } from '../constants/roles';

const DEMO_ACCOUNTS = [
  { username: 'famakan_sharma',  password: 'tony123',    role: 'c_level',     name: 'Famakan Sharma',  title: 'Chief Innovation Officer' },
  { username: 'famakan_chen',    password: 'finance123', role: 'finance',     name: 'Famakan Chen',    title: 'Chief Financial Officer' },
  { username: 'famakan_johnson', password: 'market123',  role: 'marketing',   name: 'Famakan Johnson', title: 'Marketing Director' },
  { username: 'famakan_patel',   password: 'hr123',      role: 'hr',          name: 'Famakan Patel',   title: 'HR Manager' },
  { username: 'famakan_pandey',  password: 'eng123',     role: 'engineering', name: 'Famakan Pandey',  title: 'Lead AI Engineer' },
  { username: 'famakan_smith',   password: 'emp123',     role: 'employee',    name: 'Famakan Smith',   title: 'Operations Associate' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuickUser, setActiveQuickUser] = useState(null);

  const executeLogin = async (userToSubmit, passToSubmit) => {
    setError('');
    setLoading(true);
    try {
      await login(userToSubmit, passToSubmit);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }
    executeLogin(username, password);
  };

  const handleQuickSelect = (acc) => {
    setActiveQuickUser(acc.username);
    setUsername(acc.username);
    setPassword(acc.password);
    executeLogin(acc.username, acc.password);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-600 selection:text-white font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <BuildingIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">FinSolve</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Enterprise RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">Intelligent Internal Knowledge Platform</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <ShieldIcon className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Isolation Active</span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-10 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Secure enterprise intelligence with strict departmental boundaries.
            </h1>
            <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              FinSolve AI indexes financial reports, engineering documentation, HR analytics, and operational policies, ensuring every response is strictly filtered according to the user's verified role.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Demo Accounts · Instant Single-Click Sign In
              </p>
              <span className="text-xs text-slate-500">6 Verified Roles</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc, idx) => {
                const config = ROLE_CONFIG[acc.role] || ROLE_CONFIG.employee;
                const isSelected = activeQuickUser === acc.username;

                return (
                  <button
                    key={acc.username}
                    onClick={() => handleQuickSelect(acc)}
                    disabled={loading}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className={`group relative text-left p-3.5 rounded-xl border pressable card-rim animate-enter ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/40 shadow-md shadow-blue-500/10'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-sm`}>
                          <RoleIcon role={acc.role} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                            {acc.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{acc.title}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {config.label.split(' ')[0]}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">{config.accessibleDepartments.join(', ')}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-8 card-rim backdrop-blur-xl animate-enter">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Workspace Authentication</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or select an account from the demo list.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircleIcon className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. famakan_sharma"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <LockIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 pressable flex items-center justify-center gap-2 group text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Assistant</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-500">
                Encrypted JWT session · RBAC isolation enforced via Qdrant & FastAPI
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        FinSolve Technologies Inc. · Internal Corporate Knowledge Base · Confidential
      </footer>
    </div>
  );
}
