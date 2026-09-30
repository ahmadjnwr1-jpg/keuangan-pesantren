import React, { useState } from 'react';
import { 
  FileBarChart, 
  Calendar, 
  Printer, 
  Download, 
  Filter, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight,
  Receipt,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { downloadLaporanPDF } from '../services/pdfGenerator';

export const LaporanView: React.FC = () => {
  const db = DbEngine.getInstance();
  const state = db.getState();

  const [activeReport, setActiveReport] = useState<'PENERIMAAN' | 'PENGELUARAN' | 'TAGIHAN' | 'TUNGGAKAN' | 'ARUS_KAS' | 'BULANAN' | 'TAHUNAN'>('PENERIMAAN');
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [downloadNotice, setDownloadNotice] = useState<{ success: boolean; message: string; blobUrl?: string } | null>(null);

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Generate CSV based on current active report
    let csv = '';
    const dateTag = db.formatDateOnly();

    if (activeReport === 'PENERIMAAN') {
      const { rows, total } = db.getLaporanPenerimaan({ tglMulai, tglSelesai, idKelas: filterKelas });
      csv = 'No. Transaksi,Tanggal,Santri,NIS,Kelas,Tagihan,Nominal,Metode,Referensi\n' +
        rows.map(r => `"${r.payment.NOMOR_TRANSAKSI}","${r.payment.TANGGAL_PEMBAYARAN}","${r.santri?.NAMA_LENGKAP || ''}","${r.santri?.NIS || ''}","${r.kelas?.NAMA_KELAS || ''}","${r.jtg?.NAMA_TAGIHAN || ''}",${r.payment.NOMINAL},"${r.payment.METODE}","${r.payment.REFERENSI || ''}"`).join('\n') +
        `\nTOTAL PENERIMAAN,,,,,,${total},,`;
    } else if (activeReport === 'PENGELUARAN') {
      const { rows, totalLunas } = db.getLaporanPengeluaran({ tglMulai, tglSelesai });
      csv = 'Tanggal,Kategori,Uraian,Nominal,Status,Metode,Referensi\n' +
        rows.map(r => `"${r.expense.TANGGAL_PEMBAYARAN || r.expense.TANGGAL_PENGAJUAN}","${r.kategori?.NAMA_KATEGORI || ''}","${r.expense.URAIAN}",${r.expense.NOMINAL_PENGAJUAN},"${r.expense.STATUS}","${r.expense.METODE || ''}","${r.expense.REFERENSI || ''}"`).join('\n') +
        `\nTOTAL PENGELUARAN LUNAS,,,${totalLunas},,,`;
    } else if (activeReport === 'TAGIHAN' || activeReport === 'TUNGGAKAN') {
      const isArrears = activeReport === 'TUNGGAKAN';
      const { rows, totalNominal, totalPaid, totalRemaining } = db.getLaporanTagihanDanTunggakan({ idKelas: filterKelas, hanyaTunggakan: isArrears });
      csv = 'Santri,NIS,Kelas,Tagihan,Periode,Nominal,Telah Dibayar,Sisa Tunggakan,Status\n' +
        rows.map(r => `"${r.santri?.NAMA_LENGKAP || ''}","${r.santri?.NIS || ''}","${r.kelas?.NAMA_KELAS || ''}","${r.bill.NAMA_TAGIHAN}","${r.bill.PERIODE_TAGIHAN || ''}",${r.bill.NOMINAL},${r.paid},${r.remaining},"${r.statusPembayaran}"`).join('\n') +
        `\nTOTAL,,,,,${totalNominal},${totalPaid},${totalRemaining},`;
    } else if (activeReport === 'BULANAN') {
      const monthly = db.getMonthlySummary('2026');
      csv = 'Bulan,Penerimaan,Pengeluaran,Selisih Kas\n' +
        monthly.map(m => `"${m.bulan}",${m.penerimaan},${m.pengeluaran},${m.selisih}`).join('\n');
    } else {
      const cashFlow = db.getLaporanArusKas();
      csv = 'Tanggal,Tipe,Kategori,Uraian,Pemasukan,Pengeluaran,Saldo Berjalan\n' +
        cashFlow.history.map(h => `"${h.tanggal}","${h.tipe}","${h.kategori}","${h.uraian}",${h.tipe === 'MASUK' ? h.nominal : 0},${h.tipe === 'KELUAR' ? h.nominal : 0},${h.saldoBerjalan}`).join('\n');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LAPORAN_${activeReport}_${dateTag}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute reports based on filters
  const penerimaanData = db.getLaporanPenerimaan({ tglMulai, tglSelesai, idKelas: filterKelas });
  const pengeluaranData = db.getLaporanPengeluaran({ tglMulai, tglSelesai });
  const tagihanData = db.getLaporanTagihanDanTunggakan({ idKelas: filterKelas, hanyaTunggakan: false });
  const tunggakanData = db.getLaporanTagihanDanTunggakan({ idKelas: filterKelas, hanyaTunggakan: true });
  const arusKasData = db.getLaporanArusKas();
  const monthlyData = db.getMonthlySummary('2026');

  const handleExportPdf = () => {
    let title = '';
    let subtitle = '';
    let headers: string[] = [];
    let rows: any[][] = [];
    let summaryText = '';

    if (activeReport === 'PENERIMAAN') {
      title = 'Laporan Penerimaan Kas Pesantren';
      subtitle = `Periode: ${tglMulai || 'Awal'} s/d ${tglSelesai || 'Sekarang'} | Filter Kelas: ${filterKelas || 'Semua'}`;
      headers = ['No. Trx', 'Tanggal', 'Nama Santri', 'Kelas', 'Uraian Tagihan', 'Metode', 'Nominal (Rp)'];
      rows = penerimaanData.rows.map(r => [
        r.payment.NOMOR_TRANSAKSI,
        r.payment.TANGGAL_PEMBAYARAN,
        r.santri?.NAMA_LENGKAP || '-',
        r.kelas?.NAMA_KELAS || '-',
        r.bill?.NAMA_TAGIHAN || '-',
        r.payment.METODE,
        `Rp ${r.payment.NOMINAL.toLocaleString('id-ID')}`
      ]);
      rows.push(['TOTAL PENERIMAAN', '', '', '', '', '', `Rp ${penerimaanData.total.toLocaleString('id-ID')}`]);
      summaryText = `Total Penerimaan Kas: Rp ${penerimaanData.total.toLocaleString('id-ID')} (${penerimaanData.rows.length} Transaksi)`;
    } else if (activeReport === 'PENGELUARAN') {
      title = 'Laporan Pengeluaran Kas Pesantren';
      subtitle = `Periode: ${tglMulai || 'Awal'} s/d ${tglSelesai || 'Sekarang'}`;
      headers = ['ID', 'Tgl Bayar', 'Kategori', 'Uraian Pengeluaran', 'Status', 'Nominal (Rp)'];
      rows = pengeluaranData.rows.map(r => [
        r.expense.ID_PENGELUARAN,
        r.expense.TANGGAL_PEMBAYARAN || r.expense.TANGGAL_PENGAJUAN,
        r.kategori?.NAMA_KATEGORI || '-',
        r.expense.URAIAN,
        r.expense.STATUS,
        `Rp ${r.expense.NOMINAL_PENGAJUAN.toLocaleString('id-ID')}`
      ]);
      rows.push(['TOTAL PENGELUARAN LUNAS', '', '', '', '', `Rp ${pengeluaranData.totalLunas.toLocaleString('id-ID')}`]);
      summaryText = `Total Pengeluaran Kas Lunas: Rp ${pengeluaranData.totalLunas.toLocaleString('id-ID')}`;
    } else if (activeReport === 'TAGIHAN' || activeReport === 'TUNGGAKAN') {
      const data = activeReport === 'TAGIHAN' ? tagihanData : tunggakanData;
      title = activeReport === 'TAGIHAN' ? 'Laporan Tagihan Santri Keseluruhan' : 'Laporan Rekap Tunggakan Piutang Santri';
      subtitle = `Filter Kelas: ${filterKelas || 'Semua Kelas'}`;
      headers = ['Nama Santri', 'NIS', 'Kelas', 'Uraian Tagihan', 'Total Tagihan', 'Terbayar', 'Sisa Tagihan', 'Status'];
      rows = data.rows.map(r => [
        r.santri?.NAMA_LENGKAP || '-',
        r.santri?.NIS || '-',
        r.kelas?.NAMA_KELAS || '-',
        `${r.bill.NAMA_TAGIHAN}${r.bill.PERIODE_TAGIHAN ? ` (${r.bill.PERIODE_TAGIHAN})` : ''}`,
        `Rp ${r.bill.NOMINAL.toLocaleString('id-ID')}`,
        `Rp ${r.paid.toLocaleString('id-ID')}`,
        `Rp ${r.remaining.toLocaleString('id-ID')}`,
        r.statusPembayaran
      ]);
      rows.push(['TOTAL', '', '', '', `Rp ${data.totalNominal.toLocaleString('id-ID')}`, `Rp ${data.totalPaid.toLocaleString('id-ID')}`, `Rp ${data.totalRemaining.toLocaleString('id-ID')}`, '']);
      summaryText = `Total Tagihan: Rp ${data.totalNominal.toLocaleString('id-ID')} | Masuk: Rp ${data.totalPaid.toLocaleString('id-ID')} | Sisa Tunggakan: Rp ${data.totalRemaining.toLocaleString('id-ID')}`;
    } else if (activeReport === 'ARUS_KAS') {
      title = 'Laporan Buku Kas & Arus Kas Harian';
      subtitle = `Posisi Saldo Kas Per Tanggal: ${new Date().toLocaleDateString('id-ID')}`;
      headers = ['Tanggal', 'Arus', 'Kategori', 'Uraian Transaksi', 'Pemasukan', 'Pengeluaran', 'Saldo Kas'];
      rows = arusKasData.history.map(h => [
        h.tanggal,
        h.tipe === 'MASUK' ? 'KAS MASUK' : 'KAS KELUAR',
        h.kategori,
        h.uraian,
        h.tipe === 'MASUK' ? `Rp ${h.nominal.toLocaleString('id-ID')}` : '-',
        h.tipe === 'KELUAR' ? `Rp ${h.nominal.toLocaleString('id-ID')}` : '-',
        `Rp ${h.saldoBerjalan.toLocaleString('id-ID')}`
      ]);
      summaryText = `Total Masuk: Rp ${arusKasData.totalMasuk.toLocaleString('id-ID')} | Total Keluar: Rp ${arusKasData.totalKeluar.toLocaleString('id-ID')} | Saldo Akhir: Rp ${arusKasData.saldoAkhir.toLocaleString('id-ID')}`;
    } else {
      title = 'Rekapitulasi Arus Kas Bulanan';
      subtitle = 'Tahun Anggaran 2026';
      headers = ['Bulan', 'Total Penerimaan', 'Total Pengeluaran', 'Surplus / Defisit'];
      rows = monthlyData.map(m => [
        m.bulan,
        `Rp ${m.penerimaan.toLocaleString('id-ID')}`,
        `Rp ${m.pengeluaran.toLocaleString('id-ID')}`,
        `Rp ${m.selisih.toLocaleString('id-ID')}`
      ]);
      const totPen = monthlyData.reduce((s, m) => s + m.penerimaan, 0);
      const totPeng = monthlyData.reduce((s, m) => s + m.pengeluaran, 0);
      rows.push(['TOTAL TAHUNAN', `Rp ${totPen.toLocaleString('id-ID')}`, `Rp ${totPeng.toLocaleString('id-ID')}`, `Rp ${(totPen - totPeng).toLocaleString('id-ID')}`]);
      summaryText = `Penerimaan: Rp ${totPen.toLocaleString('id-ID')} | Pengeluaran: Rp ${totPeng.toLocaleString('id-ID')} | Surplus: Rp ${(totPen - totPeng).toLocaleString('id-ID')}`;
    }

    setDownloadNotice(null);
    const res = downloadLaporanPDF({
      reportType: activeReport,
      title,
      subtitle,
      headers,
      rows,
      summaryText
    });
    setDownloadNotice(res);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Laporan Keuangan Pesantren</h2>
          <p className="text-xs text-slate-500">
            Rekapitulasi penerimaan, pengeluaran, tagihan, tunggakan piutang, dan arus kas terpadu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            title="Download Data Laporan format CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Download Dokumen Laporan Resmi format PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Cetak langsung ke printer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Download notification banner if active */}
      {downloadNotice && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition print:hidden ${
          downloadNotice.success 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {downloadNotice.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{downloadNotice.message}</span>
          </div>
          <div className="flex items-center gap-2">
            {downloadNotice.blobUrl && (
              <a
                href={downloadNotice.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-emerald-800 hover:text-emerald-950 font-bold"
              >
                Buka PDF di Tab Baru ↗
              </a>
            )}
            <button
              onClick={() => setDownloadNotice(null)}
              className="p-1 hover:bg-emerald-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 print:hidden">
        {[
          { id: 'PENERIMAAN', label: 'Penerimaan Pembayaran' },
          { id: 'PENGELUARAN', label: 'Pengeluaran Kas' },
          { id: 'TAGIHAN', label: 'Tagihan Keseluruhan' },
          { id: 'TUNGGAKAN', label: 'Tunggakan Piutang' },
          { id: 'ARUS_KAS', label: 'Arus Kas Harian' },
          { id: 'BULANAN', label: 'Rekap Bulanan (2026)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeReport === tab.id 
                ? 'bg-emerald-800 text-white shadow-xs' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 print:hidden">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Mulai Tanggal</label>
          <input
            type="date"
            value={tglMulai}
            onChange={(e) => setTglMulai(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={tglSelesai}
            onChange={(e) => setTglSelesai(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter Rombel / Kelas</label>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          >
            <option value="">Semua Kelas</option>
            {state.KELAS.map(k => (
              <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Header for Official Printouts */}
      <div className="hidden print:block text-center border-b-2 border-emerald-950 pb-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Yayasan Pendidikan Islam Inayatul Muhajirin</h2>
        <h1 className="text-xl font-black text-slate-900">Pondok Pesantren Inayatul Muhajirin</h1>
        <p className="text-[11px] text-slate-500">Mandalasari, Cikancung, Kabupaten Bandung, Jawa Barat</p>
        <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
          LAPORAN {activeReport} • TANGGAL CETAK: {db.formatNow()}
        </div>
      </div>

      {/* REPORT CONTENT: 1. PENERIMAAN */}
      {activeReport === 'PENERIMAAN' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-900">Total Kas Masuk Terverifikasi:</span>
            <span className="text-lg font-black text-emerald-950 font-mono">{formatRp(penerimaanData.total)}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Transaksi & Tgl</th>
                  <th className="py-3 px-4">Nama Santri & Kelas</th>
                  <th className="py-3 px-4">Tagihan Terkait</th>
                  <th className="py-3 px-4">Metode / Ref</th>
                  <th className="py-3 px-4 text-right">Nominal Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {penerimaanData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Tidak ada data penerimaan</td>
                  </tr>
                ) : (
                  penerimaanData.rows.map(({ payment, bill, santri, kelas }) => (
                    <tr key={payment.ID_PEMBAYARAN}>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">{payment.NOMOR_TRANSAKSI}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{payment.TANGGAL_PEMBAYARAN}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{santri?.NAMA_LENGKAP}</div>
                        <div className="text-[11px] text-slate-500">{kelas?.NAMA_KELAS}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{bill?.NAMA_TAGIHAN}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold">{payment.METODE}</span>
                        {payment.REFERENSI && <div className="text-[10px] text-slate-500 font-mono">Ref: {payment.REFERENSI}</div>}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-800 font-mono text-sm">
                        {formatRp(payment.NOMINAL)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: 2. PENGELUARAN */}
      {activeReport === 'PENGELUARAN' && (
        <div className="space-y-4">
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 flex justify-between items-center text-xs">
            <span className="font-bold text-rose-900">Total Pengeluaran Kas Lunas:</span>
            <span className="text-lg font-black text-rose-950 font-mono">{formatRp(pengeluaranData.totalLunas)}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal Pembayaran</th>
                  <th className="py-3 px-4">Kategori Belanja</th>
                  <th className="py-3 px-4">Uraian Kebutuhan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Nominal Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pengeluaranData.rows.map(({ expense, kategori }) => (
                  <tr key={expense.ID_PENGELUARAN}>
                    <td className="py-3 px-4">{expense.TANGGAL_PEMBAYARAN || expense.TANGGAL_PENGAJUAN}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{kategori?.NAMA_KATEGORI}</td>
                    <td className="py-3 px-4">{expense.URAIAN}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        expense.STATUS === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {expense.STATUS}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-900 font-mono text-sm">
                      {formatRp(expense.NOMINAL_PENGAJUAN)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: 3 & 4. TAGIHAN & TUNGGAKAN */}
      {(activeReport === 'TAGIHAN' || activeReport === 'TUNGGAKAN') && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Total Tagihan Awal</span>
              <span className="text-base font-black text-slate-900 font-mono">
                {formatRp(activeReport === 'TUNGGAKAN' ? tunggakanData.totalNominal : tagihanData.totalNominal)}
              </span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block mb-1">Telah Diterima</span>
              <span className="text-base font-black text-emerald-900 font-mono">
                {formatRp(activeReport === 'TUNGGAKAN' ? tunggakanData.totalPaid : tagihanData.totalPaid)}
              </span>
            </div>
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-700 block mb-1">Sisa Piutang / Tunggakan</span>
              <span className="text-base font-black text-rose-900 font-mono">
                {formatRp(activeReport === 'TUNGGAKAN' ? tunggakanData.totalRemaining : tagihanData.totalRemaining)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Santri & Kelas</th>
                  <th className="py-3 px-4">Tagihan & Periode</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Dibayar</th>
                  <th className="py-3 px-4 text-right">Sisa Tunggakan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeReport === 'TUNGGAKAN' ? tunggakanData.rows : tagihanData.rows).map(({ bill, santri, kelas, paid, remaining, statusPembayaran }) => (
                  <tr key={bill.ID_TAGIHAN}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{santri?.NAMA_LENGKAP}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NIS: {santri?.NIS} • {kelas?.NAMA_KELAS}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{bill.NAMA_TAGIHAN}</div>
                      <div className="text-[11px] text-slate-500">{bill.PERIODE_TAGIHAN || 'Sekali Bayar'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatRp(bill.NOMINAL)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800">{formatRp(paid)}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-700 font-mono text-sm">{formatRp(remaining)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        statusPembayaran === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' :
                        statusPembayaran === 'CICIL' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {statusPembayaran}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: 5. BULANAN */}
      {activeReport === 'BULANAN' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bulan</th>
                <th className="py-3 px-4 text-right">Penerimaan Kas</th>
                <th className="py-3 px-4 text-right">Pengeluaran Lunas</th>
                <th className="py-3 px-4 text-right">Selisih Kas Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {monthlyData.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 font-sans">{m.bulan}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-800">{formatRp(m.penerimaan)}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-700">{formatRp(m.pengeluaran)}</td>
                  <td className={`py-3 px-4 text-right font-black text-sm ${m.selisih >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    {m.selisih >= 0 ? '+' : ''}{formatRp(m.selisih)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT CONTENT: 6. ARUS KAS */}
      {activeReport === 'ARUS_KAS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Uraian Transaksi</th>
                <th className="py-3 px-4 text-right">Pemasukan</th>
                <th className="py-3 px-4 text-right">Pengeluaran</th>
                <th className="py-3 px-4 text-right">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {arusKasData.history.map((h, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-sans">{h.tanggal}</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900">{h.uraian}</div>
                    <div className="text-[10px] text-slate-500">{h.kategori}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-800">
                    {h.tipe === 'MASUK' ? formatRp(h.nominal) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-700">
                    {h.tipe === 'KELUAR' ? formatRp(h.nominal) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatRp(h.saldoBerjalan)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
