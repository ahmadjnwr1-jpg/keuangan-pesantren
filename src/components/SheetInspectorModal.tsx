import React, { useState } from 'react';
import { Table, Download, Search, X, Database, Layers, CheckCircle2 } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { DatabaseState, DATABASE_SCHEMA_KEYS } from '../types/database';

interface SheetInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SheetInspectorModal: React.FC<SheetInspectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const db = DbEngine.getInstance();
  const state = db.getState();
  const sheetNames = Object.keys(DATABASE_SCHEMA_KEYS) as Array<keyof DatabaseState>;
  const [selectedSheet, setSelectedSheet] = useState<keyof DatabaseState>('TAGIHAN');
  const [search, setSearch] = useState('');

  const headers = DATABASE_SCHEMA_KEYS[selectedSheet];
  const rows = (state[selectedSheet] as any[]) || [];

  const filteredRows = rows.filter(row => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(query)
    );
  });

  const handleDownloadCsv = () => {
    const csvContent = db.exportSheetCsv(selectedSheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SHEET_${selectedSheet}_${db.formatDateOnly()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">Database Inspector 16 Sheet</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-mono rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  16 Sheet Terverifikasi
                </span>
              </div>
              <p className="text-xs text-slate-400">Pondok Pesantren Inayatul Muhajirin Core Schema</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheet Selector Bar */}
        <div className="bg-slate-100 p-2 sm:px-4 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Pilih Sheet:
          </span>
          {sheetNames.map(sheet => {
            const count = (state[sheet] as any[])?.length || 0;
            const isSelected = selectedSheet === sheet;
            return (
              <button
                key={sheet}
                onClick={() => {
                  setSelectedSheet(sheet);
                  setSearch('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-emerald-800 text-white shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{sheet}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Filter & Export */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari dalam sheet ${selectedSheet}...`}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-600">
            <span>
              Menampilkan <strong className="text-slate-900">{filteredRows.length}</strong> dari {rows.length} baris
            </span>
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                    {headers.map(header => (
                      <th key={header} className="py-2.5 px-3 whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 1} className="py-12 text-center text-slate-400 font-sans">
                        Tidak ada data di sheet ini.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/40 transition">
                        <td className="py-2 px-3 text-center text-slate-400 font-sans text-xs">{idx + 1}</td>
                        {headers.map(header => {
                          const val = row[header];
                          const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                          return (
                            <td key={header} className="py-2 px-3 whitespace-nowrap max-w-xs truncate text-slate-800">
                              {str || <span className="text-slate-300 italic font-sans">null</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Struktur kolom disesuaikan dengan schema 16 sheet blueprint resmi.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
