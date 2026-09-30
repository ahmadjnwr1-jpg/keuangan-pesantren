import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DbEngine } from './dbEngine';
import { PESANTREN_LOGO_BASE64 } from '../assets/logoBase64';

function terbilang(n: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  const roundN = Math.floor(Math.abs(n));
  if (roundN === 0) return 'Nol Rupiah';
  if (roundN < 12) return bilangan[roundN] + ' ';
  if (roundN < 20) return terbilang(roundN - 10) + 'Belas ';
  if (roundN < 100) return terbilang(Math.floor(roundN / 10)) + 'Puluh ' + terbilang(roundN % 10);
  if (roundN < 200) return 'Seratus ' + terbilang(roundN - 100);
  if (roundN < 1000) return terbilang(Math.floor(roundN / 100)) + 'Ratus ' + terbilang(roundN % 100);
  if (roundN < 2000) return 'Seribu ' + terbilang(roundN - 1000);
  if (roundN < 1000000) return terbilang(Math.floor(roundN / 1000)) + 'Ribu ' + terbilang(roundN % 1000);
  if (roundN < 1000000000) return terbilang(Math.floor(roundN / 1000000)) + 'Juta ' + terbilang(roundN % 1000000);
  if (roundN < 1000000000000) return terbilang(Math.floor(roundN / 1000000000)) + 'Milyar ' + terbilang(roundN % 1000000000);
  return '';
}

export function formatTerbilangRupiah(num: number): string {
  const res = terbilang(num).trim().replace(/\s+/g, ' ');
  return res ? `${res} Rupiah` : 'Nol Rupiah';
}

/**
 * Universal safe PDF downloader for browser & iframe environments
 */
export function triggerPdfBlobDownload(doc: jsPDF, filename: string): { success: boolean; blobUrl: string; filename: string; error?: string } {
  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    }, 400);

    return { success: true, blobUrl, filename };
  } catch (err: any) {
    console.warn('Direct blob anchor download failed, attempting jsPDF save fallback:', err);
    try {
      doc.save(filename);
      return { success: true, blobUrl: '', filename };
    } catch (fallbackErr: any) {
      console.error('All PDF download mechanisms failed:', fallbackErr);
      return { success: false, blobUrl: '', filename, error: fallbackErr.message || 'Gagal menyimpan file PDF' };
    }
  }
}

export interface PdfGenerationResult {
  success: boolean;
  filename: string;
  blobUrl?: string;
  message: string;
}

