import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Ban, 
  Calendar, 
  Filter, 
  X, 
  CreditCard, 
  Trash2,
  Eye,
  Edit3,
  User,
  GraduationCap,
  Clock,
  Printer,
  FileText,
  MessageSquare,
  Download
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { TagihanRow } from '../types/database';
import { WhatsAppTagihanModal } from '../components/WhatsAppTagihanModal';
import { downloadSuratTagihanPDF } from '../services/pdfGenerator';
import { PesantrenLogoSvg } from '../components/PesantrenLogoSvg';

interface TagihanViewProps {
  onPayBill: (idTagihan: string) => void;
}

export const TagihanView: React.FC<TagihanViewProps> = ({ onPayBill }) => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const activeYear = state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKelas, setFilterKelas] = useState('');

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<TagihanRow | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // WhatsApp & PDF Modals
  const [waModalTagihanId, setWaModalTagihanId] = useState<string | null>(null);
  const [toastPdfNotice, setToastPdfNotice] = useState<string | null>(null);

  const handleDownloadPDFQuick = (idTagihan: string) => {
    const res = downloadSuratTagihanPDF(idTagihan);
    setToastPdfNotice(res.message);
    setTimeout(() => setToastPdfNotice(null), 3500);
  };

  // Detail & Edit Modals
  const [showDetailModal, setShowDetailModal] = useState<TagihanRow | null>(null);
  const [showEditModal, setShowEditModal] = useState<TagihanRow | null>(null);
  const [editForm, setEditForm] = useState({
    nominal: 0,
    tanggalJatuhTempo: '',
    keterangan: '',
    status: 'AKTIF' as any
  });

  // Generate Wizard Form
  const [generateForm, setGenerateForm] = useState({
    idTahunAjaran: activeYear?.ID_TAHUN_AJARAN || '',
    idJenisTagihan: state.JENIS_TAGIHAN[0]?.ID_JENIS_TAGIHAN || '',
    periodeTagihan: '2026-10',
    tglTerbit: db.formatDateOnly(),
    tglJatuhTempo: '2026-10-10',
    idJenjang: '',
    idKelas: ''
  });

  const [previewResult, setPreviewResult] = useState<any>(null);

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const billsWithStats = state.TAGIHAN.map(b => {
    const santri = state.SANTRI.find(s => s.ID_SANTRI === b.ID_SANTRI);
    const kelas = santri ? state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
    const paid = db.getBillPaidAmount(b.ID_TAGIHAN);
    const sisa = Math.max(0, b.NOMINAL - paid);
    const paymentStatus = db.getBillPaymentStatus(b);

    return {
      bill: b,
      santri,
      kelas,
      paid,
      sisa,
      paymentStatus
    };
  });

  const filteredBills = billsWithStats.filter(item => {
    if (filterStatus) {
      if (filterStatus === 'DIBATALKAN' && item.bill.STATUS !== 'DIBATALKAN') return false;
      if (filterStatus === 'PENGAJUAN_PEMBATALAN' && item.bill.STATUS !== 'PENGAJUAN_PEMBATALAN') return false;
      if (filterStatus === 'BELUM BAYAR' && (item.paymentStatus !== 'BELUM BAYAR' || item.bill.STATUS !== 'AKTIF')) return false;
      if (filterStatus === 'CICIL' && (item.paymentStatus !== 'CICIL' || item.bill.STATUS !== 'AKTIF')) return false;
      if (filterStatus === 'LUNAS' && (item.paymentStatus !== 'LUNAS' || item.bill.STATUS !== 'AKTIF')) return false;
    }
    if (filterKelas && item.santri?.ID_KELAS !== filterKelas) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.bill.ID_TAGIHAN.toLowerCase().includes(q) ||
        item.bill.NAMA_TAGIHAN.toLowerCase().includes(q) ||
        (item.santri && item.santri.NAMA_LENGKAP.toLowerCase().includes(q)) ||
        (item.santri && item.santri.NIS.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleGeneratePreview = () => {
    try {
      const prev = db.previewGenerateTagihan({
        idTahunAjaran: generateForm.idTahunAjaran,
        idJenisTagihan: generateForm.idJenisTagihan,
        periodeTagihan: generateForm.periodeTagihan,
        tglTerbit: generateForm.tglTerbit,
        tglJatuhTempo: generateForm.tglJatuhTempo,
        idJenjang: generateForm.idJenjang || undefined,
        idKelas: generateForm.idKelas || undefined
      });
      setPreviewResult(prev);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateExecute = () => {
    try {
      const res = db.executeGenerateTagihan({
        idTahunAjaran: generateForm.idTahunAjaran,
        idJenisTagihan: generateForm.idJenisTagihan,
        periodeTagihan: generateForm.periodeTagihan,
        tglTerbit: generateForm.tglTerbit,
        tglJatuhTempo: generateForm.tglJatuhTempo,
        idJenjang: generateForm.idJenjang || undefined,
        idKelas: generateForm.idKelas || undefined
      });
      setShowGenerateModal(false);
      setPreviewResult(null);
      alert(`Berhasil menerbitkan ${res.generatedCount} tagihan santri!\nTotal Nominal: Rp ${res.totalNominal.toLocaleString('id-ID')}\nDilewati (Duplikat): ${res.skippedDuplicates}\nDilewati (Tarif Belum Diatur): ${res.skippedNoTariff}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRequestCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCancelModal) return;
    try {
      db.ajukanPembatalanTagihan(showCancelModal.ID_TAGIHAN, cancelReason);
      setShowCancelModal(null);
      setCancelReason('');
      alert('Pengajuan pembatalan tagihan berhasil dikirim. Menunggu persetujuan Kepala Bidang Keuangan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditTagihanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    try {
      db.updateTagihan(showEditModal.ID_TAGIHAN, {
        nominal: Number(editForm.nominal),
        tanggalJatuhTempo: editForm.tanggalJatuhTempo,
        keterangan: editForm.keterangan,
        status: editForm.status
      });
      setShowEditModal(null);
      alert('Rincian tagihan berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pengelolaan Tagihan Santri</h2>
          <p className="text-xs text-slate-500">
            Snapshot tarif patokan, generate tagihan massal, pencegahan duplikasi, unduh PDF surat, dan kirim tagihan ke WhatsApp wali.
          </p>
        </div>

        <button
          onClick={() => {
            setShowGenerateModal(true);
            setPreviewResult(null);
          }}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Tagihan Massal</span>
        </button>
      </div>

      {toastPdfNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastPdfNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Santri / NIS / Tagihan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          >
            <option value="">Semua Status Pembayaran</option>
            <option value="BELUM BAYAR">Status: Belum Bayar</option>
            <option value="CICIL">Status: Cicil (Sebagian)</option>
            <option value="LUNAS">Status: Lunas</option>
            <option value="PENGAJUAN_PEMBATALAN">Status: Pengajuan Pembatalan</option>
            <option value="DIBATALKAN">Status: Dibatalkan</option>
          </select>
        </div>

        <div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 focus:bg-white"
          >
            <option value="">Semua Kelas</option>
            {state.KELAS.map(k => (
              <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Santri & Kelas</th>
                <th className="py-3 px-4">Nama Tagihan & Periode</th>
                <th className="py-3 px-4 text-right">Nominal Tagihan</th>
                <th className="py-3 px-4 text-right">Telah Dibayar</th>
                <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada tagihan yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filteredBills.map(({ bill, santri, kelas, paid, sisa, paymentStatus }) => {
                  const isCancelled = bill.STATUS === 'DIBATALKAN';
                  const isPendingCancel = bill.STATUS === 'PENGAJUAN_PEMBATALAN';

                  return (
                    <tr key={bill.ID_TAGIHAN} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{santri?.NAMA_LENGKAP || 'Santri'}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NIS: {santri?.NIS || '-'} • {kelas?.NAMA_KELAS}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{bill.NAMA_TAGIHAN}</div>
                        <div className="text-[11px] text-slate-500">
                          {bill.PERIODE_TAGIHAN ? `Periode: ${bill.PERIODE_TAGIHAN}` : 'Sekali Bayar'} • Tempo: {bill.TANGGAL_JATUH_TEMPO}
                        </div>
                        {bill.KETERANGAN && (
                          <div className="text-[10px] text-slate-400 italic truncate max-w-xs">{bill.KETERANGAN}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900 font-mono text-sm">
                        {formatRp(bill.NOMINAL)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-800 font-mono">
                        {formatRp(paid)}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-rose-700 font-mono text-sm">
                        {formatRp(sisa)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          isCancelled ? 'bg-red-100 text-red-800' :
                          isPendingCancel ? 'bg-amber-100 text-amber-800' :
                          paymentStatus === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' :
                          paymentStatus === 'CICIL' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {bill.STATUS === 'AKTIF' ? paymentStatus : bill.STATUS}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5 items-center">
                          {/* Cetak PDF Surat Tagihan */}
                          <button
                            onClick={() => handleDownloadPDFQuick(bill.ID_TAGIHAN)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition cursor-pointer"
                            title="Unduh PDF Surat Pemberitahuan Tagihan Resmi"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Kirim Tagihan via WhatsApp */}
                          <button
                            onClick={() => setWaModalTagihanId(bill.ID_TAGIHAN)}
                            className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition cursor-pointer shadow-2xs"
                            title="Kirim Tagihan & Narasi Surat via WhatsApp ke Wali Santri"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Detail Tagihan (Eye) */}
                          <button
                            onClick={() => setShowDetailModal(bill)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                            title="Lihat Detail Rincian Tagihan & Riwayat Pembayaran"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Tagihan (Edit3) */}
                          <button
                            onClick={() => {
                              setShowEditModal(bill);
                              setEditForm({
                                nominal: bill.NOMINAL,
                                tanggalJatuhTempo: bill.TANGGAL_JATUH_TEMPO,
                                keterangan: bill.KETERANGAN || '',
                                status: bill.STATUS
                              });
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 rounded-lg transition cursor-pointer"
                            title="Edit Rincian Tagihan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {bill.STATUS === 'AKTIF' && sisa > 0 && (
                            <button
                              onClick={() => onPayBill(bill.ID_TAGIHAN)}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Bayar tagihan ini"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Bayar</span>
                            </button>
                          )}

                          {bill.STATUS === 'AKTIF' && (
                            <button
                              onClick={() => {
                                setShowCancelModal(bill);
                                setCancelReason('');
                              }}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                              title="Ajukan pembatalan tagihan ini"
                            >
                              Batalkan
                            </button>
                          )}

                          {paid === 0 && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus tagihan ${bill.NAMA_TAGIHAN} (${santri?.NAMA_LENGKAP})? Tagihan belum pernah dibayar.`)) {
                                  try {
                                    const res = db.deleteTagihan(bill.ID_TAGIHAN);
                                    alert(res.message);
                                  } catch (err: any) {
                                    alert(err.message);
                                  }
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                              title="Hapus tagihan salah input"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Generate Tagihan Massal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Generate Tagihan Massal Santri</h3>
                <p className="text-xs text-emerald-200">Snapshot tarif otomatis & pencegahan duplikasi tagihan</p>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="p-1 hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran *</label>
                  <select
                    value={generateForm.idTahunAjaran}
                    onChange={(e) => setGenerateForm({ ...generateForm, idTahunAjaran: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {state.TAHUN_AJARAN.map(t => (
                      <option key={t.ID_TAHUN_AJARAN} value={t.ID_TAHUN_AJARAN}>
                        {t.NAMA_TAHUN_AJARAN} ({t.STATUS})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Tagihan *</label>
                  <select
                    value={generateForm.idJenisTagihan}
                    onChange={(e) => setGenerateForm({ ...generateForm, idJenisTagihan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {state.JENIS_TAGIHAN.map(j => (
                      <option key={j.ID_JENIS_TAGIHAN} value={j.ID_JENIS_TAGIHAN}>
                        {j.NAMA_TAGIHAN} ({j.SIFAT})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Periode Tagihan (YYYY-MM)</label>
                  <input
                    type="month"
                    value={generateForm.periodeTagihan}
                    onChange={(e) => setGenerateForm({ ...generateForm, periodeTagihan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Terbit</label>
                  <input
                    type="date"
                    value={generateForm.tglTerbit}
                    onChange={(e) => setGenerateForm({ ...generateForm, tglTerbit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo</label>
                  <input
                    type="date"
                    value={generateForm.tglJatuhTempo}
                    onChange={(e) => setGenerateForm({ ...generateForm, tglJatuhTempo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Filter Jenjang (Opsional)</label>
                  <select
                    value={generateForm.idJenjang}
                    onChange={(e) => setGenerateForm({ ...generateForm, idJenjang: e.target.value, idKelas: '' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Semua Jenjang</option>
                    {state.JENJANG.map(j => (
                      <option key={j.ID_JENJANG} value={j.ID_JENJANG}>{j.NAMA_JENJANG}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Filter Kelas (Opsional)</label>
                  <select
                    value={generateForm.idKelas}
                    onChange={(e) => setGenerateForm({ ...generateForm, idKelas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Semua Kelas</option>
                    {state.KELAS
                      .filter(k => !generateForm.idJenjang || k.ID_JENJANG === generateForm.idJenjang)
                      .map(k => (
                        <option key={k.ID_KELAS} value={k.ID_KELAS}>{k.NAMA_KELAS}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Preview Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Cek Pratinjau & Duplikasi</span>
                </button>
              </div>

              {/* Preview Result Box */}
              {previewResult && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Hasil Pemeriksaan Pratinjau:</div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-xl font-black text-emerald-800">{previewResult.ready.length}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Siap Diterbitkan</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-xl font-black text-amber-800">{previewResult.duplicates.length}</div>
                      <div className="text-[10px] text-amber-700 font-semibold">Dilewati (Duplikat)</div>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <div className="text-xl font-black text-rose-800">{previewResult.noTariff.length}</div>
                      <div className="text-[10px] text-rose-700 font-semibold">Dilewati (Tarif Kosong)</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 font-semibold">
                    <span>Total Estimasi Tagihan:</span>
                    <span className="font-black text-slate-900 font-mono text-sm">{formatRp(previewResult.totalNominal)}</span>
                  </div>

                  {previewResult.ready.length > 0 ? (
                    <button
                      type="button"
                      onClick={handleGenerateExecute}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Konfirmasi & Terbitkan {previewResult.ready.length} Tagihan Sekarang
                    </button>
                  ) : (
                    <p className="text-xs text-rose-600 text-center font-semibold">
                      Tidak ada tagihan yang dapat diterbitkan untuk kriteria ini.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajukan Pembatalan */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-700 flex items-center justify-center shrink-0">
                  <PesantrenLogoSvg className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-sm">Ajukan Pembatalan Tagihan</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCancelModal(null)} 
                className="p-1 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestCancel} className="p-6 space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                Pengajuan pembatalan tagihan akan diverifikasi dan disetujui/ditolak oleh <strong>Ranran Siti Nurhasanah (Kepala Bidang Keuangan)</strong>.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagihan Yang Dibatalkan</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">{showCancelModal.NAMA_TAGIHAN}</div>
                  <div className="text-slate-500 font-mono">Nominal: {formatRp(showCancelModal.NOMINAL)}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-700">Alasan Pembatalan Tagihan *</label>
                  <span className="text-[10px] text-slate-400">Minimal 5 karakter</span>
                </div>
                
                {/* Opsi Alasan Cepat */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Santri pindah sekolah/pesantren',
                    'Mendapatkan beasiswa penuh yayasan',
                    'Kesalahan ganda (duplikasi terbit)',
                    'Keringanan khusus disetujui pimpinan'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCancelReason(preset)}
                      className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-lg text-[10px] text-slate-600 transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  autoFocus
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ketik atau pilih alasan pembatalan di atas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-emerald-600 focus:bg-white resize-y"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(null)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={cancelReason.trim().length < 5}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Tagihan (Mata Icon) */}
      {showDetailModal && (() => {
        const santri = state.SANTRI.find(s => s.ID_SANTRI === showDetailModal.ID_SANTRI);
        const kelas = santri ? state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
        const jenjang = santri ? state.JENJANG.find(j => j.ID_JENJANG === santri.ID_JENJANG) : null;
        const jtg = state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === showDetailModal.ID_JENIS_TAGIHAN);
        const ta = state.TAHUN_AJARAN.find(t => t.ID_TAHUN_AJARAN === showDetailModal.ID_TAHUN_AJARAN);
        const paid = db.getBillPaidAmount(showDetailModal.ID_TAGIHAN);
        const sisa = Math.max(0, showDetailModal.NOMINAL - paid);
        const billPayments = state.PEMBAYARAN.filter(p => p.ID_TAGIHAN === showDetailModal.ID_TAGIHAN);
        const statusPembayaran = db.getBillPaymentStatus(showDetailModal);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
              <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-sm sm:text-base">Detail Rincian Tagihan Santri</h3>
                </div>
                <button onClick={() => setShowDetailModal(null)} className="p-1 hover:text-emerald-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Santri Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-md">
                      NIS: {santri?.NIS || '-'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{santri?.NAMA_LENGKAP || 'Santri'}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {kelas?.NAMA_KELAS || '-'} • {jenjang?.NAMA_JENJANG || '-'} • Wali: {santri?.NAMA_WALI || '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full font-black text-[11px] uppercase ${
                      showDetailModal.STATUS === 'DIBATALKAN' ? 'bg-red-100 text-red-800' :
                      statusPembayaran === 'LUNAS' ? 'bg-emerald-100 text-emerald-800' :
                      statusPembayaran === 'CICIL' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {showDetailModal.STATUS === 'DIBATALKAN' ? 'DIBATALKAN' : statusPembayaran}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">ID: {showDetailModal.ID_TAGIHAN}</div>
                  </div>
                </div>

                {/* Bill Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Jenis Tagihan</span>
                    <strong className="text-slate-900 mt-0.5 block">{showDetailModal.NAMA_TAGIHAN}</strong>
                    <span className="text-[10px] text-slate-500">{jtg?.SIFAT || 'Bulanan'}</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Tahun Ajaran / Periode</span>
                    <strong className="text-slate-900 mt-0.5 block">{ta?.NAMA_TAHUN_AJARAN || '-'}</strong>
                    <span className="text-[10px] text-slate-500">{showDetailModal.PERIODE_TAGIHAN || 'Sekali Bayar'}</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Tanggal Terbit</span>
                    <strong className="text-slate-900 mt-0.5 block">{showDetailModal.TANGGAL_TERBIT}</strong>
                    <span className="text-[10px] text-slate-500">Oleh Sistem</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Jatuh Tempo</span>
                    <strong className="text-rose-700 mt-0.5 block">{showDetailModal.TANGGAL_JATUH_TEMPO}</strong>
                    <span className="text-[10px] text-slate-400">Batas Pelunasan</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="grid grid-cols-3 gap-2 text-center divide-x divide-emerald-200">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-semibold block">Total Nominal Tagihan</span>
                      <span className="text-sm sm:text-base font-black text-slate-900 font-mono mt-0.5 block">
                        {formatRp(showDetailModal.NOMINAL)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-semibold block">Telah Dibayar</span>
                      <span className="text-sm sm:text-base font-black text-emerald-800 font-mono mt-0.5 block">
                        {formatRp(paid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-semibold block">Sisa Yang Harus Dibayar</span>
                      <span className="text-sm sm:text-base font-black text-rose-700 font-mono mt-0.5 block">
                        {formatRp(sisa)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment History Table */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">Riwayat Pembayaran Masuk ({billPayments.length} Transaksi)</span>
                  </div>
                  {billPayments.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                      Belum ada catatan transaksi pembayaran untuk pos tagihan ini.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">No. Transaksi</th>
                            <th className="py-2.5 px-3">Tanggal</th>
                            <th className="py-2.5 px-3 text-right">Nominal</th>
                            <th className="py-2.5 px-3">Metode</th>
                            <th className="py-2.5 px-3">Ref / Ket</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {billPayments.map(p => (
                            <tr key={p.ID_PEMBAYARAN} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">{p.NOMOR_TRANSAKSI}</td>
                              <td className="py-2 px-3 text-slate-600">{p.TANGGAL_PEMBAYARAN}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">{formatRp(p.NOMINAL)}</td>
                              <td className="py-2 px-3">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold">{p.METODE}</span>
                              </td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">{p.REFERENSI || p.KETERANGAN || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {showDetailModal.KETERANGAN && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                    <strong>Catatan:</strong> {showDetailModal.KETERANGAN}
                  </div>
                )}

                <div className="pt-3 flex flex-wrap justify-between items-center gap-2 border-t border-slate-200">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadPDFQuick(showDetailModal.ID_TAGIHAN)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Unduh PDF Surat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaModalTagihanId(showDetailModal.ID_TAGIHAN)}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kirim ke WhatsApp</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(null)}
                      className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                    >
                      Tutup
                    </button>
                    {showDetailModal.STATUS === 'AKTIF' && sisa > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const id = showDetailModal.ID_TAGIHAN;
                          setShowDetailModal(null);
                          onPayBill(id);
                        }}
                        className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Input Pembayaran</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Edit Tagihan (Pensil Icon) */}
      {showEditModal && (() => {
        const paid = db.getBillPaidAmount(showEditModal.ID_TAGIHAN);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-sm">Edit Rincian Tagihan Santri</h3>
                </div>
                <button onClick={() => setShowEditModal(null)} className="p-1 hover:text-emerald-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditTagihanSubmit} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">{showEditModal.NAMA_TAGIHAN}</div>
                  <div className="text-slate-500 font-mono mt-0.5">ID: {showEditModal.ID_TAGIHAN}</div>
                  <div className="text-emerald-800 font-semibold mt-1">
                    Telah Terbayar: {formatRp(paid)}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nominal Pokok Tagihan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={paid > 0 ? paid : 1000}
                    step={1000}
                    value={editForm.nominal}
                    onChange={(e) => setEditForm({ ...editForm, nominal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-emerald-800 focus:outline-emerald-600 focus:bg-white"
                  />
                  {paid > 0 && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Minimal nominal Rp {paid.toLocaleString('id-ID')} karena sudah ada pembayaran masuk.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo *</label>
                  <input
                    type="date"
                    required
                    value={editForm.tanggalJatuhTempo}
                    onChange={(e) => setEditForm({ ...editForm, tanggalJatuhTempo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Tagihan</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                    <option value="PENGAJUAN_PEMBATALAN">PENGAJUAN_PEMBATALAN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterangan Tambahan</label>
                  <textarea
                    rows={2}
                    value={editForm.keterangan}
                    onChange={(e) => setEditForm({ ...editForm, keterangan: e.target.value })}
                    placeholder="Catatan penyesuaian nominal/keringanan..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal Kirim Tagihan via WhatsApp & Unduh PDF */}
      <WhatsAppTagihanModal
        idTagihan={waModalTagihanId}
        onClose={() => setWaModalTagihanId(null)}
      />

    </div>
  );
};
