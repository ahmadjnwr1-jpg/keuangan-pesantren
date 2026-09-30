import React, { useState } from 'react';
import { 
  TrendingDown, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Filter, 
  Calendar,
  X,
  CreditCard,
  Eye,
  FileDown,
  Ban,
  FileText
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { PengeluaranRow, PaymentMethod } from '../types/database';
import { generateBuktiPengeluaranPdf } from '../services/pdfGenerator';

export const PengeluaranView: React.FC = () => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const currentUser = db.getCurrentUser();
  const isHeadFinance = currentUser?.ROLE === 'KEPALA_BIDANG_KEUANGAN';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState<{ exp: PengeluaranRow; type: 'APPROVE' | 'REJECT' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [payModal, setPayModal] = useState<PengeluaranRow | null>(null);
  const [detailModal, setDetailModal] = useState<PengeluaranRow | null>(null);
  const [cancelModal, setCancelModal] = useState<PengeluaranRow | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Forms
  const [formAdd, setFormAdd] = useState({
    tglPengajuan: db.formatDateOnly(),
    idKategori: state.KATEGORI_PENGELUARAN[0]?.ID_KATEGORI || '',
    uraian: '',
    nominal: 100000,
    keterangan: ''
  });

  const [payForm, setPayForm] = useState({
    tglPembayaran: db.formatDateOnly(),
    metode: 'TUNAI' as PaymentMethod,
    referensi: '',
    keterangan: ''
  });

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const filteredExpenses = state.PENGELUARAN.filter(e => {
    if (filterStatus && e.STATUS !== filterStatus) return false;
    if (filterKategori && e.ID_KATEGORI !== filterKategori) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.ID_PENGELUARAN.toLowerCase().includes(q) ||
        e.URAIAN.toLowerCase().includes(q) ||
        (e.REFERENSI && e.REFERENSI.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.ajukanPengeluaran(formAdd);
      setShowAddModal(false);
      setFormAdd({
        tglPengajuan: db.formatDateOnly(),
        idKategori: state.KATEGORI_PENGELUARAN[0]?.ID_KATEGORI || '',
        uraian: '',
        nominal: 100000,
        keterangan: ''
      });
      alert('Pengajuan pengeluaran kas berhasil dibuat! Menunggu persetujuan Kepala Bidang Keuangan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModal) return;
    try {
      if (approvalModal.type === 'APPROVE') {
        db.setujuiPengeluaran(approvalModal.exp.ID_PENGELUARAN);
        alert(`Pengeluaran ${approvalModal.exp.URAIAN} DISETUJUI. Nominal Rp ${approvalModal.exp.NOMINAL_PENGAJUAN.toLocaleString('id-ID')} terkunci.`);
      } else {
        db.tolakPengeluaran(approvalModal.exp.ID_PENGELUARAN, rejectReason);
        alert('Pengajuan pengeluaran berhasil DITOLAK.');
      }
      setApprovalModal(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    try {
      db.bayarPengeluaran(payModal.ID_PENGELUARAN, payForm);
      setPayModal(null);
      alert('Pengeluaran berhasil DIBAYAR LUNAS. Saldo kas pesantren telah diperbarui.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengelolaan Pengeluaran Kas Pesantren</h2>
          <p className="text-xs text-slate-500">
            Jalur Terkunci: DIAJUKAN &rarr; DISETUJUI / DITOLAK &rarr; DIBAYAR &rarr; LUNAS (Kas Berkurang).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajukan Pengeluaran</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Uraian / Kategori / Referensi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          >
            <option value="">Semua Status Pengeluaran</option>
            <option value="DIAJUKAN">Status: DIAJUKAN (Menunggu Approval)</option>
            <option value="DISETUJUI">Status: DISETUJUI (Siap Dibayar)</option>
            <option value="LUNAS">Status: LUNAS (Kas Berkurang)</option>
            <option value="DITOLAK">Status: DITOLAK</option>
          </select>
        </div>

        <div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          >
            <option value="">Semua Kategori</option>
            {state.KATEGORI_PENGELUARAN.map(k => (
              <option key={k.ID_KATEGORI} value={k.ID_KATEGORI}>{k.NAMA_KATEGORI}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal & Uraian</th>
                <th className="py-3 px-4">Kategori Belanja</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi Alur Kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada pengeluaran kas yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => {
                  const kat = state.KATEGORI_PENGELUARAN.find(k => k.ID_KATEGORI === e.ID_KATEGORI);
                  const diajukanUser = state.USERS.find(u => u.ID_USER === e.DIAJUKAN_OLEH);

                  return (
                    <tr key={e.ID_PENGELUARAN} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{e.URAIAN}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Diajukan: {e.TANGGAL_PENGAJUAN}</span>
                          {e.TANGGAL_PEMBAYARAN && <span>• Dibayar: {e.TANGGAL_PEMBAYARAN}</span>}
                        </div>
                        {e.KETERANGAN && (
                          <div className="text-[10px] text-slate-400 italic truncate max-w-sm mt-0.5">{e.KETERANGAN}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{kat?.NAMA_KATEGORI || e.ID_KATEGORI}</span>
                        <div className="text-[10px] text-slate-400">Oleh: {diajukanUser?.NAMA_LENGKAP || e.DIAJUKAN_OLEH}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900 font-mono text-sm">
                        {formatRp(e.NOMINAL_PENGAJUAN)}
                      </td>

                      <td className="py-3 px-4">
                        {e.METODE ? (
                          <div>
                            <span className="font-bold text-slate-800">{e.METODE}</span>
                            {e.REFERENSI && <div className="text-[10px] text-slate-500 font-mono">Ref: {e.REFERENSI}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Dibayar</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          e.STATUS === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' :
                          e.STATUS === 'DISETUJUI' ? 'bg-blue-100 text-blue-800' :
                          e.STATUS === 'DITOLAK' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {e.STATUS}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-1.5">
                          {/* Detail Eye Button */}
                          <button
                            onClick={() => setDetailModal(e)}
                            title="Lihat Rincian Pengeluaran"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* PDF Bukti Kas Keluar (Voucher) Button */}
                          <button
                            onClick={() => {
                              const res = generateBuktiPengeluaranPdf(e.ID_PENGELUARAN);
                              if (res.success) {
                                showToast(res.message);
                              } else {
                                alert(res.message);
                              }
                            }}
                            title="Unduh Bukti Pengeluaran Kas (PDF)"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer border border-emerald-200"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>

                          {/* Step 1: Head Finance Approval */}
                          {e.STATUS === 'DIAJUKAN' && isHeadFinance && (
                            <>
                              <button
                                onClick={() => setApprovalModal({ exp: e, type: 'APPROVE' })}
                                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => {
                                  setApprovalModal({ exp: e, type: 'REJECT' });
                                  setRejectReason('');
                                }}
                                className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {e.STATUS === 'DIAJUKAN' && !isHeadFinance && (
                            <span className="text-[11px] text-slate-400 italic">Menunggu Kabid</span>
                          )}

                          {/* Step 2: Pay Approved Expense */}
                          {e.STATUS === 'DISETUJUI' && (
                            <button
                              onClick={() => {
                                setPayModal(e);
                                setPayForm({
                                  tglPembayaran: db.formatDateOnly(),
                                  metode: 'TUNAI',
                                  referensi: '',
                                  keterangan: ''
                                });
                              }}
                              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Bayar Kas</span>
                            </button>
                          )}

                          {/* Fitur Pembatalan Pengeluaran (Bisa oleh Kabid Keuangan untuk pengeluaran Aktif/Lunas/Disetujui) */}
                          {e.STATUS !== 'DIBATALKAN' && e.STATUS !== 'DITOLAK' && isHeadFinance && (
                            <button
                              onClick={() => {
                                setCancelModal(e);
                                setCancelReason('');
                              }}
                              title="Batalkan Pengeluaran Kas"
                              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Batal</span>
                            </button>
                          )}

                          {e.STATUS === 'LUNAS' && (
                            <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 ml-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Lunas</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Rincian Pengeluaran Kas</h3>
              </div>
              <button
                onClick={() => setDetailModal(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">ID Pengeluaran</span>
                  <span className="font-mono font-bold text-slate-800">{detailModal.ID_PENGELUARAN}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                    detailModal.STATUS === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' :
                    detailModal.STATUS === 'DISETUJUI' ? 'bg-blue-100 text-blue-800' :
                    detailModal.STATUS === 'DITOLAK' || detailModal.STATUS === 'DIBATALKAN' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {detailModal.STATUS}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Kategori Beban</span>
                  <span className="font-bold text-slate-900">
                    {state.KATEGORI_PENGELUARAN.find(k => k.ID_KATEGORI === detailModal.ID_KATEGORI)?.NAMA_KATEGORI || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Nominal Pengajuan</span>
                  <span className="font-black text-sm text-emerald-800">
                    Rp {detailModal.NOMINAL_PENGAJUAN.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block">Uraian Kebutuhan:</span>
                <p className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {detailModal.URAIAN}
                </p>
              </div>

              {detailModal.KETERANGAN && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 block">Catatan / Keterangan:</span>
                  <p className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                    {detailModal.KETERANGAN}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                <div>
                  <span className="block font-semibold">Tgl Pengajuan:</span>
                  <span className="text-slate-800">{detailModal.TANGGAL_PENGAJUAN}</span>
                </div>
                <div>
                  <span className="block font-semibold">Tgl Pembayaran:</span>
                  <span className="text-slate-800">{detailModal.TANGGAL_PEMBAYARAN || '-'}</span>
                </div>
                <div>
                  <span className="block font-semibold">Metode / Ref:</span>
                  <span className="text-slate-800">{detailModal.METODE || 'TUNAI'} {detailModal.REFERENSI ? `(${detailModal.REFERENSI})` : ''}</span>
                </div>
                <div>
                  <span className="block font-semibold">Diajukan Oleh:</span>
                  <span className="text-slate-800">{state.USERS.find(u => u.ID_USER === detailModal.DIAJUKAN_OLEH)?.NAMA_LENGKAP || detailModal.DIAJUKAN_OLEH}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const res = generateBuktiPengeluaranPdf(detailModal.ID_PENGELUARAN);
                    if (res.success) {
                      showToast(res.message);
                    } else {
                      alert(res.message);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Unduh Bukti PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal (Fitur Pembatalan Pengeluaran) */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden space-y-4">
            <div className="px-6 py-4 bg-rose-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-sm">Pembatalan Pengeluaran Kas</h3>
              </div>
              <button
                onClick={() => setCancelModal(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  db.batalkanPengeluaran(cancelModal.ID_PENGELUARAN, cancelReason);
                  setCancelModal(null);
                  setCancelReason('');
                  showToast('Pengeluaran berhasil DIBATALKAN. Audit log dan saldo kas telah disesuaikan.');
                } catch (err: any) {
                  alert(err.message);
                }
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 leading-relaxed">
                Anda akan membatalkan pengeluaran <strong>{cancelModal.URAIAN}</strong> sebesar <strong>Rp {cancelModal.NOMINAL_PENGAJUAN.toLocaleString('id-ID')}</strong>. Jika status sebelumnya LUNAS, saldo kas pesantren akan otomatis dipulihkan.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alasan Pembatalan Pengeluaran * (Minimal 5 karakter)
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Contoh: Kesalahan input nominal, nota dibatalkan oleh pihak toko, dll."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-rose-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModal(null)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Konfirmasi Pembatalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajukan Pengeluaran Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Ajukan Pengeluaran Kas Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pengajuan *</label>
                <input
                  type="date"
                  required
                  value={formAdd.tglPengajuan}
                  onChange={(e) => setFormAdd({ ...formAdd, tglPengajuan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Belanja *</label>
                <select
                  required
                  value={formAdd.idKategori}
                  onChange={(e) => setFormAdd({ ...formAdd, idKategori: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {state.KATEGORI_PENGELUARAN.map(k => (
                    <option key={k.ID_KATEGORI} value={k.ID_KATEGORI}>{k.NAMA_KATEGORI}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian Kebutuhan / Belanja *</label>
                <textarea
                  required
                  rows={2}
                  value={formAdd.uraian}
                  onChange={(e) => setFormAdd({ ...formAdd, uraian: e.target.value })}
                  placeholder="Contoh: Pembelian beras 1 kwintal untuk dapur santri"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Yang Diajukan (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={formAdd.nominal}
                  onChange={(e) => setFormAdd({ ...formAdd, nominal: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={formAdd.keterangan}
                  onChange={(e) => setFormAdd({ ...formAdd, keterangan: e.target.value })}
                  placeholder="Keterangan toko / tujuan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Ajukan ke Kabid Keuangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Approval / Reject Pengeluaran */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className={`px-6 py-4 text-white flex justify-between items-center ${
              approvalModal.type === 'APPROVE' ? 'bg-emerald-900' : 'bg-rose-900'
            }`}>
              <h3 className="font-bold text-sm">
                {approvalModal.type === 'APPROVE' ? 'Setujui Pengeluaran Kas' : 'Tolak Pengajuan Pengeluaran'}
              </h3>
              <button onClick={() => setApprovalModal(null)} className="p-1 hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApprovalSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{approvalModal.exp.URAIAN}</div>
                <div className="text-emerald-800 font-mono font-black text-sm mt-1">
                  Nominal: {formatRp(approvalModal.exp.NOMINAL_PENGAJUAN)}
                </div>
                <div className="text-slate-400 mt-1">Diajukan: {approvalModal.exp.TANGGAL_PENGAJUAN}</div>
              </div>

              {approvalModal.type === 'APPROVE' ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                  Dengan menyetujui, nominal pengeluaran akan <strong>dikunci permanen</strong> dan status berubah menjadi <strong>DISETUJUI</strong> siap dicairkan kasnya.
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alasan Penolakan (Wajib min. 5 karakter) *</label>
                  <textarea
                    required
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Anggaran belum tersedia / spesifikasi kebutuhan tidak sesuai..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalModal(null)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-bold ${
                    approvalModal.type === 'APPROVE' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {approvalModal.type === 'APPROVE' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bayar Pengeluaran Disetujui */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Pembayaran Kas Pengeluaran</h3>
                <p className="text-xs text-blue-200">Status akan menjadi LUNAS dan saldo kas berkurang</p>
              </div>
              <button onClick={() => setPayModal(null)} className="p-1 hover:text-blue-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-slate-500">Uraian Belanja:</div>
                <div className="font-bold text-slate-900 text-sm">{payModal.URAIAN}</div>
                <div className="text-blue-900 font-black font-mono text-base mt-1">
                  Nominal Dibayar: {formatRp(payModal.NOMINAL_PENGAJUAN)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pembayaran Kas *</label>
                <input
                  type="date"
                  required
                  value={payForm.tglPembayaran}
                  onChange={(e) => setPayForm({ ...payForm, tglPembayaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Pengeluaran *</label>
                <select
                  value={payForm.metode}
                  onChange={(e) => setPayForm({ ...payForm, metode: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="TUNAI">TUNAI (Kas Tunai Pesantren)</option>
                  <option value="TRANSFER">TRANSFER (Rekening Bank Pesantren)</option>
                  <option value="LAINNYA">LAINNYA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  No. Bukti / Referensi Transfer {payForm.metode === 'TRANSFER' ? '*' : '(Opsional)'}
                </label>
                <input
                  type="text"
                  required={payForm.metode === 'TRANSFER'}
                  value={payForm.referensi}
                  onChange={(e) => setPayForm({ ...payForm, referensi: e.target.value })}
                  placeholder={payForm.metode === 'TRANSFER' ? 'Contoh: TRF-BSI-9921008 (Wajib)' : 'Nomor kuitansi toko jika ada'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={payForm.keterangan}
                  onChange={(e) => setPayForm({ ...payForm, keterangan: e.target.value })}
                  placeholder="Catatan belanja"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayModal(null)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-xs"
                >
                  Konfirmasi Pembayaran Kas (LUNAS)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
