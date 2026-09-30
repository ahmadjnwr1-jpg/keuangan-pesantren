import React from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Users,
  Receipt,
  ShieldCheck,
  PlusCircle,
  CreditCard,
  TrendingDown,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { NavPage } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate: (page: NavPage) => void;
  onOpenInvoice: (idPembayaran: string) => void;
  onOpenAudit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenInvoice,
  onOpenAudit
}) => {
  const db = DbEngine.getInstance();
  const summary = db.getKasSummary();
  const monthly = db.getMonthlySummary('2026');
  const payments = db.getState().PEMBAYARAN.slice(0, 5);
  const expenses = db.getState().PENGELUARAN.slice(0, 5);
  const activeYear = db.getState().TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF');

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Find max monthly value for bar chart heights
  const maxMonthly = Math.max(
    ...monthly.map(m => Math.max(m.penerimaan, m.pengeluaran)),
    1000000
  );

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner & Integrity Guarantee */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Wallet className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/80 rounded-full text-xs font-semibold text-emerald-200 mb-3 border border-emerald-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Keuangan Tunggal (Single Source of Truth)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Pondok Pesantren Inayatul Muhajirin
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Pengelolaan keuangan pesantren terintegrasi berbasis 16 sheet blueprint: Tagihan, Pembayaran, Pengeluaran, Kas, dan Pelaporan bersumber dari kebenaran transaksi yang sama.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => onNavigate('pembayaran')}
              className="px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>+ Input Pembayaran</span>
            </button>
            <button
              onClick={() => onNavigate('pengeluaran')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>+ Ajukan Pengeluaran</span>
            </button>
            <button
              onClick={() => onNavigate('tagihan')}
              className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-950 text-white border border-emerald-600/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Generate Tagihan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Saldo Kas Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Pesantren</span>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
            {formatRupiah(summary.saldoKas)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Penerimaan - Pengeluaran Lunas</span>
          </div>
        </div>

        {/* Total Penerimaan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Penerimaan</span>
            <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-teal-900 tracking-tight">
            {formatRupiah(summary.totalPenerimaan)}
          </div>
          <div className="mt-2 text-[11px] text-teal-700 font-medium">
            Dari {db.getState().PEMBAYARAN.length} transaksi pembayaran santri
          </div>
        </div>

        {/* Total Pengeluaran Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengeluaran Lunas</span>
            <div className="p-2 bg-rose-50 text-rose-800 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-900 tracking-tight">
            {formatRupiah(summary.totalPengeluaranLunas)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Hanya status LUNAS yang memotong kas
          </div>
        </div>

        {/* Total Tunggakan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tunggakan Santri</span>
            <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-900 tracking-tight">
            {formatRupiah(summary.totalTunggakan)}
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            Dari {summary.totalTagihanAktifCount} tagihan aktif diterbitkan
          </div>
        </div>

      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Santri Aktif</div>
            <div className="text-base font-black text-slate-900">{summary.totalSantriAktif} Santri</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Tagihan Aktif</div>
            <div className="text-base font-black text-slate-900">{summary.totalTagihanAktifCount} Tagihan</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Tahun Ajaran</div>
            <div className="text-xs font-bold text-slate-900 truncate">{activeYear?.NAMA_TAHUN_AJARAN || '2026/2027'}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Aturan Blueprint</div>
            <div className="text-xs font-bold text-emerald-800">100% Terkunci</div>
          </div>
        </div>
      </div>

      {/* Financial Health & Monthly Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Trend Visual (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Arus Kas Bulanan (Tahun 2026)</h3>
              <p className="text-xs text-slate-500">Perbandingan penerimaan pembayaran vs pengeluaran lunas per bulan</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                <span>Penerimaan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                <span>Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-3">
            {monthly.slice(6, 12).map((m, idx) => {
              const inPct = (m.penerimaan / maxMonthly) * 100;
              const outPct = (m.pengeluaran / maxMonthly) * 100;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 w-16">{m.bulan}</span>
                    <div className="flex gap-4 text-[11px]">
                      <span className="text-emerald-700 font-bold">{formatRupiah(m.penerimaan)}</span>
                      <span className="text-rose-600 font-semibold">{formatRupiah(m.pengeluaran)}</span>
                      <span className={`font-mono font-bold ${m.selisih >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                        ({m.selisih >= 0 ? '+' : ''}{formatRupiah(m.selisih)})
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(inPct, 0)}%` }} 
                    />
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(outPct, 0)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Rules Lock Guarantee Card (1 col) */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifikasi Saldo Tak Bercabang</span>
            </div>
            <h4 className="text-lg font-black tracking-tight text-white mb-3">
              Kepastian Integritas Keuangan
            </h4>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-1">Formula Saldo Kas:</span>
                <div className="font-mono text-emerald-300 font-bold text-[11px]">
                  TOTAL PEMBAYARAN - TOTAL PENGELUARAN LUNAS = SALDO KAS
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-1">Formula Sisa Tagihan:</span>
                <div className="font-mono text-amber-300 font-bold text-[11px]">
                  NOMINAL TAGIHAN - TOTAL PEMBAYARAN = SISA TAGIHAN
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Dashboard, Buku Kas, Rekap Tunggakan, Laporan, dan Kwitansi mengambil kebenaran dari database 16 sheet yang sama secara sinkron.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onOpenAudit}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer text-center"
            >
              Jalankan Uji Audit Sistem
            </button>
          </div>
        </div>

      </div>

      {/* Recent Transactions Split: Latest Payments & Latest Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latest Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pembayaran Terakhir Diterima</h3>
              <p className="text-xs text-slate-500">Penerimaan kas dari wali santri</p>
            </div>
            <button
              onClick={() => onNavigate('pembayaran')}
              className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="space-y-2.5">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Belum ada transaksi pembayaran</div>
            ) : (
              payments.map(p => {
                const bill = db.getState().TAGIHAN.find(t => t.ID_TAGIHAN === p.ID_TAGIHAN);
                const santri = bill ? db.getState().SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI) : null;
                return (
                  <div key={p.ID_PEMBAYARAN} className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/80 transition flex items-center justify-between">
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {santri?.NAMA_LENGKAP || 'Santri'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {bill?.NAMA_TAGIHAN} • {p.TANGGAL_PEMBAYARAN} • {p.METODE}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-800">
                        {formatRupiah(p.NOMINAL)}
                      </div>
                      <button
                        onClick={() => onOpenInvoice(p.ID_PEMBAYARAN)}
                        className="text-[10px] text-emerald-700 font-bold hover:underline mt-0.5 inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Kwitansi</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Latest Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pengeluaran Kas Terkini</h3>
              <p className="text-xs text-slate-500">Operasional dan belanja pesantren</p>
            </div>
            <button
              onClick={() => onNavigate('pengeluaran')}
              className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="space-y-2.5">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Belum ada data pengeluaran</div>
            ) : (
              expenses.map(e => {
                const kat = db.getState().KATEGORI_PENGELUARAN.find(k => k.ID_KATEGORI === e.ID_KATEGORI);
                return (
                  <div key={e.ID_PENGELUARAN} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition flex items-center justify-between">
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {e.URAIAN}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {kat?.NAMA_KATEGORI || 'Operasional'} • {e.TANGGAL_PENGAJUAN}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">
                        {formatRupiah(e.NOMINAL_PENGAJUAN)}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mt-0.5 ${
                        e.STATUS === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' :
                        e.STATUS === 'DISETUJUI' ? 'bg-blue-100 text-blue-800' :
                        e.STATUS === 'DITOLAK' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {e.STATUS}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
