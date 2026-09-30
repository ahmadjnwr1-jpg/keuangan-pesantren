import React, { useState } from 'react';
import { Building2, ShieldCheck, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { PesantrenLogoSvg } from './PesantrenLogoSvg';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const [username, setUsername] = useState('ranran');
  const [password, setPassword] = useState('GantiPasswordU001!');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      db.login(username, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
    }
  };

  const handleQuickLogin = (uname: string) => {
    setError('');
    try {
      db.login(uname, 'default');
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-emerald-900/20 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-50 rounded-full pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="text-center relative z-10 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white p-1 border-2 border-emerald-700/60 mx-auto flex items-center justify-center shadow-lg mb-3 overflow-hidden">
            <PesantrenLogoSvg className="w-full h-full object-contain" />
          </div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest block">
            Yayasan Pendidikan Islam Inayatul Muhajirin
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Keuangan Pesantren
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Informasi Pengelolaan Kas & Tagihan 16 Sheet Terpadu
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs relative z-10">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Username Pengguna</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ranran atau astri"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-emerald-600 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-emerald-600 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100 relative z-10 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Atau Pilih Akun Cepat (Siap Pakai):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('ranran')}
              className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition cursor-pointer"
            >
              <div className="font-bold text-slate-900 text-xs">Ranran Siti N.</div>
              <div className="text-[10px] text-emerald-800 font-bold uppercase">Role: KABID KEUANGAN</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('astri')}
              className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition cursor-pointer"
            >
              <div className="font-bold text-slate-900 text-xs">Astri Sriwulandari</div>
              <div className="text-[10px] text-blue-800 font-bold uppercase">Role: ADMIN KEUANGAN</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[10px] text-slate-400">
          Cipatat, Kabupaten Bandung Barat • Jawa Barat
        </div>

      </div>
    </div>
  );
};
