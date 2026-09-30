import React, { useState } from 'react';
import { 
  FolderTree, 
  CalendarDays, 
  GraduationCap, 
  Layers, 
  Receipt, 
  DollarSign, 
  Tags, 
  Plus, 
  CheckCircle2, 
  X,
  Sparkles,
  Edit3,
  Trash2,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  UploadCloud,
  Download
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { 
  TahunAjaranRow, 
  TarifTagihanRow, 
  KelasRow, 
  JenjangRow, 
  JenisTagihanRow, 
  KategoriPengeluaranRow 
} from '../types/database';
import { ExcelTemplateService, TemplateType } from '../services/excelTemplateService';
import { ExcelImportModal } from '../components/ExcelImportModal';

export const MasterDataView: React.FC = () => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const [activeTab, setActiveTab] = useState<'TA' | 'JEN' | 'KLS' | 'JTG' | 'TRF' | 'KAT'>('TA');
  const [importModalType, setImportModalType] = useState<TemplateType | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Modals Add
  const [showAddTahunAjaran, setShowAddTahunAjaran] = useState(false);
  const [showAddTarif, setShowAddTarif] = useState(false);
  const [showAddKelas, setShowAddKelas] = useState(false);
  const [showAddJenjang, setShowAddJenjang] = useState(false);
  const [showAddJenisTagihan, setShowAddJenisTagihan] = useState(false);
  const [showAddKategori, setShowAddKategori] = useState(false);

  // Modals Edit
  const [editTahunAjaran, setEditTahunAjaran] = useState<TahunAjaranRow | null>(null);
  const [editTarif, setEditTarif] = useState<TarifTagihanRow | null>(null);
  const [editKelas, setEditKelas] = useState<KelasRow | null>(null);
  const [editJenjang, setEditJenjang] = useState<JenjangRow | null>(null);
  const [editJenisTagihan, setEditJenisTagihan] = useState<JenisTagihanRow | null>(null);
  const [editKategori, setEditKategori] = useState<KategoriPengeluaranRow | null>(null);

  // Modals Delete
  const [deleteTaModal, setDeleteTaModal] = useState<TahunAjaranRow | null>(null);
  const [forceDeleteTa, setForceDeleteTa] = useState(true);
  const [deleteTaClasses, setDeleteTaClasses] = useState(true);
  const [selectedTaClassIds, setSelectedTaClassIds] = useState<string[]>([]);

  const [deleteKelasModal, setDeleteKelasModal] = useState<KelasRow | null>(null);
  const [forceDeleteKelas, setForceDeleteKelas] = useState(false);

  const [deleteJenjangModal, setDeleteJenjangModal] = useState<JenjangRow | null>(null);
  const [forceDeleteJenjang, setForceDeleteJenjang] = useState(false);

  const [deleteJtgModal, setDeleteJtgModal] = useState<JenisTagihanRow | null>(null);
  const [forceDeleteJtg, setForceDeleteJtg] = useState(false);

  const [deleteKategoriModal, setDeleteKategoriModal] = useState<KategoriPengeluaranRow | null>(null);
  const [forceDeleteKat, setForceDeleteKat] = useState(false);

  // Forms State Add
  const [taForm, setTaForm] = useState({
    nama: '',
    tglMulai: '2026-07-15',
    tglSelesai: '2027-06-25',
    keterangan: ''
  });

  const [tarifForm, setTarifForm] = useState({
    idTahunAjaran: state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF')?.ID_TAHUN_AJARAN || '',
    idJenjang: state.JENJANG[0]?.ID_JENJANG || '',
    idKelas: state.KELAS[0]?.ID_KELAS || '',
    idJenisTagihan: state.JENIS_TAGIHAN[0]?.ID_JENIS_TAGIHAN || '',
    nominal: 350000
  });

  const [kelasForm, setKelasForm] = useState({
    idJenjang: state.JENJANG[0]?.ID_JENJANG || '',
    idTahunAjaran: state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF')?.ID_TAHUN_AJARAN || '',
    kodeKelas: '',
    namaKelas: ''
  });

  const [jenjangForm, setJenjangForm] = useState({
    kode: '',
    nama: ''
  });

  const [jtgForm, setJtgForm] = useState({
    kode: '',
    nama: '',
    sifat: 'BERULANG' as 'BERULANG' | 'SEKALI_BAYAR'
  });

  const [kategoriForm, setKategoriForm] = useState({
    kode: '',
    nama: ''
  });

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  // ===============================
  // HANDLERS: TAHUN AJARAN
  // ===============================
  const handleAddTahunAjaran = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addTahunAjaran(taForm.nama, taForm.tglMulai, taForm.tglSelesai, taForm.keterangan);
      setShowAddTahunAjaran(false);
      setTaForm({ nama: '', tglMulai: '2026-07-15', tglSelesai: '2027-06-25', keterangan: '' });
      alert('Tahun Ajaran baru berhasil ditambahkan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditTahunAjaranSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTahunAjaran) return;
    try {
      db.updateTahunAjaran(editTahunAjaran.ID_TAHUN_AJARAN, {
        NAMA_TAHUN_AJARAN: editTahunAjaran.NAMA_TAHUN_AJARAN,
        TANGGAL_MULAI: editTahunAjaran.TANGGAL_MULAI,
        TANGGAL_SELESAI: editTahunAjaran.TANGGAL_SELESAI,
        KETERANGAN: editTahunAjaran.KETERANGAN,
        STATUS: editTahunAjaran.STATUS
      });
      setEditTahunAjaran(null);
      alert('Data Tahun Ajaran berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTahunAjaranSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTaModal) return;
    try {
      const classIds = selectedTaClassIds.length > 0 ? selectedTaClassIds : undefined;
      const res = db.deleteTahunAjaran(deleteTaModal.ID_TAHUN_AJARAN, forceDeleteTa, deleteTaClasses, classIds);
      setDeleteTaModal(null);
      setForceDeleteTa(true);
      setDeleteTaClasses(true);
      setSelectedTaClassIds([]);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===============================
  // HANDLERS: TARIF TAGIHAN
  // ===============================
  const handleAddTarif = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addTarifTagihan(
        tarifForm.idTahunAjaran,
        tarifForm.idJenjang,
        tarifForm.idKelas,
        tarifForm.idJenisTagihan,
        tarifForm.nominal
      );
      setShowAddTarif(false);
      alert('Tarif tagihan baru berhasil disimpan ke dalam matriks!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditTarifSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarif) return;
    try {
      db.updateTarifTagihan(editTarif.ID_TARIF, editTarif.NOMINAL, editTarif.STATUS);
      setEditTarif(null);
      alert('Nominal tarif berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTarif = (t: TarifTagihanRow) => {
    if (!confirm('Hapus tarif patokan ini?')) return;
    try {
      db.deleteTarifTagihan(t.ID_TARIF);
      alert('Tarif berhasil dihapus.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===============================
  // HANDLERS: KELAS
  // ===============================
  const handleAddKelas = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addKelas(kelasForm.idJenjang, kelasForm.kodeKelas, kelasForm.namaKelas, kelasForm.idTahunAjaran);
      setShowAddKelas(false);
      setKelasForm({
        idJenjang: state.JENJANG[0]?.ID_JENJANG || '',
        idTahunAjaran: state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF')?.ID_TAHUN_AJARAN || '',
        kodeKelas: '',
        namaKelas: ''
      });
      alert('Kelas baru berhasil ditambahkan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditKelasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKelas) return;
    try {
      db.updateKelas(
        editKelas.ID_KELAS, 
        editKelas.NAMA_KELAS, 
        editKelas.KODE_KELAS, 
        editKelas.ID_JENJANG, 
        editKelas.ID_TAHUN_AJARAN, 
        editKelas.STATUS
      );
      setEditKelas(null);
      alert('Data kelas berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteKelasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteKelasModal) return;
    try {
      const res = db.deleteKelas(deleteKelasModal.ID_KELAS, forceDeleteKelas);
      setDeleteKelasModal(null);
      setForceDeleteKelas(false);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===============================
  // HANDLERS: JENJANG
  // ===============================
  const handleAddJenjang = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addJenjang(jenjangForm.kode, jenjangForm.nama);
      setShowAddJenjang(false);
      setJenjangForm({ kode: '', nama: '' });
      alert('Jenjang baru berhasil ditambahkan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditJenjangSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJenjang) return;
    try {
      db.updateJenjang(editJenjang.ID_JENJANG, editJenjang.KODE_JENJANG, editJenjang.NAMA_JENJANG, editJenjang.STATUS);
      setEditJenjang(null);
      alert('Data jenjang berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteJenjangSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteJenjangModal) return;
    try {
      const res = db.deleteJenjang(deleteJenjangModal.ID_JENJANG, forceDeleteJenjang);
      setDeleteJenjangModal(null);
      setForceDeleteJenjang(false);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===============================
  // HANDLERS: JENIS TAGIHAN
  // ===============================
  const handleAddJenisTagihan = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addJenisTagihan(jtgForm.kode, jtgForm.nama, jtgForm.sifat);
      setShowAddJenisTagihan(false);
      setJtgForm({ kode: '', nama: '', sifat: 'BERULANG' });
      alert('Jenis tagihan baru berhasil ditambahkan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditJenisTagihanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJenisTagihan) return;
    try {
      db.updateJenisTagihan(
        editJenisTagihan.ID_JENIS_TAGIHAN, 
        editJenisTagihan.KODE_TAGIHAN, 
        editJenisTagihan.NAMA_TAGIHAN, 
        editJenisTagihan.SIFAT, 
        editJenisTagihan.STATUS
      );
      setEditJenisTagihan(null);
      alert('Jenis tagihan berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteJenisTagihanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteJtgModal) return;
    try {
      const res = db.deleteJenisTagihan(deleteJtgModal.ID_JENIS_TAGIHAN, forceDeleteJtg);
      setDeleteJtgModal(null);
      setForceDeleteJtg(false);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===============================
  // HANDLERS: KATEGORI PENGELUARAN
  // ===============================
  const handleAddKategori = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addKategoriPengeluaran(kategoriForm.kode, kategoriForm.nama);
      setShowAddKategori(false);
      setKategoriForm({ kode: '', nama: '' });
      alert('Kategori pengeluaran baru berhasil ditambahkan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditKategoriSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKategori) return;
    try {
      db.updateKategoriPengeluaran(editKategori.ID_KATEGORI, editKategori.KODE_KATEGORI, editKategori.NAMA_KATEGORI, editKategori.STATUS);
      setEditKategori(null);
      alert('Kategori pengeluaran berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteKategoriSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteKategoriModal) return;
    try {
      const res = db.deleteKategoriPengeluaran(deleteKategoriModal.ID_KATEGORI, forceDeleteKat);
      setDeleteKategoriModal(null);
      setForceDeleteKat(false);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Master Data & Pengaturan Terpadu</h2>
          <p className="text-xs text-slate-500">
            Pondasi konfigurasi keuangan pesantren (Tahun Ajaran, Jenjang, Rombel Kelas, Tarif, Jenis Tagihan, & Kategori Pengeluaran)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Koreksi & Hapus Lengkap Aktif</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'TA', label: 'Tahun Ajaran', icon: CalendarDays, count: state.TAHUN_AJARAN.length },
          { id: 'TRF', label: 'Matriks Tarif Tagihan', icon: DollarSign, count: state.TARIF_TAGIHAN.length },
          { id: 'KLS', label: 'Rombongan Belajar (Kelas)', icon: Layers, count: state.KELAS.length },
          { id: 'JEN', label: 'Jenjang Pendidikan', icon: GraduationCap, count: state.JENJANG.length },
          { id: 'JTG', label: 'Jenis Tagihan / Iuran', icon: Receipt, count: state.JENIS_TAGIHAN.length },
          { id: 'KAT', label: 'Kategori Pengeluaran', icon: Tags, count: state.KATEGORI_PENGELUARAN.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-emerald-800 text-white shadow-xs' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
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
            className="p-1 hover:bg-emerald-100 rounded text-emerald-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB: TAHUN AJARAN */}
      {activeTab === 'TA' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">
              Daftar periode kalender akademik pesantren. Tepat satu Tahun Ajaran harus berstatus AKTIF.
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelTemplateService.exportTemplate('TAHUN_AJARAN')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Download Template Format Excel Tahun Ajaran"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Template</span>
              </button>
              <button
                onClick={() => setImportModalType('TAHUN_AJARAN')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Import Data Tahun Ajaran dari Excel"
              >
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Import Template</span>
              </button>
              <button
                onClick={() => setShowAddTahunAjaran(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tahun Ajaran</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Tahun Ajaran</th>
                  <th className="py-3 px-4">Periode Tanggal</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.TAHUN_AJARAN.map(t => (
                  <tr key={t.ID_TAHUN_AJARAN} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{t.NAMA_TAHUN_AJARAN}</span>
                        {t.STATUS === 'AKTIF' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                            Aktif Berjalan
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {t.ID_TAHUN_AJARAN}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {t.TANGGAL_MULAI || '-'} s/d {t.TANGGAL_SELESAI || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{t.KETERANGAN || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                        t.STATUS === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.STATUS}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-1.5">
                        {t.STATUS !== 'AKTIF' && (
                          <button
                            onClick={() => {
                              if (confirm(`Aktifkan Tahun Ajaran ${t.NAMA_TAHUN_AJARAN}?`)) {
                                db.setActiveAcademicYear(t.ID_TAHUN_AJARAN);
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Set Aktif
                          </button>
                        )}

                        <button
                          onClick={() => setEditTahunAjaran(t)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                          title="Edit Tahun Ajaran"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setDeleteTaModal(t);
                            setForceDeleteTa(true);
                            setDeleteTaClasses(true);
                            const ref = db.getTahunAjaranReferenceSummary(t.ID_TAHUN_AJARAN);
                            setSelectedTaClassIds(ref.relatedClasses.map(k => k.ID_KELAS));
                          }}
                          disabled={t.STATUS === 'AKTIF'}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-30 rounded-lg transition cursor-pointer"
                          title={t.STATUS === 'AKTIF' ? 'Tidak dapat menghapus tahun ajaran yang sedang aktif' : 'Hapus Tahun Ajaran'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TARIF TAGIHAN */}
      {activeTab === 'TRF' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">
              Matriks nominal yang menjadi snapshot patokan saat tagihan diterbitkan
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelTemplateService.exportTemplate('TARIF')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Download Template Format Excel Matriks Tarif"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Template</span>
              </button>
              <button
                onClick={() => setImportModalType('TARIF')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Import Data Matriks Tarif dari Excel"
              >
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Import Template</span>
              </button>
              <button
                onClick={() => setShowAddTarif(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tarif Baru</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tahun Ajaran</th>
                  <th className="py-3 px-4">Jenjang & Kelas</th>
                  <th className="py-3 px-4">Jenis Tagihan</th>
                  <th className="py-3 px-4 text-right">Nominal Patokan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.TARIF_TAGIHAN.map(t => {
                  const ta = state.TAHUN_AJARAN.find(a => a.ID_TAHUN_AJARAN === t.ID_TAHUN_AJARAN);
                  const jen = state.JENJANG.find(j => j.ID_JENJANG === t.ID_JENJANG);
                  const kls = state.KELAS.find(k => k.ID_KELAS === t.ID_KELAS);
                  const jtg = state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === t.ID_JENIS_TAGIHAN);

                  return (
                    <tr key={t.ID_TARIF} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {ta?.NAMA_TAHUN_AJARAN || t.ID_TAHUN_AJARAN}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{kls?.NAMA_KELAS || t.ID_KELAS}</div>
                        <div className="text-[10px] text-slate-500">{jen?.NAMA_JENJANG || t.ID_JENJANG}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {jtg?.NAMA_TAGIHAN || t.ID_JENIS_TAGIHAN}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 text-sm">
                        {formatRp(t.NOMINAL)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                          {t.STATUS}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditTarif(t)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                            title="Edit Nominal Tarif"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTarif(t)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                            title="Hapus Tarif"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: KELAS */}
      {activeTab === 'KLS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">
              Daftar rombongan belajar kelas per jenjang dan tahun ajaran
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelTemplateService.exportTemplate('KELAS')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Download Template Format Excel Rombel Kelas"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Template</span>
              </button>
              <button
                onClick={() => setImportModalType('KELAS')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Import Data Kelas dari Excel"
              >
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Import Template</span>
              </button>
              <button
                onClick={() => setShowAddKelas(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelas</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode Kelas</th>
                  <th className="py-3 px-4">Nama Kelas</th>
                  <th className="py-3 px-4">Jenjang</th>
                  <th className="py-3 px-4">Tahun Ajaran Terkait</th>
                  <th className="py-3 px-4">Jumlah Santri</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.KELAS.map(k => {
                  const j = state.JENJANG.find(jen => jen.ID_JENJANG === k.ID_JENJANG);
                  const ta = state.TAHUN_AJARAN.find(t => t.ID_TAHUN_AJARAN === k.ID_TAHUN_AJARAN);
                  const count = state.SANTRI.filter(s => s.ID_KELAS === k.ID_KELAS && s.STATUS === 'AKTIF').length;
                  return (
                    <tr key={k.ID_KELAS} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{k.KODE_KELAS}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{k.NAMA_KELAS}</td>
                      <td className="py-3 px-4 text-slate-600">{j?.NAMA_JENJANG || k.ID_JENJANG}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {ta ? (
                          <span className="font-semibold text-emerald-800">{ta.NAMA_TAHUN_AJARAN}</span>
                        ) : (
                          <span className="text-slate-400 italic">Semua Tahun</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-800">{count} Santri Aktif</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                          {k.STATUS}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditKelas(k)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                            title="Edit Kelas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteKelasModal(k);
                              setForceDeleteKelas(false);
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: JENJANG */}
      {activeTab === 'JEN' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">
              Jenjang pendidikan formal / pesantren (MTs, MA, Salafiyah, dll.)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelTemplateService.exportTemplate('JENJANG')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Download Template Format Excel Jenjang"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Template</span>
              </button>
              <button
                onClick={() => setImportModalType('JENJANG')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Import Data Jenjang dari Excel"
              >
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Import Template</span>
              </button>
              <button
                onClick={() => setShowAddJenjang(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jenjang</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.JENJANG.map(j => {
              const kelasCount = state.KELAS.filter(k => k.ID_JENJANG === j.ID_JENJANG).length;
              return (
                <div key={j.ID_JENJANG} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      {j.KODE_JENJANG}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{j.NAMA_JENJANG}</h4>
                    <p className="text-[11px] text-slate-500">{kelasCount} Kelas Terdaftar</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {j.STATUS}
                    </span>
                    <button
                      onClick={() => setEditJenjang(j)}
                      className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                      title="Edit Jenjang"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteJenjangModal(j);
                        setForceDeleteJenjang(false);
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                      title="Hapus Jenjang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: JENIS TAGIHAN */}
      {activeTab === 'JTG' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">
              Kategori pos penerimaan santri (SPP Bulanan, Daftar Ulang, Makan, dll.)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelTemplateService.exportTemplate('JENIS_TAGIHAN')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Download Template Format Excel Jenis Tagihan"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Template</span>
              </button>
              <button
                onClick={() => setImportModalType('JENIS_TAGIHAN')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Import Data Jenis Tagihan dari Excel"
              >
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Import Template</span>
              </button>
              <button
                onClick={() => setShowAddJenisTagihan(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jenis Tagihan</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Tagihan</th>
                  <th className="py-3 px-4">Sifat Penagihan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.JENIS_TAGIHAN.map(j => (
                  <tr key={j.ID_JENIS_TAGIHAN} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{j.KODE_TAGIHAN}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{j.NAMA_TAGIHAN}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        j.SIFAT === 'BERULANG' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {j.SIFAT === 'BERULANG' ? 'Berulang Bulanan (Syahriah)' : 'Sekali Bayar (Insidental)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        {j.STATUS}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditJenisTagihan(j)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                          title="Edit Jenis Tagihan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteJtgModal(j);
                            setForceDeleteJtg(false);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                          title="Hapus Jenis Tagihan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: KATEGORI PENGELUARAN */}
      {activeTab === 'KAT' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">
              Kategori pos pengeluaran operasional dan pemeliharaan pesantren
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelTemplateService.exportTemplate('KATEGORI_PENGELUARAN')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Download Template Format Excel Kategori Pengeluaran"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Export Template</span>
              </button>
              <button
                onClick={() => setImportModalType('KATEGORI_PENGELUARAN')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Import Data Kategori Pengeluaran dari Excel"
              >
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Import Template</span>
              </button>
              <button
                onClick={() => setShowAddKategori(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode Kategori</th>
                  <th className="py-3 px-4">Nama Kategori</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.KATEGORI_PENGELUARAN.map(k => (
                  <tr key={k.ID_KATEGORI} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{k.KODE_KATEGORI}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{k.NAMA_KATEGORI}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        {k.STATUS}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditKategori(k)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition cursor-pointer"
                          title="Edit Kategori"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteKategoriModal(k);
                            setForceDeleteKat(false);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODALS: ADD */}
      {/* ==================================================== */}

      {/* Modal Tambah Tahun Ajaran */}
      {showAddTahunAjaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Tahun Ajaran Baru</h3>
              <button onClick={() => setShowAddTahunAjaran(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTahunAjaran} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tahun Ajaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2027/2028"
                  value={taForm.nama}
                  onChange={(e) => setTaForm({ ...taForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={taForm.tglMulai}
                    onChange={(e) => setTaForm({ ...taForm, tglMulai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={taForm.tglSelesai}
                    onChange={(e) => setTaForm({ ...taForm, tglSelesai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  placeholder="Keterangan tambahan"
                  value={taForm.keterangan}
                  onChange={(e) => setTaForm({ ...taForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTahunAjaran(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Tahun Ajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Kelas */}
      {showAddKelas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Rombel Kelas Baru</h3>
              <button onClick={() => setShowAddKelas(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddKelas} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenjang Pendidikan *</label>
                <select
                  value={kelasForm.idJenjang}
                  onChange={(e) => setKelasForm({ ...kelasForm, idJenjang: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.JENJANG.map(j => (
                    <option key={j.ID_JENJANG} value={j.ID_JENJANG}>{j.NAMA_JENJANG} ({j.KODE_JENJANG})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran Terkait (Opsional)</label>
                <select
                  value={kelasForm.idTahunAjaran}
                  onChange={(e) => setKelasForm({ ...kelasForm, idTahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Semua Tahun Ajaran (Umum)</option>
                  {state.TAHUN_AJARAN.map(t => (
                    <option key={t.ID_TAHUN_AJARAN} value={t.ID_TAHUN_AJARAN}>
                      {t.NAMA_TAHUN_AJARAN} ({t.STATUS})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Jika dipilih, kelas ini akan otomatis ikut terhapus saat Tahun Ajaran tersebut dihapus bersih.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 7A, 10-IPA"
                  value={kelasForm.kodeKelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, kodeKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 7A (Putra)"
                  value={kelasForm.namaKelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, namaKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddKelas(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Tarif Baru */}
      {showAddTarif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Tarif Tagihan Baru</h3>
              <button onClick={() => setShowAddTarif(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTarif} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                <select
                  value={tarifForm.idTahunAjaran}
                  onChange={(e) => setTarifForm({ ...tarifForm, idTahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.TAHUN_AJARAN.map(t => (
                    <option key={t.ID_TAHUN_AJARAN} value={t.ID_TAHUN_AJARAN}>{t.NAMA_TAHUN_AJARAN} ({t.STATUS})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenjang Pendidikan</label>
                <select
                  value={tarifForm.idJenjang}
                  onChange={(e) => {
                    const jId = e.target.value;
                    const validK = state.KELAS.filter(k => k.ID_JENJANG === jId);
                    setTarifForm({
                      ...tarifForm,
                      idJenjang: jId,
                      idKelas: validK[0]?.ID_KELAS || ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.JENJANG.map(j => (
                    <option key={j.ID_JENJANG} value={j.ID_JENJANG}>{j.NAMA_JENJANG}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelas Sasaran</label>
                <select
                  value={tarifForm.idKelas}
                  onChange={(e) => setTarifForm({ ...tarifForm, idKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.KELAS
                    .filter(k => k.ID_JENJANG === tarifForm.idJenjang)
                    .map(k => (
                      <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Tagihan</label>
                <select
                  value={tarifForm.idJenisTagihan}
                  onChange={(e) => setTarifForm({ ...tarifForm, idJenisTagihan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.JENIS_TAGIHAN.map(j => (
                    <option key={j.ID_JENIS_TAGIHAN} value={j.ID_JENIS_TAGIHAN}>{j.NAMA_TAGIHAN} ({j.SIFAT})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Patokan (Rp)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={tarifForm.nominal}
                  onChange={(e) => setTarifForm({ ...tarifForm, nominal: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-emerald-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTarif(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Jenjang */}
      {showAddJenjang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Jenjang Pendidikan</h3>
              <button onClick={() => setShowAddJenjang(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddJenjang} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Jenjang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MTS, MA, SMK"
                  value={jenjangForm.kode}
                  onChange={(e) => setJenjangForm({ ...jenjangForm, kode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Jenjang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Madrasah Tsanawiyah"
                  value={jenjangForm.nama}
                  onChange={(e) => setJenjangForm({ ...jenjangForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJenjang(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Jenjang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Jenis Tagihan */}
      {showAddJenisTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Jenis Tagihan / Iuran</h3>
              <button onClick={() => setShowAddJenisTagihan(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddJenisTagihan} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Tagihan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SPP, DU, ASRAMA"
                  value={jtgForm.kode}
                  onChange={(e) => setJtgForm({ ...jtgForm, kode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tagihan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iuran Syahriah / SPP Bulanan"
                  value={jtgForm.nama}
                  onChange={(e) => setJtgForm({ ...jtgForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sifat Penagihan *</label>
                <select
                  value={jtgForm.sifat}
                  onChange={(e) => setJtgForm({ ...jtgForm, sifat: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="BERULANG">Berulang Bulanan (Syahriah)</option>
                  <option value="SEKALI_BAYAR">Sekali Bayar (Insidental / Tahunan)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJenisTagihan(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {showAddKategori && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Tambah Kategori Pengeluaran</h3>
              <button onClick={() => setShowAddKategori(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddKategori} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: OPS, GAJI, SARPRAS"
                  value={kategoriForm.kode}
                  onChange={(e) => setKategoriForm({ ...kategoriForm, kode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Operasional Santri & Dapur"
                  value={kategoriForm.nama}
                  onChange={(e) => setKategoriForm({ ...kategoriForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddKategori(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODALS: EDIT */}
      {/* ==================================================== */}

      {/* Modal Edit Tahun Ajaran */}
      {editTahunAjaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Data Tahun Ajaran</h3>
              <button onClick={() => setEditTahunAjaran(null)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTahunAjaranSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  value={editTahunAjaran.NAMA_TAHUN_AJARAN}
                  onChange={(e) => setEditTahunAjaran({ ...editTahunAjaran, NAMA_TAHUN_AJARAN: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={editTahunAjaran.TANGGAL_MULAI}
                    onChange={(e) => setEditTahunAjaran({ ...editTahunAjaran, TANGGAL_MULAI: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={editTahunAjaran.TANGGAL_SELESAI}
                    onChange={(e) => setEditTahunAjaran({ ...editTahunAjaran, TANGGAL_SELESAI: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editTahunAjaran.STATUS}
                  onChange={(e) => setEditTahunAjaran({ ...editTahunAjaran, STATUS: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={editTahunAjaran.KETERANGAN || ''}
                  onChange={(e) => setEditTahunAjaran({ ...editTahunAjaran, KETERANGAN: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditTahunAjaran(null)}
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

      {/* Modal Edit Tarif */}
      {editTarif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Nominal Tarif</h3>
              <button onClick={() => setEditTarif(null)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTarifSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Tarif (Rp)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={editTarif.NOMINAL}
                  onChange={(e) => setEditTarif({ ...editTarif, NOMINAL: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editTarif.STATUS}
                  onChange={(e) => setEditTarif({ ...editTarif, STATUS: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditTarif(null)}
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

      {/* Modal Edit Kelas */}
      {editKelas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Data Rombel Kelas</h3>
              <button onClick={() => setEditKelas(null)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditKelasSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Kelas</label>
                <input
                  type="text"
                  required
                  value={editKelas.KODE_KELAS}
                  onChange={(e) => setEditKelas({ ...editKelas, KODE_KELAS: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={editKelas.NAMA_KELAS}
                  onChange={(e) => setEditKelas({ ...editKelas, NAMA_KELAS: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenjang Pendidikan</label>
                <select
                  value={editKelas.ID_JENJANG}
                  onChange={(e) => setEditKelas({ ...editKelas, ID_JENJANG: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {state.JENJANG.map(j => (
                    <option key={j.ID_JENJANG} value={j.ID_JENJANG}>{j.NAMA_JENJANG}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran Terkait</label>
                <select
                  value={editKelas.ID_TAHUN_AJARAN || ''}
                  onChange={(e) => setEditKelas({ ...editKelas, ID_TAHUN_AJARAN: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Semua Tahun Ajaran (Umum)</option>
                  {state.TAHUN_AJARAN.map(t => (
                    <option key={t.ID_TAHUN_AJARAN} value={t.ID_TAHUN_AJARAN}>
                      {t.NAMA_TAHUN_AJARAN} ({t.STATUS})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editKelas.STATUS}
                  onChange={(e) => setEditKelas({ ...editKelas, STATUS: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditKelas(null)}
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

      {/* Modal Edit Jenjang */}
      {editJenjang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Jenjang Pendidikan</h3>
              <button onClick={() => setEditJenjang(null)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditJenjangSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Jenjang</label>
                <input
                  type="text"
                  required
                  value={editJenjang.KODE_JENJANG}
                  onChange={(e) => setEditJenjang({ ...editJenjang, KODE_JENJANG: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Jenjang</label>
                <input
                  type="text"
                  required
                  value={editJenjang.NAMA_JENJANG}
                  onChange={(e) => setEditJenjang({ ...editJenjang, NAMA_JENJANG: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editJenjang.STATUS}
                  onChange={(e) => setEditJenjang({ ...editJenjang, STATUS: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditJenjang(null)}
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

      {/* Modal Edit Jenis Tagihan */}
      {editJenisTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Jenis Tagihan</h3>
              <button onClick={() => setEditJenisTagihan(null)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditJenisTagihanSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Tagihan</label>
                <input
                  type="text"
                  required
                  value={editJenisTagihan.KODE_TAGIHAN}
                  onChange={(e) => setEditJenisTagihan({ ...editJenisTagihan, KODE_TAGIHAN: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  required
                  value={editJenisTagihan.NAMA_TAGIHAN}
                  onChange={(e) => setEditJenisTagihan({ ...editJenisTagihan, NAMA_TAGIHAN: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sifat Tagihan</label>
                <select
                  value={editJenisTagihan.SIFAT}
                  onChange={(e) => setEditJenisTagihan({ ...editJenisTagihan, SIFAT: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="BERULANG">Berulang Bulanan (Syahriah)</option>
                  <option value="SEKALI_BAYAR">Sekali Bayar (Insidental)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editJenisTagihan.STATUS}
                  onChange={(e) => setEditJenisTagihan({ ...editJenisTagihan, STATUS: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditJenisTagihan(null)}
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

      {/* Modal Edit Kategori */}
      {editKategori && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Kategori Pengeluaran</h3>
              <button onClick={() => setEditKategori(null)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditKategoriSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Kategori</label>
                <input
                  type="text"
                  required
                  value={editKategori.KODE_KATEGORI}
                  onChange={(e) => setEditKategori({ ...editKategori, KODE_KATEGORI: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={editKategori.NAMA_KATEGORI}
                  onChange={(e) => setEditKategori({ ...editKategori, NAMA_KATEGORI: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editKategori.STATUS}
                  onChange={(e) => setEditKategori({ ...editKategori, STATUS: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditKategori(null)}
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

      {/* ==================================================== */}
      {/* MODALS: DELETE */}
      {/* ==================================================== */}

      {/* Modal Hapus Tahun Ajaran (With Cascade Classes Option) */}
      {deleteTaModal && (() => {
        const refSummary = db.getTahunAjaranReferenceSummary(deleteTaModal.ID_TAHUN_AJARAN);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-rose-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                  <h3 className="font-bold text-sm sm:text-base">Konfirmasi Hapus Tahun Ajaran</h3>
                </div>
                <button onClick={() => setDeleteTaModal(null)} className="p-1 hover:text-rose-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeleteTahunAjaranSubmit} className="p-6 space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{deleteTaModal.NAMA_TAHUN_AJARAN}</div>
                  <div className="text-slate-500 font-mono mt-0.5">ID: {deleteTaModal.ID_TAHUN_AJARAN}</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Periode: {deleteTaModal.TANGGAL_MULAI} s/d {deleteTaModal.TANGGAL_SELESAI}
                  </div>
                </div>

                {/* Reference Stats */}
                <div className="p-3.5 bg-slate-100 rounded-xl space-y-1.5">
                  <div className="font-bold text-slate-800">Keterkaitan Data pada Tahun Ajaran Ini:</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>• Tagihan Terbit: <strong>{refSummary.billCount}</strong></div>
                    <div>• Pembayaran Kas: <strong>{refSummary.paymentCount}</strong></div>
                    <div>• Matriks Tarif: <strong>{refSummary.tariffCount}</strong></div>
                    <div>• Riwayat Kelas Santri: <strong>{refSummary.historyCount}</strong></div>
                    <div className="col-span-2 text-emerald-800 font-bold">
                      • Rombel Kelas Terkait: <strong>{refSummary.classCount} Kelas</strong>
                    </div>
                  </div>
                </div>

                {/* Option to Cascade Delete Classes */}
                {refSummary.relatedClasses.length > 0 && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deleteTaClasses}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setDeleteTaClasses(val);
                          if (val) {
                            setSelectedTaClassIds(refSummary.relatedClasses.map(k => k.ID_KELAS));
                          } else {
                            setSelectedTaClassIds([]);
                          }
                        }}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="font-bold text-rose-950">
                          Hapus Otomatis Rombel Kelas Terkait ({refSummary.relatedClasses.length} Kelas)
                        </div>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                          Centang ini agar rombel kelas yang dibuat untuk tahun ajaran ini otomatis ikut terhapus dan tidak tertinggal di master data.
                        </p>
                      </div>
                    </label>

                    {deleteTaClasses && (
                      <div className="pt-1.5 pl-6 space-y-1">
                        <div className="text-[10px] text-slate-500 font-semibold">Kelas yang akan dihapus bersamaan:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {refSummary.relatedClasses.map(k => (
                            <span key={k.ID_KELAS} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-mono text-[10px]">
                              {k.NAMA_KELAS}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {refSummary.hasReferences ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                      <div className="font-bold text-amber-900 mb-0.5">Konfirmasi Bersihkan Seluruh Data Terkait:</div>
                      Tahun ajaran ini memiliki data tarif/tagihan/riwayat. Menghapus akan membersihkan seluruh data tarif, tagihan, dan riwayat yang melekat pada tahun ajaran ini secara otomatis.
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={forceDeleteTa}
                        onChange={(e) => setForceDeleteTa(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-[11px] text-slate-700 font-semibold">
                        Konfirmasi: Saya memahami seluruh riwayat, tarif, dan tagihan tahun ajaran ini akan dibersihkan.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                    Tahun ajaran ini belum memiliki data tarif ataupun riwayat kelas, sehingga dapat dihapus dengan aman.
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDeleteTaModal(null)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={refSummary.hasReferences && !forceDeleteTa}
                    className="px-5 py-2 bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold hover:bg-rose-800 shadow-xs"
                  >
                    Hapus Tahun Ajaran {deleteTaClasses && refSummary.relatedClasses.length > 0 ? '& Kelas Terkait' : ''}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal Hapus Kelas */}
      {deleteKelasModal && (() => {
        const studentCount = state.SANTRI.filter(s => s.ID_KELAS === deleteKelasModal.ID_KELAS && s.STATUS === 'AKTIF').length;
        const tariffCount = state.TARIF_TAGIHAN.filter(t => t.ID_KELAS === deleteKelasModal.ID_KELAS).length;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-rose-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                  <h3 className="font-bold text-sm">Konfirmasi Hapus Kelas</h3>
                </div>
                <button onClick={() => setDeleteKelasModal(null)} className="p-1 hover:text-rose-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeleteKelasSubmit} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{deleteKelasModal.NAMA_KELAS}</div>
                  <div className="text-slate-500 font-mono">Kode: {deleteKelasModal.KODE_KELAS}</div>
                  <div className="text-slate-600 mt-1">
                    Santri Aktif: <strong>{studentCount} Orang</strong> • Tarif Terkait: <strong>{tariffCount} Tarif</strong>
                  </div>
                </div>

                {studentCount > 0 ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                      <div className="font-bold text-amber-900 mb-0.5">Perhatian: Santri Aktif Terdaftar</div>
                      Kelas ini masih dihuni oleh <strong>{studentCount} santri aktif</strong>. Jika dihapus paksa, santri akan dialihkan secara otomatis ke kelas lain yang tersedia agar data santri tidak hilang.
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceDeleteKelas}
                        onChange={(e) => setForceDeleteKelas(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-[11px] text-slate-700 font-semibold">
                        Konfirmasi: Hapus kelas ini dan alihkan santri aktifnya ke kelas lain.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                    Kelas ini tidak memiliki santri aktif dan dapat dihapus dengan aman.
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDeleteKelasModal(null)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={studentCount > 0 && !forceDeleteKelas}
                    className="px-5 py-2 bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold hover:bg-rose-800 shadow-xs"
                  >
                    Hapus Kelas
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal Hapus Jenjang */}
      {deleteJenjangModal && (() => {
        const classes = state.KELAS.filter(k => k.ID_JENJANG === deleteJenjangModal.ID_JENJANG);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-rose-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                  <h3 className="font-bold text-sm">Konfirmasi Hapus Jenjang</h3>
                </div>
                <button onClick={() => setDeleteJenjangModal(null)} className="p-1 hover:text-rose-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeleteJenjangSubmit} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{deleteJenjangModal.NAMA_JENJANG}</div>
                  <div className="text-slate-500 font-mono">Kode: {deleteJenjangModal.KODE_JENJANG}</div>
                  <div className="text-slate-600 mt-1">Kelas Terkait: <strong>{classes.length} Kelas</strong></div>
                </div>

                {classes.length > 0 ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                      Jenjang ini memiliki {classes.length} kelas terdaftar. Hapus bersih akan menghapus jenjang beserta seluruh kelas dan tarif di dalamnya.
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceDeleteJenjang}
                        onChange={(e) => setForceDeleteJenjang(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-[11px] text-slate-700 font-semibold">
                        Konfirmasi: Hapus bersih jenjang beserta kelas terkait.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                    Jenjang ini belum memiliki kelas dan dapat dihapus dengan aman.
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDeleteJenjangModal(null)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={classes.length > 0 && !forceDeleteJenjang}
                    className="px-5 py-2 bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold hover:bg-rose-800 shadow-xs"
                  >
                    Hapus Jenjang
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal Hapus Jenis Tagihan */}
      {deleteJtgModal && (() => {
        const bills = state.TAGIHAN.filter(t => t.ID_JENIS_TAGIHAN === deleteJtgModal.ID_JENIS_TAGIHAN);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-rose-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                  <h3 className="font-bold text-sm">Konfirmasi Hapus Jenis Tagihan</h3>
                </div>
                <button onClick={() => setDeleteJtgModal(null)} className="p-1 hover:text-rose-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeleteJenisTagihanSubmit} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{deleteJtgModal.NAMA_TAGIHAN}</div>
                  <div className="text-slate-500 font-mono">Kode: {deleteJtgModal.KODE_TAGIHAN}</div>
                  <div className="text-slate-600 mt-1">Tagihan Terbit: <strong>{bills.length} Tagihan</strong></div>
                </div>

                {bills.length > 0 ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                      Jenis tagihan ini telah digunakan pada {bills.length} tagihan santri. Hapus bersih akan membatalkan tagihan dan tarif terkait jenis ini.
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceDeleteJtg}
                        onChange={(e) => setForceDeleteJtg(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-[11px] text-slate-700 font-semibold">
                        Konfirmasi: Hapus bersih jenis tagihan ini beserta tagihan terkait.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                    Jenis tagihan ini belum memiliki tagihan terbit dan dapat dihapus dengan aman.
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDeleteJtgModal(null)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={bills.length > 0 && !forceDeleteJtg}
                    className="px-5 py-2 bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold hover:bg-rose-800 shadow-xs"
                  >
                    Hapus Jenis Tagihan
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal Hapus Kategori Pengeluaran */}
      {deleteKategoriModal && (() => {
        const expenses = state.PENGELUARAN.filter(p => p.ID_KATEGORI === deleteKategoriModal.ID_KATEGORI);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-rose-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-300" />
                  <h3 className="font-bold text-sm">Konfirmasi Hapus Kategori Pengeluaran</h3>
                </div>
                <button onClick={() => setDeleteKategoriModal(null)} className="p-1 hover:text-rose-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeleteKategoriSubmit} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm">{deleteKategoriModal.NAMA_KATEGORI}</div>
                  <div className="text-slate-500 font-mono">Kode: {deleteKategoriModal.KODE_KATEGORI}</div>
                  <div className="text-slate-600 mt-1">Data Pengeluaran: <strong>{expenses.length} Transaksi</strong></div>
                </div>

                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] leading-relaxed">
                      Kategori ini memiliki {expenses.length} data transaksi pengeluaran.
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceDeleteKat}
                        onChange={(e) => setForceDeleteKat(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-[11px] text-slate-700 font-semibold">
                        Konfirmasi: Hapus bersih kategori ini beserta transaksinya.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                    Kategori ini belum memiliki pengeluaran dan dapat dihapus dengan aman.
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDeleteKategoriModal(null)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={expenses.length > 0 && !forceDeleteKat}
                    className="px-5 py-2 bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold hover:bg-rose-800 shadow-xs"
                  >
                    Hapus Kategori
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Excel Import Modal for All Master Data Tabs */}
      {importModalType && (
        <ExcelImportModal
          type={importModalType}
          title={`Import Data Master ${
            importModalType === 'TAHUN_AJARAN' ? 'Tahun Ajaran' :
            importModalType === 'JENJANG' ? 'Jenjang Pendidikan' :
            importModalType === 'KELAS' ? 'Rombongan Belajar (Kelas)' :
            importModalType === 'JENIS_TAGIHAN' ? 'Jenis Tagihan / Iuran' :
            importModalType === 'TARIF' ? 'Matriks Tarif Tagihan' :
            'Kategori Pengeluaran'
          } via Excel`}
          isOpen={!!importModalType}
          onClose={() => setImportModalType(null)}
          onSuccess={(msg) => setToastMessage(msg)}
        />
      )}

    </div>
  );
};
