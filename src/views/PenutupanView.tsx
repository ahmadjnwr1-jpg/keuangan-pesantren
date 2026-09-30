import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  User, 
  X, 
  Info,
  Clock,
  ArrowRightCircle
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { PenutupanPeriodeRow } from '../types/database';

export const PenutupanView: React.FC = () => {
  const db = DbEngine.getInstance();
  const [currentUser, setCurrentUser] = useState(() => db.getCurrentUser());
  const [state, setState] = useState(() => db.getState());
  const isHeadFinance = currentUser?.ROLE === 'KEPALA_BIDANG_KEUANGAN';

  // State form
  const [tahun, setTahun] = useState('2026');
  const [bulan, setBulan] = useState('09');
  const [keterangan, setKeterangan] = useState('');

  // Modals confirmation
  const [confirmCloseModal, setConfirmCloseModal] = useState<{ tahun: string; bulan: string; keterangan: string } | null>(null);
  const [confirmReopenModal, setConfirmReopenModal] = useState<{ tahun: string; bulan: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-subscribe to db engine updates
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setState(db.getState());
      setCurrentUser(db.getCurrentUser());
    });
    return unsub;
  }, [db]);

  const periods = [...state.PENUTUPAN_PERIODE].sort((a, b) => 
    `${b.TAHUN}-${b.BULAN}`.localeCompare(`${a.TAHUN}-${a.BULAN}`)
  );

  const handleOpenCloseModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHeadFinance) {
      alert('Akses dibatasi: Otoritas penutupan / pembukaan periode hanya dimiliki oleh Kepala Bidang Keuangan (Ranran Siti Nurhasanah). Silakan beralih akun melalui pojok kanan atas.');
      return;
    }
    setConfirmCloseModal({ tahun, bulan, keterangan });
  };

  const executeClosePeriod = () => {
    if (!confirmCloseModal) return;
    try {
      db.closePeriod(confirmCloseModal.tahun, confirmCloseModal.bulan, confirmCloseModal.keterangan);
      setConfirmCloseModal(null);
      setKeterangan('');
      showToast(`Periode ${confirmCloseModal.tahun}-${confirmCloseModal.bulan} berhasil DITUTUP & DIKUNCI.`);
    } catch (err: any) {
      alert(err.message || 'Gagal menutup periode');
    }
  };

  const executeReopenPeriod = () => {
    if (!confirmReopenModal) return;
    try {
      db.reopenPeriod(confirmReopenModal.tahun, confirmReopenModal.bulan);
      setConfirmReopenModal(null);
      showToast(`Periode ${confirmReopenModal.tahun}-${confirmReopenModal.bulan} berhasil DIBUKA kembali.`);
    } catch (err: any) {
      alert(err.message || 'Gagal membuka periode');
    }
  };

  // Quick action: Close a period directly from table
  const handleQuickClose = (t: string, b: string) => {
    if (!isHeadFinance) {
      alert('Akses dibatasi: Otoritas penutupan periode hanya dimiliki oleh Kepala Bidang Keuangan (Ranran Siti Nurhasanah). Silakan beralih akun di pojok kanan atas.');
      return;
    }
    setConfirmCloseModal({ tahun: t, bulan: b, keterangan: `Tutup periode ${t}-${b}` });
  };

  // Quick action: Reopen a period directly from table
  const handleQuickReopen = (t: string, b: string) => {
    if (!isHeadFinance) {
      alert('Akses dibatasi: Otoritas pembukaan periode hanya dimiliki oleh Kepala Bidang Keuangan (Ranran Siti Nurhasanah). Silakan beralih akun di pojok kanan atas.');
      return;
    }
    setConfirmReopenModal({ tahun: t, bulan: b });
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Penutupan Periode Keuangan (Period Closing)</h2>
          <p className="text-xs text-slate-500">
            Kunci integritas buku kas bulanan untuk mencegah pengeditan atau mutasi susulan pada periode yang telah diaudit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isHeadFinance ? (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Otorisasi Aktif: Kepala Bidang Keuangan</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Login sebagai <strong>Admin</strong>. Beralih ke akun <strong>Kabid Keuangan</strong> untuk menutup/membuka periode.</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Close Period (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-sm text-slate-900">Tutup Periode Bulanan</h3>
          </div>

          <form onSubmit={handleOpenCloseModal} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun (YYYY)</label>
                <input
                  type="text"
                  required
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bulan (01-12)</label>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                    <option key={m} value={m}>Bulan {m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Keterangan Penutupan Buku</label>
              <textarea
                rows={3}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Tutup buku kas operasional akhir bulan..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 leading-relaxed border border-amber-200">
              <strong>Efek Penguncian:</strong> Transaksi pembayaran santri atau pengeluaran kas pada periode yang DITUTUP akan otomatis ditolak dan dikunci oleh sistem.
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                isHeadFinance 
                  ? 'bg-emerald-800 hover:bg-emerald-900 text-white' 
                  : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{isHeadFinance ? 'Kunci & Tutup Periode Sekarang' : 'Kunci & Tutup Periode (Perlu Kabid)'}</span>
            </button>
          </form>
        </div>

        {/* Status Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Histori & Status Periode Keuangan</h3>
            <span className="text-xs text-slate-500 font-semibold">{periods.length} Catatan Periode</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Status Kunci</th>
                  <th className="py-3 px-4">Ditutup Oleh & Tanggal</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {periods.map(p => {
                  const user = state.USERS.find(u => u.ID_USER === p.DITUTUP_OLEH);
                  const isClosed = p.STATUS === 'DITUTUP';

                  return (
                    <tr key={p.ID_PERIODE} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm font-sans">
                        {p.TAHUN}-{p.BULAN}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            if (isClosed) {
                              handleQuickReopen(p.TAHUN, p.BULAN);
                            } else {
                              handleQuickClose(p.TAHUN, p.BULAN);
                            }
                          }}
                          title={isClosed ? 'Klik untuk membuka kunci periode' : 'Klik untuk mengunci periode ini'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase font-sans transition cursor-pointer border ${
                            isClosed 
                              ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {isClosed ? (
                            <>
                              <Lock className="w-3 h-3 text-rose-700" />
                              <span>TERKUNCI</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>TERBUKA</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-600">
                        {p.DITUTUP_OLEH ? (
                          <div>
                            <div className="font-semibold text-slate-900">{user?.NAMA_LENGKAP || p.DITUTUP_OLEH}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.TANGGAL_PENUTUPAN}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-mono">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-600 max-w-xs truncate">
                        {p.KETERANGAN || '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {isClosed ? (
                            <button
                              onClick={() => handleQuickReopen(p.TAHUN, p.BULAN)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Buka kembali periode ini"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Buka Kembali</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickClose(p.TAHUN, p.BULAN)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Kunci & Tutup periode ini"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Kunci Periode</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Konfirmasi Tutup Periode */}
      {confirmCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <Lock className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Konfirmasi Penutupan Periode</h4>
                <p className="text-[11px] text-slate-500">Kunci Integritas Buku Kas Bulanan</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs leading-relaxed space-y-1">
              <p>
                Anda akan mengunci dan menutup periode <strong>{confirmCloseModal.tahun}-{confirmCloseModal.bulan}</strong>.
              </p>
              <p className="text-[11px] text-rose-700">
                Setelah ditutup, seluruh transaksi pembayaran baru, pengeluaran baru, atau perubahan data yang bertanggal pada periode ini akan ditolak oleh sistem.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCloseModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeClosePeriod}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ya, Kunci &amp; Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Buka Kembali Periode */}
      {confirmReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Unlock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Buka Kembali Periode Keuangan</h4>
                <p className="text-[11px] text-slate-500">Membuka kembali akses mutasi buku kas</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs leading-relaxed space-y-1">
              <p>
                Buka kembali periode <strong>{confirmReopenModal.tahun}-{confirmReopenModal.bulan}</strong>?
              </p>
              <p className="text-[11px] text-amber-700">
                Periode ini akan berstatus <strong>DIBUKA</strong> kembali, sehingga transaksi susulan atau penyesuaian kas dapat diproses oleh kasir/admin.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmReopenModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeReopenPeriod}
                className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Ya, Buka Kembali</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
