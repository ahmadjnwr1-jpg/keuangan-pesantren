import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { ExcelTemplateService, TemplateType, ImportValidationResult } from '../services/excelTemplateService';

interface ExcelImportModalProps {
  type: TemplateType;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (summary: string) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  type,
  title,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<ImportValidationResult<any> | null>(null);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    try {
      ExcelTemplateService.exportTemplate(type);
    } catch (err: any) {
      setErrorMsg('Gagal mendownload template: ' + err.message);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg('');
    setLoading(true);

    try {
      const rawRows = await ExcelTemplateService.parseFile(selectedFile);
      if (!rawRows || rawRows.length === 0) {
        throw new Error('File Excel/CSV kosong atau tidak memiliki baris data.');
      }

      let res: ImportValidationResult<any>;
      if (type === 'SANTRI') {
        res = ExcelTemplateService.validateSantriRows(rawRows);
      } else {
        res = ExcelTemplateService.validateMasterDataRows(type, rawRows);
      }

      setValidation(res);
    } catch (err: any) {
      setErrorMsg('Gagal membaca file: ' + err.message);
      setValidation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = () => {
    if (!validation || validation.validRows.length === 0) return;
    setImporting(true);
    setErrorMsg('');

    try {
      let resultMsg = '';
      if (type === 'SANTRI') {
        const { success, updated } = ExcelTemplateService.commitSantriImport(validation.validRows);
        resultMsg = `Berhasil mengimport data santri: ${success} data baru ditambahkan, ${updated} data diperbarui.`;
      } else {
        const { inserted, updated } = ExcelTemplateService.commitMasterDataImport(type, validation.validRows);
        resultMsg = `Berhasil mengimport data: ${inserted} baru, ${updated} diperbarui.`;
      }

      onSuccess(resultMsg);
      handleReset();
      onClose();
    } catch (err: any) {
      setErrorMsg('Gagal mengeksekusi import: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidation(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">{title}</h3>
              <p className="text-[11px] text-emerald-200">Format Excel (.xlsx / .xls) atau CSV standar</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Step 1: Download Template Notice */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                Langkah 1: Gunakan Template Resmi Excel
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Download format template yang telah disesuaikan dengan kolom database pesantren beserta panduan kode.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template Excel</span>
            </button>
          </div>

          {/* Step 2: Upload Area */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-slate-600" />
              Langkah 2: Unggah File Excel / CSV Hasil Pengerjaan
            </h4>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-input"
            />

            {!file ? (
              <label
                htmlFor="excel-file-input"
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-emerald-50/30 transition cursor-pointer group"
              >
                <div className="p-3 bg-white rounded-full shadow-xs mb-3 group-hover:scale-105 transition">
                  <UploadCloud className="w-8 h-8 text-emerald-700" />
                </div>
                <div className="font-bold text-slate-800 text-sm">Klik untuk memilih file Excel atau CSV</div>
                <div className="text-[11px] text-slate-500 mt-1">Mendukung format .xlsx, .xls, dan .csv</div>
              </label>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-700" />
                  <div>
                    <div className="font-bold text-slate-900">{file.name}</div>
                    <div className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Ganti File
                </button>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
              <span>Memproses dan memvalidasi baris data Excel...</span>
            </div>
          )}

          {/* Step 3: Validation Summary & Preview */}
          {validation && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold">
                  Total Baris: {validation.totalRows}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Siap Diimport: {validation.validRows.length}
                </span>
                {validation.invalidRows.length > 0 && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Baris Bermasalah: {validation.invalidRows.length}
                  </span>
                )}
              </div>

              {/* Invalid Rows Details */}
              {validation.invalidRows.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] max-h-36 overflow-y-auto">
                  <div className="font-bold text-amber-900 mb-1">Catatan Baris yang Dilewati:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                    {validation.invalidRows.map((inv, idx) => (
                      <li key={idx}>
                        Baris {inv.rowNumber}: {inv.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Preview Table */}
              <div>
                <div className="font-bold text-slate-800 mb-1.5">Preview Data yang Akan Diimport (5 Teratas):</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto max-h-48">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        {type === 'SANTRI' ? (
                          <>
                            <th className="py-2 px-3">NIS</th>
                            <th className="py-2 px-3">Nama Santri</th>
                            <th className="py-2 px-3">JK</th>
                            <th className="py-2 px-3">Target Kelas</th>
                            <th className="py-2 px-3">Wali Santri</th>
                            <th className="py-2 px-3">No Kontak</th>
                          </>
                        ) : type === 'TAHUN_AJARAN' ? (
                          <>
                            <th className="py-2 px-3">Kode</th>
                            <th className="py-2 px-3">Nama Tahun Ajaran</th>
                            <th className="py-2 px-3">Mulai</th>
                            <th className="py-2 px-3">Selesai</th>
                            <th className="py-2 px-3">Status</th>
                          </>
                        ) : type === 'JENJANG' ? (
                          <>
                            <th className="py-2 px-3">Kode</th>
                            <th className="py-2 px-3">Nama Jenjang</th>
                            <th className="py-2 px-3">Status</th>
                          </>
                        ) : type === 'KELAS' ? (
                          <>
                            <th className="py-2 px-3">Kode Kelas</th>
                            <th className="py-2 px-3">Nama Rombel</th>
                            <th className="py-2 px-3">Jenjang</th>
                            <th className="py-2 px-3">Status</th>
                          </>
                        ) : type === 'JENIS_TAGIHAN' ? (
                          <>
                            <th className="py-2 px-3">Kode</th>
                            <th className="py-2 px-3">Nama Pos Tagihan</th>
                            <th className="py-2 px-3">Sifat</th>
                            <th className="py-2 px-3">Status</th>
                          </>
                        ) : type === 'TARIF' ? (
                          <>
                            <th className="py-2 px-3">Jenis Tagihan</th>
                            <th className="py-2 px-3">Tahun Ajaran</th>
                            <th className="py-2 px-3">Nominal (Rp)</th>
                            <th className="py-2 px-3">Keterangan</th>
                          </>
                        ) : (
                          <>
                            <th className="py-2 px-3">Kode</th>
                            <th className="py-2 px-3">Nama Kategori</th>
                            <th className="py-2 px-3">Keterangan</th>
                            <th className="py-2 px-3">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validation.validRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          {type === 'SANTRI' ? (
                            <>
                              <td className="py-1.5 px-3 font-mono">{row.NIS}</td>
                              <td className="py-1.5 px-3 font-bold text-slate-900">{row.NAMA_LENGKAP}</td>
                              <td className="py-1.5 px-3">{row.JENIS_KELAMIN}</td>
                              <td className="py-1.5 px-3 text-emerald-800 font-semibold">{row.NAMA_KELAS_TARGET || '-'}</td>
                              <td className="py-1.5 px-3">{row.NAMA_WALI}</td>
                              <td className="py-1.5 px-3 font-mono">{row.NOMOR_KONTAK_WALI}</td>
                            </>
                          ) : type === 'TAHUN_AJARAN' ? (
                            <>
                              <td className="py-1.5 px-3 font-mono font-bold">{row.KODE_TAHUN_AJARAN}</td>
                              <td className="py-1.5 px-3">{row.NAMA_TAHUN_AJARAN}</td>
                              <td className="py-1.5 px-3 font-mono">{row.TANGGAL_MULAI}</td>
                              <td className="py-1.5 px-3 font-mono">{row.TANGGAL_SELESAI}</td>
                              <td className="py-1.5 px-3 font-bold">{row.STATUS}</td>
                            </>
                          ) : type === 'JENJANG' ? (
                            <>
                              <td className="py-1.5 px-3 font-mono font-bold">{row.KODE_JENJANG}</td>
                              <td className="py-1.5 px-3">{row.NAMA_JENJANG}</td>
                              <td className="py-1.5 px-3 font-bold">{row.STATUS}</td>
                            </>
                          ) : type === 'KELAS' ? (
                            <>
                              <td className="py-1.5 px-3 font-mono font-bold">{row.KODE_KELAS}</td>
                              <td className="py-1.5 px-3">{row.NAMA_KELAS}</td>
                              <td className="py-1.5 px-3">{row.KODE_JENJANG}</td>
                              <td className="py-1.5 px-3 font-bold">{row.STATUS}</td>
                            </>
                          ) : type === 'JENIS_TAGIHAN' ? (
                            <>
                              <td className="py-1.5 px-3 font-mono font-bold">{row.KODE_TAGIHAN}</td>
                              <td className="py-1.5 px-3">{row.NAMA_TAGIHAN}</td>
                              <td className="py-1.5 px-3">{row.SIFAT}</td>
                              <td className="py-1.5 px-3 font-bold">{row.STATUS}</td>
                            </>
                          ) : type === 'TARIF' ? (
                            <>
                              <td className="py-1.5 px-3">{row.ID_JENIS_TAGIHAN}</td>
                              <td className="py-1.5 px-3">{row.ID_TAHUN_AJARAN}</td>
                              <td className="py-1.5 px-3 font-bold font-mono text-emerald-800">
                                Rp {row.NOMINAL?.toLocaleString('id-ID')}
                              </td>
                              <td className="py-1.5 px-3">{row.KETERANGAN || '-'}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-1.5 px-3 font-mono font-bold">{row.KODE_KATEGORI}</td>
                              <td className="py-1.5 px-3">{row.NAMA_KATEGORI}</td>
                              <td className="py-1.5 px-3">{row.KETERANGAN || '-'}</td>
                              <td className="py-1.5 px-3 font-bold">{row.STATUS}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!validation || validation.validRows.length === 0 || importing}
            onClick={handleExecuteImport}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {importing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mengimport Data...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {validation?.validRows.length 
                    ? `Eksekusi Import (${validation.validRows.length} Data)` 
                    : 'Pilih & Validasi File'}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
