import React, { useState } from 'react';
import { Settings, Building2, Save, RotateCcw, ShieldCheck, CheckCircle2, FileSpreadsheet, Code2, Smartphone, Download, WifiOff } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { GasIntegrationModal } from '../components/GasIntegrationModal';
import { PesantrenLogoSvg } from '../components/PesantrenLogoSvg';

export const PengaturanView: React.FC = () => {
  const db = DbEngine.getInstance();
  const state = db.getState();

  const [showGasModal, setShowGasModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getVal = (key: string, def = '') => {
    const f = state.PENGATURAN.find(p => p.KEY === key);
    return f ? f.NILAI : def;
  };

  const [namaPondok, setNamaPondok] = useState(getVal('NAMA_PONDOK', 'Pondok Pesantren Inayatul Muhajirin'));
  const [namaYayasan, setNamaYayasan] = useState(getVal('NAMA_YAYASAN', 'Yayasan Pendidikan Islam Inayatul Muhajirin'));
  const [alamat, setAlamat] = useState(getVal('ALAMAT_PONDOK', 'Kp. Pasir Salam RT 02/05 Desa Mandalasari, Kec. Cikancung, Kab. Bandung'));
  const [penandatangan, setPenandatangan] = useState(getVal('PENANDATANGAN_KEUANGAN', 'Ranran Siti Nurhasanah, S.Pd, M.Pd'));
  const [jabatan, setJabatan] = useState(getVal('JABATAN_PENANDATANGAN_KEUANGAN', 'Kepala Bidang Keuangan'));
  const [kontak, setKontak] = useState(getVal('NOMOR_KONTAK_PESANTREN', '081223344556'));
  const [rekening, setRekening] = useState(getVal('REKENING_BANK', 'BSI 7182991023 a.n. Pontren Inayatul Muhajirin'));

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.saveSetting('NAMA_PONDOK', namaPondok);
      db.saveSetting('NAMA_YAYASAN', namaYayasan);
      db.saveSetting('ALAMAT_PONDOK', alamat);
      db.saveSetting('PENANDATANGAN_KEUANGAN', penandatangan);
      db.saveSetting('JABATAN_PENANDATANGAN_KEUANGAN', jabatan);
      db.saveSetting('NOMOR_KONTAK_PESANTREN', kontak);
      db.saveSetting('REKENING_BANK', rekening);
      showToast('Pengaturan identitas pesantren & kop surat berhasil disimpan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const executeResetFactory = () => {
    try {
      db.resetToFactory();
      setResetSuccess(true);
      setShowResetModal(false);
      showToast('Database berhasil direset ke setelan awal pabrik.');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      alert('Gagal mereset: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengaturan Identitas Lembaga & Kop Surat</h2>
          <p className="text-xs text-slate-500">
            Konfigurasi nama pondok, yayasan, penandatangan resmi kwitansi, dan rekening penerimaan.
          </p>
        </div>
        <button
          onClick={() => setShowGasModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
          <span>Integrasi Google Apps Script</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner Khusus Google Apps Script & Sheets */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-5 rounded-2xl text-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
            <Code2 className="w-4 h-4" />
            <span>Migrasi & Sinkronisasi ke Google Apps Script (GAS)</span>
          </div>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            Pindahkan aplikasi ini ke akun Google Apps Script Anda dan jadikan Google Spreadsheet sebagai database online (16 sheets: Santri, Tagihan, Pembayaran Kasir, Kas, dll.).
          </p>
        </div>
        <button
          onClick={() => setShowGasModal(true)}
          className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Buka Panduan & Kode GAS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pondok Pesantren *</label>
                <input
                  type="text"
                  required
                  value={namaPondok}
                  onChange={(e) => setNamaPondok(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Yayasan Hukum *</label>
                <input
                  type="text"
                  required
                  value={namaYayasan}
                  onChange={(e) => setNamaYayasan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Pesantren *</label>
              <textarea
                rows={2}
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Penandatangan Kwitansi *</label>
                <input
                  type="text"
                  required
                  value={penandatangan}
                  onChange={(e) => setPenandatangan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan Penandatangan *</label>
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Konfirmasi Pesantren</label>
                <input
                  type="text"
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Informasi Rekening Bank Resmi</label>
                <input
                  type="text"
                  value={rekening}
                  onChange={(e) => setRekening(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>

          </form>
        </div>

        {/* System Operations (1 col) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Pratinjau Kop Surat Resmi</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-1.5 text-xs shadow-2xs">
              <div className="w-16 h-16 rounded-xl bg-white p-0.5 border border-emerald-700/50 mx-auto mb-1.5 flex items-center justify-center shadow-xs overflow-hidden">
                <PesantrenLogoSvg className="w-full h-full object-contain" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{namaYayasan}</div>
              <div className="text-sm font-black text-slate-900">{namaPondok}</div>
              <div className="text-[10px] text-slate-500">{alamat}</div>
              <div className="pt-2 mt-2 border-t border-slate-100 flex justify-center gap-2 text-[10px] text-slate-400">
                <span>{penandatangan}</span>
                <span>•</span>
                <span>{jabatan}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <WifiOff className="w-4 h-4 text-emerald-700" />
              <span>Kemampuan Paten Offline (PWA)</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Aplikasi ini telah dilengkapi Service Worker &amp; Offline Cache. Klik tombol <strong>"Install Offline"</strong> di navbar atas untuk memasang aplikasi ke desktop Windows atau layar utama HP Anda.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block">Pemulihan Sistem Awal:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jika ingin mengatur ulang data kembali seperti baru, gunakan tombol reset berikut.
            </p>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset Database ke Setelan Awal</span>
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Reset to Factory */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Reset Database ke Setelan Awal?</h4>
                <p className="text-[11px] text-slate-500">Pemulihan Data Pabrik (Factory Reset)</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200 text-rose-900">
              <strong>PERINGATAN:</strong> Tindakan ini akan mengembalikan seluruh 16 tabel database pesantren ke data bawaan awal. Seluruh transaksi pembayaran, tagihan, dan pengeluaran baru akan disetel ulang.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeResetFactory}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Integrasi Google Apps Script */}
      <GasIntegrationModal
        isOpen={showGasModal}
        onClose={() => setShowGasModal(false)}
        onSuccess={showToast}
      />

    </div>
  );
};
