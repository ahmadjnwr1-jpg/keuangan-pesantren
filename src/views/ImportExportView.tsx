import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Copy, 
  RefreshCw,
  ShieldCheck,
  FileText,
  Code2
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { DatabaseState } from '../types/database';
import { GasIntegrationModal } from '../components/GasIntegrationModal';

export const ImportExportView: React.FC = () => {
  const db = DbEngine.getInstance();
  const currentUser = db.getCurrentUser();
  const isHeadFinance = currentUser?.ROLE === 'KEPALA_BIDANG_KEUANGAN';

  const [showGasModal, setShowGasModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Import State
  const [importType, setImportType] = useState<string>('SANTRI');
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState<any>(null);

  // Export State
  const [exportSheet, setExportSheet] = useState<keyof DatabaseState>('SANTRI');

  // Backup / Restore State
  const [restoreJson, setRestoreJson] = useState('');

  const parseCsvLines = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const parseLine = (line: string) => {
      const result: string[] = [];
      let cur = '';
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (insideQuote && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            insideQuote = !insideQuote;
          }
        } else if (c === ',' && !insideQuote) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine);
    return { headers, rows };
  };

  const handleValidateImport = () => {
    if (!csvText.trim()) {
      alert('Silakan tempel atau masukkan data CSV terlebih dahulu.');
      return;
    }
    const { headers, rows } = parseCsvLines(csvText);
    if (headers.length === 0 || rows.length === 0) {
      alert('Format CSV tidak valid atau tidak memiliki baris data.');
      return;
    }

    try {
      if (importType === 'SANTRI') {
        const preview = db.getState(); // test access
        const previewRes = {
          importType: 'SANTRI',
          totalRows: rows.length,
          headers,
          sampleRows: rows.slice(0, 5),
          canExecute: true
        };
        setImportPreview(previewRes);
      } else {
        setImportPreview({
          importType,
          totalRows: rows.length,
          headers,
          sampleRows: rows.slice(0, 5),
          canExecute: true
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExecuteImport = () => {
    if (!importPreview) return;
    const { headers, rows } = parseCsvLines(csvText);

    try {
      let successCount = 0;
      if (importType === 'SANTRI') {
        const nisIdx = headers.indexOf('NIS');
        const namaIdx = headers.indexOf('NAMA_LENGKAP');
        const jenjangIdx = headers.indexOf('ID_JENJANG');
        const kelasIdx = headers.indexOf('ID_KELAS');

        if (namaIdx === -1) throw new Error('Kolom NAMA_LENGKAP wajib ada pada CSV.');

        rows.forEach(r => {
          const defaultJenjang = db.getState().JENJANG[0]?.ID_JENJANG || '';
          const defaultKelas = db.getState().KELAS[0]?.ID_KELAS || '';
          db.addSantri({
            NIS: nisIdx !== -1 && r[nisIdx] ? r[nisIdx] : `2026${Math.floor(1000 + Math.random() * 9000)}`,
            NAMA_LENGKAP: r[namaIdx] || 'Santri Baru',
            ID_JENJANG: jenjangIdx !== -1 && r[jenjangIdx] ? r[jenjangIdx] : defaultJenjang,
            ID_KELAS: kelasIdx !== -1 && r[kelasIdx] ? r[kelasIdx] : defaultKelas,
            STATUS: 'AKTIF',
            JENIS_KELAMIN: 'L',
            TANGGAL_MASUK: db.formatDateOnly()
          });
          successCount++;
        });
      } else if (importType === 'JENJANG') {
        const kodeIdx = headers.indexOf('KODE_JENJANG');
        const namaIdx = headers.indexOf('NAMA_JENJANG');
        rows.forEach(r => {
          if (r[kodeIdx] && r[namaIdx]) {
            db.addJenjang(r[kodeIdx], r[namaIdx]);
            successCount++;
          }
        });
      } else if (importType === 'KELAS') {
        const jenjangIdx = headers.indexOf('ID_JENJANG');
        const kodeIdx = headers.indexOf('KODE_KELAS');
        const namaIdx = headers.indexOf('NAMA_KELAS');
        rows.forEach(r => {
          if (r[jenjangIdx] && r[kodeIdx] && r[namaIdx]) {
            db.addKelas(r[jenjangIdx], r[kodeIdx], r[namaIdx]);
            successCount++;
          }
        });
      } else if (importType === 'KATEGORI_PENGELUARAN') {
        const kodeIdx = headers.indexOf('KODE_KATEGORI');
        const namaIdx = headers.indexOf('NAMA_KATEGORI');
        rows.forEach(r => {
          if (r[kodeIdx] && r[namaIdx]) {
            db.addKategoriPengeluaran(r[kodeIdx], r[namaIdx]);
            successCount++;
          }
        });
      }

      alert(`Import berhasil! ${successCount} data baru berhasil dimasukkan ke sistem.`);
      setCsvText('');
      setImportPreview(null);
    } catch (err: any) {
      alert(`Gagal import data: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    const csvContent = db.exportSheetCsv(exportSheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DATA_${exportSheet}_${db.formatDateOnly()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBackup = () => {
    const json = db.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BACKUP_KAS_PESANTREN_16SHEET_${db.formatDateOnly()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = () => {
    if (!restoreJson.trim()) {
      alert('Silakan tempel isi file JSON backup terlebih dahulu.');
      return;
    }
    if (!confirm('PERINGATAN: Memulihkan database akan menimpa seluruh 16 sheet saat ini dengan data backup. Lanjutkan?')) {
      return;
    }
    try {
      db.restoreBackupJson(restoreJson);
      setRestoreJson('');
      alert('Database berhasil dipulihkan dari cadangan backup!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Import, Export & Cadangan Database</h2>
          <p className="text-xs text-slate-500">
            Fasilitas migrasi data CSV master, ekspor sheet, dan sinkronisasi Google Apps Script.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Import CSV */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Import Data Master (CSV)</h3>
              <p className="text-xs text-slate-500">Import santri, jenjang, kelas, atau kategori</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Jenis Data Master</label>
              <select
                value={importType}
                onChange={(e) => {
                  setImportType(e.target.value);
                  setImportPreview(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="SANTRI">Data Santri (SANTRI)</option>
                <option value="JENJANG">Jenjang Pendidikan (JENJANG)</option>
                <option value="KELAS">Rombel Kelas (KELAS)</option>
                <option value="KATEGORI_PENGELUARAN">Kategori Pengeluaran (KATEGORI_PENGELUARAN)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Tempel Konten CSV</label>
                <button
                  type="button"
                  onClick={() => {
                    if (importType === 'SANTRI') {
                      setCsvText('NIS,NAMA_LENGKAP,ID_JENJANG,ID_KELAS\n202607009,Ahmad Fauzan Mubarok,JEN-01,KLS-MTS-7A\n202607010,Siti Salma Khairunnisa,JEN-01,KLS-MTS-7B');
                    } else if (importType === 'JENJANG') {
                      setCsvText('KODE_JENJANG,NAMA_JENJANG\nSMP,Sekolah Menengah Pertama\nSMK,Sekolah Menengah Kejuruan');
                    } else if (importType === 'KELAS') {
                      setCsvText('ID_JENJANG,KODE_KELAS,NAMA_KELAS\nJEN-01,MTS09B,Kelas 9B MTs Putri');
                    }
                  }}
                  className="text-emerald-700 hover:underline font-bold text-[11px]"
                >
                  Muat Contoh Format
                </button>
              </div>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  setImportPreview(null);
                }}
                placeholder="Baris pertama header, baris kedua dst data dipisahkan koma..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 leading-relaxed"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed">
              <strong>Aturan Blueprint:</strong> Transaksi TAGIHAN, PEMBAYARAN, dan PENGELUARAN tidak diizinkan melalui import CSV manual untuk melindungi integritas saldo kas dan mencegah ketidakcocokan transaksi.
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleValidateImport}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition cursor-pointer"
              >
                Validasi Pratinjau
              </button>
            </div>

            {/* Preview Box */}
            {importPreview && (
              <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-950">Hasil Pemeriksaan Pratinjau:</span>
                  <span className="font-black text-emerald-900">{importPreview.totalRows} baris siap diimpor</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Header terdeteksi: <span className="font-mono">{importPreview.headers.join(', ')}</span>
                </div>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer mt-2"
                >
                  Konfirmasi & Simpan ke Database
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Export Data CSV */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ekspor Sheet ke CSV</h3>
              <p className="text-xs text-slate-500">Unduh data per sheet untuk analisis spreadsheet eksternal</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Sheet Database Yang Ingin Diekspor</label>
              <select
                value={exportSheet}
                onChange={(e) => setExportSheet(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="SANTRI">Sheet: SANTRI</option>
                <option value="TAGIHAN">Sheet: TAGIHAN</option>
                <option value="PEMBAYARAN">Sheet: PEMBAYARAN</option>
                <option value="PENGELUARAN">Sheet: PENGELUARAN</option>
                <option value="TARIF_TAGIHAN">Sheet: TARIF_TAGIHAN</option>
                <option value="JENIS_TAGIHAN">Sheet: JENIS_TAGIHAN</option>
                <option value="KELAS">Sheet: KELAS</option>
                <option value="JENJANG">Sheet: JENJANG</option>
                <option value="TAHUN_AJARAN">Sheet: TAHUN_AJARAN</option>
                <option value="LOG_AKTIVITAS">Sheet: LOG_AKTIVITAS (Audit Log)</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-800">Detail Sheet Terpilih:</div>
              <div className="text-slate-600">Nama Sheet: <span className="font-mono font-bold text-slate-900">{exportSheet}</span></div>
              <div className="text-slate-600">Jumlah Data: <strong className="text-slate-900">{(db.getState()[exportSheet] as any[])?.length || 0} baris</strong></div>
            </div>

            <button
              onClick={handleExportCsv}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File CSV ({exportSheet})</span>
            </button>
          </div>
        </div>

      </div>

      {/* Section 3: Full Backup & Restore System */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Cadangan Penuh 16 Sheet (Full Backup & Restore)</h3>
            <p className="text-xs text-slate-400">Pencadangan snapshot data lengkap untuk keamanan operasional jangka panjang</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Backup */}
          <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Buat Cadangan (Backup JSON)</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Menghasilkan satu berkas JSON terenkapsulasi yang memuat seluruh tabel: USERS, SANTRI, TAHUN_AJARAN, JENJANG, KELAS, JENIS_TAGIHAN, TARIF, RIWAYAT, TAGIHAN, PEMBAYARAN, PENGELUARAN, KAS, PENGATURAN, AUDIT, DOKUMEN, dan PENUTUPAN PERIODE.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Backup Lengkap (.json)</span>
            </button>
          </div>

          {/* Restore */}
          <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Pulihkan Cadangan (Restore JSON)</span>
              </h4>
              <p className="text-slate-300 leading-relaxed mb-3">
                Tempel konten JSON backup untuk memulihkan database. <em>(Otoritas Kepala Bidang Keuangan)</em>
              </p>
              <textarea
                rows={3}
                value={restoreJson}
                onChange={(e) => setRestoreJson(e.target.value)}
                placeholder="Tempel isi file backup JSON di sini..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-[11px] text-slate-300 focus:outline-emerald-500"
              />
            </div>
            <button
              onClick={handleRestoreBackup}
              className="mt-4 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Pulihkan Database Dari Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Integrasi Google Apps Script */}
      <GasIntegrationModal
        isOpen={showGasModal}
        onClose={() => setShowGasModal(false)}
        onSuccess={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

    </div>
  );
};
