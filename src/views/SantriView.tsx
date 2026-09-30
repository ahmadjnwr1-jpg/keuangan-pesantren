import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ArrowUpDown, 
  Edit3, 
  Calendar, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  GraduationCap,
  Sparkles,
  ChevronRight,
  X,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  FileSpreadsheet,
  UploadCloud,
  Download
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { SantriRow } from '../types/database';
import { ExcelTemplateService } from '../services/excelTemplateService';
import { ExcelImportModal } from '../components/ExcelImportModal';

export const SantriView: React.FC = () => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const activeYear = state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF');

  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('AKTIF');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showMoveModal, setShowMoveModal] = useState<SantriRow | null>(null);
  const [showMassPromotionModal, setShowMassPromotionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<SantriRow | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [forceDelete, setForceDelete] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState<SantriRow | null>(null);
  const [editForm, setEditForm] = useState<Partial<SantriRow>>({});

  // Form State for Add Santri
  const [formData, setFormData] = useState({
    NIS: '',
    NAMA_LENGKAP: '',
    NISN: '',
    NIK: '',
    TEMPAT_LAHIR: '',
    TANGGAL_LAHIR: '',
    JENIS_KELAMIN: 'L',
    ID_JENJANG: state.JENJANG[0]?.ID_JENJANG || '',
    ID_KELAS: state.KELAS[0]?.ID_KELAS || '',
    STATUS: 'AKTIF' as const,
    ALAMAT: '',
    NO_TELEPON_AYAH: '',
    NO_TELEPON_IBU: '',
    NO_TELEPON_WALI: '',
    NAMA_AYAH_KANDUNG: '',
    NAMA_IBU_KANDUNG: '',
    NAMA_WALI: '',
    KEBUTUHAN_KHUSUS: 'Tidak Ada',
    DISABILITAS: 'Tidak Ada',
    NOMOR_KIP_PIP: '',
    TANGGAL_MASUK: db.formatDateOnly(),
    KETERANGAN: ''
  });

  // Pindah Kelas State
  const [moveJenjang, setMoveJenjang] = useState('');
  const [moveKelas, setMoveKelas] = useState('');

  // Mass Promotion State
  const [targetYear, setTargetYear] = useState(activeYear?.ID_TAHUN_AJARAN || '');
  const [promotionMappings, setPromotionMappings] = useState<Array<{ idKelasAsal: string; idJenjangTujuan: string; idKelasTujuan: string }>>([
    {
      idKelasAsal: state.KELAS[0]?.ID_KELAS || '',
      idJenjangTujuan: state.JENJANG[0]?.ID_JENJANG || '',
      idKelasTujuan: state.KELAS[1]?.ID_KELAS || ''
    }
  ]);

  const filteredSantri = state.SANTRI.filter(s => {
    if (filterStatus && s.STATUS !== filterStatus) return false;
    if (filterKelas && s.ID_KELAS !== filterKelas) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.NAMA_LENGKAP.toLowerCase().includes(q) ||
        s.NIS.toLowerCase().includes(q) ||
        (s.NISN && s.NISN.toLowerCase().includes(q)) ||
        (s.NAMA_WALI && s.NAMA_WALI.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addSantri(formData);
      setShowAddModal(false);
      alert('Santri berhasil didaftarkan ke sistem dan riwayat kelas telah dibuat!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    try {
      db.updateSantri(showEditModal.ID_SANTRI, editForm);
      setShowEditModal(null);
      alert('Data santri berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMoveModal) return;
    try {
      db.pindahKelasSantri(showMoveModal.ID_SANTRI, moveJenjang, moveKelas);
      setShowMoveModal(null);
      alert(`Santri ${showMoveModal.NAMA_LENGKAP} berhasil dipindahkan ke kelas baru!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeleteModal) return;
    try {
      const res = db.deleteSantri(showDeleteModal.ID_SANTRI, deleteReason, forceDelete);
      setShowDeleteModal(null);
      setDeleteReason('');
      setForceDelete(false);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetStatusNonaktif = (statusTarget: 'KELUAR' | 'NONAKTIF') => {
    if (!showDeleteModal) return;
    try {
      db.updateSantri(showDeleteModal.ID_SANTRI, { STATUS: statusTarget });
      setShowDeleteModal(null);
      alert(`Status santri ${showDeleteModal.NAMA_LENGKAP} berhasil diubah menjadi ${statusTarget}. Data keuangan dan riwayat tetap tersimpan aman.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMassPromotion = () => {
    try {
      const res = db.executeMassPromotion(promotionMappings, targetYear);
      setShowMassPromotionModal(false);
      alert(`Kenaikan kelas massal selesai!\n${res.processedCount} santri berhasil dinaikkan kelasnya.\n${res.skippedCount} santri dilewati (karena sudah memiliki riwayat).`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manajemen Data Santri & Rombel</h2>
          <p className="text-xs text-slate-500">
            Total {state.SANTRI.length} santri terdaftar • Tahun Ajaran Aktif: {activeYear?.NAMA_TAHUN_AJARAN}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExcelTemplateService.exportTemplate('SANTRI')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            title="Download Template Format Excel untuk Input Data Santri"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export Template</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Import Data Santri dari File Excel / CSV"
          >
            <UploadCloud className="w-4 h-4 text-emerald-700" />
            <span>Import Template</span>
          </button>

          <button
            onClick={() => setShowMassPromotionModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>Kenaikan Kelas</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri</span>
          </button>
        </div>
      </div>

      {/* Toast Notification if any */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage('')}
            className="p-1 hover:bg-emerald-100 rounded text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Nama Santri / NIS / Wali..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white transition"
          />
        </div>

        <div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white transition"
          >
            <option value="">Semua Kelas</option>
            {state.KELAS.map(k => (
              <option key={k.ID_KELAS} value={k.ID_KELAS}>
                {k.KODE_KELAS} - {k.NAMA_KELAS}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white transition"
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Status: AKTIF</option>
            <option value="LULUS">Status: LULUS</option>
            <option value="KELUAR">Status: KELUAR</option>
            <option value="NONAKTIF">Status: NONAKTIF</option>
          </select>
        </div>
      </div>

      {/* Santri Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NIS & Identitas</th>
                <th className="py-3 px-4">Jenjang & Kelas</th>
                <th className="py-3 px-4">Wali Santri / Kontak</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada santri yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredSantri.map(s => {
                  const jenjang = state.JENJANG.find(j => j.ID_JENJANG === s.ID_JENJANG);
                  const kelas = state.KELAS.find(k => k.ID_KELAS === s.ID_KELAS);
                  const history = state.RIWAYAT_KELAS.filter(r => r.ID_SANTRI === s.ID_SANTRI);

                  return (
                    <tr key={s.ID_SANTRI} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{s.NAMA_LENGKAP}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NIS: <span className="font-bold text-slate-700">{s.NIS}</span>
                          {s.NISN && ` • NISN: ${s.NISN}`}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{s.TEMPAT_LAHIR || '-'}, {s.TANGGAL_LAHIR || '-'}</span>
                          <span>• ({s.JENIS_KELAMIN === 'L' ? 'Laki-laki' : 'Perempuan'})</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold">
                          {kelas?.NAMA_KELAS || s.ID_KELAS}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {jenjang?.NAMA_JENJANG || s.ID_JENJANG}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Riwayat Kelas: {history.length} periode
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        <div className="font-semibold text-slate-800">
                          {s.NAMA_WALI || s.NAMA_AYAH_KANDUNG || s.NAMA_IBU_KANDUNG || '-'}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono">{s.NO_TELEPON_WALI || s.NO_TELEPON_AYAH || '-'}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] truncate max-w-xs mt-0.5">
                          {s.ALAMAT || 'Alamat belum diisi'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.STATUS === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' :
                          s.STATUS === 'LULUS' ? 'bg-blue-100 text-blue-800' :
                          s.STATUS === 'KELUAR' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {s.STATUS}
                        </span>
                        {s.NOMOR_KIP_PIP && (
                          <div className="text-[10px] text-purple-700 font-semibold mt-1">
                            Penerima PIP
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-1.5">
                          {/* Pindah Kelas */}
                          <button
                            onClick={() => {
                              setShowMoveModal(s);
                              setMoveJenjang(s.ID_JENJANG);
                              setMoveKelas(s.ID_KELAS);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                            title="Pindah Rombel / Kelas"
                          >
                            Pindah
                          </button>

                          {/* Edit Data */}
                          <button
                            onClick={() => {
                              setShowEditModal(s);
                              setEditForm({
                                NAMA_LENGKAP: s.NAMA_LENGKAP,
                                NIS: s.NIS,
                                NISN: s.NISN || '',
                                NIK: s.NIK || '',
                                STATUS: s.STATUS,
                                NAMA_WALI: s.NAMA_WALI || '',
                                NO_TELEPON_WALI: s.NO_TELEPON_WALI || '',
                                ALAMAT: s.ALAMAT || '',
                                NOMOR_KIP_PIP: s.NOMOR_KIP_PIP || ''
                              });
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                            title="Edit Data Santri"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Hapus Santri */}
                          <button
                            onClick={() => {
                              const sum = db.getSantriTransactionSummary(s.ID_SANTRI);
                              setShowDeleteModal(s);
                              setDeleteReason('Penghapusan data santri');
                              setForceDelete(!sum.hasFinancialHistory);
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            title="Hapus Data Santri"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
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

      {/* Modal Hapus Santri */}
      {showDeleteModal && (() => {
        const summary = db.getSantriTransactionSummary(showDeleteModal.ID_SANTRI);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-rose-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                  <h3 className="font-bold text-sm sm:text-base">Konfirmasi Hapus Data Santri</h3>
                </div>
                <button onClick={() => setShowDeleteModal(null)} className="p-1 hover:text-rose-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeleteSubmit} className="p-6 space-y-4 text-xs">
                
                {/* Santri Card */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{showDeleteModal.NAMA_LENGKAP}</div>
                  <div className="text-slate-500 font-mono mt-0.5">NIS: {showDeleteModal.NIS}</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Status Saat Ini: <strong className="text-slate-800">{showDeleteModal.STATUS}</strong>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Rombel Kelas & Tahun Ajaran TIDAK AKAN HILANG dan tetap tersimpan utuh untuk santri lainnya.</span>
                  </div>
                </div>

                {/* Financial Status Checker */}
                <div className="p-3.5 bg-slate-100 rounded-xl space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Catatan Keuangan Santri:</span>
                    <span className="font-mono text-[11px]">{summary.billCount} Tagihan • {summary.paymentCount} Pembayaran</span>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span>Total Tagihan Diterbitkan:</span>
                    <span className="font-mono font-semibold">Rp {summary.totalBills.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-emerald-800 font-bold flex justify-between">
                    <span>Total Pembayaran Masuk Kas:</span>
                    <span className="font-mono">Rp {summary.totalPayments.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* If student has payment history: Protect Single Source of Truth */}
                {summary.hasFinancialHistory ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Perhatian Integritas Pembukuan Kas:</span>
                      </div>
                      Santri ini telah memiliki <strong>{summary.paymentCount} transaksi kas sah</strong>. Menghapus data santri berbayar secara permanen akan memengaruhi pembukuan kas.
                      <div className="mt-2 font-semibold">
                        Solusi Direkomendasikan: Ubah status santri menjadi <strong>KELUAR</strong> atau <strong>NONAKTIF</strong> agar data kas tetap utuh.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetStatusNonaktif('KELUAR')}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition text-xs cursor-pointer text-center"
                      >
                        Ubah Status Jadi "KELUAR"
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatusNonaktif('NONAKTIF')}
                        className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition text-xs cursor-pointer text-center"
                      >
                        Ubah Status Jadi "NONAKTIF"
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={forceDelete}
                          onChange={(e) => setForceDelete(e.target.checked)}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-[11px] text-slate-600">
                          Saya mengonfirmasi ingin menghapus permanen santri ini beserta tagihan/pembayarannya (Khusus data salah input / testing).
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                    Santri ini belum memiliki riwayat pembayaran kas masuk, sehingga aman untuk dihapus permanen.
                  </div>
                )}

                {/* Reason Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alasan Penghapusan {summary.hasFinancialHistory ? '*' : '(Wajib dicatat di Audit Log)'}
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Contoh: Kesalahan pendaftaran ganda / data uji coba awal..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-rose-600 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={summary.hasFinancialHistory && !forceDelete}
                    className="px-5 py-2 bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold hover:bg-rose-800 shadow-xs"
                  >
                    Hapus Santri Permanen
                  </button>
                </div>

              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal Edit Santri */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base">Edit Data Santri</h3>
              <button onClick={() => setShowEditModal(null)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={editForm.NIS || ''}
                    onChange={(e) => setEditForm({ ...editForm, NIS: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Santri</label>
                  <select
                    value={editForm.STATUS || 'AKTIF'}
                    onChange={(e) => setEditForm({ ...editForm, STATUS: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="LULUS">LULUS</option>
                    <option value="KELUAR">KELUAR</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
                <input
                  type="text"
                  required
                  value={editForm.NAMA_LENGKAP || ''}
                  onChange={(e) => setEditForm({ ...editForm, NAMA_LENGKAP: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Wali Santri</label>
                  <input
                    type="text"
                    value={editForm.NAMA_WALI || ''}
                    onChange={(e) => setEditForm({ ...editForm, NAMA_WALI: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    value={editForm.NO_TELEPON_WALI || ''}
                    onChange={(e) => setEditForm({ ...editForm, NO_TELEPON_WALI: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Domisili</label>
                <textarea
                  rows={2}
                  value={editForm.ALAMAT || ''}
                  onChange={(e) => setEditForm({ ...editForm, ALAMAT: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Santri Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white">
              <h3 className="font-bold text-sm sm:text-base">Pendaftaran Santri Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Induk Santri (NIS) *</label>
                  <input
                    type="text"
                    required
                    value={formData.NIS}
                    onChange={(e) => setFormData({ ...formData, NIS: e.target.value })}
                    placeholder="Contoh: 202607005"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
                  <input
                    type="text"
                    required
                    value={formData.NAMA_LENGKAP}
                    onChange={(e) => setFormData({ ...formData, NAMA_LENGKAP: e.target.value })}
                    placeholder="Nama lengkap santri"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={formData.NISN}
                    onChange={(e) => setFormData({ ...formData, NISN: e.target.value })}
                    placeholder="NISN Kemdikbud/Kemenag"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK</label>
                  <input
                    type="text"
                    value={formData.NIK}
                    onChange={(e) => setFormData({ ...formData, NIK: e.target.value })}
                    placeholder="NIK Kependudukan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.JENIS_KELAMIN}
                    onChange={(e) => setFormData({ ...formData, JENIS_KELAMIN: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  >
                    <option value="L">Laki-laki (Putra)</option>
                    <option value="P">Perempuan (Putri)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenjang Pendidikan *</label>
                  <select
                    value={formData.ID_JENJANG}
                    onChange={(e) => {
                      const jId = e.target.value;
                      const validKelas = state.KELAS.filter(k => k.ID_JENJANG === jId);
                      setFormData({ 
                        ...formData, 
                        ID_JENJANG: jId,
                        ID_KELAS: validKelas[0]?.ID_KELAS || ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-medium"
                  >
                    {state.JENJANG.map(j => (
                      <option key={j.ID_JENJANG} value={j.ID_JENJANG}>{j.NAMA_JENJANG}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel / Kelas Masuk *</label>
                  <select
                    value={formData.ID_KELAS}
                    onChange={(e) => setFormData({ ...formData, ID_KELAS: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-medium"
                  >
                    {state.KELAS
                      .filter(k => k.ID_JENJANG === formData.ID_JENJANG)
                      .map(k => (
                        <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.TEMPAT_LAHIR}
                    onChange={(e) => setFormData({ ...formData, TEMPAT_LAHIR: e.target.value })}
                    placeholder="Kota kelahiran"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.TANGGAL_LAHIR}
                    onChange={(e) => setFormData({ ...formData, TANGGAL_LAHIR: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={formData.ALAMAT}
                  onChange={(e) => setFormData({ ...formData, ALAMAT: e.target.value })}
                  placeholder="Kampung/Desa, RT/RW, Kecamatan, Kabupaten/Kota"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.NAMA_WALI}
                    onChange={(e) => setFormData({ ...formData, NAMA_WALI: e.target.value, NAMA_AYAH_KANDUNG: e.target.value })}
                    placeholder="Nama orang tua atau wali santri"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / HP Wali *</label>
                  <input
                    type="text"
                    required
                    value={formData.NO_TELEPON_WALI}
                    onChange={(e) => setFormData({ ...formData, NO_TELEPON_WALI: e.target.value, NO_TELEPON_AYAH: e.target.value })}
                    placeholder="08xxxxxxxxxx (untuk kwitansi WhatsApp)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition cursor-pointer"
                >
                  Simpan Santri Baru
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Pindah Kelas Individual */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Pindah Kelas Santri</h3>
              <button onClick={() => setShowMoveModal(null)} className="p-1 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMoveSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{showMoveModal.NAMA_LENGKAP}</div>
                <div className="text-slate-500 font-mono">NIS: {showMoveModal.NIS}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenjang Tujuan</label>
                <select
                  value={moveJenjang}
                  onChange={(e) => {
                    const jId = e.target.value;
                    setMoveJenjang(jId);
                    const validK = state.KELAS.filter(k => k.ID_JENJANG === jId);
                    setMoveKelas(validK[0]?.ID_KELAS || '');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.JENJANG.map(j => (
                    <option key={j.ID_JENJANG} value={j.ID_JENJANG}>{j.NAMA_JENJANG}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelas Tujuan</label>
                <select
                  value={moveKelas}
                  onChange={(e) => setMoveKelas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.KELAS
                    .filter(k => k.ID_JENJANG === moveJenjang)
                    .map(k => (
                      <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(null)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Pindahkan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kenaikan Kelas Massal */}
      {showMassPromotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Kenaikan Kelas Massal Santri</h3>
                <p className="text-xs text-emerald-200">Pemetaan kelas dan update riwayat tahun ajaran baru</p>
              </div>
              <button onClick={() => setShowMassPromotionModal(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran Tujuan Kenaikan Kelas</label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {state.TAHUN_AJARAN.map(t => (
                    <option key={t.ID_TAHUN_AJARAN} value={t.ID_TAHUN_AJARAN}>
                      {t.NAMA_TAHUN_AJARAN} ({t.STATUS})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="font-bold text-slate-900">Pemetaan Kelas Asal &rarr; Kelas Tujuan</div>
                {promotionMappings.map((m, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="w-full sm:w-1/2">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Dari Kelas Asal:</span>
                      <select
                        value={m.idKelasAsal}
                        onChange={(e) => {
                          const updated = [...promotionMappings];
                          updated[idx].idKelasAsal = e.target.value;
                          setPromotionMappings(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {state.KELAS.map(k => (
                          <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
                        ))}
                      </select>
                    </div>

                    <div className="hidden sm:block text-slate-400 font-bold">&rarr;</div>

                    <div className="w-full sm:w-1/2">
                      <span className="text-[10px] text-slate-500 block mb-0.5">Ke Kelas Tujuan:</span>
                      <select
                        value={m.idKelasTujuan}
                        onChange={(e) => {
                          const updated = [...promotionMappings];
                          updated[idx].idKelasTujuan = e.target.value;
                          const foundK = state.KELAS.find(k => k.ID_KELAS === e.target.value);
                          if (foundK) updated[idx].idJenjangTujuan = foundK.ID_JENJANG;
                          setPromotionMappings(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {state.KELAS.map(k => (
                          <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Ketentuan Blueprint:</strong> Santri yang sudah memiliki riwayat di Tahun Ajaran target akan dilewati secara otomatis (Duplicate Prevention).
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMassPromotionModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleMassPromotion}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Eksekusi Kenaikan Massal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal for Santri */}
      <ExcelImportModal
        type="SANTRI"
        title="Import Data Santri via Template Excel"
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(msg) => setToastMessage(msg)}
      />

    </div>
  );
};
