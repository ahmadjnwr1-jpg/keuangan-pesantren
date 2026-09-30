import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, Eye, X, User, Calendar } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { LogAktivitasRow } from '../types/database';

export const AuditView: React.FC = () => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const [search, setSearch] = useState('');
  const [filterModul, setFilterModul] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogAktivitasRow | null>(null);

  const logs = state.LOG_AKTIVITAS;

  const modules = Array.from(new Set(logs.map(l => l.MODUL))).filter(Boolean);

  const filteredLogs = logs.filter(l => {
    if (filterModul && l.MODUL !== filterModul) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.KETERANGAN.toLowerCase().includes(q) ||
        l.AKSI.toLowerCase().includes(q) ||
        l.NAMA_USER.toLowerCase().includes(q) ||
        l.ID_DATA.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Audit Log & Rekaman Aktivitas Sistem</h2>
          <p className="text-xs text-slate-500">
            Pencatatan menyeluruh setiap perubahan data, otorisasi transaksi, pengeluaran, dan audit trail keuangan.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit Log Immutability: Aktif</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas / user / ID data..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={filterModul}
            onChange={(e) => setFilterModul(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          >
            <option value="">Semua Modul Sistem</option>
            {modules.map(m => (
              <option key={m} value={m}>Modul: {m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu & Pengguna</th>
                <th className="py-3 px-4">Modul & Aksi</th>
                <th className="py-3 px-4">ID Data Sasaran</th>
                <th className="py-3 px-4">Uraian Aktivitas</th>
                <th className="py-3 px-4 text-right">Detail Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada rekaman log yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.ID_LOG} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-500 text-[11px]">{l.WAKTU}</div>
                      <div className="font-bold text-slate-900 mt-0.5">{l.NAMA_USER}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-bold text-[10px] mr-1.5">
                        {l.MODUL}
                      </span>
                      <span className="font-mono font-bold text-emerald-800 text-[11px]">
                        {l.AKSI}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {l.ID_DATA || '-'}
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <div className="text-slate-800 leading-tight">{l.KETERANGAN}</div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {(l.DATA_LAMA || l.DATA_BARU) ? (
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Lihat JSON</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector Detail JSON */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Inspeksi Data Audit: {selectedLog.AKSI}</h3>
                <p className="text-xs text-slate-400">ID Log: {selectedLog.ID_LOG} • {selectedLog.WAKTU}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">Keterangan:</div>
                <div className="text-slate-700">{selectedLog.KETERANGAN}</div>
              </div>

              {selectedLog.DATA_LAMA && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">Data Lama (Sebelum Perubahan):</label>
                  <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.DATA_LAMA), null, 2);
                      } catch {
                        return selectedLog.DATA_LAMA;
                      }
                    })()}
                  </pre>
                </div>
              )}

              {selectedLog.DATA_BARU && (
                <div>
                  <label className="block font-bold text-emerald-700 mb-1">Data Baru (Setelah Perubahan):</label>
                  <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.DATA_BARU), null, 2);
                      } catch {
                        return selectedLog.DATA_BARU;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
