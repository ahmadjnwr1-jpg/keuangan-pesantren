import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, RefreshCw, X } from 'lucide-react';
import { DbEngine } from '../services/dbEngine';

interface AuditRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditRunnerModal: React.FC<AuditRunnerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const db = DbEngine.getInstance();
  const [isRunning, setIsRunning] = useState(false);
  const [auditResult, setAuditResult] = useState(() => db.runComprehensiveSystemAudit());

  const handleRunAudit = () => {
    setIsRunning(true);
    setTimeout(() => {
      setAuditResult(db.runComprehensiveSystemAudit());
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Pemeriksaan Integritas Sistem & Aturan Bisnis</h3>
              <p className="text-xs text-emerald-200">Audit Blueprint 16 Sheet & Single Source of Truth</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            auditResult.allPassed 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {auditResult.allPassed ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {auditResult.allPassed ? 'Semua Aturan Bisnis Terpenuhi (100% Valid)' : 'Perhatian Ditemukan pada Audit'}
                </div>
                <div className="text-xs opacity-80">
                  Waktu Audit: {auditResult.timestamp} • Sistem Berjalan Stabil
                </div>
              </div>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={isRunning}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Uji Ulang</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {auditResult.checks.map((check, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-3">
                {check.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {check.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                {check.status === 'FAIL' && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900">{check.name}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      check.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                      check.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {check.category}: {check.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{check.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-emerald-900">Ketentuan Kunci Blueprint yang Dikunci:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
              <li><strong>Formula Kas Tunggal:</strong> Saldo Kas = Total Pembayaran Santri - Total Pengeluaran Lunas.</li>
              <li><strong>Formula Tagihan:</strong> Sisa Tagihan = Nominal Tagihan - Total Pembayaran.</li>
              <li><strong>Pengeluaran:</strong> Hanya berstatus LUNAS yang memotong saldo kas.</li>
              <li><strong>Pembatalan Tagihan:</strong> Pembayaran yang sudah ada tetap dipertahankan utuh di audit log.</li>
              <li><strong>Penutupan Periode:</strong> Periode DITUTUP menolak mutasi pembayaran atau pengeluaran baru.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
