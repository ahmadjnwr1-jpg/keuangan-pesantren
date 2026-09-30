import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Printer, 
  Send, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign,
  X,
  FileText,
  Trash2,
  Download
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { PaymentMethod } from '../types/database';
import { downloadKwitansiPDF } from '../services/pdfGenerator';

interface PembayaranViewProps {
  onOpenInvoice: (idPembayaran: string) => void;
  onOpenWhatsApp: (idPembayaran: string) => void;
  preSelectedTagihanId?: string | null;
}

export const PembayaranView: React.FC<PembayaranViewProps> = ({
  onOpenInvoice,
  onOpenWhatsApp,
  preSelectedTagihanId
}) => {
  const db = DbEngine.getInstance();
  const state = db.getState();

  const [search, setSearch] = useState('');
  const [filterMetode, setFilterMetode] = useState('');
  const [showAddModal, setShowAddModal] = useState(Boolean(preSelectedTagihanId));

  // Payment Form
  const [selectedTagihanId, setSelectedTagihanId] = useState(preSelectedTagihanId || '');
  const [nominal, setNominal] = useState<number>(0);
  const [tglPembayaran, setTglPembayaran] = useState(db.formatDateOnly());
  const [metode, setMetode] = useState<PaymentMethod>('TUNAI');
  const [referensi, setReferensi] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [downloadNotice, setDownloadNotice] = useState<{ success: boolean; message: string; blobUrl?: string } | null>(null);

  const handleDirectDownload = (idPay: string) => {
    setDownloadNotice(null);
    const res = downloadKwitansiPDF(idPay);
    setDownloadNotice(res);
  };

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  // Active bills with positive remaining amount
  const unpaidBills = state.TAGIHAN
    .filter(b => b.STATUS === 'AKTIF')
    .map(b => {
      const santri = state.SANTRI.find(s => s.ID_SANTRI === b.ID_SANTRI);
      const paid = db.getBillPaidAmount(b.ID_TAGIHAN);
      const remaining = Math.max(0, b.NOMINAL - paid);
      return { bill: b, santri, remaining, paid };
    })
    .filter(item => item.remaining > 0);

  const selectedBillInfo = unpaidBills.find(item => item.bill.ID_TAGIHAN === selectedTagihanId);

  // Set nominal to remaining balance automatically when tagihan changes
  const handleSelectTagihan = (id: string) => {
    setSelectedTagihanId(id);
    const info = unpaidBills.find(item => item.bill.ID_TAGIHAN === id);
    if (info) {
      setNominal(info.remaining);
    }
  };

  const handleDeletePembayaran = (idPay: string, noTrx: string) => {
    const alasan = prompt(`Batalkan/Hapus pembayaran ${noTrx}? Masukkan alasan koreksi:`, 'Koreksi transaksi salah input');
    if (!alasan) return;
    try {
      const res = db.deletePembayaran(idPay, alasan);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagihanId) {
      alert('Silakan pilih tagihan yang akan dibayar.');
      return;
    }
    try {
      const newPay = db.addPembayaran({
        idTagihan: selectedTagihanId,
        tglPembayaran,
        nominal,
        metode,
        referensi,
        keterangan
      });
      setShowAddModal(false);
      setSelectedTagihanId('');
      setNominal(0);
      setReferensi('');
      setKeterangan('');
      alert(`Pembayaran berhasil dicatat dengan Nomor Transaksi: ${newPay.NOMOR_TRANSAKSI}`);
      // Open invoice automatically
      onOpenInvoice(newPay.ID_PEMBAYARAN);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const paymentsWithDetails = state.PEMBAYARAN.map(p => {
    const bill = state.TAGIHAN.find(t => t.ID_TAGIHAN === p.ID_TAGIHAN);
    const santri = bill ? state.SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI) : null;
    const kelas = santri ? state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
    return { payment: p, bill, santri, kelas };
  });

  const filteredPayments = paymentsWithDetails.filter(({ payment, bill, santri }) => {
    if (filterMetode && payment.METODE !== filterMetode) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        payment.NOMOR_TRANSAKSI.toLowerCase().includes(q) ||
        (payment.REFERENSI && payment.REFERENSI.toLowerCase().includes(q)) ||
        (santri && santri.NAMA_LENGKAP.toLowerCase().includes(q)) ||
        (santri && santri.NIS.toLowerCase().includes(q)) ||
        (bill && bill.NAMA_TAGIHAN.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Penerimaan Pembayaran Santri</h2>
          <p className="text-xs text-slate-500">
            Pencatatan kas masuk, cicilan pembayaran, cetak tanda terima kwitansi resmi, dan notifikasi WhatsApp wali.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            if (unpaidBills.length > 0 && !selectedTagihanId) {
              handleSelectTagihan(unpaidBills[0].bill.ID_TAGIHAN);
            }
          }}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Input Pembayaran Baru</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Transaksi / Santri / NIS / Referensi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={filterMetode}
            onChange={(e) => setFilterMetode(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          >
            <option value="">Semua Metode Pembayaran</option>
            <option value="TUNAI">Metode: TUNAI</option>
            <option value="TRANSFER">Metode: TRANSFER</option>
            <option value="LAINNYA">Metode: LAINNYA</option>
          </select>
        </div>
      </div>

      {/* Notification banner if downloading */}
      {downloadNotice && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
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
                Buka PDF ↗
              </a>
            )}
            <button
              onClick={() => setDownloadNotice(null)}
              className="p-1 hover:bg-emerald-100 rounded text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Transaksi & Tanggal</th>
                <th className="py-3 px-4">Santri & Kelas</th>
                <th className="py-3 px-4">Tagihan Terkait</th>
                <th className="py-3 px-4 text-right">Nominal Masuk</th>
                <th className="py-3 px-4">Metode / Ref</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi pembayaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(({ payment, bill, santri, kelas }) => (
                  <tr key={payment.ID_PEMBAYARAN} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">{payment.NOMOR_TRANSAKSI}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{payment.TANGGAL_PEMBAYARAN}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{santri?.NAMA_LENGKAP || 'Santri'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        NIS: {santri?.NIS || '-'} • {kelas?.NAMA_KELAS}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{bill?.NAMA_TAGIHAN || '-'}</div>
                      <div className="text-[11px] text-slate-500">
                        {bill?.PERIODE_TAGIHAN ? `Periode: ${bill.PERIODE_TAGIHAN}` : 'Sekali Bayar'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-emerald-800 font-mono text-sm">
                      {formatRp(payment.NOMINAL)}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        payment.METODE === 'TRANSFER' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {payment.METODE}
                      </span>
                      {payment.REFERENSI && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Ref: {payment.REFERENSI}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleDirectDownload(payment.ID_PEMBAYARAN)}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Download Kwitansi format PDF"
                        >
                          <Download className="w-3 h-3 text-white" />
                          <span>Unduh PDF</span>
                        </button>
                        <button
                          onClick={() => onOpenInvoice(payment.ID_PEMBAYARAN)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Lihat / Cetak Kwitansi"
                        >
                          <Printer className="w-3 h-3 text-slate-600" />
                          <span>Kwitansi</span>
                        </button>
                        <button
                          onClick={() => onOpenWhatsApp(payment.ID_PEMBAYARAN)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Kirim ke WhatsApp Wali"
                        >
                          <Send className="w-3 h-3 text-emerald-700" />
                          <span>WA</span>
                        </button>
                        <button
                          onClick={() => handleDeletePembayaran(payment.ID_PEMBAYARAN, payment.NOMOR_TRANSAKSI)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                          title="Batalkan / Hapus Transaksi Pembayaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Input Pembayaran Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Input Pembayaran Tagihan</h3>
                <p className="text-xs text-emerald-200">Validasi otomatis sisa tagihan & kas masuk</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Tagihan Santri yang Dibayar *</label>
                <select
                  required
                  value={selectedTagihanId}
                  onChange={(e) => handleSelectTagihan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-emerald-600 focus:bg-white"
                >
                  <option value="">-- Pilih Tagihan Santri --</option>
                  {unpaidBills.map(item => (
                    <option key={item.bill.ID_TAGIHAN} value={item.bill.ID_TAGIHAN}>
                      {item.santri?.NAMA_LENGKAP} ({item.santri?.NIS}) — {item.bill.NAMA_TAGIHAN} {item.bill.PERIODE_TAGIHAN ? `(${item.bill.PERIODE_TAGIHAN})` : ''} — Sisa: {formatRp(item.remaining)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBillInfo && (
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Tagihan Awal:</span>
                    <span className="font-bold text-slate-900 font-mono">{formatRp(selectedBillInfo.bill.NOMINAL)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Telah Masuk:</span>
                    <span className="font-bold text-emerald-800 font-mono">{formatRp(selectedBillInfo.paid)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-200/80">
                    <span className="font-bold text-rose-700">Maksimum Pembayaran (Sisa):</span>
                    <span className="font-black text-rose-700 font-mono text-sm">{formatRp(selectedBillInfo.remaining)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Pembayaran *</label>
                  <input
                    type="date"
                    required
                    value={tglPembayaran}
                    onChange={(e) => setTglPembayaran(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Metode Bayar *</label>
                  <select
                    value={metode}
                    onChange={(e) => setMetode(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-bold"
                  >
                    <option value="TUNAI">TUNAI (Kasir)</option>
                    <option value="TRANSFER">TRANSFER (Rekening Bank)</option>
                    <option value="LAINNYA">LAINNYA (Voucher / Bantuan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp) *
                  {selectedBillInfo && (
                    <span className="text-slate-400 font-normal ml-1">
                      (Bisa lunas penuh atau cicilan)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={selectedBillInfo ? selectedBillInfo.remaining : undefined}
                  value={nominal}
                  onChange={(e) => setNominal(Number(e.target.value))}
                  placeholder="Masukkan nominal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black font-mono text-emerald-950 focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Referensi / Bukti Transfer {metode === 'TRANSFER' ? '*' : '(Opsional)'}
                </label>
                <input
                  type="text"
                  required={metode === 'TRANSFER'}
                  value={referensi}
                  onChange={(e) => setReferensi(e.target.value)}
                  placeholder={metode === 'TRANSFER' ? 'Contoh: BSI-TRF-99210041 (Wajib untuk transfer)' : 'Nomor kwitansi manual jika ada'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Titipan orang tua santri via ustadz"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-xs"
                >
                  Simpan & Cetak Kwitansi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
