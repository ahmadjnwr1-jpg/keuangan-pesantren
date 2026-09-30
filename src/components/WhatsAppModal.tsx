import React, { useState } from 'react';
import { MessageSquare, Send, Copy, Check, X, Phone, User, ExternalLink } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { PesantrenLogoSvg } from './PesantrenLogoSvg';

interface WhatsAppModalProps {
  idPembayaran: string | null;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ idPembayaran, onClose }) => {
  if (!idPembayaran) return null;

  const db = DbEngine.getInstance();
  const [copied, setCopied] = useState(false);
  const waData = db.generateWhatsAppText(idPembayaran);
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

  const handleSend = () => {
    const clean = getCleanPhone(phone);
    const url = clean 
      ? `https://wa.me/${clean}?text=${encodeURIComponent(customText)}`
      : `https://wa.me/?text=${encodeURIComponent(customText)}`;
    window.open(url, '_blank');
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
              <h3 className="font-bold text-sm">Kirim Bukti Pembayaran via WhatsApp</h3>
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nomor WhatsApp Wali Santri</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890 atau 6281234567890"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-emerald-600 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Nomor dapat diedit jika wali santri berganti nomor kontak.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Format Pesan Konfirmasi</label>
              <button 
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>
            <textarea
              rows={11}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-600 focus:bg-white transition leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSend}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Buka WhatsApp Web</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </button>
        </div>
      </div>
    </div>
  );
};
