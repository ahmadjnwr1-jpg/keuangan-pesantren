/**
 * PONDOK PESANTREN INAYATUL MUHAJIRIN
 * SISTEM INFORMASI KEUANGAN PESANTREN
 * 16 SHEET DATABASE SCHEMA & TYPE DEFINITIONS
 */

export type UserRole = 'ADMIN' | 'KEPALA_BIDANG_KEUANGAN';
export type RecordStatus = 'AKTIF' | 'NONAKTIF' | 'LULUS' | 'KELUAR';
export type BillingSifat = 'BERULANG' | 'SEKALI_BAYAR';
export type BillStatus = 'AKTIF' | 'PENGAJUAN_PEMBATALAN' | 'DIBATALKAN';
export type PaymentStatus = 'BELUM BAYAR' | 'CICIL' | 'LUNAS' | 'DIBATALKAN';
export type PaymentMethod = 'TUNAI' | 'TRANSFER' | 'LAINNYA';
export type ExpenseStatus = 'DIAJUKAN' | 'DISETUJUI' | 'DITOLAK' | 'LUNAS';
export type PeriodStatus = 'DIBUKA' | 'DITUTUP';

export interface UserRow {
  ID_USER: string;
  NAMA_LENGKAP: string;
  USERNAME: string;
  PASSWORD_HASH: string;
  ROLE: UserRole;
  STATUS: 'AKTIF' | 'NONAKTIF';
  LAST_LOGIN?: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface SantriRow {
  ID_SANTRI: string;
  NIS: string;
  NAMA_LENGKAP: string;
  NISN?: string;
  NIK?: string;
  TEMPAT_LAHIR?: string;
  TANGGAL_LAHIR?: string;
  JENIS_KELAMIN?: 'L' | 'P' | string;
  ID_JENJANG: string;
  ID_KELAS: string;
  STATUS: 'AKTIF' | 'LULUS' | 'KELUAR' | 'NONAKTIF';
  ALAMAT?: string;
  NO_TELEPON_AYAH?: string;
  NO_TELEPON_IBU?: string;
  NO_TELEPON_WALI?: string;
  NAMA_AYAH_KANDUNG?: string;
  NAMA_IBU_KANDUNG?: string;
  NAMA_WALI?: string;
  KEBUTUHAN_KHUSUS?: string;
  DISABILITAS?: string;
  NOMOR_KIP_PIP?: string;
  TANGGAL_MASUK?: string;
  TANGGAL_KELUAR?: string;
  KETERANGAN?: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface TahunAjaranRow {
  ID_TAHUN_AJARAN: string;
  NAMA_TAHUN_AJARAN: string;
  TANGGAL_MULAI: string;
  TANGGAL_SELESAI: string;
  STATUS: 'AKTIF' | 'NONAKTIF';
  KETERANGAN?: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface JenjangRow {
  ID_JENJANG: string;
  KODE_JENJANG: string;
  NAMA_JENJANG: string;
  STATUS: 'AKTIF' | 'NONAKTIF';
}

export interface KelasRow {
  ID_KELAS: string;
  ID_JENJANG: string;
  ID_TAHUN_AJARAN?: string; // Opsional: relasi tahun ajaran
  KODE_KELAS: string;
  NAMA_KELAS: string;
  STATUS: 'AKTIF' | 'NONAKTIF';
}

export interface JenisTagihanRow {
  ID_JENIS_TAGIHAN: string;
  KODE_TAGIHAN: string;
  NAMA_TAGIHAN: string;
  SIFAT: BillingSifat;
  STATUS: 'AKTIF' | 'NONAKTIF';
}

export interface TarifTagihanRow {
  ID_TARIF: string;
  ID_TAHUN_AJARAN: string;
  ID_JENJANG: string;
  ID_KELAS: string;
  ID_JENIS_TAGIHAN: string;
  NOMINAL: number;
  STATUS: 'AKTIF' | 'NONAKTIF';
}

export interface RiwayatKelasRow {
  ID_RIWAYAT: string;
  ID_SANTRI: string;
  ID_TAHUN_AJARAN: string;
  ID_JENJANG: string;
  ID_KELAS: string;
}

export interface TagihanRow {
  ID_TAGIHAN: string;
  ID_SANTRI: string;
  ID_JENIS_TAGIHAN: string;
  NAMA_TAGIHAN: string;
  ID_TAHUN_AJARAN: string;
  PERIODE_TAGIHAN?: string; // YYYY-MM
  TANGGAL_TERBIT: string;
  TANGGAL_JATUH_TEMPO: string;
  NOMINAL: number;
  STATUS: BillStatus;
  KETERANGAN?: string;
}

export interface PembayaranRow {
  ID_PEMBAYARAN: string;
  NOMOR_TRANSAKSI: string;
  ID_TAGIHAN: string;
  TANGGAL_PEMBAYARAN: string;
  NOMINAL: number;
  METODE: PaymentMethod;
  REFERENSI?: string;
  KETERANGAN?: string;
}

export interface KategoriPengeluaranRow {
  ID_KATEGORI: string;
  KODE_KATEGORI: string;
  NAMA_KATEGORI: string;
  STATUS: 'AKTIF' | 'NONAKTIF';
}

export interface PengeluaranRow {
  ID_PENGELUARAN: string;
  TANGGAL_PENGAJUAN: string;
  DIAJUKAN_OLEH: string;
  ID_KATEGORI: string;
  URAIAN: string;
  NOMINAL_PENGAJUAN: number;
  STATUS: ExpenseStatus;
  DISETUJUI_OLEH?: string;
  TANGGAL_PERSETUJUAN?: string;
  TANGGAL_PEMBAYARAN?: string;
  METODE?: PaymentMethod | string;
  REFERENSI?: string;
  KETERANGAN?: string;
}

export interface PengaturanRow {
  KEY: string;
  NILAI: string;
  KETERANGAN?: string;
}

export interface LogAktivitasRow {
  ID_LOG: string;
  WAKTU: string;
  ID_USER: string;
  NAMA_USER: string;
  MODUL: string;
  AKSI: string;
  ID_DATA: string;
  KETERANGAN: string;
  DATA_LAMA?: string;
  DATA_BARU?: string;
}

export interface DokumenRow {
  ID_DOKUMEN: string;
  JENIS_DOKUMEN: string;
  ID_REFERENSI: string;
  NAMA_FILE: string;
  URL_FILE: string;
  DIBUAT_OLEH: string;
  TANGGAL_DIBUAT: string;
  KETERANGAN?: string;
}

export interface PenutupanPeriodeRow {
  ID_PERIODE: string;
  TAHUN: string;
  BULAN: string; // 01 - 12
  STATUS: PeriodStatus;
  DITUTUP_OLEH?: string;
  TANGGAL_PENUTUPAN?: string;
  KETERANGAN?: string;
}

export interface DatabaseState {
  USERS: UserRow[];
  SANTRI: SantriRow[];
  TAHUN_AJARAN: TahunAjaranRow[];
  JENJANG: JenjangRow[];
  KELAS: KelasRow[];
  JENIS_TAGIHAN: JenisTagihanRow[];
  TARIF_TAGIHAN: TarifTagihanRow[];
  RIWAYAT_KELAS: RiwayatKelasRow[];
  TAGIHAN: TagihanRow[];
  PEMBAYARAN: PembayaranRow[];
  KATEGORI_PENGELUARAN: KategoriPengeluaranRow[];
  PENGELUARAN: PengeluaranRow[];
  PENGATURAN: PengaturanRow[];
  LOG_AKTIVITAS: LogAktivitasRow[];
  DOKUMEN: DokumenRow[];
  PENUTUPAN_PERIODE: PenutupanPeriodeRow[];
}

export const DATABASE_SCHEMA_KEYS: Record<keyof DatabaseState, string[]> = {
  USERS: [
    'ID_USER', 'NAMA_LENGKAP', 'USERNAME', 'PASSWORD_HASH', 'ROLE', 'STATUS', 'LAST_LOGIN', 'CREATED_AT', 'UPDATED_AT'
  ],
  SANTRI: [
    'ID_SANTRI', 'NIS', 'NAMA_LENGKAP', 'NISN', 'NIK', 'TEMPAT_LAHIR', 'TANGGAL_LAHIR', 'JENIS_KELAMIN',
    'ID_JENJANG', 'ID_KELAS', 'STATUS', 'ALAMAT', 'NO_TELEPON_AYAH', 'NO_TELEPON_IBU', 'NO_TELEPON_WALI',
    'NAMA_AYAH_KANDUNG', 'NAMA_IBU_KANDUNG', 'NAMA_WALI', 'KEBUTUHAN_KHUSUS', 'DISABILITAS', 'NOMOR_KIP_PIP',
    'TANGGAL_MASUK', 'TANGGAL_KELUAR', 'KETERANGAN', 'CREATED_AT', 'UPDATED_AT'
  ],
  TAHUN_AJARAN: [
    'ID_TAHUN_AJARAN', 'NAMA_TAHUN_AJARAN', 'TANGGAL_MULAI', 'TANGGAL_SELESAI', 'STATUS', 'KETERANGAN', 'CREATED_AT', 'UPDATED_AT'
  ],
  JENJANG: ['ID_JENJANG', 'KODE_JENJANG', 'NAMA_JENJANG', 'STATUS'],
  KELAS: ['ID_KELAS', 'ID_JENJANG', 'KODE_KELAS', 'NAMA_KELAS', 'STATUS'],
  JENIS_TAGIHAN: ['ID_JENIS_TAGIHAN', 'KODE_TAGIHAN', 'NAMA_TAGIHAN', 'SIFAT', 'STATUS'],
  TARIF_TAGIHAN: ['ID_TARIF', 'ID_TAHUN_AJARAN', 'ID_JENJANG', 'ID_KELAS', 'ID_JENIS_TAGIHAN', 'NOMINAL', 'STATUS'],
  RIWAYAT_KELAS: ['ID_RIWAYAT', 'ID_SANTRI', 'ID_TAHUN_AJARAN', 'ID_JENJANG', 'ID_KELAS'],
  TAGIHAN: [
    'ID_TAGIHAN', 'ID_SANTRI', 'ID_JENIS_TAGIHAN', 'NAMA_TAGIHAN', 'ID_TAHUN_AJARAN', 'PERIODE_TAGIHAN',
    'TANGGAL_TERBIT', 'TANGGAL_JATUH_TEMPO', 'NOMINAL', 'STATUS', 'KETERANGAN'
  ],
  PEMBAYARAN: [
    'ID_PEMBAYARAN', 'NOMOR_TRANSAKSI', 'ID_TAGIHAN', 'TANGGAL_PEMBAYARAN', 'NOMINAL', 'METODE', 'REFERENSI', 'KETERANGAN'
  ],
  KATEGORI_PENGELUARAN: ['ID_KATEGORI', 'KODE_KATEGORI', 'NAMA_KATEGORI', 'STATUS'],
  PENGELUARAN: [
    'ID_PENGELUARAN', 'TANGGAL_PENGAJUAN', 'DIAJUKAN_OLEH', 'ID_KATEGORI', 'URAIAN', 'NOMINAL_PENGAJUAN',
    'STATUS', 'DISETUJUI_OLEH', 'TANGGAL_PERSETUJUAN', 'TANGGAL_PEMBAYARAN', 'METODE', 'REFERENSI', 'KETERANGAN'
  ],
  PENGATURAN: ['KEY', 'NILAI', 'KETERANGAN'],
  LOG_AKTIVITAS: [
    'ID_LOG', 'WAKTU', 'ID_USER', 'NAMA_USER', 'MODUL', 'AKSI', 'ID_DATA', 'KETERANGAN', 'DATA_LAMA', 'DATA_BARU'
  ],
  DOKUMEN: [
    'ID_DOKUMEN', 'JENIS_DOKUMEN', 'ID_REFERENSI', 'NAMA_FILE', 'URL_FILE', 'DIBUAT_OLEH', 'TANGGAL_DIBUAT', 'KETERANGAN'
  ],
  PENUTUPAN_PERIODE: [
    'ID_PERIODE', 'TAHUN', 'BULAN', 'STATUS', 'DITUTUP_OLEH', 'TANGGAL_PENUTUPAN', 'KETERANGAN'
  ]
};
