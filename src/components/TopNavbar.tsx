import React, { useState } from 'react';
import { 
  Menu, 
  ShieldCheck, 
  Database, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { PesantrenLogoSvg } from './PesantrenLogoSvg';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  onOpenAudit: () => void;
  onOpenInspector: () => void;
  currentTitle: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onOpenAudit,
  onOpenInspector,
  currentTitle
}) => {
  const db = DbEngine.getInstance();
  const currentUser = db.getCurrentUser();
  const state = db.getState();
  const activeYear = state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<any | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const initiateSwitch = (user: any) => {
    setUserDropdownOpen(false);
    if (user.ID_USER === currentUser?.ID_USER) return;
    setPasswordModalUser(user);
    setPasswordInput('');
    setPasswordError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    try {
      db.switchUser(passwordModalUser.ID_USER, passwordInput.trim());
      setPasswordModalUser(null);
      setPasswordInput('');
      setPasswordError('');
    } catch (e: any) {
      setPasswordError(e.message || 'Kata sandi salah.');
    }
  };

  const handleLogout = () => {
    db.logout();
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 hidden sm:flex">
          <PesantrenLogoSvg className="w-full h-full object-contain" />
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{currentTitle}</span>
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-emerald-800">Inayatul Muhajirin Cipatat</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-emerald-700" />
              TA: {activeYear?.NAMA_TAHUN_AJARAN || '2026/2027'} (Aktif)
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Tools, Account Switcher & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* PWA Install & Offline Status */}
        <PWAInstallButton />

        {/* Database Inspector Tool Button */}
        <button
          onClick={onOpenInspector}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
          title="Buka Penampil Database 16 Sheet"
        >
          <Database className="w-3.5 h-3.5 text-slate-600" />
          <span>16 Sheet</span>
        </button>

        {/* Audit Runner Tool Button */}
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
          title="Uji Keselarasan Aturan Bisnis & Keuangan"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Uji Audit</span>
        </button>

        {/* User Account Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {currentUser?.NAMA_LENGKAP.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                {currentUser?.NAMA_LENGKAP || 'Belum Masuk'}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                {currentUser?.ROLE === 'KEPALA_BIDANG_KEUANGAN' ? 'Kepala Bid. Keuangan' : 'Admin Keuangan'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Akun Aktif Saat Ini</span>
                  <div className="font-bold text-slate-900 text-sm">{currentUser?.NAMA_LENGKAP}</div>
                  <span className="inline-block px-2 py-0.5 mt-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                    {currentUser?.ROLE}
                  </span>
                </div>

                <div className="py-2 px-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                    Ganti Peran Pengguna (Uji Coba Approval):
                  </span>
                  {state.USERS.map(user => {
                    const isCurrent = user.ID_USER === currentUser?.ID_USER;
                    return (
                      <button
                        key={user.ID_USER}
                        onClick={() => initiateSwitch(user)}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                          isCurrent ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{user.NAMA_LENGKAP}</div>
                          <div className="text-[10px] text-slate-400">{user.ROLE === 'KEPALA_BIDANG_KEUANGAN' ? 'Persetujuan Pengeluaran & Pembatalan' : 'Input Transaksi & Tagihan'}</div>
                        </div>
                        {isCurrent && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-1 px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 font-semibold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Password Modal for User Switching */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {passwordModalUser.NAMA_LENGKAP.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Verifikasi Kata Sandi</h4>
                <p className="text-[11px] text-slate-500">{passwordModalUser.NAMA_LENGKAP}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Masukkan Kata Sandi:
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Masukkan kata sandi..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-emerald-600 focus:bg-white font-mono"
                />
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Masuk Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
