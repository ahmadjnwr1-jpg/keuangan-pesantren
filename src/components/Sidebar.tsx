import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FolderTree,
  Receipt,
  CreditCard,
  Ban,
  TrendingDown,
  Wallet,
  FileBarChart,
  FileText,
  FileSpreadsheet,
  Lock,
  History,
  Settings,
  Database,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { DbEngine } from '../services/dbEngine';
import { PesantrenLogoSvg } from './PesantrenLogoSvg';

export type NavPage = 
  | 'dashboard'
  | 'santri'
  | 'tahunAjaran'
  | 'master'
  | 'tagihan'
  | 'pembayaran'
  | 'pembatalan'
  | 'pengeluaran'
  | 'kas'
  | 'laporan'
  | 'dokumen'
  | 'importExport'
  | 'penutupan'
  | 'audit'
  | 'inspector'
  | 'pengaturan'
  | 'auditRunner';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose
}) => {
  const db = DbEngine.getInstance();
  const currentUser = db.getCurrentUser();
  const isHeadFinance = currentUser?.ROLE === 'KEPALA_BIDANG_KEUANGAN';

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard' as NavPage, label: 'Dashboard Keuangan', icon: LayoutDashboard }
      ]
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'santri' as NavPage, label: 'Data Santri', icon: Users },
        { id: 'tahunAjaran' as NavPage, label: 'Tahun Ajaran', icon: CalendarDays },
        { id: 'master' as NavPage, label: 'Data Master & Tarif', icon: FolderTree }
      ]
    },
    {
      title: 'TRANSAKSI',
      items: [
        { id: 'tagihan' as NavPage, label: 'Tagihan Santri', icon: Receipt },
        { id: 'pembayaran' as NavPage, label: 'Penerimaan Pembayaran', icon: CreditCard },
        { id: 'pembatalan' as NavPage, label: 'Pembatalan Tagihan', icon: Ban },
        { id: 'pengeluaran' as NavPage, label: 'Pengeluaran Kas', icon: TrendingDown }
      ]
    },
    {
      title: 'KAS & LAPORAN',
      items: [
        { id: 'kas' as NavPage, label: 'Buku Kas Pesantren', icon: Wallet },
        { id: 'laporan' as NavPage, label: 'Laporan Keuangan', icon: FileBarChart },
        { id: 'dokumen' as NavPage, label: 'Arsip Dokumen / Kwitansi', icon: FileText }
      ]
    },
    {
      title: 'SISTEM & AUDIT',
      items: [
        { id: 'importExport' as NavPage, label: 'Import / Export & Backup', icon: FileSpreadsheet },
        { id: 'penutupan' as NavPage, label: 'Penutupan Periode', icon: Lock, badge: isHeadFinance ? 'Khusus Kabid' : undefined },
        { id: 'audit' as NavPage, label: 'Audit Log Aktivitas', icon: History },
        { id: 'inspector' as NavPage, label: '16 Sheet Database', icon: Database },
        { id: 'auditRunner' as NavPage, label: 'Uji Aturan Bisnis', icon: ShieldCheck },
        { id: 'pengaturan' as NavPage, label: 'Pengaturan Pesantren', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-2xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-emerald-950 text-white z-50 flex flex-col transition-transform duration-200 ease-in-out border-r border-emerald-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-900/80 bg-emerald-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 border border-emerald-700/50 overflow-hidden">
              <PesantrenLogoSvg className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white leading-tight">
                KEUANGAN
              </div>
              <div className="text-[10px] font-semibold text-emerald-400 tracking-wider">
                INAYATUL MUHAJIRIN
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 pb-1.5 text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-800 text-white font-bold shadow-xs'
                          : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-400/70'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded-md border border-amber-500/30 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Pesantren Info & Author Project Branding */}
        <div className="p-3 border-t border-emerald-900/80 bg-emerald-950/80 text-[11px] text-emerald-300/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="truncate">Cipatat, Bandung Barat</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 font-bold px-1.5 py-0.5 rounded bg-emerald-900/50">V.1</span>
          </div>
          <div className="pt-1 border-t border-emerald-900/50 text-[10px] font-mono tracking-wide text-emerald-400/90 text-center font-semibold">
            Projecr By Ahmadjnwr V.1
          </div>
        </div>
      </aside>
    </>
  );
};
