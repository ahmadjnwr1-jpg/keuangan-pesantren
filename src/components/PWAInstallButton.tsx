import React, { useState } from 'react';
import { DownloadCloud, Smartphone, CheckCircle, Wifi, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isOnline, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Offline / Online Status Badge */}
        <div 
          title={isOnline ? 'Terhubung (Online)' : 'Mode Offline Aktif - Sistem tetap berjalan 100%'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
            isOnline 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
          }`}
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
              <span>Offline Aktif</span>
            </>
          )}
        </div>

        {/* In-App Install Button */}
        {!isInstalled && (
          <button
            onClick={() => {
              if (isInstallable) {
                install();
              } else {
                setShowGuideModal(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-xs shadow-xs transition cursor-pointer border border-emerald-700"
            title="Jadikan Aplikasi Offline / Pasang ke Komputer"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline">Install Offline</span>
          </button>
        )}
      </div>

      {/* Panduan Instalasi Manual jika browser belum memicu direct prompt */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-800">
                <DownloadCloud className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">Cara Jadikan Aplikasi Paten Offline</h4>
              </div>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Aplikasi ini mendukung <strong>PWA (Progressive Web App)</strong> sehingga dapat di-install langsung ke Laptop/Komputer (Windows/Mac) dan HP (Android/iOS) tanpa kuota internet saat dijalankan.
              </p>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <span>💻 Di Komputer / Laptop (Google Chrome / Edge):</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                  <li>Lihat di pojok kanan atas address bar browser, klik ikon <strong>Install / Pasang Aplikasi</strong> (ikon monitor bertanda panah).</li>
                  <li>Atau klik <strong>Titik Tiga Menu &gt; Simpan dan Bagikan &gt; Pasang aplikasi ini</strong>.</li>
                  <li>Aplikasi akan langsung muncul di Desktop &amp; Start Menu layaknya aplikasi Windows asli!</li>
                </ol>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>📱 Di HP Android / iPhone:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                  <li>Buka browser (Chrome di Android atau Safari di iPhone).</li>
                  <li>Klik tombol menu / tombol <strong>Share (Bagikan)</strong>.</li>
                  <li>Pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                ⚡ <strong>Keuntungan:</strong> Setelah terpasang, aplikasi tetap dapat dibuka, membuat tagihan, menginput santri, dan mencetak kwitansi PDF meski koneksi Wi-Fi/Internet terputus total!
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
