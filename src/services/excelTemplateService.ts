import * as XLSX from 'xlsx';
import { DbEngine } from './dbEngine';
import { SantriRow, TahunAjaranRow, JenjangRow, KelasRow, JenisTagihanRow, TarifTagihanRow, KategoriPengeluaranRow } from '../types/database';

export type TemplateType = 
  | 'SANTRI'
  | 'TAHUN_AJARAN'
  | 'JENJANG'
  | 'KELAS'
  | 'JENIS_TAGIHAN'
  | 'TARIF'
  | 'KATEGORI_PENGELUARAN';

export interface ImportValidationResult<T> {
  type: TemplateType;
  totalRows: number;
  validRows: T[];
  invalidRows: { rowNumber: number; raw: any; errors: string[] }[];
  summary: string;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}

export class ExcelTemplateService {
  /**
   * Export standardized Excel template with instructions and reference sheets
   */
  public static exportTemplate(type: TemplateType): void {
    const db = DbEngine.getInstance();
    const state = db.getState();
    const wb = XLSX.utils.book_new();

    if (type === 'SANTRI') {
      const activeTa = state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF') || state.TAHUN_AJARAN[0];
      const activeTaCode = activeTa?.KODE_TAHUN_AJARAN || '2025/2026';
      const defaultKelasCode = state.KELAS[0]?.KODE_KELAS || '7A';

      const sampleData = [
        {
          'NIS': '20250101',
          'NISN': '0091234567',
          'NAMA_LENGKAP': 'Ahmad Fauzan Pratama',
          'JENIS_KELAMIN': 'L',
          'KODE_KELAS': defaultKelasCode,
          'TAHUN_AJARAN': activeTaCode,
          'NIK': '3204123456780001',
          'TEMPAT_LAHIR': 'Bandung',
          'TANGGAL_LAHIR': '2011-05-14',
          'ALAMAT': 'Jl. Pesantren No. 12, Bandung',
          'NAMA_AYAH': 'H. Ridwan Pratama',
          'NAMA_IBU': 'Hj. Siti Aminah',
          'NAMA_WALI': 'H. Ridwan Pratama',
          'NO_TELP_WALI': '081234567890',
          'STATUS': 'AKTIF'
        },
        {
          'NIS': '20250102',
          'NISN': '0091234568',
          'NAMA_LENGKAP': 'Nur Aisyah Humaira',
          'JENIS_KELAMIN': 'P',
          'KODE_KELAS': defaultKelasCode,
          'TAHUN_AJARAN': activeTaCode,
          'NIK': '3204123456780002',
          'TEMPAT_LAHIR': 'Garut',
          'TANGGAL_LAHIR': '2011-08-21',
          'ALAMAT': 'Kp. Babakan RT 02/05, Garut',
          'NAMA_AYAH': 'Ustadz Munawir',
          'NAMA_IBU': 'Khadijah',
          'NAMA_WALI': 'Ustadz Munawir',
          'NO_TELP_WALI': '081298765432',
          'STATUS': 'AKTIF'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData);
      ws['!cols'] = [
        { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
        { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 32 },
        { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_SANTRI');

      // Reference sheet for available classes and academic years
      const refData = state.KELAS.map(k => {
        const j = state.JENJANG.find(jg => jg.ID_JENJANG === k.ID_JENJANG);
        return {
          'KODE_KELAS (Pakai ini)': k.KODE_KELAS,
          'NAMA_KELAS': k.NAMA_KELAS,
          'JENJANG': j?.NAMA_JENJANG || '-'
        };
      });
      const wsRef = XLSX.utils.json_to_sheet(refData);
      wsRef['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, wsRef, 'REFERENSI_KELAS');

      const refTa = state.TAHUN_AJARAN.map(t => ({
        'KODE_TAHUN_AJARAN (Pakai ini)': t.KODE_TAHUN_AJARAN,
        'NAMA_TAHUN_AJARAN': t.NAMA_TAHUN_AJARAN,
        'STATUS': t.STATUS
      }));
      const wsTa = XLSX.utils.json_to_sheet(refTa);
      wsTa['!cols'] = [{ wch: 26 }, { wch: 28 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsTa, 'REFERENSI_TAHUN_AJARAN');

      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownload(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Template_Import_Santri_Inayatul_Muhajirin.xlsx');
      return;
    }

    if (type === 'TAHUN_AJARAN') {
      const sample = [
        {
          'KODE_TAHUN_AJARAN': '2026/2027',
          'NAMA_TAHUN_AJARAN': 'Tahun Ajaran 2026/2027',
          'TANGGAL_MULAI': '2026-07-15',
          'TANGGAL_SELESAI': '2027-06-25',
          'STATUS': 'PERSIAPAN'
        },
        {
          'KODE_TAHUN_AJARAN': '2027/2028',
          'NAMA_TAHUN_AJARAN': 'Tahun Ajaran 2027/2028',
          'TANGGAL_MULAI': '2027-07-15',
          'TANGGAL_SELESAI': '2028-06-25',
          'STATUS': 'NONAKTIF'
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      ws['!cols'] = [{ wch: 22 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'TAHUN_AJARAN');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownload(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Template_Import_Tahun_Ajaran.xlsx');
      return;
    }

    if (type === 'JENJANG') {
      const sample = [
        {
          'KODE_JENJANG': 'SMP',
          'NAMA_JENJANG': 'Sekolah Menengah Pertama (SMP)',
          'STATUS': 'AKTIF'
        },
        {
          'KODE_JENJANG': 'SMA',
          'NAMA_JENJANG': 'Sekolah Menengah Atas (SMA)',
          'STATUS': 'AKTIF'
        },
        {
          'KODE_JENJANG': 'TAHFIDZ',
          'NAMA_JENJANG': 'Program Khusus Tahfidz Al-Qur\'an',
          'STATUS': 'AKTIF'
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      ws['!cols'] = [{ wch: 18 }, { wch: 36 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'JENJANG');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownload(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Template_Import_Jenjang.xlsx');
      return;
    }

    if (type === 'KELAS') {
      const sample = [
        {
          'KODE_KELAS': '7A',
          'NAMA_KELAS': 'Kelas 7A Tahfidz Putra',
          'KODE_JENJANG': state.JENJANG[0]?.KODE_JENJANG || 'SMP',
          'STATUS': 'AKTIF'
        },
        {
          'KODE_KELAS': '7B',
          'NAMA_KELAS': 'Kelas 7B Tahfidz Putri',
          'KODE_JENJANG': state.JENJANG[0]?.KODE_JENJANG || 'SMP',
          'STATUS': 'AKTIF'
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      ws['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 18 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'KELAS');

      // Reference sheet
      const refJenjang = state.JENJANG.map(j => ({
        'KODE_JENJANG (Gunakan ini)': j.KODE_JENJANG,
        'NAMA_JENJANG': j.NAMA_JENJANG
      }));
      const wsRef = XLSX.utils.json_to_sheet(refJenjang);
      wsRef['!cols'] = [{ wch: 26 }, { wch: 34 }];
      XLSX.utils.book_append_sheet(wb, wsRef, 'REFERENSI_JENJANG');

      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownload(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Template_Import_Kelas.xlsx');
      return;
    }

    if (type === 'JENIS_TAGIHAN') {
      const sample = [
        {
          'KODE_TAGIHAN': 'SPP',
          'NAMA_TAGIHAN': 'Iuran Bulanan Syahriah / SPP',
          'SIFAT': 'BERULANG',
          'STATUS': 'AKTIF'
        },
        {
          'KODE_TAGIHAN': 'DAFTAR_ULANG',
          'NAMA_TAGIHAN': 'Biaya Daftar Ulang Awal Tahun',
          'SIFAT': 'SEKALI',
          'STATUS': 'AKTIF'
        },
        {
          'KODE_TAGIHAN': 'KITAB',
          'NAMA_TAGIHAN': 'Paket Pembelian Kitab & Seragam',
          'SIFAT': 'SEKALI',
          'STATUS': 'AKTIF'
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      ws['!cols'] = [{ wch: 20 }, { wch: 36 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'JENIS_TAGIHAN');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownload(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Template_Import_Jenis_Tagihan.xlsx');
      return;
    }

    if (type === 'TARIF') {
      const sample = [
        {
          'KODE_JENIS_TAGIHAN': state.JENIS_TAGIHAN[0]?.KODE_TAGIHAN || 'SPP',
          'KODE_TAHUN_AJARAN': state.TAHUN_AJARAN[0]?.KODE_TAHUN_AJARAN || '2025/2026',
          'KODE_KELAS': state.KELAS[0]?.KODE_KELAS || '',
          'KODE_JENJANG': '',
          'NOMINAL': 350000,
          'KETERANGAN': 'Tarif SPP Bulanan Standar'
        },
        {
          'KODE_JENIS_TAGIHAN': state.JENIS_TAGIHAN[0]?.KODE_TAGIHAN || 'SPP',
          'KODE_TAHUN_AJARAN': state.TAHUN_AJARAN[0]?.KODE_TAHUN_AJARAN || '2025/2026',
          'KODE_KELAS': '',
          'KODE_JENJANG': state.JENJANG[0]?.KODE_JENJANG || '',
          'NOMINAL': 300000,
          'KETERANGAN': 'Tarif Bersifat Jenjang Umum'
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      ws['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 32 }];
      XLSX.utils.book_append_sheet(wb, ws, 'TARIF_TAGIHAN');

      // Add helper sheet
      const wsHelp = XLSX.utils.json_to_sheet([
        {
          'JENIS_TAGIHAN_TERSEDIA': state.JENIS_TAGIHAN.map(j => j.KODE_TAGIHAN).join(', '),
          'TAHUN_AJARAN_TERSEDIA': state.TAHUN_AJARAN.map(t => t.KODE_TAHUN_AJARAN).join(', '),
          'KELAS_TERSEDIA': state.KELAS.map(k => k.KODE_KELAS).join(', '),
          'JENJANG_TERSEDIA': state.JENJANG.map(j => j.KODE_JENJANG).join(', ')
        }
      ]);
      XLSX.utils.book_append_sheet(wb, wsHelp, 'PANDUAN_KODE');

      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownload(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Template_Import_Matriks_Tarif.xlsx');
      return;
    }

    if (type === 'KATEGORI_PENGELUARAN') {
      const sample = [
        {
          'KODE_KATEGORI': 'OPERASIONAL',
          'NAMA_KATEGORI': 'Biaya Operasional & Rumah Tangga',
          'KETERANGAN': 'Listrik, air, kebersihan, pemeliharaan',
          'STATUS': 'AKTIF'
        },
        {
          'KODE_KATEGORI': 'KONSUMSI',
          'NAMA_KATEGORI': 'Dapur & Konsumsi Santri',
          'KETERANGAN': 'Bahan makanan harian dapur asrama santri',
          'STATUS': 'AKTIF'
        },
        {
          'KODE_KATEGORI': 'SARPRAS',
          'NAMA_KATEGORI': 'Pengadaan Sarana & Prasarana',
          'KETERANGAN': 'Perbaikan gedung, meja belajar, kasur santri',
          'STATUS': 'AKTIF'
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      ws['!cols'] = [{ wch: 20 }, { wch: 34 }, { wch: 36 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'KATEGORI_PENGELUARAN');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      triggerDownload(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Template_Import_Kategori_Pengeluaran.xlsx');
      return;
    }
  }

  /**
   * Parse uploaded Excel or CSV file
   */
  public static async parseFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate and prepare Santri import records
   */
  public static validateSantriRows(rawRows: any[]): ImportValidationResult<any> {
    const db = DbEngine.getInstance();
    const state = db.getState();
    const activeTa = state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF') || state.TAHUN_AJARAN[0];

    const validRows: any[] = [];
    const invalidRows: { rowNumber: number; raw: any; errors: string[] }[] = [];

    rawRows.forEach((r, index) => {
      const rowNum = index + 2; // header is row 1
      const errors: string[] = [];

      const nama = String(r['NAMA_LENGKAP'] || r['NAMA'] || r['Nama Lengkap'] || '').trim();
      const jkRaw = String(r['JENIS_KELAMIN'] || r['JK'] || r['Jenis Kelamin'] || 'L').trim().toUpperCase();
      const jk = (jkRaw === 'P' || jkRaw === 'PEREMPUAN') ? 'P' : 'L';
      const kodeKelas = String(r['KODE_KELAS'] || r['KELAS'] || r['Kelas'] || '').trim();
      const taCode = String(r['TAHUN_AJARAN'] || r['Tahun Ajaran'] || activeTa?.KODE_TAHUN_AJARAN || '').trim();

      if (!nama) {
        errors.push('Nama Lengkap wajib diisi.');
      }

      // Check Kelas
      let matchedKelas = state.KELAS.find(k => {
        const kCode = (k?.KODE_KELAS || '').toString().toLowerCase();
        const kNama = (k?.NAMA_KELAS || '').toString().toLowerCase();
        const target = (kodeKelas || '').toString().toLowerCase();
        return (target && (kCode === target || kNama === target));
      });
      if (!matchedKelas && kodeKelas) {
        errors.push(`Kelas "${kodeKelas}" tidak ditemukan dalam Master Kelas.`);
      } else if (!matchedKelas && state.KELAS.length > 0) {
        // Fallback to first class if not specified
        matchedKelas = state.KELAS[0];
      }

      // Check Tahun Ajaran
      let matchedTa = state.TAHUN_AJARAN.find(t => {
        const tCode = (t?.KODE_TAHUN_AJARAN || '').toString().toLowerCase();
        const tNama = (t?.NAMA_TAHUN_AJARAN || '').toString().toLowerCase();
        const target = (taCode || '').toString().toLowerCase();
        return (target && (tCode === target || tNama === target));
      });
      if (!matchedTa) {
        matchedTa = activeTa;
      }

      // Auto generate NIS if missing
      const nisInput = String(r['NIS'] || r['Nis'] || '').trim();
      const nis = nisInput || `2025${String(Math.floor(1000 + Math.random() * 9000))}`;

      // Check if NIS already exists in state
      const existingSantri = state.SANTRI.find(s => s.NIS === nis);

      if (errors.length > 0) {
        invalidRows.push({ rowNumber: rowNum, raw: r, errors });
      } else {
        const item = {
          NIS: nis,
          NISN: String(r['NISN'] || '').trim(),
          NIK: String(r['NIK'] || '').trim(),
          NAMA_LENGKAP: nama,
          JENIS_KELAMIN: jk,
          TEMPAT_LAHIR: String(r['TEMPAT_LAHIR'] || r['Tempat Lahir'] || 'Bandung').trim(),
          TANGGAL_LAHIR: String(r['TANGGAL_LAHIR'] || r['Tanggal Lahir'] || '2010-01-01').trim(),
          ALAMAT: String(r['ALAMAT'] || r['Alamat'] || '-').trim(),
          NAMA_AYAH_KANDUNG: String(r['NAMA_AYAH'] || r['Nama Ayah'] || '-').trim(),
          NAMA_IBU_KANDUNG: String(r['NAMA_IBU'] || r['Nama Ibu'] || '-').trim(),
          NAMA_WALI: String(r['NAMA_WALI'] || r['Nama Wali'] || r['NAMA_AYAH'] || '-').trim(),
          NOMOR_KONTAK_WALI: String(r['NO_TELP_WALI'] || r['No Telp Wali'] || r['NO_WA'] || '08123456789').trim(),
          STATUS: (r['STATUS'] || 'AKTIF').toUpperCase() as any,
          ID_KELAS_TARGET: matchedKelas?.ID_KELAS,
          NAMA_KELAS_TARGET: matchedKelas?.NAMA_KELAS,
          ID_TAHUN_AJARAN_TARGET: matchedTa?.ID_TAHUN_AJARAN,
          IS_UPDATE: !!existingSantri,
          EXISTING_ID: existingSantri?.ID_SANTRI
        };
        validRows.push(item);
      }
    });

    return {
      type: 'SANTRI',
      totalRows: rawRows.length,
      validRows,
      invalidRows,
      summary: `${validRows.length} baris santri siap diimport, ${invalidRows.length} baris tidak valid.`
    };
  }

  /**
   * Commit Santri import into database
   */
  public static commitSantriImport(validRows: any[]): { success: number; updated: number } {
    const db = DbEngine.getInstance();
    const state = db.getState();
    let success = 0;
    let updated = 0;

    validRows.forEach(row => {
      if (row.IS_UPDATE && row.EXISTING_ID) {
        db.updateSantri(row.EXISTING_ID, {
          NIS: row.NIS,
          NISN: row.NISN,
          NIK: row.NIK,
          NAMA_LENGKAP: row.NAMA_LENGKAP,
          JENIS_KELAMIN: row.JENIS_KELAMIN,
          TEMPAT_LAHIR: row.TEMPAT_LAHIR,
          TANGGAL_LAHIR: row.TANGGAL_LAHIR,
          ALAMAT: row.ALAMAT,
          NAMA_AYAH_KANDUNG: row.NAMA_AYAH_KANDUNG,
          NAMA_IBU_KANDUNG: row.NAMA_IBU_KANDUNG,
          NAMA_WALI: row.NAMA_WALI,
          NOMOR_KONTAK_WALI: row.NOMOR_KONTAK_WALI,
          STATUS: row.STATUS
        });
        updated++;
      } else {
        const idSantri = `SAN-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
        const newSantri: SantriRow = {
          ID_SANTRI: idSantri,
          NIS: row.NIS,
          NISN: row.NISN,
          NIK: row.NIK,
          NAMA_LENGKAP: row.NAMA_LENGKAP,
          JENIS_KELAMIN: row.JENIS_KELAMIN,
          TEMPAT_LAHIR: row.TEMPAT_LAHIR,
          TANGGAL_LAHIR: row.TANGGAL_LAHIR,
          ALAMAT: row.ALAMAT,
          NAMA_AYAH_KANDUNG: row.NAMA_AYAH_KANDUNG,
          NAMA_IBU_KANDUNG: row.NAMA_IBU_KANDUNG,
          NAMA_WALI: row.NAMA_WALI,
          NOMOR_KONTAK_WALI: row.NOMOR_KONTAK_WALI,
          STATUS: row.STATUS,
          TANGGAL_MASUK: new Date().toISOString().split('T')[0]
        };

        state.SANTRI.unshift(newSantri);

        // Assign to Class History
        if (row.ID_KELAS_TARGET) {
          const k = state.KELAS.find(kl => kl.ID_KELAS === row.ID_KELAS_TARGET);
          const idRombel = `RK-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
          state.RIWAYAT_KELAS.push({
            ID_RIWAYAT: idRombel,
            ID_SANTRI: idSantri,
            ID_KELAS: row.ID_KELAS_TARGET,
            ID_JENJANG: k?.ID_JENJANG || '',
            ID_TAHUN_AJARAN: row.ID_TAHUN_AJARAN_TARGET || state.TAHUN_AJARAN[0]?.ID_TAHUN_AJARAN || '',
            TANGGAL_MULAI: new Date().toISOString().split('T')[0],
            STATUS: 'AKTIF'
          });
        }
        success++;
      }
    });

    db.saveDatabase();
    db.writeAuditLog('SANTRI', 'TAMBAH', 'IMPORT_BATCH', `Import batch Excel santri: ${success} data baru, ${updated} diperbarui.`, null, null);

    return { success, updated };
  }

  /**
   * Validate and Import Master Data generic rows
   */
  public static validateMasterDataRows(type: TemplateType, rawRows: any[]): ImportValidationResult<any> {
    const db = DbEngine.getInstance();
    const state = db.getState();
    const validRows: any[] = [];
    const invalidRows: { rowNumber: number; raw: any; errors: string[] }[] = [];

    rawRows.forEach((r, index) => {
      const rowNum = index + 2;
      const errors: string[] = [];

      if (type === 'TAHUN_AJARAN') {
        const kode = String(r['KODE_TAHUN_AJARAN'] || r['KODE'] || '').trim();
        const nama = String(r['NAMA_TAHUN_AJARAN'] || r['NAMA'] || `Tahun Ajaran ${kode}`).trim();
        const mulai = String(r['TANGGAL_MULAI'] || '2026-07-15').trim();
        const selesai = String(r['TANGGAL_SELESAI'] || '2027-06-25').trim();
        const status = (String(r['STATUS'] || 'PERSIAPAN').toUpperCase()) as any;

        if (!kode) errors.push('KODE_TAHUN_AJARAN wajib diisi.');
        if (errors.length === 0) {
          validRows.push({
            KODE_TAHUN_AJARAN: kode,
            NAMA_TAHUN_AJARAN: nama,
            TANGGAL_MULAI: mulai,
            TANGGAL_SELESAI: selesai,
            STATUS: status
          });
        }
      } else if (type === 'JENJANG') {
        const kode = String(r['KODE_JENJANG'] || r['KODE'] || '').trim().toUpperCase();
        const nama = String(r['NAMA_JENJANG'] || r['NAMA'] || '').trim();
        const status = (String(r['STATUS'] || 'AKTIF').toUpperCase()) as any;

        if (!kode) errors.push('KODE_JENJANG wajib diisi.');
        if (!nama) errors.push('NAMA_JENJANG wajib diisi.');
        if (errors.length === 0) {
          validRows.push({ KODE_JENJANG: kode, NAMA_JENJANG: nama, STATUS: status });
        }
      } else if (type === 'KELAS') {
        const kode = String(r['KODE_KELAS'] || r['KODE'] || '').trim();
        const nama = String(r['NAMA_KELAS'] || r['NAMA'] || '').trim();
        const kodeJenjang = String(r['KODE_JENJANG'] || r['JENJANG'] || '').trim();
        const status = (String(r['STATUS'] || 'AKTIF').toUpperCase()) as any;

        if (!kode) errors.push('KODE_KELAS wajib diisi.');
        if (!nama) errors.push('NAMA_KELAS wajib diisi.');

        let j = state.JENJANG.find(jg => {
          const jCode = (jg?.KODE_JENJANG || '').toString().toLowerCase();
          const target = (kodeJenjang || '').toString().toLowerCase();
          return target && jCode === target;
        });
        if (!j && state.JENJANG.length > 0) {
          j = state.JENJANG[0];
        }
        if (!j) errors.push('Jenjang belum tersedia. Tambahkan data Jenjang terlebih dahulu.');

        if (errors.length === 0 && j) {
          validRows.push({
            KODE_KELAS: kode,
            NAMA_KELAS: nama,
            ID_JENJANG: j.ID_JENJANG,
            KODE_JENJANG: j.KODE_JENJANG,
            STATUS: status
          });
        }
      } else if (type === 'JENIS_TAGIHAN') {
        const kode = String(r['KODE_TAGIHAN'] || r['KODE'] || '').trim().toUpperCase();
        const nama = String(r['NAMA_TAGIHAN'] || r['NAMA'] || '').trim();
        const sifatRaw = String(r['SIFAT'] || 'BERULANG').trim().toUpperCase();
        const sifat = sifatRaw.includes('SEKALI') ? 'SEKALI' : 'BERULANG';
        const status = (String(r['STATUS'] || 'AKTIF').toUpperCase()) as any;

        if (!kode) errors.push('KODE_TAGIHAN wajib diisi.');
        if (!nama) errors.push('NAMA_TAGIHAN wajib diisi.');
        if (errors.length === 0) {
          validRows.push({
            KODE_TAGIHAN: kode,
            NAMA_TAGIHAN: nama,
            SIFAT: sifat,
            STATUS: status
          });
        }
      } else if (type === 'TARIF') {
        const kodeJtg = String(r['KODE_JENIS_TAGIHAN'] || r['TAGIHAN'] || '').trim();
        const kodeTa = String(r['KODE_TAHUN_AJARAN'] || r['TAHUN_AJARAN'] || '').trim();
        const kodeKelas = String(r['KODE_KELAS'] || '').trim();
        const kodeJenjang = String(r['KODE_JENJANG'] || '').trim();
        const nominal = Number(r['NOMINAL'] || r['Nominal'] || 0);

        if (!kodeJtg) errors.push('KODE_JENIS_TAGIHAN wajib diisi.');
        if (!kodeTa) errors.push('KODE_TAHUN_AJARAN wajib diisi.');
        if (nominal <= 0) errors.push('NOMINAL harus lebih besar dari 0.');

        const jtg = state.JENIS_TAGIHAN.find(j => {
          const jCode = (j?.KODE_TAGIHAN || '').toString().toLowerCase();
          const target = (kodeJtg || '').toString().toLowerCase();
          return target && jCode === target;
        });
        const ta = state.TAHUN_AJARAN.find(t => {
          const tCode = (t?.KODE_TAHUN_AJARAN || '').toString().toLowerCase();
          const target = (kodeTa || '').toString().toLowerCase();
          return target && tCode === target;
        });
        const k = kodeKelas ? state.KELAS.find(kl => {
          const kCode = (kl?.KODE_KELAS || '').toString().toLowerCase();
          const target = (kodeKelas || '').toString().toLowerCase();
          return target && kCode === target;
        }) : null;
        const jg = kodeJenjang ? state.JENJANG.find(j => {
          const jCode = (j?.KODE_JENJANG || '').toString().toLowerCase();
          const target = (kodeJenjang || '').toString().toLowerCase();
          return target && jCode === target;
        }) : null;

        if (!jtg) errors.push(`Jenis Tagihan "${kodeJtg}" tidak ditemukan.`);
        if (!ta) errors.push(`Tahun Ajaran "${kodeTa}" tidak ditemukan.`);

        if (errors.length === 0 && jtg && ta) {
          validRows.push({
            ID_JENIS_TAGIHAN: jtg.ID_JENIS_TAGIHAN,
            ID_TAHUN_AJARAN: ta.ID_TAHUN_AJARAN,
            ID_KELAS: k ? k.ID_KELAS : null,
            ID_JENJANG: jg ? jg.ID_JENJANG : null,
            NOMINAL: nominal,
            KETERANGAN: String(r['KETERANGAN'] || '').trim()
          });
        }
      } else if (type === 'KATEGORI_PENGELUARAN') {
        const kode = String(r['KODE_KATEGORI'] || r['KODE'] || '').trim().toUpperCase();
        const nama = String(r['NAMA_KATEGORI'] || r['NAMA'] || '').trim();
        const ket = String(r['KETERANGAN'] || '').trim();
        const status = (String(r['STATUS'] || 'AKTIF').toUpperCase()) as any;

        if (!kode) errors.push('KODE_KATEGORI wajib diisi.');
        if (!nama) errors.push('NAMA_KATEGORI wajib diisi.');
        if (errors.length === 0) {
          validRows.push({
            KODE_KATEGORI: kode,
            NAMA_KATEGORI: nama,
            KETERANGAN: ket,
            STATUS: status
          });
        }
      }

      if (errors.length > 0) {
        invalidRows.push({ rowNumber: rowNum, raw: r, errors });
      }
    });

    return {
      type,
      totalRows: rawRows.length,
      validRows,
      invalidRows,
      summary: `${validRows.length} baris valid dari ${rawRows.length} baris terdeteksi.`
    };
  }

  /**
   * Commit Master Data batch into database
   */
  public static commitMasterDataImport(type: TemplateType, validRows: any[]): { inserted: number; updated: number } {
    const db = DbEngine.getInstance();
    const state = db.getState();
    let inserted = 0;
    let updated = 0;

    if (type === 'TAHUN_AJARAN') {
      validRows.forEach(r => {
        const existing = state.TAHUN_AJARAN.find(t => t.KODE_TAHUN_AJARAN === r.KODE_TAHUN_AJARAN);
        if (existing) {
          existing.NAMA_TAHUN_AJARAN = r.NAMA_TAHUN_AJARAN;
          existing.TANGGAL_MULAI = r.TANGGAL_MULAI;
          existing.TANGGAL_SELESAI = r.TANGGAL_SELESAI;
          existing.STATUS = r.STATUS;
          updated++;
        } else {
          db.addTahunAjaran(r.KODE_TAHUN_AJARAN, r.NAMA_TAHUN_AJARAN, r.TANGGAL_MULAI, r.TANGGAL_SELESAI, r.STATUS);
          inserted++;
        }
      });
    } else if (type === 'JENJANG') {
      validRows.forEach(r => {
        const existing = state.JENJANG.find(j => j.KODE_JENJANG === r.KODE_JENJANG);
        if (existing) {
          existing.NAMA_JENJANG = r.NAMA_JENJANG;
          existing.STATUS = r.STATUS;
          updated++;
        } else {
          db.addJenjang(r.KODE_JENJANG, r.NAMA_JENJANG, r.STATUS);
          inserted++;
        }
      });
    } else if (type === 'KELAS') {
      validRows.forEach(r => {
        const existing = state.KELAS.find(k => k.KODE_KELAS === r.KODE_KELAS);
        if (existing) {
          existing.NAMA_KELAS = r.NAMA_KELAS;
          existing.ID_JENJANG = r.ID_JENJANG;
          existing.STATUS = r.STATUS;
          updated++;
        } else {
          db.addKelas(r.KODE_KELAS, r.NAMA_KELAS, r.ID_JENJANG, r.STATUS);
          inserted++;
        }
      });
    } else if (type === 'JENIS_TAGIHAN') {
      validRows.forEach(r => {
        const existing = state.JENIS_TAGIHAN.find(j => j.KODE_TAGIHAN === r.KODE_TAGIHAN);
        if (existing) {
          existing.NAMA_TAGIHAN = r.NAMA_TAGIHAN;
          existing.SIFAT = r.SIFAT;
          existing.STATUS = r.STATUS;
          updated++;
        } else {
          db.addJenisTagihan(r.KODE_TAGIHAN, r.NAMA_TAGIHAN, r.SIFAT, r.STATUS);
          inserted++;
        }
      });
    } else if (type === 'TARIF') {
      validRows.forEach(r => {
        db.addTarif(r.ID_JENIS_TAGIHAN, r.ID_TAHUN_AJARAN, r.NOMINAL, r.ID_KELAS, r.ID_JENJANG, r.KETERANGAN);
        inserted++;
      });
    } else if (type === 'KATEGORI_PENGELUARAN') {
      validRows.forEach(r => {
        const existing = state.KATEGORI_PENGELUARAN.find(k => k.KODE_KATEGORI === r.KODE_KATEGORI);
        if (existing) {
          existing.NAMA_KATEGORI = r.NAMA_KATEGORI;
          existing.KETERANGAN = r.KETERANGAN;
          existing.STATUS = r.STATUS;
          updated++;
        } else {
          db.addKategoriPengeluaran(r.KODE_KATEGORI, r.NAMA_KATEGORI, r.KETERANGAN, r.STATUS);
          inserted++;
        }
      });
    }

    db.saveDatabase();
    db.writeAuditLog(type as any, 'TAMBAH', 'IMPORT_BATCH', `Import batch Excel ${type}: ${inserted} baru, ${updated} diperbarui`, null, null);
    return { inserted, updated };
  }
}
