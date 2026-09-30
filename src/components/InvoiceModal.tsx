import React from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  Printer, 
  Send, 
  X, 
  ShieldCheck, 
  Download,
  AlertCircle
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { downloadKwitansiPDF } from '../services/pdfGenerator';
import { PesantrenLogoSvg } from './PesantrenLogoSvg';

interface InvoiceModalProps {
  idPembayaran: string | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ idPembayaran, onClose }) => {
  if (!idPembayaran) return null;

  const db = DbEngine.getInstance();
  let data: any = null;
  let errorMsg = '';

  try {
    data = db.getInvoiceData(idPembayaran);
  } catch (e: any) {
    errorMsg = e.message;
  }

  if (errorMsg || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-bold">Kwitansi Tidak Ditemukan</h3>
          </div>
          <p className="text-sm text-slate-600 mb-6">{errorMsg || 'Data pembayaran tidak tersedia.'}</p>
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const { payment, bill, santri, kelas, jenjang, jtg, paidTotal, sisa, status, pondok } = data;
  const [downloadNotice, setDownloadNotice] = React.useState<{ success: boolean; message: string; blobUrl?: string } | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloadNotice(null);
    const res = downloadKwitansiPDF(idPembayaran);
    setDownloadNotice(res);
  };

  const handleWhatsApp = () => {
    const wa = db.generateWhatsAppText(idPembayaran);
    window.open(wa.waUrl, '_blank');
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Top Actions - Hidden during Print */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-300" />
            <span className="font-bold text-sm tracking-wide">Kwitansi & Bukti Pembayaran Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              title="Download Kwitansi Resmi format PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Kirim ke WhatsApp Wali Santri"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download notification banner if active */}
        {downloadNotice && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between print:hidden ${
            downloadNotice.success ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-200' : 'bg-rose-100 text-rose-900 border-b border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{downloadNotice.message}</span>
            </div>
            {downloadNotice.blobUrl && (
              <a 
                href={downloadNotice.blobUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-emerald-800 hover:text-emerald-950 font-bold ml-2"
              >
                Buka PDF di Tab Baru ↗
              </a>
            )}
          </div>
        )}

        {/* Printable Area */}
        <div id="printable-invoice" className="p-8 sm:p-10 overflow-y-auto bg-white text-slate-800 text-sm leading-relaxed">
          
          {/* Header Lembaga (Kop Surat Pesantren) */}
          <div className="text-center border-b-2 border-emerald-900 pb-5 mb-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-emerald-700/60 mx-auto mb-2 flex items-center justify-center shadow-md overflow-hidden">
              <PesantrenLogoSvg className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-emerald-800">{pondok.namaYayasan}</h1>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">{pondok.namaPondok}</h2>
            <p className="text-xs text-slate-600 mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>{pondok.alamat}</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kontak Keuangan: {pondok.kontak} • Rekening BSI: 7182991023 a.n. Pontren Inayatul Muhajirin
            </p>
          </div>

          {/* Title & Document Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">BUKTI PENERIMAAN PEMBAYARAN</span>
              <div className="text-lg font-black text-slate-900 tracking-tight font-mono">{payment.NOMOR_TRANSAKSI}</div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Bayar: {payment.TANGGAL_PEMBAYARAN}</span>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${
                status === 'LUNAS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                status === 'CICIL' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-red-100 text-red-800 border border-red-300'
              }`}>
                STATUS: {status}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Metode: {payment.METODE}</span>
            </div>
          </div>

          {/* Student & Bill Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Data Santri</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{santri?.NAMA_LENGKAP || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIS:</span>
                  <span className="font-mono font-semibold text-slate-800">{santri?.NIS || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jenjang / Kelas:</span>
                  <span className="text-slate-800">{jenjang?.KODE_JENJANG || ''} - {kelas?.NAMA_KELAS || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wali Santri:</span>
                  <span className="text-slate-800">{santri?.NAMA_WALI || santri?.NAMA_AYAH_KANDUNG || '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Rincian Tagihan</span>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Tagihan:</span>
                  <span className="font-bold text-slate-900">{bill.NAMA_TAGIHAN}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Periode:</span>
                  <span className="text-slate-800">{bill.PERIODE_TAGIHAN || 'Sekali Bayar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jatuh Tempo:</span>
                  <span className="text-slate-800">{bill.TANGGAL_JATUH_TEMPO}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Referensi:</span>
                  <span className="font-mono text-slate-800">{payment.REFERENSI || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Deskripsi Pembayaran</th>
                  <th className="py-2.5 px-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{bill.NAMA_TAGIHAN}</div>
                    <div className="text-[11px] text-slate-500">
                      {payment.KETERANGAN || `Pembayaran angsuran tagihan santri ${santri?.NAMA_LENGKAP}`}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    {formatRupiah(payment.NOMINAL)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Total Nominal Tagihan:</span>
                <span className="font-bold">{formatRupiah(bill.NOMINAL)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-1.5">
                <span>Pembayaran Saat Ini:</span>
                <span className="text-sm font-black">{formatRupiah(payment.NOMINAL)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Telah Masuk:</span>
                <span>{formatRupiah(paidTotal)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1.5">
                <span>Sisa Tagihan:</span>
                <span className="text-sm font-black">{formatRupiah(sisa)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-200">
            <div>
              <div className="text-[11px] text-slate-500 mb-1">Catatan Pesantren:</div>
              <p className="text-[11px] text-slate-600 italic">
                1. Simpan tanda terima ini sebagai bukti sah pembayaran.<br/>
                2. Pembayaran via transfer dinyatakan sah setelah dana masuk rekening resmi.<br/>
                3. Informasi tunggakan dapat ditanyakan langsung ke bagian keuangan.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi Sistem Keuangan Pesantren</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-slate-600 text-[11px]">
                Mandalasari, {payment.TANGGAL_PEMBAYARAN}
              </div>
              <div className="text-slate-700 font-medium text-[11px] mt-0.5">
                {pondok.jabatan}
              </div>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic text-emerald-800 text-xs tracking-wider opacity-60">
                  (Tertanda Resmi)
                </span>
              </div>
              <div className="font-bold text-slate-900 underline text-xs">
                {pondok.penandatangan}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                ID Dokumen: {payment.ID_PEMBAYARAN}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Close */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center print:hidden">
          <span className="text-xs text-slate-500">
            Nomor: <span className="font-mono font-bold text-slate-700">{payment.NOMOR_TRANSAKSI}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp Orang Tua</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kwitansi</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
