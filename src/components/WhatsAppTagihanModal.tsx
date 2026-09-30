import React, { useState } from 'react';
import { MessageSquare, Send, Copy, Check, X, Phone, User, FileText, Download } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { downloadSuratTagihanPDF } from '../services/pdfGenerator';
import { PesantrenLogoSvg } from './PesantrenLogoSvg';

interface WhatsAppTagihanModalProps {
  idTagihan: string | null;
  onClose: () => void;
}

export const WhatsAppTagihanModal: React.FC<WhatsAppTagihanModalProps> = ({ idTagihan, onClose }) => {
  if (!idTagihan) return null;

  const db = DbEngine.getInstance();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const waData = db.generateBillWhatsAppText(idTagihan);
  const [phone, setPhone] = useState(waData.phone || '');
  const [customText, setCustomText] = useState(waData.text);

  const getCleanPhone = (p: string) => {
    return p.replace(/[^0-9]/g, '').replace(/^0/, '62');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = () => {
    const clean = getCleanPhone(phone);
    const url = clean 
      ? `https://wa.me/${clean}?text=${encodeURIComponent(customText)}`
      : `https://wa.me/?text=${encodeURIComponent(customText)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPDF = () => {
    const res = downloadSuratTagihanPDF(idTagihan);
    if (res.success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-emerald-600 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
              <PesantrenLogoSvg className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Kirim Tagihan & Unduh PDF</h3>
              <p className="text-xs text-emerald-200">Pondok Pesantren Inayatul Muhajirin Cipatat</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Action Box: Download PDF Dokumen Surat Tagihan */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Surat Tagihan Resmi (PDF)</span>
                <span className="text-[11px] text-slate-500">Lengkap dengan Kop Surat, rincian tabel, dan rekening</span>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
            >
              {downloadSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess ? 'Tersimpan!' : 'Unduh PDF'}</span>
            </button>
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nomor WhatsApp Wali Santri:</span>
            </label>
            <input 
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789 atau 628123456789"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-emerald-600 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * Otomatis terisi dari data kontak wali santri di sistem.
            </p>
          </div>

          {/* Preview & Edit Pesan WA */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Pesan Notifikasi Tagihan (Bisa Diedit):
              </label>
              <button 
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
              </button>
            </div>
            <textarea 
              rows={8}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-emerald-600 focus:bg-white resize-y"
            />
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
            💡 <strong>Tips untuk Admin:</strong> Klik tombol <strong>"Unduh PDF"</strong> terlebih dahulu agar file tersimpan di perangkat Anda, lalu klik <strong>"Kirim via WhatsApp"</strong> untuk mengirim pesan narasi sekaligus melampirkan file PDF-nya ke kontak wali santri.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
          <button 
            type="button"
            onClick={handleSendWA}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Kirim via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
