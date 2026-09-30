import React, { useState } from 'react';
import { Ban, CheckCircle2, XCircle, AlertCircle, History, ShieldAlert, X } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { TagihanRow } from '../types/database';

export const PembatalanView: React.FC = () => {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const currentUser = db.getCurrentUser();
  const isHeadFinance = currentUser?.ROLE === 'KEPALA_BIDANG_KEUANGAN';

  const [selectedBill, setSelectedBill] = useState<TagihanRow | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [note, setNote] = useState('');

  const cancellationBills = state.TAGIHAN
    .filter(b => b.STATUS === 'PENGAJUAN_PEMBATALAN' || b.STATUS === 'DIBATALKAN')
    .map(b => {
      const santri = state.SANTRI.find(s => s.ID_SANTRI === b.ID_SANTRI);
      const kelas = santri ? state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
      const paid = db.getBillPaidAmount(b.ID_TAGIHAN);
      return { bill: b, santri, kelas, paid };
    });

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill || !actionType) return;
    try {
      if (actionType === 'APPROVE') {
        db.setujuiPembatalanTagihan(selectedBill.ID_TAGIHAN, note);
        alert('Pembatalan tagihan berhasil DISETUJUI. Status tagihan kini DIBATALKAN.');
      } else {
        db.tolakPembatalanTagihan(selectedBill.ID_TAGIHAN, note);
        alert('Pengajuan pembatalan tagihan DITOLAK. Status tagihan kembali AKTIF.');
      }
      setSelectedBill(null);
      setActionType(null);
      setNote('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Alur Persetujuan Pembatalan Tagihan</h2>
          <p className="text-xs text-slate-500">
            Verifikasi pengajuan pembatalan tagihan santri dengan pengawasan otoritas Kepala Bidang Keuangan.
          </p>
        </div>

        {!isHeadFinance && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Persetujuan/penolakan pembatalan hanya dapat dilakukan oleh Kepala Bidang Keuangan.</span>
          </div>
        )}
      </div>

      {/* Rules Notice */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-emerald-900">
          <ShieldAlert className="w-4 h-4 text-emerald-700" />
          <span>Prinsip Perlindungan Transaksi Blueprint:</span>
        </div>
        <p className="text-slate-600">
          Tagihan yang dibatalkan tidak boleh menerima pembayaran baru. Namun pembayaran yang telah tercatat sebelumnya <strong>TIDAK DIHAPUS</strong> untuk menjaga integritas saldo kas pesantren tanpa distorsi histori (No refund leak).
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Santri & Kelas</th>
                <th className="py-3 px-4">Tagihan & Periode</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right">Pernah Masuk</th>
                <th className="py-3 px-4">Keterangan / Alasan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cancellationBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada antrean pengajuan pembatalan tagihan saat ini.
                  </td>
                </tr>
              ) : (
                cancellationBills.map(({ bill, santri, kelas, paid }) => {
                  const isPending = bill.STATUS === 'PENGAJUAN_PEMBATALAN';

                  return (
                    <tr key={bill.ID_TAGIHAN} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{santri?.NAMA_LENGKAP}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIS: {santri?.NIS} • {kelas?.NAMA_KELAS}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{bill.NAMA_TAGIHAN}</div>
                        <div className="text-[11px] text-slate-500">
                          {bill.PERIODE_TAGIHAN ? `Periode ${bill.PERIODE_TAGIHAN}` : 'Sekali Bayar'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                        {formatRp(bill.NOMINAL)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-800 font-mono">
                        {formatRp(paid)}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-700 italic text-[11px] leading-tight">
                          {bill.KETERANGAN || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                          isPending ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.STATUS}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isPending && isHeadFinance ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setActionType('APPROVE');
                                setNote('');
                              }}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setActionType('REJECT');
                                setNote('');
                              }}
                              className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : isPending ? (
                          <span className="text-[11px] text-slate-400 italic">Menunggu Kabid</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Telah Diproses</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Approval / Rejection */}
      {selectedBill && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className={`px-6 py-4 text-white flex justify-between items-center ${
              actionType === 'APPROVE' ? 'bg-emerald-900' : 'bg-rose-900'
            }`}>
              <h3 className="font-bold text-sm">
                {actionType === 'APPROVE' ? 'Setujui Pembatalan Tagihan' : 'Tolak Pengajuan Pembatalan'}
              </h3>
              <button onClick={() => setSelectedBill(null)} className="p-1 hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcess} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{selectedBill.NAMA_TAGIHAN}</div>
                <div className="text-slate-500 font-mono">Nominal: {formatRp(selectedBill.NOMINAL)}</div>
                <div className="text-slate-400 mt-1 italic">{selectedBill.KETERANGAN}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {actionType === 'APPROVE' ? 'Catatan Persetujuan (Opsional)' : 'Alasan Penolakan (Wajib min. 5 karakter) *'}
                </label>
                <textarea
                  required={actionType === 'REJECT'}
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={actionType === 'APPROVE' ? 'Contoh: Disetujui karena santri pindah domisili' : 'Contoh: Pengajuan ditolak karena santri masih aktif belajar'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-bold ${
                    actionType === 'APPROVE' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {actionType === 'APPROVE' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
