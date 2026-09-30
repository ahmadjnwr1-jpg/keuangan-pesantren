// ============================================================================
// MODAL INTEGRASI GOOGLE APPS SCRIPT & SPREADSHEET
// Memberikan instruksi, salin Code.gs, salin Index.html, dan Uji Sinkronisasi
// ============================================================================

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Code2,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { GasSyncService, GasSyncConfig } from '../services/gasSyncService';

interface GasIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const GasIntegrationModal: React.FC<GasIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'SETUP' | 'CODE_GS' | 'INDEX_HTML' | 'SYNC'>('SETUP');
  const [config, setConfig] = useState<GasSyncConfig>(GasSyncService.getConfig());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string }>({
    loading: false,
  });
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const codeGsContent = GasSyncService.generateCodeGs();
  // Gunakan Shared URL produksi publik agar tidak diblokir oleh autentikasi preview internal
  const sharedUrl = 'https://ais-pre-bdhttgbwfdqelxbpt6twwf-668653354293.asia-east1.run.app';
  const [embedAppUrl, setEmbedAppUrl] = useState(sharedUrl);
  const indexHtmlContent = GasSyncService.generateIndexHtml(embedAppUrl);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSaveConfig = () => {
    const url = (config.webAppUrl || '').trim();
    GasSyncService.saveConfig({ ...config, webAppUrl: url });
    setConfig(GasSyncService.getConfig());
    setActionAlert({
      type: 'success',
      title: 'URL Tersimpan',
      message: 'Konfigurasi URL Google Apps Script berhasil disimpan!'
    });
    onSuccess('Konfigurasi URL Apps Script berhasil disimpan!');
  };

  const handleTestConnection = async () => {
    const url = (config.webAppUrl || '').trim();
    if (!url) {
      setTestStatus({
        loading: false,
        success: false,
        message: 'Masukkan URL Google Apps Script Web App terlebih dahulu!',
      });
      return;
    }
    setTestStatus({ loading: true });
    const res = await GasSyncService.testConnection(url);
    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  const executePushAll = async (targetUrl: string) => {
    setSyncStatus({ loading: true, message: 'Sedang mengirim seluruh data ke Google Sheets...' });
    const res = await GasSyncService.pushAllToSheets(targetUrl);
    setSyncStatus({ loading: false });
    const updatedCfg = GasSyncService.getConfig();
    setConfig(updatedCfg);
    
    if (res.success) {
      setActionAlert({
        type: 'success',
        title: 'Sinkronisasi Berhasil!',
        message: res.message,
      });
      onSuccess(res.message);
    } else {
      setActionAlert({
        type: 'error',
        title: 'Pengiriman Gagal',
        message: res.message,
      });
    }
  };

  const handlePushAll = () => {
    const url = (config.webAppUrl || '').trim();
    if (!url) {
      setActiveSubTab('SETUP');
      setActionAlert({
        type: 'error',
        title: 'URL Belum Diisi',
        message: 'Silakan masukkan URL Web App Google Apps Script Anda terlebih dahulu di Tab 1 (Panduan & Sambungan URL).',
      });
      return;
    }

    setConfirmDialog({
      title: 'Kirim Seluruh Data ke Google Sheets?',
      message: 'Apakah Anda ingin mengirim SELURUH database pesantren saat ini (16 tabel: Santri, Tagihan, Transaksi Kasir, Pos Kas, dll.) ke Google Spreadsheet Anda? Data sheet dengan nama yang sama akan diperbarui.',
      onConfirm: () => {
        setConfirmDialog(null);
        executePushAll(url);
      },
    });
  };

  const executePullAll = async (targetUrl: string) => {
    setSyncStatus({ loading: true, message: 'Sedang menarik data dari Google Sheets...' });
    const res = await GasSyncService.pullAllFromSheets(targetUrl);
    setSyncStatus({ loading: false });
    if (res.success) {
      setActionAlert({
        type: 'success',
        title: 'Berhasil Memuat Data',
        message: 'Data berhasil ditarik dari Google Sheets! Halaman akan dimuat ulang dalam 2 detik.',
      });
      onSuccess(res.message);
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setActionAlert({
        type: 'error',
        title: 'Penarikan Gagal',
        message: res.message,
      });
    }
  };

  const handlePullAll = () => {
    const url = (config.webAppUrl || '').trim();
    if (!url) {
      setActiveSubTab('SETUP');
      setActionAlert({
        type: 'error',
        title: 'URL Belum Diisi',
        message: 'Silakan masukkan URL Web App Google Apps Script Anda terlebih dahulu.',
      });
      return;
    }

    setConfirmDialog({
      title: 'Tarik Data dari Spreadsheet?',
      message: 'PERINGATAN: Menarik data dari Spreadsheet akan menimpa database lokal saat ini dengan isi Google Sheets. Lanjutkan?',
      onConfirm: () => {
        setConfirmDialog(null);
        executePullAll(url);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Integrasi Google Apps Script & Spreadsheet</h3>
              <p className="text-xs text-emerald-100">
                Jalankan aplikasi ini di Apps Script Anda sendiri dan sinkronkan data ke Google Sheets secara otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('SETUP')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-t border-x cursor-pointer ${
              activeSubTab === 'SETUP'
                ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. Panduan & Sambungan URL</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CODE_GS')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-t border-x cursor-pointer ${
              activeSubTab === 'CODE_GS'
                ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Kode Code.gs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('INDEX_HTML')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-t border-x cursor-pointer ${
              activeSubTab === 'INDEX_HTML'
                ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>3. Kode Index.html</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SYNC')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-t border-x cursor-pointer ${
              activeSubTab === 'SYNC'
                ? 'bg-white text-emerald-800 border-slate-200 border-b-white -mb-px'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>4. Sinkronisasi Data</span>
          </button>
        </div>

        {/* Konten Tab */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Action Alert Banner */}
          {actionAlert && (
            <div
              className={`p-4 rounded-2xl text-xs border flex items-start justify-between gap-3 ${
                actionAlert.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : actionAlert.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-blue-50 text-blue-900 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {actionAlert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                {actionAlert.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                {actionAlert.type === 'info' && <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-sm mb-0.5">{actionAlert.title}</div>
                  <div className="leading-relaxed">{actionAlert.message}</div>
                </div>
              </div>
              <button
                onClick={() => setActionAlert(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* TAB 1: PANDUAN & URL */}
          {activeSubTab === 'SETUP' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Cara Kerja Penggabungan ke Google Apps Script:
                </span>
                <ol className="text-xs text-emerald-900 space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>Buat sebuah <strong>Google Spreadsheet</strong> baru di Google Drive Anda.</li>
                  <li>Buka menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
                  <li>Salin kode dari tab <strong>"2. Kode Code.gs"</strong> dan tempel ke file <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">Code.gs</code>.</li>
                  <li>Buat file HTML baru dengan nama <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">Index</code>, lalu salin kode dari tab <strong>"3. Kode Index.html"</strong>.</li>
                  <li>
                    Klik <strong>Deploy (Terapkan) &gt; New deployment</strong>:
                    <ul className="list-disc pl-4 mt-1 font-semibold">
                      <li>Select type: <strong>Web app</strong></li>
                      <li>Execute as: <strong>Me (Akun Google Anda)</strong></li>
                      <li>Who has access: <strong>Anyone (Siapa saja)</strong></li>
                    </ul>
                  </li>
                  <li>Salin <strong>Web App URL</strong> yang dihasilkan oleh Google, lalu tempelkan pada kolom di bawah ini.</li>
                </ol>
              </div>

              {/* Form Input Web App URL */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  URL Google Apps Script Web App (Deployment URL):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={config.webAppUrl}
                    onChange={(e) => setConfig({ ...config, webAppUrl: e.target.value.trim() })}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-emerald-600 focus:bg-white"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSaveConfig}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Simpan URL
                    </button>
                    <button
                      onClick={handleTestConnection}
                      disabled={testStatus.loading}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      {testStatus.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Uji Koneksi</span>
                    </button>
                    <button
                      onClick={handlePushAll}
                      disabled={syncStatus.loading}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      {syncStatus.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      <span>Kirim Data Sekarang</span>
                    </button>
                  </div>
                </div>

                {/* Status Tes */}
                {testStatus.message && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      testStatus.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {testStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KODE CODE.GS */}
          {activeSubTab === 'CODE_GS' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">
                  Tempelkan seluruh kode ini ke dalam file <strong className="text-slate-800 font-mono">Code.gs</strong> di Google Apps Script Anda:
                </span>
                <button
                  onClick={() => handleCopy(codeGsContent, 'CODE_GS')}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copiedCode === 'CODE_GS' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'CODE_GS' ? 'Tersalin ke Clipboard!' : 'Salin Kode Code.gs'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[380px] border border-slate-800 shadow-inner">
                {codeGsContent}
              </pre>
            </div>
          )}

          {/* TAB 3: KODE INDEX.HTML */}
          {activeSubTab === 'INDEX_HTML' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-1">Catatan Penting Tautan:</span>
                Gunakan tautan publik aplikasi (Shared App URL) berikut agar tidak ditolak koneksinya oleh browser/Google Apps Script:
                <input
                  type="text"
                  value={embedAppUrl}
                  onChange={(e) => setEmbedAppUrl(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono text-[11px] text-slate-800"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">
                  Buat file HTML baru di Apps Script dengan nama <strong className="text-slate-800 font-mono">Index</strong>, lalu tempelkan kode ini:
                </span>
                <button
                  onClick={() => handleCopy(indexHtmlContent, 'INDEX_HTML')}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copiedCode === 'INDEX_HTML' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'INDEX_HTML' ? 'Tersalin ke Clipboard!' : 'Salin Kode Index.html'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[380px] border border-slate-800 shadow-inner">
                {indexHtmlContent}
              </pre>
            </div>
          )}

          {/* TAB 4: SINKRONISASI DATA */}
          {activeSubTab === 'SYNC' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-slate-800 block">Pusat Sinkronisasi Google Sheets</span>
                <p className="text-xs text-slate-500">
                  Terakhir disinkronkan: <strong className="text-slate-800">{config.lastSyncTime || 'Belum pernah'}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PUSH CARD */}
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                      <UploadCloud className="w-5 h-5 text-emerald-700" />
                      <span>Kirim Semua Data ke Sheets (Push)</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Menyalin dan memperbarui 16 sheet di Google Spreadsheet (Santri, Tagihan, Transaksi Kasir, Pos Pengeluaran, Kas, Kelas, dll.) sesuai data di aplikasi saat ini.
                    </p>
                  </div>
                  <button
                    onClick={handlePushAll}
                    disabled={syncStatus.loading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    {syncStatus.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span>Kirim Data Sekarang</span>
                  </button>
                </div>

                {/* PULL CARD */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
                      <DownloadCloud className="w-5 h-5 text-teal-700" />
                      <span>Tarik Data dari Sheets (Pull)</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Mengambil seluruh isi tabel terbaru langsung dari Google Spreadsheet dan memuatnya ke aplikasi lokal Anda jika ada perubahan langsung di Sheets.
                    </p>
                  </div>
                  <button
                    onClick={handlePullAll}
                    disabled={syncStatus.loading}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    {syncStatus.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                    <span>Tarik Data dari Sheets</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            Aplikasi Keuangan & Pembayaran Pesantren • Format Kompatibel Apps Script V8
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Confirmation Dialog Overlay */}
      {confirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{confirmDialog.title}</h4>
                <p className="text-[11px] text-slate-500">Konfirmasi Sinkronisasi Spreadsheet</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {confirmDialog.message}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
