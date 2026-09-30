import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  FileSpreadsheet, 
  Code2, 
  Smartphone, 
  Download, 
  WifiOff,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Coins,
  Lock,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
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

  // Modals for Reset
  const [showResetZeroModal, setShowResetZeroModal] = useState(false);
  const [showResetDemoModal, setShowResetDemoModal] = useState(false);
  
  // Reset Options
  const [clearSantri, setClearSantri] = useState(true);
  const [clearKelasDanTarif, setClearKelasDanTarif] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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

  const openResetZeroModal = () => {
    setPasswordInput('');
    setPasswordError('');
    setShowResetZeroModal(true);
  };

  // 1. Reset Total Bersih ke 0 dengan Password Otentikasi Kabid
  const executeResetToZero = () => {
    // Validasi Sandi Keamanan
    if (passwordInput !== '112233') {
      setPasswordError('Sandi otentikasi salah! Masukkan kata sandi Kepala Bidang Keuangan (112233).');
      return;
    }

    try {
      db.resetToZero({ 
        clearSantri: clearSantri, 
        clearKelasDanTarif: clearKelasDanTarif 
      });
      setShowResetZeroModal(false);
      showToast('Berhasil! Seluruh data transaksi, santri, dan kelas telah direset bersih ke 0.');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e: any) {
      alert('Gagal mereset ke 0: ' + e.message);
    }
  };

  // 2. Reset ke Data Bawaan / Contoh Demo
  const executeResetDemo = () => {
    if (passwordInput !== '112233') {
      setPasswordError('Sandi otentikasi salah! Masukkan sandi (112233).');
      return;
    }
    try {
      db.resetToFactory();
      setShowResetDemoModal(false);
      showToast('Database berhasil dipulihkan dengan data contoh bawaan.');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e: any) {
      alert('Gagal mereset: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengaturan Identitas Lembaga &amp; Kop Surat</h2>
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
            <span>Migrasi &amp; Sinkronisasi ke Google Apps Script (GAS)</span>
          </div>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            Pindahkan aplikasi ini ke akun Google Apps Script Anda dan jadikan Google Spreadsheet sebagai database online (16 sheets: Santri, Tagihan, Pembayaran Kasir, Kas, dll.).
          </p>
        </div>
        <button
          onClick={() => setShowGasModal(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          Buka Panduan &amp; Kode GAS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Pengaturan (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-sm text-slate-900">Identitas Pesantren &amp; Penandatangan</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pondok Pesantren</label>
                <input
                  type="text"
                  required
                  value={namaPondok}
                  onChange={(e) => setNamaPondok(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Yayasan</label>
                <input
                  type="text"
                  required
                  value={namaYayasan}
                  onChange={(e) => setNamaYayasan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Lembaga</label>
              <textarea
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pejabat Keuangan (Penandatangan)</label>
                <input
                  type="text"
                  required
                  value={penandatangan}
                  onChange={(e) => setPenandatangan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan Resmi</label>
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Kontak / WhatsApp Pesantren</label>
                <input
                  type="text"
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rekening Resmi Pembayaran</label>
                <input
                  type="text"
                  value={rekening}
                  onChange={(e) => setRekening(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info: Live Kop Surat Preview & Reset Options (1 col) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Pratinjau Kop Kwitansi</h4>
            <div className="p-4 bg-emerald-950/5 border border-emerald-900/10 rounded-2xl text-center space-y-1">
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

          {/* Pengaturan Reset Database */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-rose-700" />
              <span className="font-bold text-slate-900">Pengaturan Reset Database Aman:</span>
            </div>
            
            {/* Opsi 1: Reset Bersih ke Rp 0 */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                <Coins className="w-4 h-4 text-rose-700" />
                <span>Reset Bersih ke 0 (Buku Kas &amp; Santri)</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Menghapus semua transaksi (pembayaran, pengeluaran, tagihan, kas), santri, dan kelas menjadi <strong>0 bersih</strong> dengan otentikasi sandi keamanan.
              </p>
              <button
                type="button"
                onClick={openResetZeroModal}
                className="w-full py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Total ke 0 (Perlu Sandi)</span>
              </button>
            </div>

            {/* Opsi 2: Reset ke Contoh Demo Bawaan */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Reset ke Data Demo Bawaan</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mengisi kembali database dengan data contoh/demo bawaan untuk simulasi.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPasswordInput('');
                  setPasswordError('');
                  setShowResetDemoModal(true);
                }}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                <span>Kembalikan Contoh Demo</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal 1: Konfirmasi Reset Bersih ke Rp 0 Dengan Sandi 112233 */}
      {showResetZeroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Konfirmasi Reset Bersih ke 0</h4>
                <p className="text-[11px] text-slate-500">Otoritas Kepala Bidang Keuangan</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed space-y-1.5">
              <p className="font-bold">Data yang akan dikosongkan ke 0:</p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-800">
                <li>Saldo Kas Pesantren ➔ <strong>Rp 0</strong></li>
                <li>Seluruh Pembayaran &amp; Kwitansi ➔ <strong>Rp 0</strong></li>
                <li>Seluruh Pengeluaran Kas ➔ <strong>Rp 0</strong></li>
                <li>Seluruh Tagihan Siswa ➔ <strong>0 Tagihan</strong></li>
              </ul>
            </div>

            {/* Pilihan Cakupan Data Santri & Kelas */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input 
                  type="checkbox" 
                  checked={clearSantri} 
                  onChange={(e) => setClearSantri(e.target.checked)}
                  className="rounded text-rose-700 focus:ring-rose-600 w-4 h-4 cursor-pointer"
                />
                <span>Kosongkan Seluruh Data Santri (Santri Jadi 0)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input 
                  type="checkbox" 
                  checked={clearKelasDanTarif} 
                  onChange={(e) => setClearKelasDanTarif(e.target.checked)}
                  className="rounded text-rose-700 focus:ring-rose-600 w-4 h-4 cursor-pointer"
                />
                <span>Kosongkan Daftar Kelas &amp; Tarif SPP (Siap Input Baru)</span>
              </label>
            </div>

            {/* Input Sandi Keamanan 112233 */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Masukkan Sandi Otoritas (112233):</span>
                <span className="text-[10px] text-slate-400 font-normal">Sandi Kabid Keuangan</span>
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Ketik 112233 untuk verifikasi"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="p-2 bg-rose-100 text-rose-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetZeroModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeResetToZero}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Konfirmasi Reset ke 0</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Konfirmasi Reset ke Contoh Demo Dengan Sandi 112233 */}
      {showResetDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Kembalikan Data Contoh Demo?</h4>
                <p className="text-[11px] text-slate-500">Memuat sampel data santri &amp; pembayaran demo</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-amber-900">
              Database akan diisi kembali dengan beberapa santri sampel, tarif contoh, dan sampel pembayaran untuk simulasi/pelatihan.
            </p>

            {/* Input Sandi Keamanan 112233 */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Masukkan Sandi Otoritas (112233):</span>
                <span className="text-[10px] text-slate-400 font-normal">Sandi Kabid Keuangan</span>
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Ketik 112233 untuk verifikasi"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="p-2 bg-rose-100 text-rose-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetDemoModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeResetDemo}
                className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Ya, Muat Data Demo
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
