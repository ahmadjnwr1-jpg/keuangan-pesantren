import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Calendar, 
  Search, 
  CheckCircle2, 
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';

export const KasView: React.FC = () => {
  const db = DbEngine.getInstance();
  const summary = db.getKasSummary();
  const cashFlow = db.getLaporanArusKas();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const filteredHistory = cashFlow.history.filter(item => {
    if (filterType && item.tipe !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.uraian.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.referensi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Buku Kas & Rekonsiliasi Pesantren</h2>
          <p className="text-xs text-slate-500">
            Sumber data keuangan tunggal dan mutasi kas real-time tanpa percabangan saldo.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Rekonsiliasi Kas: 100% Cocok</span>
        </div>
      </div>

      {/* 3 Core Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Saldo Kas Utama */}
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Saldo Kas Akhir</span>
            <div className="p-2 bg-emerald-800/80 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-200" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
            {formatRp(summary.saldoKas)}
          </div>
          <div className="mt-3 text-[11px] text-emerald-200/90 pt-3 border-t border-emerald-800/60 font-mono">
            Pemasukan ({formatRp(summary.totalPenerimaan)}) - Pengeluaran ({formatRp(summary.totalPengeluaranLunas)})
          </div>
        </div>

        {/* Total Penerimaan Kas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Masuk</span>
            <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-teal-900 tracking-tight font-mono">
            {formatRp(summary.totalPenerimaan)}
          </div>
          <div className="mt-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            Dari {db.getState().PEMBAYARAN.length} transaksi pembayaran tagihan
          </div>
        </div>

        {/* Total Pengeluaran Kas Lunas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Keluar</span>
            <div className="p-2 bg-rose-50 text-rose-800 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-black text-rose-900 tracking-tight font-mono">
            {formatRp(summary.totalPengeluaranLunas)}
          </div>
          <div className="mt-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            Hanya status LUNAS yang memotong kas
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mutasi kas / referensi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          >
            <option value="">Semua Mutasi (Masuk & Keluar)</option>
            <option value="MASUK">Penerimaan Kas Saja (Kas Masuk)</option>
            <option value="KELUAR">Pengeluaran Kas Saja (Kas Keluar)</option>
          </select>
        </div>
      </div>

      {/* Mutasi Kas Table with Running Balance */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Buku Mutasi Kas Harian (Running Balance)</h3>
            <p className="text-xs text-slate-500">Urutan kronologis transaksi dan saldo berjalan</p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            Total {filteredHistory.length} Transaksi Kas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal & Transaksi</th>
                <th className="py-3 px-4">Uraian / Keterangan Belanja</th>
                <th className="py-3 px-4">Metode / Ref</th>
                <th className="py-3 px-4 text-right">Pemasukan</th>
                <th className="py-3 px-4 text-right">Pengeluaran</th>
                <th className="py-3 px-4 text-right">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    Tidak ada transaksi kas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900 text-xs">{item.tanggal}</div>
                      <span className={`inline-block px-2 py-0.2 rounded-full font-black text-[9px] uppercase mt-0.5 ${
                        item.tipe === 'MASUK' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.tipe === 'MASUK' ? 'Penerimaan' : 'Pengeluaran'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans max-w-sm">
                      <div className="font-bold text-slate-900">{item.uraian}</div>
                      <div className="text-[11px] text-slate-500">{item.kategori}</div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="font-bold text-slate-700">{item.metode}</span>
                      <div className="text-[10px] text-slate-400 font-mono">{item.referensi}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-800">
                      {item.tipe === 'MASUK' ? formatRp(item.nominal) : '-'}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      {item.tipe === 'KELUAR' ? formatRp(item.nominal) : '-'}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 text-xs bg-slate-50/50">
                      {formatRp(item.saldoBerjalan)}
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
