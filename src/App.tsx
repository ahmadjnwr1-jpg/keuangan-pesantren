/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DbEngine } from './services/dbEngine';
import { Sidebar, NavPage } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { LoginPage } from './components/LoginPage';
import { InvoiceModal } from './components/InvoiceModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { SheetInspectorModal } from './components/SheetInspectorModal';
import { AuditRunnerModal } from './components/AuditRunnerModal';

// Views
import { DashboardView } from './views/DashboardView';
import { SantriView } from './views/SantriView';
import { MasterDataView } from './views/MasterDataView';
import { TagihanView } from './views/TagihanView';
import { PembayaranView } from './views/PembayaranView';
import { PembatalanView } from './views/PembatalanView';
import { PengeluaranView } from './views/PengeluaranView';
import { KasView } from './views/KasView';
import { LaporanView } from './views/LaporanView';
import { DokumenView } from './views/DokumenView';
import { ImportExportView } from './views/ImportExportView';
import { PenutupanView } from './views/PenutupanView';
import { AuditView } from './views/AuditView';
import { PengaturanView } from './views/PengaturanView';

export default function App() {
  const db = DbEngine.getInstance();
  const [currentUser, setCurrentUser] = useState(() => db.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [invoiceModalId, setInvoiceModalId] = useState<string | null>(null);
  const [whatsAppModalId, setWhatsAppModalId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Cross-view selection
  const [preSelectedTagihanId, setPreSelectedTagihanId] = useState<string | null>(null);

  // Listen to DB mutations
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
    });
    return unsubscribe;
  }, [db]);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={() => setCurrentUser(db.getCurrentUser())} />;
  }

  const getPageTitle = (page: NavPage): string => {
    const titles: Record<NavPage, string> = {
      dashboard: 'Dashboard Keuangan',
      santri: 'Data Santri & Rombel',
      tahunAjaran: 'Tahun Ajaran',
      master: 'Master Data & Tarif',
      tagihan: 'Tagihan Santri',
      pembayaran: 'Penerimaan Pembayaran',
      pembatalan: 'Persetujuan Pembatalan',
      pengeluaran: 'Pengeluaran Kas',
      kas: 'Buku Kas & Mutasi',
      laporan: 'Laporan Keuangan Terpadu',
      dokumen: 'Arsip Dokumen / Kwitansi',
      importExport: 'Import / Export & Backup',
      penutupan: 'Penutupan Periode',
      audit: 'Audit Log Aktivitas',
      inspector: '16 Sheet Database',
      pengaturan: 'Pengaturan Identitas',
      auditRunner: 'Uji Aturan Bisnis'
    };
    return titles[page] || 'Keuangan Pesantren';
  };

  const handlePayBillFromTagihan = (idTagihan: string) => {
    setPreSelectedTagihanId(idTagihan);
    setCurrentPage('pembayaran');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'inspector') {
            setIsInspectorOpen(true);
          } else if (page === 'auditRunner') {
            setIsAuditOpen(true);
          } else {
            setCurrentPage(page);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Navbar */}
        <TopNavbar
          currentTitle={getPageTitle(currentPage)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenInspector={() => setIsInspectorOpen(true)}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentPage}
              onOpenInvoice={(id) => setInvoiceModalId(id)}
              onOpenAudit={() => setIsAuditOpen(true)}
            />
          )}

          {currentPage === 'santri' && <SantriView />}

          {(currentPage === 'master' || currentPage === 'tahunAjaran') && <MasterDataView />}

          {currentPage === 'tagihan' && (
            <TagihanView onPayBill={handlePayBillFromTagihan} />
          )}

          {currentPage === 'pembayaran' && (
            <PembayaranView
              onOpenInvoice={(id) => setInvoiceModalId(id)}
              onOpenWhatsApp={(id) => setWhatsAppModalId(id)}
              preSelectedTagihanId={preSelectedTagihanId}
            />
          )}

          {currentPage === 'pembatalan' && <PembatalanView />}

          {currentPage === 'pengeluaran' && <PengeluaranView />}

          {currentPage === 'kas' && <KasView />}

          {currentPage === 'laporan' && <LaporanView />}

          {currentPage === 'dokumen' && (
            <DokumenView
              onOpenInvoice={(id) => setInvoiceModalId(id)}
              onOpenWhatsApp={(id) => setWhatsAppModalId(id)}
            />
          )}

          {currentPage === 'importExport' && <ImportExportView />}

          {currentPage === 'penutupan' && <PenutupanView />}

          {currentPage === 'audit' && <AuditView />}

          {currentPage === 'pengaturan' && <PengaturanView />}
        </main>

        {/* Global Page Footer with Branding */}
        <footer className="w-full border-t border-slate-200/80 bg-white/60 py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sistem Keuangan Pondok Pesantren Inayatul Muhajirin</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">Cipatat, Bandung Barat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-[11px] shadow-2xs">
              Projecr By Ahmadjnwr V.1
            </span>
          </div>
        </footer>
      </div>

      {/* Printable Invoice & Kwitansi Modal */}
      <InvoiceModal
        idPembayaran={invoiceModalId}
        onClose={() => setInvoiceModalId(null)}
      />

      {/* WhatsApp Message Composer Modal */}
      <WhatsAppModal
        idPembayaran={whatsAppModalId}
        onClose={() => setWhatsAppModalId(null)}
      />

      {/* 16-Sheet Live Database Inspector Modal */}
      <SheetInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Comprehensive System & Rules Audit Modal */}
      <AuditRunnerModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

    </div>
  );
}