export function downloadKwitansiPDF(idPembayaran: string): PdfGenerationResult {
  try {
    const db = DbEngine.getInstance();
    const data = db.getInvoiceData(idPembayaran);
    if (!data || !data.payment) {
      throw new Error('Data pembayaran tidak ditemukan.');
    }

    const { payment, bill, santri, kelas, jenjang, jtg, sisa, status, pondok } = data;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor: [number, number, number] = [6, 95, 70]; // emerald-800
    const darkColor: [number, number, number] = [15, 23, 42]; // slate-900

    // Kop Surat Pesantren dengan Logo Resmi
    try {
      doc.addImage(PESANTREN_LOGO_BASE64, 'JPEG', 16, 12, 22, 22);
    } catch (e) {
      console.warn('Gagal menambahkan logo ke PDF:', e);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryColor);
    doc.text((pondok?.namaYayasan || 'YAYASAN PENDIDIKAN ISLAM INAYATUL MUHAJIRIN').toUpperCase(), 114, 18, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.text((pondok?.namaPondok || 'PONDOK PESANTREN INAYATUL MUHAJIRIN').toUpperCase(), 114, 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${pondok?.alamat || 'Mandalasari, Cikancung, Kabupaten Bandung'} | Telp/WA: ${pondok?.kontak || '081223344556'}`, 114, 31, { align: 'center' });

    // Decorative Line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(15, 36, 195, 36);
    doc.setLineWidth(0.2);
    doc.line(15, 37.5, 195, 37.5);

    // Judul Kwitansi
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('BUKTI PEMBAYARAN RESMI / KWITANSI', 105, 46, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Nomor Transaksi: ${payment.NOMOR_TRANSAKSI}`, 105, 51, { align: 'center' });

    // Box Data Santri & Transaksi
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 56, 180, 36, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('DATA SANTRI', 20, 63);
    doc.text('INFORMASI TRANSAKSI', 110, 63);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    // Left Column
    doc.text('Nama Lengkap', 20, 70);
    doc.text(`: ${santri?.NAMA_LENGKAP || '-'}`, 50, 70);

    doc.text('NIS / NISN', 20, 76);
    doc.text(`: ${santri?.NIS || '-'} / ${santri?.NISN || '-'}`, 50, 76);

    doc.text('Kelas / Jenjang', 20, 82);
    doc.text(`: ${kelas?.NAMA_KELAS || '-'} (${jenjang?.NAMA_JENJANG || '-'})`, 50, 82);

    doc.text('Nama Wali', 20, 88);
    doc.text(`: ${santri?.NAMA_WALI || santri?.NAMA_AYAH_KANDUNG || '-'}`, 50, 88);

    // Right Column
    doc.text('Tanggal Bayar', 110, 70);
    doc.text(`: ${payment.TANGGAL_PEMBAYARAN}`, 140, 70);

    doc.text('Metode Bayar', 110, 76);
    doc.text(`: ${payment.METODE} ${payment.REFERENSI ? `(${payment.REFERENSI})` : ''}`, 140, 76);

    doc.text('Status Pembayaran', 110, 82);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(status === 'LUNAS' ? 16 : 30, status === 'LUNAS' ? 149 : 64, status === 'LUNAS' ? 68 : 175);
    doc.text(`: ${status}`, 140, 82);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    doc.text('Petugas Kasir', 110, 88);
    doc.text(`: ${pondok?.penandatangan || 'Ranran Siti Nurhasanah, S.Pd, M.Pd'}`, 140, 88);

    // Table Rincian
    const tableData = [
      [
        '1',
        `${bill?.NAMA_TAGIHAN || 'Tagihan'}${bill?.PERIODE_TAGIHAN ? ` (Periode: ${bill.PERIODE_TAGIHAN})` : ''}\n${jtg?.SIFAT === 'BERULANG' ? 'Tagihan Bulanan (Syahriah)' : 'Tagihan Insidental'}`,
        `Rp ${(bill?.NOMINAL || 0).toLocaleString('id-ID')}`,
        `Rp ${(payment.NOMINAL || 0).toLocaleString('id-ID')}`,
        `Rp ${(sisa || 0).toLocaleString('id-ID')}`
      ]
    ];

    autoTable(doc, {
      startY: 96,
      head: [['No', 'Uraian Pos Tagihan', 'Total Tagihan', 'Nominal Dibayar', 'Sisa Tagihan']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 78 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: primaryColor },
        4: { cellWidth: 30, halign: 'right', textColor: [185, 28, 28] }
      },
      styles: {
        fontSize: 9,
        cellPadding: 3.5
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : 140;

    // Terbilang box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, finalY, 180, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('TERBILANG:', 19, finalY + 5.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text(formatTerbilangRupiah(payment.NOMINAL || 0), 19, finalY + 10.5);

    // Keterangan / Note
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('* Bukti pembayaran ini sah dan diterbitkan secara resmi oleh Sistem Keuangan Pesantren Inayatul Muhajirin.', 15, finalY + 22);

    // Signature Area
    const signY = finalY + 28;
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Wali Santri / Pembayar,`, 30, signY);
    doc.text(`Bandung, ${todayStr}`, 145, signY);
    doc.text(`Bendahara Pesantren,`, 145, signY + 5);

    // Name & Sign line
    doc.setDrawColor(148, 163, 184);
    doc.line(25, signY + 26, 65, signY + 26);
    doc.line(140, signY + 26, 185, signY + 26);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text(santri?.NAMA_WALI || '( ................................... )', 45, signY + 31, { align: 'center' });
    doc.text(pondok?.penandatangan || 'Ranran Siti Nurhasanah, S.Pd, M.Pd', 162.5, signY + 31, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(pondok?.jabatan || 'Bendahara Pesantren', 162.5, signY + 35, { align: 'center' });

    // Download PDF directly
    const filename = `Kwitansi_${payment.NOMOR_TRANSAKSI.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const res = triggerPdfBlobDownload(doc, filename);

    return {
      success: res.success,
      filename,
      blobUrl: res.blobUrl,
      message: res.success ? `Kwitansi ${payment.NOMOR_TRANSAKSI} berhasil didownload!` : (res.error || 'Gagal download')
    };
  } catch (err: any) {
    console.error('Error generating Kwitansi PDF:', err);
    return {
      success: false,
      filename: '',
      message: 'Gagal mendownload PDF Kwitansi: ' + err.message
    };
  }
}

export function downloadLaporanPDF(params: {
  reportType: string;
  title: string;
  subtitle: string;
  headers: string[];
  rows: any[][];
  summaryText?: string;
  orientation?: 'portrait' | 'landscape';
}): PdfGenerationResult {
  try {
    const db = DbEngine.getInstance();
    const state = db.getState();

    const getSetting = (key: string, def = '') => {
      const found = state.PENGATURAN.find(p => p.KEY === key);
      return found ? found.NILAI : def;
    };

    const namaYayasan = getSetting('NAMA_YAYASAN', 'Yayasan Pendidikan Islam Inayatul Muhajirin');
    const namaPondok = getSetting('NAMA_PONDOK', 'Pondok Pesantren Inayatul Muhajirin');
    const alamat = getSetting('ALAMAT_PONDOK', 'Mandalasari, Cikancung, Kabupaten Bandung');
    const noTelepon = getSetting('NOMOR_KONTAK_PESANTREN', '081223344556');
    const namaBendahara = getSetting('PENANDATANGAN_KEUANGAN', 'Ranran Siti Nurhasanah, S.Pd, M.Pd');

    const orientation = params.orientation || (params.headers.length > 5 ? 'landscape' : 'portrait');
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const centerX = pageWidth / 2;
    const primaryColor: [number, number, number] = [6, 95, 70];
    const darkColor: [number, number, number] = [15, 23, 42];

    // Kop Surat Pesantren dengan Logo Resmi
    try {
      doc.addImage(PESANTREN_LOGO_BASE64, 'JPEG', 14, 8, 16, 16);
    } catch (e) {
      console.warn('Gagal menambahkan logo ke PDF Laporan:', e);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text(namaYayasan.toUpperCase(), centerX, 12, { align: 'center' });

    doc.setFontSize(15);
    doc.setTextColor(...darkColor);
    doc.text(namaPondok.toUpperCase(), centerX, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${alamat} | Telp: ${noTelepon}`, centerX, 23, { align: 'center' });

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.6);
    doc.line(12, 26, pageWidth - 12, 26);
    doc.setLineWidth(0.2);
    doc.line(12, 27.2, pageWidth - 12, 27.2);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(params.title.toUpperCase(), centerX, 34, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(params.subtitle, centerX, 39, { align: 'center' });

    // Table Data - sanitize nulls
    const cleanRows = params.rows.map(row => 
      row.map(cell => (cell === null || cell === undefined ? '-' : String(cell)))
    );

    autoTable(doc, {
      startY: 43,
      head: [params.headers],
      body: cleanRows,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : 140;

    // Summary Text if any
    if (params.summaryText) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...darkColor);
      doc.text(params.summaryText, 14, finalY);
    }

    // Signatures
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const signY = finalY + 12;
    const leftSignX = orientation === 'landscape' ? 40 : 30;
    const rightSignX = orientation === 'landscape' ? 240 : 160;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text('Mengetahui,', leftSignX, signY, { align: 'center' });
    doc.text('Kepala Bidang Keuangan', leftSignX, signY + 4, { align: 'center' });

    doc.text(`Bandung, ${todayStr}`, rightSignX, signY, { align: 'center' });
    doc.text('Bendahara Pesantren', rightSignX, signY + 4, { align: 'center' });

    // Names
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkColor);
    doc.text('Astri Sriwulandari', leftSignX, signY + 24, { align: 'center' });
    doc.text(namaBendahara, rightSignX, signY + 24, { align: 'center' });

    const dateTag = new Date().toISOString().split('T')[0];
    const filename = `Laporan_${params.reportType}_${dateTag}.pdf`;
    const res = triggerPdfBlobDownload(doc, filename);

    return {
      success: res.success,
      filename,
      blobUrl: res.blobUrl,
      message: res.success ? `Laporan PDF ${params.reportType} berhasil didownload!` : (res.error || 'Gagal download')
    };
  } catch (err: any) {
    console.error('Error generating Laporan PDF:', err);
    return {
      success: false,
      filename: '',
      message: 'Gagal mendownload PDF Laporan: ' + err.message
    };
  }
}

/**
 * Generate dan Unduh Surat Pemberitahuan / Rincian Tagihan Santri Resmi PDF
 */
export function downloadSuratTagihanPDF(idTagihan: string): PdfGenerationResult {
  try {
    const db = DbEngine.getInstance();
    const state = db.getState();

    const bill = state.TAGIHAN.find(t => t.ID_TAGIHAN === idTagihan);
    if (!bill) throw new Error('Data tagihan tidak ditemukan.');

    const santri = state.SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI);
    const kelas = santri ? state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
    const jenjang = santri ? state.JENJANG.find(j => j.ID_JENJANG === santri.ID_JENJANG) : null;
    const jtg = state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === bill.ID_JENIS_TAGIHAN);
    const ta = state.TAHUN_AJARAN.find(t => t.ID_TAHUN_AJARAN === bill.ID_TAHUN_AJARAN);

    const paidTotal = db.getBillPaidAmount(bill.ID_TAGIHAN);
    const sisa = Math.max(0, bill.NOMINAL - paidTotal);
    const status = db.getBillPaymentStatus(bill);

    const getSetting = (key: string, def = '') => {
      const found = state.PENGATURAN.find(p => p.KEY === key);
      return found ? found.NILAI : def;
    };

    const namaPondok = getSetting('NAMA_PONDOK', 'Pondok Pesantren Inayatul Muhajirin');
    const namaYayasan = getSetting('NAMA_YAYASAN', 'Yayasan Pendidikan Islam Inayatul Muhajirin');
    const alamat = getSetting('ALAMAT_PONDOK', 'Mandalasari, Cikancung, Kabupaten Bandung');
    const penandatangan = getSetting('PENANDATANGAN_KEUANGAN', 'Ranran Siti Nurhasanah, S.Pd, M.Pd');
    const jabatan = getSetting('JABATAN_PENANDATANGAN_KEUANGAN', 'Kepala Bidang Keuangan');
    const rekening = getSetting('REKENING_BANK', 'BSI 7182991023 a.n. Pontren Inayatul Muhajirin');
    const kontak = getSetting('NOMOR_KONTAK_PESANTREN', '081223344556');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor: [number, number, number] = [6, 95, 70]; // emerald-800
    const darkColor: [number, number, number] = [15, 23, 42]; // slate-900

    // Kop Surat Pesantren dengan Logo Resmi
    try {
      doc.addImage(PESANTREN_LOGO_BASE64, 'JPEG', 16, 12, 22, 22);
    } catch (e) {
      console.warn('Gagal menambahkan logo ke Surat Tagihan PDF:', e);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryColor);
    doc.text(namaYayasan.toUpperCase(), 114, 18, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.text(namaPondok.toUpperCase(), 114, 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${alamat} | Telp/WA: ${kontak}`, 114, 31, { align: 'center' });

    // Decorative Line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(15, 36, 195, 36);
    doc.setLineWidth(0.2);
    doc.line(15, 37.5, 195, 37.5);

    // Judul Surat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text('SURAT PEMBERITAHUAN TAGIHAN KEUANGAN SANTRI', 105, 46, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Kode Tagihan: ${bill.ID_TAGIHAN} • Terbit: ${bill.TANGGAL_TERBIT}`, 105, 51, { align: 'center' });

    // Narasi Pembuka Sopan
    const waliNama = santri?.NAMA_WALI || santri?.NAMA_AYAH_KANDUNG || santri?.NAMA_IBU_KANDUNG || 'Orang Tua / Wali Santri';
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const greetingY = 59;
    doc.text(`Kepada Yth.`, 15, greetingY);
    doc.setFont('helvetica', 'bold');
    doc.text(`Bapak/Ibu ${waliNama}`, 15, greetingY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Wali dari: ${santri?.NAMA_LENGKAP || '-'} (NIS: ${santri?.NIS || '-'})`, 15, greetingY + 9);
    doc.text(`Di Tempat`, 15, greetingY + 13.5);

    doc.setFont('helvetica', 'italic');
    doc.text(`Assalamu'alaikum Warahmatullahi Wabarakatuh,`, 15, greetingY + 20);
    doc.setFont('helvetica', 'normal');
    const narasi1 = `Segala puji bagi Allah Subhanahu Wa Ta'ala atas limpahan rahmat dan karunia-Nya. Shalawat dan salam semoga senantiasa tercurah kepada junjungan kita Nabi Muhammad Shallallahu 'Alaihi Wasallam.`;
    doc.text(doc.splitTextToSize(narasi1, 180), 15, greetingY + 25);

    const narasi2 = `Bersama surat ini, kami dari Bagian Keuangan ${namaPondok} menyampaikan rincian informasi tagihan pendidikan santri sebagai berikut:`;
    doc.text(doc.splitTextToSize(narasi2, 180), 15, greetingY + 34);

    // Box Info Tagihan & Santri Table
    const tableBody = [
      ['Nama Santri', `: ${santri?.NAMA_LENGKAP || '-'}`],
      ['Nomor Induk Santri (NIS)', `: ${santri?.NIS || '-'}`],
      ['Kelas / Jenjang', `: ${kelas?.NAMA_KELAS || '-'} (${jenjang?.NAMA_JENJANG || '-'})`],
      ['Tahun Ajaran', `: ${ta?.NAMA_TAHUN_AJARAN || '-'}`],
      ['Pos / Uraian Tagihan', `: ${bill.NAMA_TAGIHAN} ${bill.PERIODE_TAGIHAN ? `(Periode: ${bill.PERIODE_TAGIHAN})` : ''}`],
      ['Sifat Tagihan', `: ${jtg?.SIFAT === 'BERULANG' ? 'Tagihan Bulanan (Syahriah)' : 'Tagihan Insidental'}`],
      ['Total Nominal Tagihan', `: Rp ${bill.NOMINAL.toLocaleString('id-ID')}`],
      ['Telah Dibayar Masuk', `: Rp ${paidTotal.toLocaleString('id-ID')}`],
      ['SISA TAGIHAN WAJIB', `: Rp ${sisa.toLocaleString('id-ID')}`],
      ['Batas Waktu Jatuh Tempo', `: ${bill.TANGGAL_JATUH_TEMPO}`],
      ['Status Saat Ini', `: ${status}`]
    ];

    autoTable(doc, {
      startY: greetingY + 41,
      head: [['Rincian Tagihan', 'Keterangan']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', textColor: [51, 65, 85] },
        1: { cellWidth: 125, textColor: [15, 23, 42] }
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.2
      }
    });

    const afterTableY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 5 : 160;

    // Rekening Pembayaran Box
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(15, afterTableY, 180, 19, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text('INFORMASI REKENING PEMBAYARAN RESMI PESANTREN:', 19, afterTableY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);
    doc.text(rekening, 19, afterTableY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Konfirmasi bukti transfer via WhatsApp ke nomor resmi: ${kontak}`, 19, afterTableY + 15.5);

    // Narasi Penutup Santun
    const closingY = afterTableY + 24;
    const narasiClosing = `Demikian pemberitahuan ini kami sampaikan. Kami mengucapkan terima kasih yang sebesar-besarnya atas kepercayaan, kerjasama, serta dukungan Bapak/Ibu Wali Santri dalam kelancaran proses pendidikan di pesantren. Semoga Allah SWT membalas dengan keberkahan yang berlipat ganda. Amin.`;
    doc.text(doc.splitTextToSize(narasiClosing, 180), 15, closingY);

    doc.setFont('helvetica', 'italic');
    doc.text(`Wassalamu'alaikum Warahmatullahi Wabarakatuh.`, 15, closingY + 12);

    // Signature
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const signY = closingY + 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Bandung, ${todayStr}`, 150, signY, { align: 'center' });
    doc.text(`Kepala Bidang Keuangan,`, 150, signY + 4.5, { align: 'center' });

    doc.setDrawColor(148, 163, 184);
    doc.line(125, signY + 23, 175, signY + 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text(penandatangan, 150, signY + 27, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(jabatan, 150, signY + 31, { align: 'center' });

    const safeName = (santri?.NAMA_LENGKAP || 'Santri').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Surat_Tagihan_${safeName}_${bill.ID_TAGIHAN}.pdf`;
    const res = triggerPdfBlobDownload(doc, filename);

    return {
      success: res.success,
      filename,
      blobUrl: res.blobUrl,
      message: res.success ? `Surat Tagihan PDF untuk ${santri?.NAMA_LENGKAP} berhasil didownload!` : (res.error || 'Gagal download')
    };
  } catch (err: any) {
    console.error('Error generating Surat Tagihan PDF:', err);
    return {
      success: false,
      filename: '',
      message: 'Gagal membuat PDF Surat Tagihan: ' + err.message
    };
  }
}

/**
 * Generate PDF Bukti Kas Keluar / Voucher Pengeluaran Kas
 */
export function generateBuktiPengeluaranPdf(idPengeluaran: string): { success: boolean; filename: string; blobUrl?: string; message: string } {
  try {
    const db = DbEngine.getInstance();
    const state = db.getState();
    const exp = state.PENGELUARAN.find(e => e.ID_PENGELUARAN === idPengeluaran);
    if (!exp) throw new Error('Data pengeluaran tidak ditemukan.');

    const kat = state.KATEGORI_PENGELUARAN.find(k => k.ID_KATEGORI === exp.ID_KATEGORI);
    const userAjukan = state.USERS.find(u => u.ID_USER === exp.DIAJUKAN_OLEH);
    const userSetuju = state.USERS.find(u => u.ID_USER === exp.DISETUJUI_OLEH);

    const namaPondok = db.getSetting('NAMA_PONDOK', 'Pondok Pesantren Inayatul Muhajirin');
    const namaYayasan = db.getSetting('NAMA_YAYASAN', 'Yayasan Pendidikan Islam Inayatul Muhajirin');
    const alamat = db.getSetting('ALAMAT_PONDOK', 'Kp. Pasir Salam RT 02/05 Desa Mandalasari, Kec. Cikancung, Kab. Bandung');
    const kontak = db.getSetting('NOMOR_KONTAK_PESANTREN', '081223344556');
    const penandatangan = db.getSetting('PENANDATANGAN_KEUANGAN', 'Ranran Siti Nurhasanah, S.Pd, M.Pd');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor: [number, number, number] = [4, 120, 87]; // Emerald green
    const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900

    // Logo
    try {
      if (PESANTREN_LOGO_BASE64) {
        doc.addImage(PESANTREN_LOGO_BASE64, 'JPEG', 18, 15, 24, 24);
      }
    } catch (e) {
      console.warn('Could not render logo image on Voucher PDF:', e);
    }

    // Header Kop
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(namaYayasan.toUpperCase(), 110, 19, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(namaPondok.toUpperCase(), 110, 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(alamat, 110, 30, { align: 'center' });
    doc.text(`Kontak Resmi / WhatsApp: ${kontak}`, 110, 34.5, { align: 'center' });

    // Double Header Line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1.2);
    doc.line(15, 41, 195, 41);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(15, 42.5, 195, 42.5);

    // Title Voucher
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...darkColor);
    doc.text('BUKTI KAS KELUAR (VOUCHER PENGELUARAN)', 105, 52, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Nomor Dokumen: BKK-${exp.ID_PENGELUARAN}`, 105, 57, { align: 'center' });

    // Status Banner Box
    const statusBg = exp.STATUS === 'LUNAS' ? [209, 250, 229] :
                     exp.STATUS === 'DISETUJUI' ? [224, 242, 254] :
                     exp.STATUS === 'DIBATALKAN' || exp.STATUS === 'DITOLAK' ? [255, 228, 230] : [254, 243, 199];
    const statusTextCol = exp.STATUS === 'LUNAS' ? [6, 95, 70] :
                          exp.STATUS === 'DISETUJUI' ? [7, 89, 133] :
                          exp.STATUS === 'DIBATALKAN' || exp.STATUS === 'DITOLAK' ? [159, 18, 57] : [146, 64, 14];

    doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(148, 62, 47, 8, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(statusTextCol[0], statusTextCol[1], statusTextCol[2]);
    doc.text(`STATUS: ${exp.STATUS}`, 171.5, 67.5, { align: 'center' });

    // Metadata 2 Columns
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    // Left Column
    doc.text('ID Pengeluaran', 15, 68);
    doc.text(`: ${exp.ID_PENGELUARAN}`, 48, 68);

    doc.text('Kategori Beban', 15, 74);
    doc.text(`: ${kat?.NAMA_KATEGORI || '-'} (${kat?.KODE_KATEGORI || '-'})`, 48, 74);

    doc.text('Tgl Pengajuan', 15, 80);
    doc.text(`: ${exp.TANGGAL_PENGAJUAN}`, 48, 80);

    doc.text('Diajukan Oleh', 15, 86);
    doc.text(`: ${userAjukan?.NAMA_LENGKAP || exp.DIAJUKAN_OLEH}`, 48, 86);

    // Right Column
    doc.text('Tgl Bayar / Lunas', 110, 74);
    doc.text(`: ${exp.TANGGAL_PEMBAYARAN || '- (Belum Dibayar)'}`, 148, 74);

    doc.text('Metode Transaksi', 110, 80);
    doc.text(`: ${exp.METODE || 'TUNAI'} ${exp.REFERENSI ? `[${exp.REFERENSI}]` : ''}`, 148, 80);

    doc.text('Disetujui Oleh', 110, 86);
    doc.text(`: ${userSetuju?.NAMA_LENGKAP || penandatangan}`, 148, 86);

    // Table Uraian
    autoTable(doc, {
      startY: 94,
      head: [['No', 'Uraian Pengeluaran / Kebutuhan', 'Kategori Pos', 'Nominal (Rp)']],
      body: [
        [
          '1',
          `${exp.URAIAN}\n${exp.KETERANGAN ? `Catatan: ${exp.KETERANGAN}` : ''}`,
          kat?.NAMA_KATEGORI || 'Operasional',
          `Rp ${exp.NOMINAL_PENGAJUAN.toLocaleString('id-ID')}`
        ]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 105 },
        2: { cellWidth: 38 },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: primaryColor }
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 130;

    // Terbilang Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, finalY, 180, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('JUMLAH TERBILANG:', 19, finalY + 6);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);
    doc.text(formatTerbilangRupiah(exp.NOMINAL_PENGAJUAN), 19, finalY + 11.5);

    // Signature Area: 3 Kolom (Yang Mengajukan, Yang Menyetujui / Kabid, Penerima / Kasir)
    const signY = finalY + 28;
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    // Kolom 1: Pemohon / Yang Mengajukan
    doc.text('Diajukan Oleh / Pemohon,', 35, signY, { align: 'center' });
    doc.line(15, signY + 22, 55, signY + 22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(userAjukan?.NAMA_LENGKAP || 'Staff Keuangan', 35, signY + 26, { align: 'center' });

    // Kolom 2: Penerima Dana Kas
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Penerima Kas / Pelaksana,', 105, signY, { align: 'center' });
    doc.line(85, signY + 22, 125, signY + 22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('( .................................... )', 105, signY + 26, { align: 'center' });

    // Kolom 3: Pejabat Otorisasi (Kepala Bidang Keuangan)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Bandung, ${todayStr}`, 165, signY - 5, { align: 'center' });
    doc.text('Menyetujui (Kabid Keuangan),', 165, signY, { align: 'center' });
    doc.line(145, signY + 22, 185, signY + 22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(penandatangan, 165, signY + 26, { align: 'center' });

    const safeDesc = exp.URAIAN.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const filename = `Bukti_Pengeluaran_Kas_${safeDesc}_${exp.ID_PENGELUARAN}.pdf`;
    const res = triggerPdfBlobDownload(doc, filename);

    return {
      success: res.success,
      filename,
      blobUrl: res.blobUrl,
      message: res.success ? `Bukti Kas Keluar PDF untuk "${exp.URAIAN}" berhasil didownload!` : (res.error || 'Gagal download')
    };
  } catch (err: any) {
    console.error('Error generating Bukti Pengeluaran PDF:', err);
    return {
      success: false,
      filename: '',
      message: 'Gagal membuat PDF Bukti Pengeluaran: ' + err.message
    };
  }
}
