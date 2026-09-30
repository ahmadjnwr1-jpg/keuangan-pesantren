import React from 'react';
import { FileText, Printer, Send, Calendar, User, Search, Download } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';

interface DokumenViewProps {
  onOpenInvoice: (idPembayaran: string) => void;
  onOpenWhatsApp: (idPembayaran: string) => void;
}

export const DokumenView: React.FC<DokumenViewProps> = ({ onOpenInvoice, onOpenWhatsApp }) => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const documents = state.DOKUMEN;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Arsip Dokumen & Kwitansi Resmi</h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh berkas kwitansi pembayaran dan invoice yang telah diterbitkan sistem.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Dokumen</th>
                <th className="py-3 px-4">Jenis Dokumen</th>
                <th className="py-3 px-4">ID Referensi</th>
                <th className="py-3 px-4">Tanggal Dibuat</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada dokumen yang diarsipkan.
                  </td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc.ID_DOKUMEN} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-bold text-slate-900">{doc.NAMA_FILE}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold">
                        {doc.JENIS_DOKUMEN}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{doc.ID_REFERENSI}</td>
                    <td className="py-3 px-4 text-slate-500">{doc.TANGGAL_DIBUAT}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{doc.KETERANGAN}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onOpenInvoice(doc.ID_REFERENSI)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Buka Kwitansi</span>
                        </button>
                        <button
                          onClick={() => onOpenWhatsApp(doc.ID_REFERENSI)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim WA</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
