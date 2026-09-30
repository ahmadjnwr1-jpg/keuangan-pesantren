/**
 * PONDOK PESANTREN INAYATUL MUHAJIRIN
 * EXCEL / CSV TEMPLATE & IMPORT ENGINE
 * Menyediakan download template Excel (.csv ber-BOM) dan parser import data master.
 */

import { DbEngine } from './dbEngine';

function triggerCsvDownload(filename: string, content: string) {
  // \uFEFF is UTF-8 Byte Order Mark, ensuring Microsoft Excel displays Indonesian text & commas correctly
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseCsvRows(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let insideQuote = false;
    // Detect delimiter: comma or semicolon (Excel Indonesian default)
    const delimiter = (line.includes(';') && !line.includes(',')) ? ';' : ',';

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (insideQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === delimiter && !insideQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim().toUpperCase());
  const rows = lines.slice(1).map(parseLine).map(row => row.map(cell => cell.replace(/^["']|["']$/g, '').trim()));
  return { headers, rows };
}

// ==========================================
// 1. DATA SANTRI TEMPLATE & IMPORT
// ==========================================

export function downloadSantriTemplate() {
  const headers = [
    'NIS',
    'NAMA_LENGKAP',
    'NISN',
    'NIK',
    'TEMPAT_LAHIR',
    'TANGGAL_LAHIR',
    'JENIS_KELAMIN',
    'KODE_JENJANG',
    'KODE_KELAS',
    'STATUS',
    'ALAMAT',
    'NAMA_WALI',
    'NO_TELEPON_WALI',
    'NOMOR_KIP_PIP',
    'KETERANGAN'
  ].join(',');

  const sample1 = [
    '2026001',
    'Muhammad Farhan Al-Fatih',
    '0081234567',
    '3204123456780001',
    'Bandung',
    '2012-05-14',
    'L',
    'MTS',
    '7A',
    'AKTIF',
    'Mandalasari RT 02 RW 04 Cikancung Bandung',
    'H. Ahmad Solihin',
    '081234567890',
    '',
    'Santri Baru'
  ].map(s => `"${s}"`).join(',');

  const sample2 = [
    '2026002',
    'Aisyah Rahmawati Zahra',
    '0089876543',
    '3204123456780002',
    'Garut',
    '2012-08-20',
    'P',
    'MTS',
    '7B',
    'AKTIF',
    'Jl. Cimanuk No. 45 Tarogong Garut',
    'Hj. Siti Aminah',
    '082198765432',
    'PIP-2026-9921',
    'Penerima PIP'
  ].map(s => `"${s}"`).join(',');

  const sample3 = [
    '2026003',
    'Dzaki Ahmad Muzakki',
    '0061239871',
    '3204123456780003',
    'Purwakarta',
    '2010-02-11',
    'L',
    'MA',
    '10-IPA',
    'AKTIF',
    'Campaka Purwakarta',
    'Dedi Supriadi',
    '085612345678',
    '',
    ''
  ].map(s => `"${s}"`).join(',');

  const content = `${headers}\n${sample1}\n${sample2}\n${sample3}`;
  triggerCsvDownload('Template_Import_Santri_InayatulMuhajirin.csv', content);
}

export function importSantriFromCsv(csvText: string): {
  importedCount: number;
  skippedCount: number;
  errors: string[];
} {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const { headers, rows } = parseCsvRows(csvText);

  if (rows.length === 0) {
    throw new Error('File tidak memiliki baris data untuk diimpor.');
  }

  const nisIdx = headers.indexOf('NIS');
  const namaIdx = headers.indexOf('NAMA_LENGKAP');
  const nisnIdx = headers.indexOf('NISN');
  const nikIdx = headers.indexOf('NIK');
  const tmpLahirIdx = headers.indexOf('TEMPAT_LAHIR');
  const tglLahirIdx = headers.indexOf('TANGGAL_LAHIR');
  const jkIdx = headers.indexOf('JENIS_KELAMIN');
  const jenjangIdx = headers.indexOf('KODE_JENJANG');
  const kelasIdx = headers.indexOf('KODE_KELAS');
  const statusIdx = headers.indexOf('STATUS');
  const alamatIdx = headers.indexOf('ALAMAT');
  const waliIdx = headers.indexOf('NAMA_WALI');
  const telpIdx = headers.indexOf('NO_TELEPON_WALI');
  const kipIdx = headers.indexOf('NOMOR_KIP_PIP');
  const ketIdx = headers.indexOf('KETERANGAN');

  if (namaIdx === -1) {
    throw new Error('Kolom NAMA_LENGKAP wajib ada pada file.');
  }

  let importedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  rows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const nama = r[namaIdx];
    if (!nama) {
      skippedCount++;
      return;
    }

    const nis = (nisIdx !== -1 && r[nisIdx]) ? r[nisIdx] : `2026${Math.floor(1000 + Math.random() * 9000)}`;

    // Check duplicate NIS
    if (state.SANTRI.some(s => s.NIS === nis)) {
      errors.push(`Baris ${rowNum}: NIS ${nis} (${nama}) sudah terdaftar di sistem. Dilewati.`);
      skippedCount++;
      return;
    }

    // Match Jenjang
    const kodeJen = jenjangIdx !== -1 ? r[jenjangIdx] : '';
    let jenjang = state.JENJANG.find(j => j.KODE_JENJANG === kodeJen?.toUpperCase());
    if (!jenjang) jenjang = state.JENJANG[0];

    // Match Kelas
    const kodeKls = (kelasIdx !== -1 && r[kelasIdx]) ? String(r[kelasIdx]).trim() : '';
    let kelas = state.KELAS.find(k => {
      const kCode = (k?.KODE_KELAS || '').toString().toLowerCase();
      const kNama = (k?.NAMA_KELAS || '').toString().toLowerCase();
      const target = (kodeKls || '').toString().toLowerCase();
      return target && (kCode === target || kNama === target);
    });
    if (!kelas) {
      kelas = state.KELAS.find(k => k.ID_JENJANG === jenjang?.ID_JENJANG) || state.KELAS[0];
    }

    try {
      db.addSantri({
        NIS: nis,
        NAMA_LENGKAP: nama,
        NISN: (nisnIdx !== -1 ? r[nisnIdx] : '') || undefined,
        NIK: (nikIdx !== -1 ? r[nikIdx] : '') || undefined,
        TEMPAT_LAHIR: (tmpLahirIdx !== -1 ? r[tmpLahirIdx] : '') || undefined,
        TANGGAL_LAHIR: (tglLahirIdx !== -1 ? r[tglLahirIdx] : '') || undefined,
        JENIS_KELAMIN: (jkIdx !== -1 && r[jkIdx]?.toUpperCase() === 'P') ? 'P' : 'L',
        ID_JENJANG: jenjang ? jenjang.ID_JENJANG : state.JENJANG[0].ID_JENJANG,
        ID_KELAS: kelas ? kelas.ID_KELAS : state.KELAS[0].ID_KELAS,
        STATUS: (statusIdx !== -1 && ['AKTIF', 'NONAKTIF', 'LULUS', 'KELUAR'].includes(r[statusIdx]?.toUpperCase())) ? r[statusIdx].toUpperCase() as any : 'AKTIF',
        ALAMAT: (alamatIdx !== -1 ? r[alamatIdx] : '') || undefined,
        NAMA_WALI: (waliIdx !== -1 ? r[waliIdx] : '') || undefined,
        NAMA_AYAH_KANDUNG: (waliIdx !== -1 ? r[waliIdx] : '') || undefined,
        NO_TELEPON_WALI: (telpIdx !== -1 ? r[telpIdx] : '') || '08122334455',
        NO_TELEPON_AYAH: (telpIdx !== -1 ? r[telpIdx] : '') || '08122334455',
        NOMOR_KIP_PIP: (kipIdx !== -1 ? r[kipIdx] : '') || undefined,
        KETERANGAN: (ketIdx !== -1 ? r[ketIdx] : 'Impor dari Excel') || undefined,
        TANGGAL_MASUK: db.formatDateOnly()
      });
      importedCount++;
    } catch (err: any) {
      errors.push(`Baris ${rowNum} (${nama}): ${err.message}`);
      skippedCount++;
    }
  });

  return { importedCount, skippedCount, errors };
}

// ==========================================
// 2. TAHUN AJARAN TEMPLATE & IMPORT
// ==========================================

export function downloadTahunAjaranTemplate() {
  const headers = ['NAMA_TAHUN_AJARAN', 'TANGGAL_MULAI', 'TANGGAL_SELESAI', 'KETERANGAN', 'STATUS'].join(',');
  const sample1 = '"2027/2028","2027-07-15","2028-06-25","Tahun Ajaran Mendatang","NONAKTIF"';
  const sample2 = '"2028/2029","2028-07-15","2029-06-25","Rencana Periode Baru","NONAKTIF"';
  triggerCsvDownload('Template_Import_Tahun_Ajaran.csv', `${headers}\n${sample1}\n${sample2}`);
}

export function importTahunAjaranFromCsv(csvText: string): { importedCount: number; errors: string[] } {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const { headers, rows } = parseCsvRows(csvText);

  const namaIdx = headers.indexOf('NAMA_TAHUN_AJARAN');
  const tglMulaiIdx = headers.indexOf('TANGGAL_MULAI');
  const tglSelesaiIdx = headers.indexOf('TANGGAL_SELESAI');
  const ketIdx = headers.indexOf('KETERANGAN');

  if (namaIdx === -1) throw new Error('Kolom NAMA_TAHUN_AJARAN wajib ada.');

  let importedCount = 0;
  const errors: string[] = [];

  rows.forEach((r, idx) => {
    const nama = r[namaIdx];
    if (!nama) return;
    if (state.TAHUN_AJARAN.some(t => t.NAMA_TAHUN_AJARAN.toLowerCase() === nama.toLowerCase())) {
      errors.push(`Baris ${idx + 2}: Tahun Ajaran ${nama} sudah terdaftar.`);
      return;
    }

    try {
      db.addTahunAjaran(
        nama,
        (tglMulaiIdx !== -1 && r[tglMulaiIdx]) ? r[tglMulaiIdx] : '2027-07-15',
        (tglSelesaiIdx !== -1 && r[tglSelesaiIdx]) ? r[tglSelesaiIdx] : '2028-06-25',
        (ketIdx !== -1 ? r[ketIdx] : 'Impor Excel') || ''
      );
      importedCount++;
    } catch (err: any) {
      errors.push(`Baris ${idx + 2}: ${err.message}`);
    }
  });

  return { importedCount, errors };
}

// ==========================================
// 3. JENJANG TEMPLATE & IMPORT
// ==========================================

export function downloadJenjangTemplate() {
  const headers = ['KODE_JENJANG', 'NAMA_JENJANG', 'STATUS'].join(',');
  const sample1 = '"MTS","Madrasah Tsanawiyah","AKTIF"';
  const sample2 = '"MA","Madrasah Aliyah","AKTIF"';
  const sample3 = '"SMK","Sekolah Menengah Kejuruan Pesantren","AKTIF"';
  triggerCsvDownload('Template_Import_Jenjang.csv', `${headers}\n${sample1}\n${sample2}\n${sample3}`);
}

export function importJenjangFromCsv(csvText: string): { importedCount: number; errors: string[] } {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const { headers, rows } = parseCsvRows(csvText);

  const kodeIdx = headers.indexOf('KODE_JENJANG');
  const namaIdx = headers.indexOf('NAMA_JENJANG');

  if (kodeIdx === -1 || namaIdx === -1) throw new Error('Kolom KODE_JENJANG dan NAMA_JENJANG wajib ada.');

  let importedCount = 0;
  const errors: string[] = [];

  rows.forEach((r, idx) => {
    const kode = r[kodeIdx];
    const nama = r[namaIdx];
    if (!kode || !nama) return;
    if (state.JENJANG.some(j => j.KODE_JENJANG.toUpperCase() === kode.toUpperCase())) {
      errors.push(`Baris ${idx + 2}: Kode jenjang ${kode} sudah ada.`);
      return;
    }

    try {
      db.addJenjang(kode, nama);
      importedCount++;
    } catch (err: any) {
      errors.push(`Baris ${idx + 2}: ${err.message}`);
    }
  });

  return { importedCount, errors };
}

// ==========================================
// 4. KELAS TEMPLATE & IMPORT
// ==========================================

export function downloadKelasTemplate() {
  const headers = ['KODE_KELAS', 'NAMA_KELAS', 'KODE_JENJANG', 'NAMA_TAHUN_AJARAN', 'STATUS'].join(',');
  const sample1 = '"7A","Kelas 7A Putra","MTS","","AKTIF"';
  const sample2 = '"7B","Kelas 7B Putri","MTS","","AKTIF"';
  const sample3 = '"10-IPA","Kelas 10 IPA","MA","","AKTIF"';
  triggerCsvDownload('Template_Import_Kelas.csv', `${headers}\n${sample1}\n${sample2}\n${sample3}`);
}

export function importKelasFromCsv(csvText: string): { importedCount: number; errors: string[] } {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const { headers, rows } = parseCsvRows(csvText);

  const kodeIdx = headers.indexOf('KODE_KELAS');
  const namaIdx = headers.indexOf('NAMA_KELAS');
  const jenjangIdx = headers.indexOf('KODE_JENJANG');
  const taIdx = headers.indexOf('NAMA_TAHUN_AJARAN');

  if (kodeIdx === -1 || namaIdx === -1) throw new Error('Kolom KODE_KELAS dan NAMA_KELAS wajib ada.');

  let importedCount = 0;
  const errors: string[] = [];

  rows.forEach((r, idx) => {
    const kode = r[kodeIdx];
    const nama = r[namaIdx];
    if (!kode || !nama) return;
    if (state.KELAS.some(k => k.KODE_KELAS.toUpperCase() === kode.toUpperCase())) {
      errors.push(`Baris ${idx + 2}: Kode kelas ${kode} sudah terdaftar.`);
      return;
    }

    const kodeJen = jenjangIdx !== -1 ? r[jenjangIdx] : '';
    let jenjang = state.JENJANG.find(j => j.KODE_JENJANG === kodeJen?.toUpperCase());
    if (!jenjang) jenjang = state.JENJANG[0];

    const namaTa = taIdx !== -1 ? r[taIdx] : '';
    const ta = state.TAHUN_AJARAN.find(t => t.NAMA_TAHUN_AJARAN.toLowerCase() === namaTa?.toLowerCase());

    try {
      db.addKelas(jenjang.ID_JENJANG, kode, nama, ta?.ID_TAHUN_AJARAN);
      importedCount++;
    } catch (err: any) {
      errors.push(`Baris ${idx + 2}: ${err.message}`);
    }
  });

  return { importedCount, errors };
}

// ==========================================
// 5. JENIS TAGIHAN TEMPLATE & IMPORT
// ==========================================

export function downloadJenisTagihanTemplate() {
  const headers = ['KODE_TAGIHAN', 'NAMA_TAGIHAN', 'SIFAT', 'STATUS'].join(',');
  const sample1 = '"SPP","Iuran Syahriah / SPP Bulanan","BERULANG","AKTIF"';
  const sample2 = '"DU","Daftar Ulang Awal Tahun","SEKALI_BAYAR","AKTIF"';
  const sample3 = '"MAKAN","Uang Makan Santri","BERULANG","AKTIF"';
  triggerCsvDownload('Template_Import_Jenis_Tagihan.csv', `${headers}\n${sample1}\n${sample2}\n${sample3}`);
}

export function importJenisTagihanFromCsv(csvText: string): { importedCount: number; errors: string[] } {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const { headers, rows } = parseCsvRows(csvText);

  const kodeIdx = headers.indexOf('KODE_TAGIHAN');
  const namaIdx = headers.indexOf('NAMA_TAGIHAN');
  const sifatIdx = headers.indexOf('SIFAT');

  if (kodeIdx === -1 || namaIdx === -1) throw new Error('Kolom KODE_TAGIHAN dan NAMA_TAGIHAN wajib ada.');

  let importedCount = 0;
  const errors: string[] = [];

  rows.forEach((r, idx) => {
    const kode = r[kodeIdx];
    const nama = r[namaIdx];
    if (!kode || !nama) return;
    if (state.JENIS_TAGIHAN.some(j => j.KODE_TAGIHAN.toUpperCase() === kode.toUpperCase())) {
      errors.push(`Baris ${idx + 2}: Kode tagihan ${kode} sudah terdaftar.`);
      return;
    }

    const sifat = (sifatIdx !== -1 && r[sifatIdx]?.toUpperCase() === 'SEKALI_BAYAR') ? 'SEKALI_BAYAR' : 'BERULANG';

    try {
      db.addJenisTagihan(kode, nama, sifat);
      importedCount++;
    } catch (err: any) {
      errors.push(`Baris ${idx + 2}: ${err.message}`);
    }
  });

  return { importedCount, errors };
}

// ==========================================
// 6. MATRIKS TARIF TAGIHAN TEMPLATE & IMPORT
// ==========================================

export function downloadTarifTemplate() {
  const headers = ['NAMA_TAHUN_AJARAN', 'KODE_JENJANG', 'KODE_KELAS', 'KODE_TAGIHAN', 'NOMINAL', 'STATUS'].join(',');
  const sample1 = '"2026/2027","MTS","7A","SPP","350000","AKTIF"';
  const sample2 = '"2026/2027","MTS","7B","SPP","350000","AKTIF"';
  const sample3 = '"2026/2027","MA","10-IPA","SPP","400000","AKTIF"';
  triggerCsvDownload('Template_Import_Tarif_Tagihan.csv', `${headers}\n${sample1}\n${sample2}\n${sample3}`);
}

export function importTarifFromCsv(csvText: string): { importedCount: number; errors: string[] } {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const { headers, rows } = parseCsvRows(csvText);

  const taIdx = headers.indexOf('NAMA_TAHUN_AJARAN');
  const jenIdx = headers.indexOf('KODE_JENJANG');
  const klsIdx = headers.indexOf('KODE_KELAS');
  const jtgIdx = headers.indexOf('KODE_TAGIHAN');
  const nomIdx = headers.indexOf('NOMINAL');

  if (nomIdx === -1) throw new Error('Kolom NOMINAL wajib ada.');

  let importedCount = 0;
  const errors: string[] = [];

  rows.forEach((r, idx) => {
    const rawNom = r[nomIdx]?.replace(/[^0-9]/g, '');
    const nominal = Number(rawNom || 0);
    if (nominal <= 0) return;

    const namaTa = taIdx !== -1 ? r[taIdx] : '';
    const ta = state.TAHUN_AJARAN.find(t => t.NAMA_TAHUN_AJARAN.toLowerCase() === namaTa?.toLowerCase()) ||
               state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF') || state.TAHUN_AJARAN[0];

    const kodeJen = jenIdx !== -1 ? r[jenIdx] : '';
    const jenjang = state.JENJANG.find(j => j.KODE_JENJANG === kodeJen?.toUpperCase()) || state.JENJANG[0];

    const kodeKls = klsIdx !== -1 ? r[klsIdx] : '';
    const kelas = state.KELAS.find(k => k.KODE_KELAS === kodeKls?.toUpperCase()) || state.KELAS[0];

    const kodeJtg = jtgIdx !== -1 ? r[jtgIdx] : '';
    const jtg = state.JENIS_TAGIHAN.find(j => j.KODE_TAGIHAN === kodeJtg?.toUpperCase()) || state.JENIS_TAGIHAN[0];

    if (!ta || !jenjang || !kelas || !jtg) {
      errors.push(`Baris ${idx + 2}: Referensi data (TA/Jenjang/Kelas/Tagihan) tidak lengkap.`);
      return;
    }

    try {
      // Check existing
      const existing = state.TARIF_TAGIHAN.find(
        t => t.ID_TAHUN_AJARAN === ta.ID_TAHUN_AJARAN &&
             t.ID_JENJANG === jenjang.ID_JENJANG &&
             t.ID_KELAS === kelas.ID_KELAS &&
             t.ID_JENIS_TAGIHAN === jtg.ID_JENIS_TAGIHAN
      );

      if (existing) {
        db.updateTarifTagihan(existing.ID_TARIF, nominal);
      } else {
        db.addTarifTagihan(ta.ID_TAHUN_AJARAN, jenjang.ID_JENJANG, kelas.ID_KELAS, jtg.ID_JENIS_TAGIHAN, nominal);
      }
      importedCount++;
    } catch (err: any) {
      errors.push(`Baris ${idx + 2}: ${err.message}`);
    }
  });

  return { importedCount, errors };
}

// ==========================================
// 7. KATEGORI PENGELUARAN TEMPLATE & IMPORT
// ==========================================

export function downloadKategoriTemplate() {
  const headers = ['KODE_KATEGORI', 'NAMA_KATEGORI', 'STATUS'].join(',');
  const sample1 = '"OPS","Operasional & Konsumsi Harian Santri","AKTIF"';
  const sample2 = '"GAJI","Honorarium Asatidz & Karyawan","AKTIF"';
  const sample3 = '"SARPRAS","Pemeliharaan Gedung & Fasilitas","AKTIF"';
  triggerCsvDownload('Template_Import_Kategori_Pengeluaran.csv', `${headers}\n${sample1}\n${sample2}\n${sample3}`);
}

export function importKategoriFromCsv(csvText: string): { importedCount: number; errors: string[] } {
  const db = DbEngine.getInstance();
  const state = db.getState();
  const { headers, rows } = parseCsvRows(csvText);

  const kodeIdx = headers.indexOf('KODE_KATEGORI');
  const namaIdx = headers.indexOf('NAMA_KATEGORI');

  if (kodeIdx === -1 || namaIdx === -1) throw new Error('Kolom KODE_KATEGORI dan NAMA_KATEGORI wajib ada.');

  let importedCount = 0;
  const errors: string[] = [];

  rows.forEach((r, idx) => {
    const kode = r[kodeIdx];
    const nama = r[namaIdx];
    if (!kode || !nama) return;
    if (state.KATEGORI_PENGELUARAN.some(k => k.KODE_KATEGORI.toUpperCase() === kode.toUpperCase())) {
      errors.push(`Baris ${idx + 2}: Kode kategori ${kode} sudah terdaftar.`);
      return;
    }

    try {
      db.addKategoriPengeluaran(kode, nama);
      importedCount++;
    } catch (err: any) {
      errors.push(`Baris ${idx + 2}: ${err.message}`);
    }
  });

  return { importedCount, errors };
}
