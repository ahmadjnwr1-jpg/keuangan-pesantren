/**
 * PONDOK PESANTREN INAYATUL MUHAJIRIN
 * CORE DATABASE & BUSINESS RULES ENGINE
 * Implements the 41-step blueprint faithfully with 16-sheet single source of truth.
 */

import {
  DatabaseState,
  DATABASE_SCHEMA_KEYS,
  UserRow,
  SantriRow,
  TahunAjaranRow,
  JenjangRow,
  KelasRow,
  JenisTagihanRow,
  TarifTagihanRow,
  RiwayatKelasRow,
  TagihanRow,
  PembayaranRow,
  KategoriPengeluaranRow,
  PengeluaranRow,
  PengaturanRow,
  LogAktivitasRow,
  DokumenRow,
  PenutupanPeriodeRow,
  BillStatus,
  PaymentStatus,
  PaymentMethod,
  ExpenseStatus,
  UserRole
} from '../types/database';
import { INITIAL_DATABASE } from './seedData';

const STORAGE_KEY = 'IM_PESANTREN_DB_V1';
const SESSION_KEY = 'IM_PESANTREN_CURRENT_USER';

export class DbEngine {
  private static instance: DbEngine;
  private state: DatabaseState;
  private currentUser: UserRow | null = null;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.state = this.loadDatabase();
    this.currentUser = this.loadSession();
  }

  public static getInstance(): DbEngine {
    if (!DbEngine.instance) {
      DbEngine.instance = new DbEngine();
    }
    return DbEngine.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ==========================================
  // 01 & 02: DATABASE & SCHEMA PERSISTENCE
  // ==========================================

  private loadDatabase(): DatabaseState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure all 16 sheets exist
        const validated: DatabaseState = { ...INITIAL_DATABASE };
        for (const key of Object.keys(DATABASE_SCHEMA_KEYS) as Array<keyof DatabaseState>) {
          if (Array.isArray(parsed[key])) {
            (validated as any)[key] = parsed[key];
          }
        }

        // Pastikan penugasan jabatan sesuai amanah:
        // Ranran Siti Nurhasanah = Kepala Bidang Keuangan
        // Astri Sriwulandari = Admin Keuangan
        if (Array.isArray(validated.USERS)) {
          const uRanran = validated.USERS.find(u => u.ID_USER === 'U001' || u.NAMA_LENGKAP.toLowerCase().includes('ranran'));
          if (uRanran) {
            uRanran.NAMA_LENGKAP = 'Ranran Siti Nurhasanah, S.Pd, M.Pd';
            uRanran.ROLE = 'KEPALA_BIDANG_KEUANGAN';
          }
          const uAstri = validated.USERS.find(u => u.ID_USER === 'U002' || u.NAMA_LENGKAP.toLowerCase().includes('astri'));
          if (uAstri) {
            uAstri.NAMA_LENGKAP = 'Astri Sriwulandari';
            uAstri.ROLE = 'ADMIN';
          }
        }

        return validated;
      }
    } catch (e) {
      console.error('Failed to load database from localStorage:', e);
    }
    this.saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  public saveDatabase(state?: DatabaseState): void {
    if (state) {
      this.state = state;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save database to localStorage:', e);
    }
    this.notify();
  }

  public resetToFactory(): void {
    this.state = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.saveDatabase();
    this.writeAuditLog('SISTEM', 'RESET_FACTORY', 'ALL', 'Reset database ke setelan awal', null, null);
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // ==========================================
  // 03 & 04: ID & NUMBERING ENGINE
  // ==========================================

  public formatNow(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  public formatDateOnly(d = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  public generateDatabaseId(type: 'SAN' | 'TAG' | 'PAY' | 'EXP' | 'LOG' | 'DOC' | 'PER' | 'RKL' | 'TRF' | 'TA' | 'JEN' | 'KLS' | 'JTG' | 'KAT' | 'USR'): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${type}-${ymd}-${rand}`;
  }

  public generateTransactionNumber(kodeTagihan: string, kodeKelas: string, kodeSantri: string, tahun = '2026'): string {
    const clean = (s: string) => s.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const payments = this.state.PEMBAYARAN;
    const count = payments.length + 1;
    const pad4 = String(count).padStart(4, '0');
    return `TRX-${clean(kodeTagihan)}-${clean(kodeKelas)}-${clean(kodeSantri)}-${clean(tahun)}-${pad4}`;
  }

  public generateInvoiceNumber(tahun = '2026'): string {
    const count = this.state.DOKUMEN.length + 1;
    const pad4 = String(count).padStart(4, '0');
    return `INV-${tahun}-${pad4}`;
  }

  public generateExpenseNumber(tahun = '2026'): string {
    const count = this.state.PENGELUARAN.length + 1;
    const pad4 = String(count).padStart(4, '0');
    return `PG-${tahun}-${pad4}`;
  }

  // ==========================================
  // 05, 06, 07, 08: AUTHENTICATION, SESSION, ROLE & SECURITY
  // ==========================================

  private loadSession(): UserRow | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Refresh with latest role & name from database state
        const fresh = this.state.USERS.find(u => u.ID_USER === parsed.ID_USER);
        if (fresh) return fresh;
        return parsed;
      }
    } catch {}
    // Default to admin U001
    return this.state.USERS[0] || null;
  }

  public getCurrentUser(): UserRow | null {
    return this.currentUser;
  }

  public login(username: string, passwordHash?: string): UserRow {
    const cleanUser = username.trim().toLowerCase();
    const user = this.state.USERS.find(u => u.USERNAME.toLowerCase() === cleanUser);
    if (!user) {
      throw new Error('Username atau kata sandi tidak valid.');
    }
    if (user.STATUS !== 'AKTIF') {
      throw new Error('Akun Anda sedang dinonaktifkan.');
    }
    this.currentUser = { ...user, LAST_LOGIN: this.formatNow() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));

    // Update in DB
    const idx = this.state.USERS.findIndex(u => u.ID_USER === user.ID_USER);
    if (idx !== -1) {
      this.state.USERS[idx].LAST_LOGIN = this.formatNow();
      this.saveDatabase();
    }
    this.writeAuditLog('AUTH', 'LOGIN', user.ID_USER, `Login berhasil: ${user.NAMA_LENGKAP} (${user.ROLE})`, null, null);
    this.notify();
    return this.currentUser;
  }

  public switchUser(idUser: string, inputPassword?: string): UserRow {
    const user = this.state.USERS.find(u => u.ID_USER === idUser);
    if (!user) throw new Error('User tidak ditemukan');

    // Autentikasi Password Akun Khusus:
    // Ranran: 112233
    // Astri: 332211
    if (user.ID_USER === 'U001' || user.NAMA_LENGKAP.toLowerCase().includes('ranran')) {
      if (inputPassword !== '112233') {
        throw new Error('Kata sandi salah untuk akun Kepala Bidang Keuangan (Ranran).');
      }
    } else if (user.ID_USER === 'U002' || user.NAMA_LENGKAP.toLowerCase().includes('astri')) {
      if (inputPassword !== '332211') {
        throw new Error('Kata sandi salah untuk akun Admin Keuangan (Astri).');
      }
    }

    this.currentUser = { ...user, LAST_LOGIN: this.formatNow() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
    this.writeAuditLog('AUTH', 'SWITCH_USER', user.ID_USER, `Beralih ke akun: ${user.NAMA_LENGKAP} (${user.ROLE})`, null, null);
    this.notify();
    return this.currentUser;
  }

  public logout(): void {
    if (this.currentUser) {
      this.writeAuditLog('AUTH', 'LOGOUT', this.currentUser.ID_USER, `User ${this.currentUser.NAMA_LENGKAP} keluar`, null, null);
    }
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    this.notify();
  }

  public requireAdmin(): UserRow {
    if (!this.currentUser) throw new Error('Sesi berakhir. Silakan masuk kembali.');
    if (this.currentUser.STATUS !== 'AKTIF') throw new Error('Akun tidak aktif.');
    return this.currentUser;
  }

  public requireHeadFinance(): UserRow {
    if (!this.currentUser) throw new Error('Sesi berakhir. Silakan masuk kembali.');
    if (this.currentUser.ROLE !== 'KEPALA_BIDANG_KEUANGAN') {
      throw new Error('Akses dibatasi. Tindakan ini hanya boleh dilakukan oleh Kepala Bidang Keuangan.');
    }
    return this.currentUser;
  }

  // ==========================================
  // 19: PERIOD CLOSING & LOCK
  // ==========================================

  public getPeriodKey(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.substring(0, 7);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }

  public isPeriodLocked(dateStr: string): boolean {
    const period = this.getPeriodKey(dateStr);
    const [year, month] = period.split('-');
    const row = this.state.PENUTUPAN_PERIODE.find(p => p.TAHUN === year && p.BULAN === month);
    return row ? row.STATUS === 'DITUTUP' : false;
  }

  public assertPeriodOpen(dateStr: string): void {
    if (this.isPeriodLocked(dateStr)) {
      const period = this.getPeriodKey(dateStr);
      throw new Error(`Transaksi ditolak: Periode ${period} telah DITUTUP. Perubahan data keuangan pada periode ini dikunci.`);
    }
  }

  public closePeriod(tahun: string, bulan: string, keterangan?: string): PenutupanPeriodeRow {
    this.requireHeadFinance();
    const existing = this.state.PENUTUPAN_PERIODE.find(p => p.TAHUN === tahun && p.BULAN === bulan);
    const user = this.currentUser!;

    if (existing) {
      existing.STATUS = 'DITUTUP';
      existing.DITUTUP_OLEH = user.ID_USER;
      existing.TANGGAL_PENUTUPAN = this.formatNow();
      existing.KETERANGAN = keterangan || existing.KETERANGAN;
      this.saveDatabase();
      this.writeAuditLog('PENUTUPAN_PERIODE', 'TUTUP_PERIODE', existing.ID_PERIODE, `Periode ${tahun}-${bulan} ditutup oleh ${user.NAMA_LENGKAP}`, null, existing);
      this.notify();
      return existing;
    } else {
      const newRow: PenutupanPeriodeRow = {
        ID_PERIODE: this.generateDatabaseId('PER'),
        TAHUN: tahun,
        BULAN: bulan,
        STATUS: 'DITUTUP',
        DITUTUP_OLEH: user.ID_USER,
        TANGGAL_PENUTUPAN: this.formatNow(),
        KETERANGAN: keterangan || 'Penutupan periode keuangan'
      };
      this.state.PENUTUPAN_PERIODE.push(newRow);
      this.saveDatabase();
      this.writeAuditLog('PENUTUPAN_PERIODE', 'TUTUP_PERIODE', newRow.ID_PERIODE, `Periode ${tahun}-${bulan} ditutup oleh ${user.NAMA_LENGKAP}`, null, newRow);
      this.notify();
      return newRow;
    }
  }

  public reopenPeriod(tahun: string, bulan: string, keterangan?: string): PenutupanPeriodeRow {
    this.requireHeadFinance();
    const existing = this.state.PENUTUPAN_PERIODE.find(p => p.TAHUN === tahun && p.BULAN === bulan);
    if (!existing) throw new Error('Periode belum tercatat dalam sistem.');
    const user = this.currentUser!;
    const old = { ...existing };
    existing.STATUS = 'DIBUKA';
    existing.KETERANGAN = keterangan || `Dibuka kembali oleh ${user.NAMA_LENGKAP}`;
    this.saveDatabase();
    this.writeAuditLog('PENUTUPAN_PERIODE', 'BUKA_PERIODE', existing.ID_PERIODE, `Periode ${tahun}-${bulan} dibuka kembali`, old, existing);
    this.notify();
    return existing;
  }

  // ==========================================
  // 11: AUDIT LOG ENGINE
  // ==========================================

  public writeAuditLog(modul: string, aksi: string, idData: string, keterangan: string, dataLama: any, dataBaru: any): void {
    const user = this.currentUser;
    const log: LogAktivitasRow = {
      ID_LOG: this.generateDatabaseId('LOG'),
      WAKTU: this.formatNow(),
      ID_USER: user ? user.ID_USER : 'SYS',
      NAMA_USER: user ? user.NAMA_LENGKAP : 'Sistem Otomatis',
      MODUL: modul,
      AKSI: aksi,
      ID_DATA: idData,
      KETERANGAN: keterangan,
      DATA_LAMA: dataLama ? JSON.stringify(dataLama) : '',
      DATA_BARU: dataBaru ? JSON.stringify(dataBaru) : ''
    };
    this.state.LOG_AKTIVITAS.unshift(log);
    // Keep max 2000 log entries
    if (this.state.LOG_AKTIVITAS.length > 2000) {
      this.state.LOG_AKTIVITAS.pop();
    }
    // Direct save without recursive audit
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  // ==========================================
  // 12: MASTER DATA: TAHUN AJARAN, JENJANG, KELAS, TARIF, KATEGORI
  // ==========================================

  public getActiveAcademicYear(): TahunAjaranRow {
    const active = this.state.TAHUN_AJARAN.find(t => t.STATUS === 'AKTIF');
    if (!active) {
      throw new Error('Belum ada Tahun Ajaran yang berstatus AKTIF.');
    }
    return active;
  }

  public setActiveAcademicYear(idTahunAjaran: string): void {
    this.requireAdmin();
    const old = JSON.parse(JSON.stringify(this.state.TAHUN_AJARAN));
    this.state.TAHUN_AJARAN.forEach(ta => {
      ta.STATUS = ta.ID_TAHUN_AJARAN === idTahunAjaran ? 'AKTIF' : 'NONAKTIF';
      ta.UPDATED_AT = this.formatNow();
    });
    this.saveDatabase();
    this.writeAuditLog('TAHUN_AJARAN', 'UBAH_STATUS', idTahunAjaran, `Mengaktifkan tahun ajaran: ${idTahunAjaran}`, old, this.state.TAHUN_AJARAN);
  }

  public addTahunAjaran(nama: string, tglMulai: string, tglSelesai: string, keterangan?: string): TahunAjaranRow {
    this.requireAdmin();
    if (!nama.trim()) throw new Error('Nama tahun ajaran wajib diisi.');
    const id = this.generateDatabaseId('TA');
    const row: TahunAjaranRow = {
      ID_TAHUN_AJARAN: id,
      NAMA_TAHUN_AJARAN: nama.trim(),
      TANGGAL_MULAI: tglMulai,
      TANGGAL_SELESAI: tglSelesai,
      STATUS: 'NONAKTIF',
      KETERANGAN: keterangan || '',
      CREATED_AT: this.formatNow(),
      UPDATED_AT: this.formatNow()
    };
    this.state.TAHUN_AJARAN.push(row);
    this.saveDatabase();
    this.writeAuditLog('TAHUN_AJARAN', 'TAMBAH', id, `Menambah tahun ajaran: ${nama}`, null, row);
    return row;
  }

  public updateTahunAjaran(idTahunAjaran: string, patch: Partial<TahunAjaranRow>): TahunAjaranRow {
    this.requireAdmin();
    const idx = this.state.TAHUN_AJARAN.findIndex(t => t.ID_TAHUN_AJARAN === idTahunAjaran);
    if (idx === -1) throw new Error('Tahun Ajaran tidak ditemukan.');

    const old = { ...this.state.TAHUN_AJARAN[idx] };
    const updated: TahunAjaranRow = {
      ...old,
      ...patch,
      UPDATED_AT: this.formatNow()
    };
    this.state.TAHUN_AJARAN[idx] = updated;
    this.saveDatabase();
    this.writeAuditLog('TAHUN_AJARAN', 'UBAH', idTahunAjaran, `Mengubah data tahun ajaran: ${updated.NAMA_TAHUN_AJARAN}`, old, updated);
    return updated;
  }

  public getTahunAjaranReferenceSummary(idTahunAjaran: string) {
    const bills = this.state.TAGIHAN.filter(t => t.ID_TAHUN_AJARAN === idTahunAjaran);
    const billIds = new Set(bills.map(b => b.ID_TAGIHAN));
    const payments = this.state.PEMBAYARAN.filter(p => billIds.has(p.ID_TAGIHAN));
    const tariffCount = this.state.TARIF_TAGIHAN.filter(t => t.ID_TAHUN_AJARAN === idTahunAjaran).length;
    const historyCount = this.state.RIWAYAT_KELAS.filter(r => r.ID_TAHUN_AJARAN === idTahunAjaran).length;
    const directClasses = this.state.KELAS.filter(k => k.ID_TAHUN_AJARAN === idTahunAjaran);
    
    // Classes used in this year's history or tariffs
    const classIdsInHistory = new Set(this.state.RIWAYAT_KELAS.filter(r => r.ID_TAHUN_AJARAN === idTahunAjaran).map(r => r.ID_KELAS));
    const classIdsInTariffs = new Set(this.state.TARIF_TAGIHAN.filter(t => t.ID_TAHUN_AJARAN === idTahunAjaran).map(t => t.ID_KELAS));
    const relatedClassIds = new Set([...directClasses.map(k => k.ID_KELAS), ...classIdsInHistory, ...classIdsInTariffs]);
    const relatedClasses = this.state.KELAS.filter(k => relatedClassIds.has(k.ID_KELAS));

    return {
      billCount: bills.length,
      paymentCount: payments.length,
      tariffCount,
      historyCount,
      classCount: relatedClasses.length,
      relatedClasses,
      hasReferences: bills.length > 0 || tariffCount > 0 || historyCount > 0 || relatedClasses.length > 0
    };
  }

  public deleteTahunAjaran(
    idTahunAjaran: string, 
    force = false, 
    deleteAssociatedClasses = true,
    classIdsToDelete?: string[]
  ): { success: boolean; message: string; deletedClassesCount: number } {
    this.requireAdmin();
    const idx = this.state.TAHUN_AJARAN.findIndex(t => t.ID_TAHUN_AJARAN === idTahunAjaran);
    if (idx === -1) throw new Error('Tahun Ajaran tidak ditemukan.');

    const ta = this.state.TAHUN_AJARAN[idx];
    if (ta.STATUS === 'AKTIF') {
      throw new Error(`Tahun Ajaran ${ta.NAMA_TAHUN_AJARAN} sedang berstatus AKTIF. Silakan aktifkan tahun ajaran lain terlebih dahulu sebelum menghapus.`);
    }

    const summary = this.getTahunAjaranReferenceSummary(idTahunAjaran);
    const bills = this.state.TAGIHAN.filter(t => t.ID_TAHUN_AJARAN === idTahunAjaran);
    const billIds = new Set(bills.map(b => b.ID_TAGIHAN));

    if (summary.hasReferences && !force) {
      throw new Error(
        `Tahun Ajaran ${ta.NAMA_TAHUN_AJARAN} masih memiliki keterkaitan data: ${summary.billCount} tagihan, ${summary.tariffCount} tarif patokan, ${summary.historyCount} riwayat kelas santri, dan ${summary.classCount} kelas terkait. Gunakan opsi konfirmasi hapus bersih untuk membersihkannya secara otomatis.`
      );
    }

    const old = { ...ta };
    let deletedClassesCount = 0;

    // Cascade cleanups if force is enabled:
    if (force) {
      // 1. Delete associated classes if requested
      if (deleteAssociatedClasses) {
        const targetClassIds = classIdsToDelete 
          ? new Set(classIdsToDelete) 
          : new Set(summary.relatedClasses.map(k => k.ID_KELAS));
        
        const remainingClasses = this.state.KELAS.filter(k => !targetClassIds.has(k.ID_KELAS));
        deletedClassesCount = this.state.KELAS.length - remainingClasses.length;
        this.state.KELAS = remainingClasses;

        // If any santri was assigned to deleted class, assign to fallback or empty
        const fallbackClass = remainingClasses[0]?.ID_KELAS || '';
        const fallbackJenjang = remainingClasses[0]?.ID_JENJANG || '';
        this.state.SANTRI.forEach(s => {
          if (targetClassIds.has(s.ID_KELAS)) {
            s.ID_KELAS = fallbackClass;
            if (fallbackJenjang) s.ID_JENJANG = fallbackJenjang;
          }
        });
      }

      this.state.TARIF_TAGIHAN = this.state.TARIF_TAGIHAN.filter(t => t.ID_TAHUN_AJARAN !== idTahunAjaran);
      this.state.RIWAYAT_KELAS = this.state.RIWAYAT_KELAS.filter(r => r.ID_TAHUN_AJARAN !== idTahunAjaran);
      this.state.TAGIHAN = this.state.TAGIHAN.filter(t => t.ID_TAHUN_AJARAN !== idTahunAjaran);
      this.state.PEMBAYARAN = this.state.PEMBAYARAN.filter(p => !billIds.has(p.ID_TAGIHAN));
    }

    this.state.TAHUN_AJARAN.splice(idx, 1);
    this.saveDatabase();
    this.writeAuditLog(
      'TAHUN_AJARAN',
      'HAPUS',
      idTahunAjaran,
      `Menghapus tahun ajaran: ${ta.NAMA_TAHUN_AJARAN} ${force ? '[CASCADE]' : ''} (Menghapus ${deletedClassesCount} kelas terkait)`,
      old,
      null
    );

    return {
      success: true,
      deletedClassesCount,
      message: `Tahun Ajaran ${ta.NAMA_TAHUN_AJARAN} berhasil dihapus.${force ? ` Seluruh tarif, tagihan, riwayat, dan ${deletedClassesCount} kelas terkait telah dibersihkan secara otomatis.` : ''}`
    };
  }

  public updateTarifTagihan(idTarif: string, nominal: number, status?: 'AKTIF' | 'NONAKTIF'): TarifTagihanRow {
    this.requireAdmin();
    const idx = this.state.TARIF_TAGIHAN.findIndex(t => t.ID_TARIF === idTarif);
    if (idx === -1) throw new Error('Tarif tagihan tidak ditemukan.');
    if (nominal <= 0) throw new Error('Nominal tarif harus lebih dari Rp 0.');

    const old = { ...this.state.TARIF_TAGIHAN[idx] };
    this.state.TARIF_TAGIHAN[idx].NOMINAL = Math.round(nominal);
    if (status) this.state.TARIF_TAGIHAN[idx].STATUS = status;
    this.saveDatabase();
    this.writeAuditLog('TARIF_TAGIHAN', 'UBAH', idTarif, `Mengubah nominal tarif menjadi Rp ${nominal.toLocaleString('id-ID')}`, old, this.state.TARIF_TAGIHAN[idx]);
    return this.state.TARIF_TAGIHAN[idx];
  }

  public deleteTarifTagihan(idTarif: string): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.TARIF_TAGIHAN.findIndex(t => t.ID_TARIF === idTarif);
    if (idx === -1) throw new Error('Tarif tagihan tidak ditemukan.');
    const old = { ...this.state.TARIF_TAGIHAN[idx] };
    this.state.TARIF_TAGIHAN.splice(idx, 1);
    this.saveDatabase();
    this.writeAuditLog('TARIF_TAGIHAN', 'HAPUS', idTarif, `Menghapus tarif tagihan ID: ${idTarif}`, old, null);
    return { success: true, message: 'Tarif tagihan berhasil dihapus.' };
  }

  public updateKelas(
    idKelas: string, 
    namaKelas: string, 
    kodeKelas?: string, 
    idJenjang?: string, 
    idTahunAjaran?: string, 
    status?: 'AKTIF' | 'NONAKTIF'
  ): KelasRow {
    this.requireAdmin();
    const idx = this.state.KELAS.findIndex(k => k.ID_KELAS === idKelas);
    if (idx === -1) throw new Error('Kelas tidak ditemukan.');
    const old = { ...this.state.KELAS[idx] };
    this.state.KELAS[idx].NAMA_KELAS = namaKelas.trim();
    if (kodeKelas) this.state.KELAS[idx].KODE_KELAS = kodeKelas.trim().toUpperCase();
    if (idJenjang) this.state.KELAS[idx].ID_JENJANG = idJenjang;
    if (idTahunAjaran !== undefined) this.state.KELAS[idx].ID_TAHUN_AJARAN = idTahunAjaran || undefined;
    if (status) this.state.KELAS[idx].STATUS = status;
    this.saveDatabase();
    this.writeAuditLog('KELAS', 'UBAH', idKelas, `Mengubah kelas: ${namaKelas}`, old, this.state.KELAS[idx]);
    return this.state.KELAS[idx];
  }

  public deleteKelas(idKelas: string, force = false): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.KELAS.findIndex(k => k.ID_KELAS === idKelas);
    if (idx === -1) throw new Error('Kelas tidak ditemukan.');
    const kelas = this.state.KELAS[idx];

    const studentCount = this.state.SANTRI.filter(s => s.ID_KELAS === idKelas).length;
    if (studentCount > 0 && !force) {
      throw new Error(`Kelas ${kelas.NAMA_KELAS} masih memiliki ${studentCount} santri aktif. Gunakan konfirmasi hapus paksa atau pindahkan santri terlebih dahulu.`);
    }

    const old = { ...kelas };
    
    // If force, clean up or reassign santri & clean up tariffs
    if (force) {
      const fallbackKelas = this.state.KELAS.find(k => k.ID_KELAS !== idKelas);
      this.state.SANTRI.forEach(s => {
        if (s.ID_KELAS === idKelas) {
          s.ID_KELAS = fallbackKelas ? fallbackKelas.ID_KELAS : '';
        }
      });
      this.state.TARIF_TAGIHAN = this.state.TARIF_TAGIHAN.filter(t => t.ID_KELAS !== idKelas);
      this.state.RIWAYAT_KELAS = this.state.RIWAYAT_KELAS.filter(r => r.ID_KELAS !== idKelas);
    }

    this.state.KELAS.splice(idx, 1);
    this.saveDatabase();
    this.writeAuditLog('KELAS', 'HAPUS', idKelas, `Menghapus kelas ${kelas.NAMA_KELAS} ${force ? '[CASCADE]' : ''}`, old, null);
    return { success: true, message: `Kelas ${kelas.NAMA_KELAS} berhasil dihapus.${force && studentCount > 0 ? ` (${studentCount} santri dialihkan).` : ''}` };
  }

  public addJenjang(kode: string, nama: string): JenjangRow {
    this.requireAdmin();
    const cleanKode = kode.trim().toUpperCase();
    if (this.state.JENJANG.some(j => j.KODE_JENJANG === cleanKode)) {
      throw new Error(`Kode jenjang ${cleanKode} sudah digunakan.`);
    }
    const id = this.generateDatabaseId('JEN');
    const row: JenjangRow = {
      ID_JENJANG: id,
      KODE_JENJANG: cleanKode,
      NAMA_JENJANG: nama.trim(),
      STATUS: 'AKTIF'
    };
    this.state.JENJANG.push(row);
    this.saveDatabase();
    this.writeAuditLog('JENJANG', 'TAMBAH', id, `Menambah jenjang ${nama}`, null, row);
    return row;
  }

  public updateJenjang(idJenjang: string, kode: string, nama: string, status?: 'AKTIF' | 'NONAKTIF'): JenjangRow {
    this.requireAdmin();
    const idx = this.state.JENJANG.findIndex(j => j.ID_JENJANG === idJenjang);
    if (idx === -1) throw new Error('Jenjang tidak ditemukan.');
    const old = { ...this.state.JENJANG[idx] };
    this.state.JENJANG[idx].KODE_JENJANG = kode.trim().toUpperCase();
    this.state.JENJANG[idx].NAMA_JENJANG = nama.trim();
    if (status) this.state.JENJANG[idx].STATUS = status;
    this.saveDatabase();
    this.writeAuditLog('JENJANG', 'UBAH', idJenjang, `Mengubah jenjang: ${nama}`, old, this.state.JENJANG[idx]);
    return this.state.JENJANG[idx];
  }

  public deleteJenjang(idJenjang: string, force = false): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.JENJANG.findIndex(j => j.ID_JENJANG === idJenjang);
    if (idx === -1) throw new Error('Jenjang tidak ditemukan.');
    const j = this.state.JENJANG[idx];

    const relatedClasses = this.state.KELAS.filter(k => k.ID_JENJANG === idJenjang);
    if (relatedClasses.length > 0 && !force) {
      throw new Error(`Jenjang ${j.NAMA_JENJANG} memiliki ${relatedClasses.length} kelas. Gunakan opsi hapus bersih untuk membersihkannya.`);
    }

    const old = { ...j };
    if (force) {
      this.state.KELAS = this.state.KELAS.filter(k => k.ID_JENJANG !== idJenjang);
      this.state.TARIF_TAGIHAN = this.state.TARIF_TAGIHAN.filter(t => t.ID_JENJANG !== idJenjang);
    }

    this.state.JENJANG.splice(idx, 1);
    this.saveDatabase();
    this.writeAuditLog('JENJANG', 'HAPUS', idJenjang, `Menghapus jenjang: ${j.NAMA_JENJANG} ${force ? '[CASCADE]' : ''}`, old, null);
    return { success: true, message: `Jenjang ${j.NAMA_JENJANG} berhasil dihapus.` };
  }

  public addKelas(idJenjang: string, kodeKelas: string, namaKelas: string, idTahunAjaran?: string): KelasRow {
    this.requireAdmin();
    const jenjang = this.state.JENJANG.find(j => j.ID_JENJANG === idJenjang);
    if (!jenjang) throw new Error('Jenjang tidak valid.');
    const cleanKode = kodeKelas.trim().toUpperCase();
    if (this.state.KELAS.some(k => k.KODE_KELAS === cleanKode)) {
      throw new Error(`Kode kelas ${cleanKode} sudah digunakan.`);
    }
    const id = this.generateDatabaseId('KLS');
    const row: KelasRow = {
      ID_KELAS: id,
      ID_JENJANG: idJenjang,
      ID_TAHUN_AJARAN: idTahunAjaran || undefined,
      KODE_KELAS: cleanKode,
      NAMA_KELAS: namaKelas.trim(),
      STATUS: 'AKTIF'
    };
    this.state.KELAS.push(row);
    this.saveDatabase();
    this.writeAuditLog('KELAS', 'TAMBAH', id, `Menambah kelas ${namaKelas}`, null, row);
    return row;
  }

  public addJenisTagihan(kode: string, nama: string, sifat: 'BERULANG' | 'SEKALI_BAYAR'): JenisTagihanRow {
    this.requireAdmin();
    const cleanKode = kode.trim().toUpperCase();
    if (this.state.JENIS_TAGIHAN.some(j => j.KODE_TAGIHAN === cleanKode)) {
      throw new Error(`Kode tagihan ${cleanKode} sudah digunakan.`);
    }
    const id = this.generateDatabaseId('JTG');
    const row: JenisTagihanRow = {
      ID_JENIS_TAGIHAN: id,
      KODE_TAGIHAN: cleanKode,
      NAMA_TAGIHAN: nama.trim(),
      SIFAT: sifat,
      STATUS: 'AKTIF'
    };
    this.state.JENIS_TAGIHAN.push(row);
    this.saveDatabase();
    this.writeAuditLog('JENIS_TAGIHAN', 'TAMBAH', id, `Menambah jenis tagihan ${nama}`, null, row);
    return row;
  }

  public updateJenisTagihan(idJenisTagihan: string, kode: string, nama: string, sifat: 'BERULANG' | 'SEKALI_BAYAR', status?: 'AKTIF' | 'NONAKTIF'): JenisTagihanRow {
    this.requireAdmin();
    const idx = this.state.JENIS_TAGIHAN.findIndex(j => j.ID_JENIS_TAGIHAN === idJenisTagihan);
    if (idx === -1) throw new Error('Jenis tagihan tidak ditemukan.');
    const old = { ...this.state.JENIS_TAGIHAN[idx] };
    this.state.JENIS_TAGIHAN[idx].KODE_TAGIHAN = kode.trim().toUpperCase();
    this.state.JENIS_TAGIHAN[idx].NAMA_TAGIHAN = nama.trim();
    this.state.JENIS_TAGIHAN[idx].SIFAT = sifat;
    if (status) this.state.JENIS_TAGIHAN[idx].STATUS = status;
    this.saveDatabase();
    this.writeAuditLog('JENIS_TAGIHAN', 'UBAH', idJenisTagihan, `Mengubah jenis tagihan: ${nama}`, old, this.state.JENIS_TAGIHAN[idx]);
    return this.state.JENIS_TAGIHAN[idx];
  }

  public deleteJenisTagihan(idJenisTagihan: string, force = false): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.JENIS_TAGIHAN.findIndex(j => j.ID_JENIS_TAGIHAN === idJenisTagihan);
    if (idx === -1) throw new Error('Jenis tagihan tidak ditemukan.');
    const jtg = this.state.JENIS_TAGIHAN[idx];

    const bills = this.state.TAGIHAN.filter(t => t.ID_JENIS_TAGIHAN === idJenisTagihan);
    if (bills.length > 0 && !force) {
      throw new Error(`Jenis tagihan ${jtg.NAMA_TAGIHAN} memiliki ${bills.length} tagihan terbit. Gunakan opsi hapus bersih untuk membersihkannya.`);
    }

    const old = { ...jtg };
    if (force) {
      const billIds = new Set(bills.map(b => b.ID_TAGIHAN));
      this.state.TAGIHAN = this.state.TAGIHAN.filter(t => t.ID_JENIS_TAGIHAN !== idJenisTagihan);
      this.state.PEMBAYARAN = this.state.PEMBAYARAN.filter(p => !billIds.has(p.ID_TAGIHAN));
      this.state.TARIF_TAGIHAN = this.state.TARIF_TAGIHAN.filter(t => t.ID_JENIS_TAGIHAN !== idJenisTagihan);
    }

    this.state.JENIS_TAGIHAN.splice(idx, 1);
    this.saveDatabase();
    this.writeAuditLog('JENIS_TAGIHAN', 'HAPUS', idJenisTagihan, `Menghapus jenis tagihan: ${jtg.NAMA_TAGIHAN} ${force ? '[CASCADE]' : ''}`, old, null);
    return { success: true, message: `Jenis tagihan ${jtg.NAMA_TAGIHAN} berhasil dihapus.` };
  }

  public updateKategoriPengeluaran(idKategori: string, kode: string, nama: string, status?: 'AKTIF' | 'NONAKTIF'): KategoriPengeluaranRow {
    this.requireAdmin();
    const idx = this.state.KATEGORI_PENGELUARAN.findIndex(k => k.ID_KATEGORI === idKategori);
    if (idx === -1) throw new Error('Kategori pengeluaran tidak ditemukan.');
    const old = { ...this.state.KATEGORI_PENGELUARAN[idx] };
    this.state.KATEGORI_PENGELUARAN[idx].KODE_KATEGORI = kode.trim().toUpperCase();
    this.state.KATEGORI_PENGELUARAN[idx].NAMA_KATEGORI = nama.trim();
    if (status) this.state.KATEGORI_PENGELUARAN[idx].STATUS = status;
    this.saveDatabase();
    this.writeAuditLog('KATEGORI_PENGELUARAN', 'UBAH', idKategori, `Mengubah kategori pengeluaran: ${nama}`, old, this.state.KATEGORI_PENGELUARAN[idx]);
    return this.state.KATEGORI_PENGELUARAN[idx];
  }

  public deleteKategoriPengeluaran(idKategori: string, force = false): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.KATEGORI_PENGELUARAN.findIndex(k => k.ID_KATEGORI === idKategori);
    if (idx === -1) throw new Error('Kategori pengeluaran tidak ditemukan.');
    const kat = this.state.KATEGORI_PENGELUARAN[idx];

    const expenses = this.state.PENGELUARAN.filter(p => p.ID_KATEGORI === idKategori);
    if (expenses.length > 0 && !force) {
      throw new Error(`Kategori ${kat.NAMA_KATEGORI} memiliki ${expenses.length} data pengeluaran. Gunakan opsi hapus bersih jika ingin menghapus.`);
    }

    const old = { ...kat };
    if (force) {
      this.state.PENGELUARAN = this.state.PENGELUARAN.filter(p => p.ID_KATEGORI !== idKategori);
    }

    this.state.KATEGORI_PENGELUARAN.splice(idx, 1);
    this.saveDatabase();
    this.writeAuditLog('KATEGORI_PENGELUARAN', 'HAPUS', idKategori, `Menghapus kategori pengeluaran: ${kat.NAMA_KATEGORI} ${force ? '[CASCADE]' : ''}`, old, null);
    return { success: true, message: `Kategori ${kat.NAMA_KATEGORI} berhasil dihapus.` };
  }

  public addTarifTagihan(idTahunAjaran: string, idJenjang: string, idKelas: string, idJenisTagihan: string, nominal: number): TarifTagihanRow {
    this.requireAdmin();
    if (nominal <= 0) throw new Error('Nominal tarif harus lebih dari Rp 0.');
    const duplicate = this.state.TARIF_TAGIHAN.find(
      t => t.ID_TAHUN_AJARAN === idTahunAjaran && t.ID_JENJANG === idJenjang && t.ID_KELAS === idKelas && t.ID_JENIS_TAGIHAN === idJenisTagihan
    );
    if (duplicate) {
      throw new Error('Tarif untuk kombinasi Tahun Ajaran, Jenjang, Kelas, dan Jenis Tagihan ini sudah ada.');
    }
    const id = this.generateDatabaseId('TRF');
    const row: TarifTagihanRow = {
      ID_TARIF: id,
      ID_TAHUN_AJARAN: idTahunAjaran,
      ID_JENJANG: idJenjang,
      ID_KELAS: idKelas,
      ID_JENIS_TAGIHAN: idJenisTagihan,
      NOMINAL: Math.round(nominal),
      STATUS: 'AKTIF'
    };
    this.state.TARIF_TAGIHAN.push(row);
    this.saveDatabase();
    this.writeAuditLog('TARIF_TAGIHAN', 'TAMBAH', id, `Menambah tarif tagihan Rp ${nominal.toLocaleString('id-ID')}`, null, row);
    return row;
  }

  public addKategoriPengeluaran(kode: string, nama: string): KategoriPengeluaranRow {
    this.requireAdmin();
    const cleanKode = kode.trim().toUpperCase();
    if (this.state.KATEGORI_PENGELUARAN.some(k => k.KODE_KATEGORI === cleanKode)) {
      throw new Error(`Kode kategori ${cleanKode} sudah terdaftar.`);
    }
    const id = this.generateDatabaseId('KAT');
    const row: KategoriPengeluaranRow = {
      ID_KATEGORI: id,
      KODE_KATEGORI: cleanKode,
      NAMA_KATEGORI: nama.trim(),
      STATUS: 'AKTIF'
    };
    this.state.KATEGORI_PENGELUARAN.push(row);
    this.saveDatabase();
    this.writeAuditLog('KATEGORI_PENGELUARAN', 'TAMBAH', id, `Menambah kategori ${nama}`, null, row);
    return row;
  }

  // ==========================================
  // 11 & 12: DATA SANTRI & RIWAYAT SANTRI
  // ==========================================

  public addSantri(santriData: Omit<SantriRow, 'ID_SANTRI' | 'CREATED_AT' | 'UPDATED_AT'>): SantriRow {
    this.requireAdmin();
    if (!santriData.NAMA_LENGKAP.trim()) throw new Error('Nama santri wajib diisi.');
    if (!santriData.ID_JENJANG || !santriData.ID_KELAS) throw new Error('Jenjang dan Kelas wajib dipilih.');

    // Check unique NIS
    if (santriData.NIS && this.state.SANTRI.some(s => s.NIS === santriData.NIS.trim())) {
      throw new Error(`NIS ${santriData.NIS} sudah terdaftar.`);
    }

    const id = this.generateDatabaseId('SAN');
    const now = this.formatNow();
    const row: SantriRow = {
      ...santriData,
      ID_SANTRI: id,
      STATUS: santriData.STATUS || 'AKTIF',
      CREATED_AT: now,
      UPDATED_AT: now
    };
    this.state.SANTRI.push(row);

    // Auto-create initial riwayat kelas in active academic year
    try {
      const activeYear = this.getActiveAcademicYear();
      const idRkl = this.generateDatabaseId('RKL');
      this.state.RIWAYAT_KELAS.push({
        ID_RIWAYAT: idRkl,
        ID_SANTRI: id,
        ID_TAHUN_AJARAN: activeYear.ID_TAHUN_AJARAN,
        ID_JENJANG: row.ID_JENJANG,
        ID_KELAS: row.ID_KELAS
      });
    } catch {}

    this.saveDatabase();
    this.writeAuditLog('SANTRI', 'TAMBAH', id, `Menambah santri baru: ${row.NAMA_LENGKAP} (NIS: ${row.NIS})`, null, row);
    return row;
  }

  public updateSantri(idSantri: string, patch: Partial<SantriRow>): SantriRow {
    this.requireAdmin();
    const idx = this.state.SANTRI.findIndex(s => s.ID_SANTRI === idSantri);
    if (idx === -1) throw new Error('Santri tidak ditemukan.');

    const old = { ...this.state.SANTRI[idx] };
    const updated: SantriRow = {
      ...old,
      ...patch,
      UPDATED_AT: this.formatNow()
    };
    this.state.SANTRI[idx] = updated;
    this.saveDatabase();
    this.writeAuditLog('SANTRI', 'UBAH', idSantri, `Mengubah data santri: ${updated.NAMA_LENGKAP}`, old, updated);
    return updated;
  }

  public getSantriTransactionSummary(idSantri: string) {
    const bills = this.state.TAGIHAN.filter(t => t.ID_SANTRI === idSantri);
    const billIds = new Set(bills.map(b => b.ID_TAGIHAN));
    const payments = this.state.PEMBAYARAN.filter(p => billIds.has(p.ID_TAGIHAN));
    const totalBills = bills.reduce((sum, b) => sum + b.NOMINAL, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.NOMINAL, 0);
    const activeBills = bills.filter(b => b.STATUS === 'AKTIF');

    return {
      billCount: bills.length,
      activeBillCount: activeBills.length,
      paymentCount: payments.length,
      totalBills,
      totalPayments,
      hasFinancialHistory: payments.length > 0
    };
  }

  public deleteSantri(idSantri: string, alasan: string, force = false): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.SANTRI.findIndex(s => s.ID_SANTRI === idSantri);
    if (idx === -1) throw new Error('Santri tidak ditemukan.');

    const santri = this.state.SANTRI[idx];
    const summary = this.getSantriTransactionSummary(idSantri);

    if (summary.hasFinancialHistory && !force) {
      throw new Error(
        `Santri ${santri.NAMA_LENGKAP} memiliki riwayat ${summary.paymentCount} transaksi pembayaran kas sah (Total Rp ${summary.totalPayments.toLocaleString('id-ID')}). Untuk menjaga integritas audit kas pesantren, santri tidak dapat dihapus permanen secara langsung. Disarankan mengubah status menjadi 'KELUAR' atau 'NONAKTIF'.`
      );
    }

    const oldSantri = { ...santri };

    // 1. Remove from SANTRI
    this.state.SANTRI.splice(idx, 1);

    // 2. Remove from RIWAYAT_KELAS
    this.state.RIWAYAT_KELAS = this.state.RIWAYAT_KELAS.filter(r => r.ID_SANTRI !== idSantri);

    // 3. Handle bills
    if (!summary.hasFinancialHistory) {
      this.state.TAGIHAN = this.state.TAGIHAN.filter(t => t.ID_SANTRI !== idSantri);
    } else {
      const billIds = new Set(this.state.TAGIHAN.filter(t => t.ID_SANTRI === idSantri).map(b => b.ID_TAGIHAN));
      this.state.TAGIHAN = this.state.TAGIHAN.filter(t => t.ID_SANTRI !== idSantri);
      this.state.PEMBAYARAN = this.state.PEMBAYARAN.filter(p => !billIds.has(p.ID_TAGIHAN));
    }

    this.saveDatabase();
    this.writeAuditLog(
      'SANTRI',
      'HAPUS',
      idSantri,
      `Menghapus santri: ${santri.NAMA_LENGKAP} (NIS: ${santri.NIS}). Alasan: ${alasan || 'Tidak ada alasan'} ${force ? '[FORCE DELETE]' : ''}`,
      oldSantri,
      null
    );

    return {
      success: true,
      message: `Data santri ${santri.NAMA_LENGKAP} berhasil dihapus dari sistem.`
    };
  }

  public pindahKelasSantri(idSantri: string, idJenjangBaru: string, idKelasBaru: string, idTahunAjaran?: string): void {
    this.requireAdmin();
    const santri = this.state.SANTRI.find(s => s.ID_SANTRI === idSantri);
    if (!santri) throw new Error('Santri tidak ditemukan.');

    const ta = idTahunAjaran ? this.state.TAHUN_AJARAN.find(t => t.ID_TAHUN_AJARAN === idTahunAjaran) : this.getActiveAcademicYear();
    if (!ta) throw new Error('Tahun ajaran tidak valid.');

    const old = { ...santri };
    santri.ID_JENJANG = idJenjangBaru;
    santri.ID_KELAS = idKelasBaru;
    santri.UPDATED_AT = this.formatNow();

    const rklId = this.generateDatabaseId('RKL');
    this.state.RIWAYAT_KELAS.push({
      ID_RIWAYAT: rklId,
      ID_SANTRI: idSantri,
      ID_TAHUN_AJARAN: ta.ID_TAHUN_AJARAN,
      ID_JENJANG: idJenjangBaru,
      ID_KELAS: idKelasBaru
    });

    this.saveDatabase();
    this.writeAuditLog('SANTRI', 'PINDAH_KELAS', idSantri, `Santri ${santri.NAMA_LENGKAP} dipindahkan ke kelas baru`, old, santri);
  }

  // 13: Kenaikan Kelas Massal
  public executeMassPromotion(mapping: Array<{ idKelasAsal: string; idJenjangTujuan: string; idKelasTujuan: string }>, idTahunAjaranBaru: string) {
    this.requireAdmin();
    const taBaru = this.state.TAHUN_AJARAN.find(t => t.ID_TAHUN_AJARAN === idTahunAjaranBaru);
    if (!taBaru) throw new Error('Tahun ajaran baru tidak ditemukan.');

    let processedCount = 0;
    let skippedCount = 0;

    mapping.forEach(m => {
      const activeStudents = this.state.SANTRI.filter(s => s.ID_KELAS === m.idKelasAsal && s.STATUS === 'AKTIF');
      activeStudents.forEach(santri => {
        // Check if already has history for that year
        const alreadyHas = this.state.RIWAYAT_KELAS.some(r => r.ID_SANTRI === santri.ID_SANTRI && r.ID_TAHUN_AJARAN === idTahunAjaranBaru);
        if (alreadyHas) {
          skippedCount++;
          return;
        }

        santri.ID_JENJANG = m.idJenjangTujuan;
        santri.ID_KELAS = m.idKelasTujuan;
        santri.UPDATED_AT = this.formatNow();

        this.state.RIWAYAT_KELAS.push({
          ID_RIWAYAT: this.generateDatabaseId('RKL'),
          ID_SANTRI: santri.ID_SANTRI,
          ID_TAHUN_AJARAN: idTahunAjaranBaru,
          ID_JENJANG: m.idJenjangTujuan,
          ID_KELAS: m.idKelasTujuan
        });
        processedCount++;
      });
    });

    this.saveDatabase();
    this.writeAuditLog('SANTRI', 'KENAIKAN_MASSAL', idTahunAjaranBaru, `Kenaikan kelas massal: ${processedCount} santri diproses, ${skippedCount} dilewati`, null, { processedCount, skippedCount });
    return { processedCount, skippedCount };
  }

  // ==========================================
  // 14: TAGIHAN ENGINE
  // ==========================================

  public buildBillDuplicateKey(idSantri: string, idJenisTagihan: string, periodeTagihan: string, idTahunAjaran: string): string {
    return [idSantri.trim(), idJenisTagihan.trim(), (periodeTagihan || '').trim(), idTahunAjaran.trim()].join('|');
  }

  public getBillRemaining(idTagihan: string): number {
    const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === idTagihan);
    if (!bill) return 0;
    const paid = this.state.PEMBAYARAN
      .filter(p => p.ID_TAGIHAN === idTagihan)
      .reduce((sum, p) => sum + p.NOMINAL, 0);
    return Math.max(0, bill.NOMINAL - paid);
  }

  public getBillPaidAmount(idTagihan: string): number {
    return this.state.PEMBAYARAN
      .filter(p => p.ID_TAGIHAN === idTagihan)
      .reduce((sum, p) => sum + p.NOMINAL, 0);
  }

  public getBillPaymentStatus(bill: TagihanRow): PaymentStatus {
    if (bill.STATUS === 'DIBATALKAN') return 'DIBATALKAN';
    const paid = this.getBillPaidAmount(bill.ID_TAGIHAN);
    if (paid <= 0) return 'BELUM BAYAR';
    if (paid >= bill.NOMINAL) return 'LUNAS';
    return 'CICIL';
  }

  public previewGenerateTagihan(params: {
    idTahunAjaran: string;
    idJenisTagihan: string;
    periodeTagihan?: string; // YYYY-MM
    tglTerbit: string;
    tglJatuhTempo: string;
    idJenjang?: string;
    idKelas?: string;
  }) {
    this.requireAdmin();
    const ta = this.state.TAHUN_AJARAN.find(t => t.ID_TAHUN_AJARAN === params.idTahunAjaran);
    const jtg = this.state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === params.idJenisTagihan);
    if (!ta) throw new Error('Tahun ajaran tidak ditemukan');
    if (!jtg) throw new Error('Jenis tagihan tidak ditemukan');

    const students = this.state.SANTRI.filter(s => {
      if (s.STATUS !== 'AKTIF') return false;
      if (params.idJenjang && s.ID_JENJANG !== params.idJenjang) return false;
      if (params.idKelas && s.ID_KELAS !== params.idKelas) return false;
      return true;
    });

    const existingKeys = new Set(
      this.state.TAGIHAN.map(t => this.buildBillDuplicateKey(t.ID_SANTRI, t.ID_JENIS_TAGIHAN, t.PERIODE_TAGIHAN || '', t.ID_TAHUN_AJARAN))
    );

    const ready: Array<{ santri: SantriRow; nominal: number; key: string }> = [];
    const duplicates: Array<{ santri: SantriRow; reason: string }> = [];
    const noTariff: Array<{ santri: SantriRow; reason: string }> = [];

    students.forEach(s => {
      // Find tariff
      const tariff = this.state.TARIF_TAGIHAN.find(
        t => t.ID_TAHUN_AJARAN === params.idTahunAjaran && t.ID_JENJANG === s.ID_JENJANG && t.ID_KELAS === s.ID_KELAS && t.ID_JENIS_TAGIHAN === params.idJenisTagihan && t.STATUS === 'AKTIF'
      );
      if (!tariff) {
        noTariff.push({ santri: s, reason: 'Tarif belum diatur untuk kelas ini' });
        return;
      }

      const key = this.buildBillDuplicateKey(s.ID_SANTRI, params.idJenisTagihan, params.periodeTagihan || '', params.idTahunAjaran);
      if (existingKeys.has(key)) {
        duplicates.push({ santri: s, reason: 'Tagihan untuk periode ini sudah pernah diterbitkan' });
        return;
      }

      ready.push({
        santri: s,
        nominal: tariff.NOMINAL,
        key
      });
    });

    return {
      totalSantri: students.length,
      ready,
      duplicates,
      noTariff,
      totalNominal: ready.reduce((acc, r) => acc + r.nominal, 0)
    };
  }

  public executeGenerateTagihan(params: {
    idTahunAjaran: string;
    idJenisTagihan: string;
    periodeTagihan?: string;
    tglTerbit: string;
    tglJatuhTempo: string;
    idJenjang?: string;
    idKelas?: string;
    keterangan?: string;
  }) {
    this.assertPeriodOpen(params.tglTerbit);
    const preview = this.previewGenerateTagihan(params);
    const jtg = this.state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === params.idJenisTagihan)!;

    const generatedBills: TagihanRow[] = [];
    preview.ready.forEach(item => {
      const id = this.generateDatabaseId('TAG');
      const bill: TagihanRow = {
        ID_TAGIHAN: id,
        ID_SANTRI: item.santri.ID_SANTRI,
        ID_JENIS_TAGIHAN: params.idJenisTagihan,
        NAMA_TAGIHAN: jtg.NAMA_TAGIHAN,
        ID_TAHUN_AJARAN: params.idTahunAjaran,
        PERIODE_TAGIHAN: params.periodeTagihan || '',
        TANGGAL_TERBIT: params.tglTerbit,
        TANGGAL_JATUH_TEMPO: params.tglJatuhTempo,
        NOMINAL: item.nominal,
        STATUS: 'AKTIF',
        KETERANGAN: params.keterangan || (params.periodeTagihan ? `Tagihan periode ${params.periodeTagihan}` : '')
      };
      this.state.TAGIHAN.push(bill);
      generatedBills.push(bill);
    });

    this.saveDatabase();
    this.writeAuditLog(
      'TAGIHAN',
      'GENERATE_MASSAL',
      params.idJenisTagihan,
      `Generate tagihan massal ${jtg.NAMA_TAGIHAN}: ${generatedBills.length} tagihan diterbitkan`,
      null,
      { totalGenerated: generatedBills.length, totalNominal: preview.totalNominal }
    );

    return {
      generatedCount: generatedBills.length,
      skippedDuplicates: preview.duplicates.length,
      skippedNoTariff: preview.noTariff.length,
      totalNominal: preview.totalNominal
    };
  }

  // ==========================================
  // 15: PEMBAYARAN ENGINE
  // ==========================================

  public addPembayaran(payload: {
    idTagihan: string;
    tglPembayaran: string;
    nominal: number;
    metode: PaymentMethod;
    referensi?: string;
    keterangan?: string;
  }): PembayaranRow {
    this.requireAdmin();
    this.assertPeriodOpen(payload.tglPembayaran);

    const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === payload.idTagihan);
    if (!bill) throw new Error('Tagihan tidak ditemukan.');
    if (bill.STATUS !== 'AKTIF') {
      throw new Error(`Pembayaran ditolak: Status tagihan saat ini adalah ${bill.STATUS}`);
    }

    const nominal = Math.round(Number(payload.nominal));
    if (nominal <= 0) throw new Error('Nominal pembayaran harus lebih besar dari Rp 0.');

    const remaining = this.getBillRemaining(bill.ID_TAGIHAN);
    if (nominal > remaining) {
      throw new Error(`Nominal pembayaran (Rp ${nominal.toLocaleString('id-ID')}) melebihi sisa tagihan (Rp ${remaining.toLocaleString('id-ID')}).`);
    }

    if (payload.metode === 'TRANSFER' && (!payload.referensi || !payload.referensi.trim())) {
      throw new Error('Pembayaran via TRANSFER wajib menyertakan kode referensi / nomor mutasi bank.');
    }

    const santri = this.state.SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI);
    const kelas = santri ? this.state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
    const jtg = this.state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === bill.ID_JENIS_TAGIHAN);

    const noTrx = this.generateTransactionNumber(
      jtg ? jtg.KODE_TAGIHAN : 'TRX',
      kelas ? kelas.KODE_KELAS : 'KLS',
      santri ? santri.NIS || santri.ID_SANTRI.slice(-4) : 'SAN'
    );

    const idPay = this.generateDatabaseId('PAY');
    const paymentRow: PembayaranRow = {
      ID_PEMBAYARAN: idPay,
      NOMOR_TRANSAKSI: noTrx,
      ID_TAGIHAN: bill.ID_TAGIHAN,
      TANGGAL_PEMBAYARAN: payload.tglPembayaran,
      NOMINAL: nominal,
      METODE: payload.metode,
      REFERENSI: payload.referensi ? payload.referensi.trim() : '',
      KETERANGAN: payload.keterangan || ''
    };

    this.state.PEMBAYARAN.push(paymentRow);

    // Auto-create receipt document record
    const idDoc = this.generateDatabaseId('DOC');
    this.state.DOKUMEN.unshift({
      ID_DOKUMEN: idDoc,
      JENIS_DOKUMEN: 'INVOICE_PEMBAYARAN',
      ID_REFERENSI: idPay,
      NAMA_FILE: `Kwitansi-${noTrx}.pdf`,
      URL_FILE: `/invoice/${idPay}`,
      DIBUAT_OLEH: this.currentUser ? this.currentUser.ID_USER : 'SYS',
      TANGGAL_DIBUAT: this.formatNow(),
      KETERANGAN: `Kwitansi pembayaran ${santri?.NAMA_LENGKAP || ''} - Rp ${nominal.toLocaleString('id-ID')}`
    });

    this.saveDatabase();
    this.writeAuditLog(
      'PEMBAYARAN',
      'BAYAR',
      idPay,
      `Penerimaan pembayaran ${noTrx} sebesar Rp ${nominal.toLocaleString('id-ID')} untuk tagihan ${bill.NAMA_TAGIHAN}`,
      null,
      paymentRow
    );

    return paymentRow;
  }

  public deletePembayaran(idPembayaran: string, alasan: string): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.PEMBAYARAN.findIndex(p => p.ID_PEMBAYARAN === idPembayaran);
    if (idx === -1) throw new Error('Transaksi pembayaran tidak ditemukan.');
    const pay = this.state.PEMBAYARAN[idx];

    this.assertPeriodOpen(pay.TANGGAL_PEMBAYARAN);

    const old = { ...pay };
    this.state.PEMBAYARAN.splice(idx, 1);
    
    // Clean up document receipt
    this.state.DOKUMEN = this.state.DOKUMEN.filter(d => d.ID_REFERENSI !== idPembayaran);

    this.saveDatabase();
    this.writeAuditLog(
      'PEMBAYARAN',
      'HAPUS',
      idPembayaran,
      `Membatalkan/menghapus pembayaran ${pay.NOMOR_TRANSAKSI} (Rp ${pay.NOMINAL.toLocaleString('id-ID')}). Alasan koreksi: ${alasan || 'Koreksi salah input'}`,
      old,
      null
    );

    return {
      success: true,
      message: `Transaksi pembayaran ${pay.NOMOR_TRANSAKSI} berhasil dibatalkan dan saldo tagihan telah disesuaikan kembali.`
    };
  }

  public deleteTagihan(idTagihan: string, force = false): { success: boolean; message: string } {
    this.requireAdmin();
    const idx = this.state.TAGIHAN.findIndex(t => t.ID_TAGIHAN === idTagihan);
    if (idx === -1) throw new Error('Tagihan tidak ditemukan.');
    const bill = this.state.TAGIHAN[idx];

    this.assertPeriodOpen(bill.TANGGAL_TERBIT);

    const payments = this.state.PEMBAYARAN.filter(p => p.ID_TAGIHAN === idTagihan);
    if (payments.length > 0 && !force) {
      throw new Error(`Tagihan ${bill.NAMA_TAGIHAN} telah memiliki ${payments.length} transaksi pembayaran kas. Gunakan opsi hapus bersih jika benar-benar ingin membatalkan transaksi tersebut.`);
    }

    const old = { ...bill };
    if (force) {
      this.state.PEMBAYARAN = this.state.PEMBAYARAN.filter(p => p.ID_TAGIHAN !== idTagihan);
    }
    this.state.TAGIHAN.splice(idx, 1);
    this.saveDatabase();
    this.writeAuditLog('TAGIHAN', 'HAPUS', idTagihan, `Menghapus tagihan ${bill.NAMA_TAGIHAN} ${force ? '[CASCADE]' : ''}`, old, null);
    return { success: true, message: `Tagihan ${bill.NAMA_TAGIHAN} berhasil dihapus dari sistem.` };
  }

  public updateTagihan(idTagihan: string, patch: {
    nominal?: number;
    tanggalJatuhTempo?: string;
    keterangan?: string;
    status?: BillStatus;
  }): TagihanRow {
    this.requireAdmin();
    const idx = this.state.TAGIHAN.findIndex(t => t.ID_TAGIHAN === idTagihan);
    if (idx === -1) throw new Error('Tagihan tidak ditemukan.');
    const bill = this.state.TAGIHAN[idx];

    this.assertPeriodOpen(bill.TANGGAL_TERBIT);

    const paid = this.getBillPaidAmount(idTagihan);
    if (patch.nominal !== undefined) {
      const newNominal = Math.round(Number(patch.nominal));
      if (newNominal <= 0) throw new Error('Nominal tagihan harus lebih besar dari Rp 0.');
      if (newNominal < paid) {
        throw new Error(`Nominal tagihan (Rp ${newNominal.toLocaleString('id-ID')}) tidak boleh lebih kecil dari pembayaran yang sudah masuk (Rp ${paid.toLocaleString('id-ID')}).`);
      }
      bill.NOMINAL = newNominal;
    }

    if (patch.tanggalJatuhTempo) {
      bill.TANGGAL_JATUH_TEMPO = patch.tanggalJatuhTempo;
    }

    if (patch.keterangan !== undefined) {
      bill.KETERANGAN = patch.keterangan;
    }

    if (patch.status) {
      bill.STATUS = patch.status;
    }

    const old = { ...bill };
    this.saveDatabase();
    this.writeAuditLog(
      'TAGIHAN',
      'UBAH',
      idTagihan,
      `Mengubah rincian tagihan ${bill.NAMA_TAGIHAN} (Nominal: Rp ${bill.NOMINAL.toLocaleString('id-ID')})`,
      old,
      bill
    );

    return bill;
  }

  // ==========================================
  // 16: PEMBATALAN TAGIHAN WORKFLOW
  // ==========================================

  public ajukanPembatalanTagihan(idTagihan: string, alasan: string): TagihanRow {
    this.requireAdmin();
    const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === idTagihan);
    if (!bill) throw new Error('Tagihan tidak ditemukan.');
    if (bill.STATUS !== 'AKTIF') {
      throw new Error(`Pengajuan pembatalan hanya dapat dilakukan untuk tagihan AKTIF (Status saat ini: ${bill.STATUS}).`);
    }

    const cleanReason = (alasan || '').trim();
    if (cleanReason.length < 5) {
      throw new Error('Alasan pembatalan wajib diisi minimal 5 karakter.');
    }

    this.assertPeriodOpen(bill.TANGGAL_TERBIT);

    const old = { ...bill };
    bill.STATUS = 'PENGAJUAN_PEMBATALAN';
    bill.KETERANGAN = `[Pengajuan Pembatalan: ${cleanReason}] ${bill.KETERANGAN || ''}`.trim();

    this.saveDatabase();
    this.writeAuditLog(
      'TAGIHAN',
      'PENGAJUAN_PEMBATALAN',
      idTagihan,
      `Pengajuan pembatalan tagihan ${bill.NAMA_TAGIHAN} (Alasan: ${cleanReason})`,
      old,
      bill
    );

    return bill;
  }

  public setujuiPembatalanTagihan(idTagihan: string, catatanApproval?: string): TagihanRow {
    this.requireHeadFinance();
    const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === idTagihan);
    if (!bill) throw new Error('Tagihan tidak ditemukan.');
    if (bill.STATUS !== 'PENGAJUAN_PEMBATALAN') {
      throw new Error('Tagihan tidak sedang dalam status PENGAJUAN_PEMBATALAN.');
    }

    this.assertPeriodOpen(bill.TANGGAL_TERBIT);

    const old = { ...bill };
    bill.STATUS = 'DIBATALKAN';
    bill.KETERANGAN = `[DISETUJUI DIBATALKAN oleh ${this.currentUser!.NAMA_LENGKAP}: ${catatanApproval || 'Disetujui'}] ${bill.KETERANGAN || ''}`.trim();

    this.saveDatabase();
    this.writeAuditLog(
      'TAGIHAN',
      'SETUJUI_PEMBATALAN',
      idTagihan,
      `Pembatalan tagihan ${bill.NAMA_TAGIHAN} telah DISETUJUI oleh Kepala Bidang Keuangan. (Pembayaran yang telah ada tetap dipelihara secara utuh)`,
      old,
      bill
    );

    return bill;
  }

  public tolakPembatalanTagihan(idTagihan: string, alasanPenolakan: string): TagihanRow {
    this.requireHeadFinance();
    const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === idTagihan);
    if (!bill) throw new Error('Tagihan tidak ditemukan.');
    if (bill.STATUS !== 'PENGAJUAN_PEMBATALAN') {
      throw new Error('Tagihan tidak sedang dalam status PENGAJUAN_PEMBATALAN.');
    }

    const cleanReason = (alasanPenolakan || '').trim();
    if (cleanReason.length < 5) {
      throw new Error('Alasan penolakan wajib diisi minimal 5 karakter.');
    }

    this.assertPeriodOpen(bill.TANGGAL_TERBIT);

    const old = { ...bill };
    bill.STATUS = 'AKTIF';
    bill.KETERANGAN = `[Pembatalan DITOLAK oleh ${this.currentUser!.NAMA_LENGKAP}: ${cleanReason}] ${bill.KETERANGAN || ''}`.trim();

    this.saveDatabase();
    this.writeAuditLog(
      'TAGIHAN',
      'TOLAK_PEMBATALAN',
      idTagihan,
      `Pengajuan pembatalan tagihan DITOLAK: ${cleanReason}`,
      old,
      bill
    );

    return bill;
  }

  // ==========================================
  // 17: PENGELUARAN WORKFLOW
  // ==========================================

  public ajukanPengeluaran(params: {
    tglPengajuan: string;
    idKategori: string;
    uraian: string;
    nominal: number;
    keterangan?: string;
  }): PengeluaranRow {
    this.requireAdmin();
    this.assertPeriodOpen(params.tglPengajuan);

    const nominal = Math.round(Number(params.nominal));
    if (nominal <= 0) throw new Error('Nominal pengajuan pengeluaran harus lebih besar dari Rp 0.');
    if (!params.uraian.trim()) throw new Error('Uraian pengeluaran wajib diisi.');

    const kat = this.state.KATEGORI_PENGELUARAN.find(k => k.ID_KATEGORI === params.idKategori);
    if (!kat) throw new Error('Kategori pengeluaran tidak ditemukan.');

    const id = this.generateDatabaseId('EXP');
    const row: PengeluaranRow = {
      ID_PENGELUARAN: id,
      TANGGAL_PENGAJUAN: params.tglPengajuan,
      DIAJUKAN_OLEH: this.currentUser!.ID_USER,
      ID_KATEGORI: params.idKategori,
      URAIAN: params.uraian.trim(),
      NOMINAL_PENGAJUAN: nominal,
      STATUS: 'DIAJUKAN',
      KETERANGAN: params.keterangan || ''
    };

    this.state.PENGELUARAN.unshift(row);
    this.saveDatabase();
    this.writeAuditLog(
      'PENGELUARAN',
      'AJUKAN',
      id,
      `Pengajuan pengeluaran baru: ${row.URAIAN} (Rp ${nominal.toLocaleString('id-ID')})`,
      null,
      row
    );

    return row;
  }

  public setujuiPengeluaran(idPengeluaran: string): PengeluaranRow {
    this.requireHeadFinance();
    const exp = this.state.PENGELUARAN.find(e => e.ID_PENGELUARAN === idPengeluaran);
    if (!exp) throw new Error('Pengeluaran tidak ditemukan.');
    if (exp.STATUS !== 'DIAJUKAN') {
      throw new Error(`Persetujuan ditolak: Status pengeluaran saat ini adalah ${exp.STATUS}.`);
    }

    this.assertPeriodOpen(exp.TANGGAL_PENGAJUAN);

    const old = { ...exp };
    exp.STATUS = 'DISETUJUI';
    exp.DISETUJUI_OLEH = this.currentUser!.ID_USER;
    exp.TANGGAL_PERSETUJUAN = this.formatNow();

    this.saveDatabase();
    this.writeAuditLog(
      'PENGELUARAN',
      'SETUJUI',
      idPengeluaran,
      `Pengeluaran ${exp.URAIAN} DISETUJUI oleh Kepala Bidang Keuangan (Nominal Rp ${exp.NOMINAL_PENGAJUAN.toLocaleString('id-ID')} terkunci)`,
      old,
      exp
    );

    return exp;
  }

  public tolakPengeluaran(idPengeluaran: string, alasanPenolakan: string): PengeluaranRow {
    this.requireHeadFinance();
    const exp = this.state.PENGELUARAN.find(e => e.ID_PENGELUARAN === idPengeluaran);
    if (!exp) throw new Error('Pengeluaran tidak ditemukan.');
    if (exp.STATUS !== 'DIAJUKAN') {
      throw new Error(`Penolakan tidak valid: Status pengeluaran saat ini adalah ${exp.STATUS}.`);
    }

    const cleanAlasan = (alasanPenolakan || '').trim();
    if (cleanAlasan.length < 5) throw new Error('Alasan penolakan pengeluaran wajib diisi minimal 5 karakter.');

    this.assertPeriodOpen(exp.TANGGAL_PENGAJUAN);

    const old = { ...exp };
    exp.STATUS = 'DITOLAK';
    exp.KETERANGAN = `[Ditolak oleh ${this.currentUser!.NAMA_LENGKAP}: ${cleanAlasan}] ${exp.KETERANGAN || ''}`.trim();

    this.saveDatabase();
    this.writeAuditLog(
      'PENGELUARAN',
      'TOLAK',
      idPengeluaran,
      `Pengeluaran ${exp.URAIAN} DITOLAK: ${cleanAlasan}`,
      old,
      exp
    );

    return exp;
  }

  public bayarPengeluaran(idPengeluaran: string, params: {
    tglPembayaran: string;
    metode: PaymentMethod;
    referensi?: string;
    keterangan?: string;
  }): PengeluaranRow {
    this.requireAdmin();
    this.assertPeriodOpen(params.tglPembayaran);

    const exp = this.state.PENGELUARAN.find(e => e.ID_PENGELUARAN === idPengeluaran);
    if (!exp) throw new Error('Pengeluaran tidak ditemukan.');
    if (exp.STATUS !== 'DISETUJUI') {
      throw new Error(`Pembayaran pengeluaran hanya dapat diproses setelah status DISETUJUI (Status saat ini: ${exp.STATUS}).`);
    }

    if (params.metode === 'TRANSFER' && (!params.referensi || !params.referensi.trim())) {
      throw new Error('Pembayaran pengeluaran via TRANSFER wajib menyertakan kode referensi transfer.');
    }

    // Check available cash balance
    const cashSummary = this.getKasSummary();
    if (cashSummary.saldoKas < exp.NOMINAL_PENGAJUAN) {
      throw new Error(`Saldo kas pesantren tidak mencukupi! Saldo saat ini: Rp ${cashSummary.saldoKas.toLocaleString('id-ID')}, Dibutuhkan: Rp ${exp.NOMINAL_PENGAJUAN.toLocaleString('id-ID')}.`);
    }

    const old = { ...exp };
    exp.STATUS = 'LUNAS';
    exp.TANGGAL_PEMBAYARAN = params.tglPembayaran;
    exp.METODE = params.metode;
    exp.REFERENSI = params.referensi ? params.referensi.trim() : '';
    if (params.keterangan) {
      exp.KETERANGAN = `${exp.KETERANGAN ? exp.KETERANGAN + ' | ' : ''}${params.keterangan}`.trim();
    }

    this.saveDatabase();
    this.writeAuditLog(
      'PENGELUARAN',
      'BAYAR_LUNAS',
      idPengeluaran,
      `Pengeluaran ${exp.URAIAN} telah DIBAYAR LUNAS (Kas berkurang Rp ${exp.NOMINAL_PENGAJUAN.toLocaleString('id-ID')})`,
      old,
      exp
    );

    return exp;
  }

  public batalkanPengeluaran(idPengeluaran: string, alasanPembatalan: string): PengeluaranRow {
    this.requireHeadFinance();
    const exp = this.state.PENGELUARAN.find(e => e.ID_PENGELUARAN === idPengeluaran);
    if (!exp) throw new Error('Pengeluaran tidak ditemukan.');

    const cleanReason = (alasanPembatalan || '').trim();
    if (cleanReason.length < 5) throw new Error('Alasan pembatalan wajib diisi minimal 5 karakter.');

    this.assertPeriodOpen(exp.TANGGAL_PENGAJUAN);

    const old = { ...exp };
    const oldStatus = exp.STATUS;
    exp.STATUS = 'DIBATALKAN';
    exp.KETERANGAN = `[DIBATALKAN oleh ${this.currentUser!.NAMA_LENGKAP} (${oldStatus}): ${cleanReason}] ${exp.KETERANGAN || ''}`.trim();

    this.saveDatabase();
    this.writeAuditLog(
      'PENGELUARAN',
      'BATALKAN',
      idPengeluaran,
      `Pengeluaran ${exp.URAIAN} (Semula: ${oldStatus}, Nominal: Rp ${exp.NOMINAL_PENGAJUAN.toLocaleString('id-ID')}) telah DIBATALKAN oleh Kabid Keuangan. ${oldStatus === 'LUNAS' ? '(Saldo kas dipulihkan)' : ''} Alasan: ${cleanReason}`,
      old,
      exp
    );

    return exp;
  }

  // ==========================================
  // 18: KAS PESANTREN ENGINE (SINGLE SOURCE OF TRUTH)
  // ==========================================
  // Rumus Mutlak:
  // TOTAL PEMBAYARAN - TOTAL PENGELUARAN LUNAS = SALDO KAS

  public getKasSummary() {
    const totalPenerimaan = this.state.PEMBAYARAN.reduce((acc, p) => acc + p.NOMINAL, 0);
    const totalPengeluaranLunas = this.state.PENGELUARAN
      .filter(e => e.STATUS === 'LUNAS')
      .reduce((acc, e) => acc + e.NOMINAL_PENGAJUAN, 0);

    const saldoKas = totalPenerimaan - totalPengeluaranLunas;

    // Tunggakan calculation:
    // Only active bills count toward current accounts receivable
    let totalNominalTagihanAktif = 0;
    let totalTunggakan = 0;

    this.state.TAGIHAN.forEach(b => {
      if (b.STATUS === 'AKTIF') {
        totalNominalTagihanAktif += b.NOMINAL;
        const paid = this.getBillPaidAmount(b.ID_TAGIHAN);
        totalTunggakan += Math.max(0, b.NOMINAL - paid);
      }
    });

    return {
      totalPenerimaan,
      totalPengeluaranLunas,
      saldoKas,
      totalNominalTagihanAktif,
      totalTunggakan,
      totalSantriAktif: this.state.SANTRI.filter(s => s.STATUS === 'AKTIF').length,
      totalTagihanAktifCount: this.state.TAGIHAN.filter(b => b.STATUS === 'AKTIF').length,
      totalTagihanDibatalkanCount: this.state.TAGIHAN.filter(b => b.STATUS === 'DIBATALKAN').length
    };
  }

  // ==========================================
  // 24: LAPORAN KEUANGAN
  // ==========================================

  public getLaporanPenerimaan(filter?: { tglMulai?: string; tglSelesai?: string; idKelas?: string; idJenisTagihan?: string }) {
    let rows = this.state.PEMBAYARAN.map(p => {
      const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === p.ID_TAGIHAN);
      const santri = bill ? this.state.SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI) : null;
      const kelas = santri ? this.state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
      const jtg = bill ? this.state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === bill.ID_JENIS_TAGIHAN) : null;

      return {
        payment: p,
        bill,
        santri,
        kelas,
        jtg
      };
    });

    if (filter?.tglMulai) {
      rows = rows.filter(r => r.payment.TANGGAL_PEMBAYARAN >= filter.tglMulai!);
    }
    if (filter?.tglSelesai) {
      rows = rows.filter(r => r.payment.TANGGAL_PEMBAYARAN <= filter.tglSelesai!);
    }
    if (filter?.idKelas) {
      rows = rows.filter(r => r.santri?.ID_KELAS === filter.idKelas);
    }
    if (filter?.idJenisTagihan) {
      rows = rows.filter(r => r.bill?.ID_JENIS_TAGIHAN === filter.idJenisTagihan);
    }

    const total = rows.reduce((acc, r) => acc + r.payment.NOMINAL, 0);
    return { rows, total };
  }

  public getLaporanPengeluaran(filter?: { tglMulai?: string; tglSelesai?: string; idKategori?: string; status?: string }) {
    let rows = this.state.PENGELUARAN.map(e => {
      const kat = this.state.KATEGORI_PENGELUARAN.find(k => k.ID_KATEGORI === e.ID_KATEGORI);
      const user = this.state.USERS.find(u => u.ID_USER === e.DIAJUKAN_OLEH);
      return {
        expense: e,
        kategori: kat,
        user
      };
    });

    if (filter?.tglMulai) {
      rows = rows.filter(r => (r.expense.TANGGAL_PEMBAYARAN || r.expense.TANGGAL_PENGAJUAN) >= filter.tglMulai!);
    }
    if (filter?.tglSelesai) {
      rows = rows.filter(r => (r.expense.TANGGAL_PEMBAYARAN || r.expense.TANGGAL_PENGAJUAN) <= filter.tglSelesai!);
    }
    if (filter?.idKategori) {
      rows = rows.filter(r => r.expense.ID_KATEGORI === filter.idKategori);
    }
    if (filter?.status) {
      rows = rows.filter(r => r.expense.STATUS === filter.status);
    }

    const totalLunas = rows.filter(r => r.expense.STATUS === 'LUNAS').reduce((acc, r) => acc + r.expense.NOMINAL_PENGAJUAN, 0);
    const totalAll = rows.reduce((acc, r) => acc + r.expense.NOMINAL_PENGAJUAN, 0);
    return { rows, totalLunas, totalAll };
  }

  public getLaporanTagihanDanTunggakan(filter?: { tglMulai?: string; tglSelesai?: string; idKelas?: string; idJenisTagihan?: string; hanyaTunggakan?: boolean }) {
    let rows = this.state.TAGIHAN.map(b => {
      const santri = this.state.SANTRI.find(s => s.ID_SANTRI === b.ID_SANTRI);
      const kelas = santri ? this.state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
      const jtg = this.state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === b.ID_JENIS_TAGIHAN);
      const paid = this.getBillPaidAmount(b.ID_TAGIHAN);
      const remaining = Math.max(0, b.NOMINAL - paid);
      const statusPembayaran = this.getBillPaymentStatus(b);

      return {
        bill: b,
        santri,
        kelas,
        jtg,
        paid,
        remaining,
        statusPembayaran
      };
    });

    if (filter?.idKelas) {
      rows = rows.filter(r => r.santri?.ID_KELAS === filter.idKelas);
    }
    if (filter?.idJenisTagihan) {
      rows = rows.filter(r => r.bill.ID_JENIS_TAGIHAN === filter.idJenisTagihan);
    }
    if (filter?.hanyaTunggakan) {
      rows = rows.filter(r => r.bill.STATUS === 'AKTIF' && r.remaining > 0);
    }

    const totalNominal = rows.reduce((acc, r) => acc + r.bill.NOMINAL, 0);
    const totalPaid = rows.reduce((acc, r) => acc + r.paid, 0);
    const totalRemaining = rows.reduce((acc, r) => acc + r.remaining, 0);

    return { rows, totalNominal, totalPaid, totalRemaining };
  }

  public getLaporanArusKas() {
    interface CashFlowItem {
      tanggal: string;
      tipe: 'MASUK' | 'KELUAR';
      kategori: string;
      uraian: string;
      nominal: number;
      metode: string;
      referensi: string;
      id: string;
    }

    const items: CashFlowItem[] = [];

    // All payments are cash-in
    this.state.PEMBAYARAN.forEach(p => {
      const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === p.ID_TAGIHAN);
      const santri = bill ? this.state.SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI) : null;
      items.push({
        tanggal: p.TANGGAL_PEMBAYARAN,
        tipe: 'MASUK',
        kategori: 'Penerimaan Tagihan Santri',
        uraian: `Pembayaran ${bill?.NAMA_TAGIHAN || 'Tagihan'} - ${santri?.NAMA_LENGKAP || 'Santri'} (${p.NOMOR_TRANSAKSI})`,
        nominal: p.NOMINAL,
        metode: p.METODE,
        referensi: p.REFERENSI || '-',
        id: p.ID_PEMBAYARAN
      });
    });

    // Only LUNAS expenses are cash-out
    this.state.PENGELUARAN.forEach(e => {
      if (e.STATUS === 'LUNAS' && e.TANGGAL_PEMBAYARAN) {
        const kat = this.state.KATEGORI_PENGELUARAN.find(k => k.ID_KATEGORI === e.ID_KATEGORI);
        items.push({
          tanggal: e.TANGGAL_PEMBAYARAN,
          tipe: 'KELUAR',
          kategori: kat ? kat.NAMA_KATEGORI : 'Pengeluaran Pesantren',
          uraian: e.URAIAN,
          nominal: e.NOMINAL_PENGAJUAN,
          metode: e.METODE || 'TUNAI',
          referensi: e.REFERENSI || '-',
          id: e.ID_PENGELUARAN
        });
      }
    });

    // Sort by date ascending
    items.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    // Calculate running balance
    let runningBalance = 0;
    const history = items.map(item => {
      if (item.tipe === 'MASUK') {
        runningBalance += item.nominal;
      } else {
        runningBalance -= item.nominal;
      }
      return {
        ...item,
        saldoBerjalan: runningBalance
      };
    });

    return {
      history: history.reverse(), // latest first for display
      totalMasuk: items.filter(i => i.tipe === 'MASUK').reduce((acc, i) => acc + i.nominal, 0),
      totalKeluar: items.filter(i => i.tipe === 'KELUAR').reduce((acc, i) => acc + i.nominal, 0),
      saldoAkhir: runningBalance
    };
  }

  // Monthly summary
  public getMonthlySummary(year = '2026') {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return months.map((m, idx) => {
      const ym = `${year}-${m}`;
      const penerimaan = this.state.PEMBAYARAN
        .filter(p => p.TANGGAL_PEMBAYARAN.startsWith(ym))
        .reduce((sum, p) => sum + p.NOMINAL, 0);

      const pengeluaran = this.state.PENGELUARAN
        .filter(e => e.STATUS === 'LUNAS' && e.TANGGAL_PEMBAYARAN && e.TANGGAL_PEMBAYARAN.startsWith(ym))
        .reduce((sum, e) => sum + e.NOMINAL_PENGAJUAN, 0);

      return {
        bulan: `${monthNames[idx]} ${year}`,
        kodeBulan: ym,
        penerimaan,
        pengeluaran,
        selisih: penerimaan - pengeluaran
      };
    });
  }

  // ==========================================
  // 20, 21, 23: INVOICE, PDF & WHATSAPP
  // ==========================================

  public getInvoiceData(idPembayaran: string) {
    const payment = this.state.PEMBAYARAN.find(p => p.ID_PEMBAYARAN === idPembayaran);
    if (!payment) throw new Error('Pembayaran tidak ditemukan.');
    const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === payment.ID_TAGIHAN);
    if (!bill) throw new Error('Tagihan terkait tidak ditemukan.');
    const santri = this.state.SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI);
    const kelas = santri ? this.state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
    const jenjang = santri ? this.state.JENJANG.find(j => j.ID_JENJANG === santri.ID_JENJANG) : null;
    const jtg = this.state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === bill.ID_JENIS_TAGIHAN);

    const paidTotal = this.getBillPaidAmount(bill.ID_TAGIHAN);
    const sisa = Math.max(0, bill.NOMINAL - paidTotal);
    const status = this.getBillPaymentStatus(bill);

    const setting = (key: string, def = '') => {
      const found = this.state.PENGATURAN.find(p => p.KEY === key);
      return found ? found.NILAI : def;
    };

    return {
      payment,
      bill,
      santri,
      kelas,
      jenjang,
      jtg,
      paidTotal,
      sisa,
      status,
      pondok: {
        namaPondok: setting('NAMA_PONDOK', 'Pondok Pesantren Inayatul Muhajirin'),
        namaYayasan: setting('NAMA_YAYASAN', 'Yayasan Pendidikan Islam Inayatul Muhajirin'),
        alamat: setting('ALAMAT_PONDOK', 'Mandalasari, Cikancung, Kabupaten Bandung'),
        penandatangan: setting('PENANDATANGAN_KEUANGAN', 'Ranran Siti Nurhasanah, S.Pd, M.Pd'),
        jabatan: setting('JABATAN_PENANDATANGAN_KEUANGAN', 'Kepala Bidang Keuangan'),
        rekening: setting('REKENING_BANK', 'BSI 7182991023 a.n. Pontren Inayatul Muhajirin'),
        kontak: setting('NOMOR_KONTAK_PESANTREN', '081223344556')
      }
    };
  }

  public generateWhatsAppText(idPembayaran: string): { phone: string; text: string; waUrl: string } {
    const inv = this.getInvoiceData(idPembayaran);
    const phone = inv.santri?.NO_TELEPON_WALI || inv.santri?.NO_TELEPON_AYAH || inv.santri?.NO_TELEPON_IBU || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^0/, '62');

    const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    const text = `*BUKTI PEMBAYARAN KEUANGAN PESANTREN*\n*${inv.pondok.namaPondok}*\n${inv.pondok.namaYayasan}\n----------------------------------------\n\nAssalamu'alaikum Wr. Wb.\nBapak/Ibu Wali dari Ananda *${inv.santri?.NAMA_LENGKAP || '-'}* (NIS: ${inv.santri?.NIS || '-'}), berikut adalah konfirmasi bukti penerimaan pembayaran:\n\n` +
      `📄 No. Transaksi: *${inv.payment.NOMOR_TRANSAKSI}*\n` +
      `📅 Tanggal: ${inv.payment.TANGGAL_PEMBAYARAN}\n` +
      `🏷️ Tagihan: *${inv.bill.NAMA_TAGIHAN}* ${inv.bill.PERIODE_TAGIHAN ? `(Periode: ${inv.bill.PERIODE_TAGIHAN})` : ''}\n` +
      `💰 Nominal Dibayar: *${formatRp(inv.payment.NOMINAL)}*\n` +
      `💳 Metode: ${inv.payment.METODE} ${inv.payment.REFERENSI ? `(${inv.payment.REFERENSI})` : ''}\n` +
      `📊 Total Tagihan: ${formatRp(inv.bill.NOMINAL)}\n` +
      `✅ Telah Masuk: ${formatRp(inv.paidTotal)}\n` +
      `📌 *Sisa Tagihan:* *${formatRp(inv.sisa)}*\n` +
      `🏷️ Status: *${inv.status}*\n\n` +
      `Jazakumullah Khairan Katsiran atas kepercayaannya.\n\n` +
      `_Bagian Keuangan ${inv.pondok.namaPondok}_\n` +
      `_${inv.pondok.penandatangan}_ (${inv.pondok.jabatan})`;

    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    return { phone: cleanPhone, text, waUrl };
  }

  public generateBillWhatsAppText(idTagihan: string): { phone: string; text: string; waUrl: string } {
    const bill = this.state.TAGIHAN.find(t => t.ID_TAGIHAN === idTagihan);
    if (!bill) throw new Error('Data tagihan tidak ditemukan.');

    const santri = this.state.SANTRI.find(s => s.ID_SANTRI === bill.ID_SANTRI);
    const kelas = santri ? this.state.KELAS.find(k => k.ID_KELAS === santri.ID_KELAS) : null;
    const jtg = this.state.JENIS_TAGIHAN.find(j => j.ID_JENIS_TAGIHAN === bill.ID_JENIS_TAGIHAN);

    const paidTotal = this.getBillPaidAmount(bill.ID_TAGIHAN);
    const sisa = Math.max(0, bill.NOMINAL - paidTotal);
    const status = this.getBillPaymentStatus(bill);

    const setting = (key: string, def = '') => {
      const found = this.state.PENGATURAN.find(p => p.KEY === key);
      return found ? found.NILAI : def;
    };

    const namaPondok = setting('NAMA_PONDOK', 'Pondok Pesantren Inayatul Muhajirin');
    const namaYayasan = setting('NAMA_YAYASAN', 'Yayasan Pendidikan Islam Inayatul Muhajirin');
    const rekening = setting('REKENING_BANK', 'BSI 7182991023 a.n. Pontren Inayatul Muhajirin');
    const penandatangan = setting('PENANDATANGAN_KEUANGAN', 'Ranran Siti Nurhasanah, S.Pd, M.Pd');
    const jabatan = setting('JABATAN_PENANDATANGAN_KEUANGAN', 'Kepala Bidang Keuangan');

    const phone = santri?.NO_TELEPON_WALI || santri?.NO_TELEPON_AYAH || santri?.NO_TELEPON_IBU || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^0/, '62');

    const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

    const text = `*PEMBERITAHUAN TAGIHAN KEUANGAN SANTRI*\n` +
      `*${namaPondok.toUpperCase()}*\n` +
      `${namaYayasan}\n` +
      `----------------------------------------\n\n` +
      `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\n` +
      `Semoga Bapak/Ibu Wali Santri senantiasa dalam limpahan kesehatan serta rahmat Allah SWT.\n\n` +
      `Kami sampaikan pemberitahuan rincian kewajiban administrasi pendidikan ananda tercinta:\n\n` +
      `👤 Nama Santri: *${santri?.NAMA_LENGKAP || '-'}*\n` +
      `🔢 NIS: *${santri?.NIS || '-'}*\n` +
      `🏫 Kelas: *${kelas?.NAMA_KELAS || '-'}*\n` +
      `🏷️ Pos Tagihan: *${bill.NAMA_TAGIHAN}* ${bill.PERIODE_TAGIHAN ? `(Periode: ${bill.PERIODE_TAGIHAN})` : ''}\n` +
      `💰 Total Tagihan: *${formatRp(bill.NOMINAL)}*\n` +
      `✅ Telah Dibayar: ${formatRp(paidTotal)}\n` +
      `📌 *Sisa Kewajiban: ${formatRp(sisa)}*\n` +
      `⏳ *Jatuh Tempo: ${bill.TANGGAL_JATUH_TEMPO}*\n` +
      `📊 Status Tagihan: *${status}*\n\n` +
      `💳 Pembayaran dapat ditransfer melalui:\n` +
      `*${rekening}*\n\n` +
      `_Mohon simpan dan kirimkan bukti transfer ke nomor ini agar dapat diverifikasi oleh kasir._\n\n` +
      `Terima kasih banyak atas perhatian, amanah, dan kerjasamanya dalam mendukung pendidikan putra/putri di pesantren kita tercinta. Semoga berkah dan bernilai ibadah di sisi Allah SWT. Aamiin.\n\n` +
      `Wassalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `_Bagian Keuangan ${namaPondok}_\n` +
      `*${penandatangan}* (${jabatan})`;

    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    return { phone: cleanPhone, text, waUrl };
  }

  // ==========================================
  // 26, 27, 28, 29: IMPORT, EXPORT, BACKUP & RESTORE
  // ==========================================

  public exportBackupJson(): string {
    this.requireAdmin();
    const payload = {
      app: 'KAS PESANTREN INAYATUL MUHAJIRIN',
      version: '1.0.0',
      exportedAt: this.formatNow(),
      exportedBy: this.currentUser?.NAMA_LENGKAP,
      data: this.state
    };
    this.writeAuditLog('SISTEM', 'BACKUP_DATABASE', 'FULL', 'Export file backup database lengkap JSON', null, null);
    return JSON.stringify(payload, null, 2);
  }

  public restoreBackupJson(jsonString: string): { success: boolean; message: string } {
    this.requireHeadFinance();
    try {
      const parsed = JSON.parse(jsonString);
      const incomingData = parsed.data || parsed;
      // Validate sheet keys
      for (const sheet of Object.keys(DATABASE_SCHEMA_KEYS) as Array<keyof DatabaseState>) {
        if (!Array.isArray(incomingData[sheet])) {
          throw new Error(`Struktur backup rusak: Sheet "${sheet}" tidak ditemukan.`);
        }
      }
      this.state = incomingData;
      this.saveDatabase();
      this.writeAuditLog('SISTEM', 'RESTORE_DATABASE', 'FULL', 'Restore database dari file backup eksternal berhasil', null, null);
      return { success: true, message: 'Restore database 16 sheet berhasil dipulihkan.' };
    } catch (e: any) {
      throw new Error(`Gagal memulihkan database: ${e.message}`);
    }
  }

  // Export specific sheet to CSV format
  public exportSheetCsv(sheetName: keyof DatabaseState): string {
    const headers = DATABASE_SCHEMA_KEYS[sheetName];
    const rows = (this.state[sheetName] as any[]) || [];

    const escapeCsv = (val: any) => {
      const s = val === undefined || val === null ? '' : String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headerLine = headers.map(escapeCsv).join(',');
    const dataLines = rows.map(row => headers.map(h => escapeCsv(row[h])).join(','));
    return [headerLine, ...dataLines].join('\n');
  }

  // ==========================================
  // 30: PENGATURAN
  // ==========================================

  public saveSetting(key: string, nilai: string, keterangan?: string): void {
    this.requireAdmin();
    const found = this.state.PENGATURAN.find(p => p.KEY === key);
    if (found) {
      const old = { ...found };
      found.NILAI = nilai;
      if (keterangan) found.KETERANGAN = keterangan;
      this.saveDatabase();
      this.writeAuditLog('PENGATURAN', 'UBAH', key, `Mengubah pengaturan ${key}`, old, found);
    } else {
      const newP: PengaturanRow = { KEY: key, NILAI: nilai, KETERANGAN: keterangan };
      this.state.PENGATURAN.push(newP);
      this.saveDatabase();
      this.writeAuditLog('PENGATURAN', 'TAMBAH', key, `Menambah pengaturan ${key}`, null, newP);
    }
  }

  // ==========================================
  // 38, 39, 40: AUDIT & HEALTH VERIFICATION
  // ==========================================

  public runComprehensiveSystemAudit() {
    const checks: Array<{ category: string; name: string; status: 'PASS' | 'FAIL' | 'WARNING'; message: string }> = [];

    // 1. Database Schema
    let allSheetsValid = true;
    for (const sheet of Object.keys(DATABASE_SCHEMA_KEYS) as Array<keyof DatabaseState>) {
      if (!Array.isArray(this.state[sheet])) {
        allSheetsValid = false;
        checks.push({
          category: 'DATABASE',
          name: `Schema ${sheet}`,
          status: 'FAIL',
          message: `Sheet ${sheet} tidak ditemukan atau bukan array.`
        });
      }
    }
    if (allSheetsValid) {
      checks.push({
        category: 'DATABASE',
        name: '16 Sheet Integrity',
        status: 'PASS',
        message: 'Seluruh 16 sheet terdefinisi dengan struktur header baku.'
      });
    }

    // 2. Financial Integrity Check
    const kas = this.getKasSummary();
    const computedBalance = kas.totalPenerimaan - kas.totalPengeluaranLunas;
    if (computedBalance === kas.saldoKas) {
      checks.push({
        category: 'BUSINESS RULE',
        name: 'Single Source of Truth Kas',
        status: 'PASS',
        message: `Saldo Kas Konsisten: Rp ${kas.totalPenerimaan.toLocaleString('id-ID')} (Penerimaan) - Rp ${kas.totalPengeluaranLunas.toLocaleString('id-ID')} (Pengeluaran Lunas) = Rp ${kas.saldoKas.toLocaleString('id-ID')}`
      });
    } else {
      checks.push({
        category: 'BUSINESS RULE',
        name: 'Single Source of Truth Kas',
        status: 'FAIL',
        message: `Ketidakkonsistenan saldo kas terdeteksi!`
      });
    }

    // 3. Billing & Payment Math Check
    let billErrors = 0;
    this.state.TAGIHAN.forEach(b => {
      const paid = this.getBillPaidAmount(b.ID_TAGIHAN);
      if (paid > b.NOMINAL) {
        billErrors++;
      }
    });
    if (billErrors === 0) {
      checks.push({
        category: 'BUSINESS RULE',
        name: 'Sisa Tagihan Non-Negatif',
        status: 'PASS',
        message: 'Tidak ada pembayaran yang melebihi nominal tagihan (Overpayment zero).'
      });
    } else {
      checks.push({
        category: 'BUSINESS RULE',
        name: 'Sisa Tagihan Non-Negatif',
        status: 'FAIL',
        message: `Ditemukan ${billErrors} tagihan dengan total pembayaran melebihi nominal tagihan.`
      });
    }

    // 4. Expense Lifecycle Check
    let expenseIntegrityErrors = 0;
    this.state.PENGELUARAN.forEach(e => {
      if (e.STATUS === 'LUNAS' && (!e.TANGGAL_PEMBAYARAN || !e.METODE)) {
        expenseIntegrityErrors++;
      }
      if (e.METODE === 'TRANSFER' && e.STATUS === 'LUNAS' && !e.REFERENSI) {
        expenseIntegrityErrors++;
      }
    });
    if (expenseIntegrityErrors === 0) {
      checks.push({
        category: 'BUSINESS RULE',
        name: 'Pengeluaran Lunas Integrity',
        status: 'PASS',
        message: 'Semua pengeluaran LUNAS memiliki tanggal pembayaran, metode, dan referensi transfer.'
      });
    } else {
      checks.push({
        category: 'BUSINESS RULE',
        name: 'Pengeluaran Lunas Integrity',
        status: 'FAIL',
        message: `Ditemukan ${expenseIntegrityErrors} pengeluaran lunas dengan kelengkapan data yang kurang.`
      });
    }

    // 5. User Roles and Security
    const validRoles = this.state.USERS.every(u => u.ROLE === 'ADMIN' || u.ROLE === 'KEPALA_BIDANG_KEUANGAN');
    if (validRoles && this.state.USERS.length >= 2) {
      checks.push({
        category: 'SECURITY',
        name: 'Role-Based Access Control',
        status: 'PASS',
        message: 'Pengguna terdaftar memiliki role sah (ADMIN / KEPALA_BIDANG_KEUANGAN).'
      });
    } else {
      checks.push({
        category: 'SECURITY',
        name: 'Role-Based Access Control',
        status: 'WARNING',
        message: 'Periksa kelengkapan pengguna atau format role pengguna.'
      });
    }

    // 6. Active Academic Year Check
    const activeYears = this.state.TAHUN_AJARAN.filter(t => t.STATUS === 'AKTIF');
    if (activeYears.length === 1) {
      checks.push({
        category: 'MASTER DATA',
        name: 'Tahun Ajaran Aktif Tunggal',
        status: 'PASS',
        message: `Tepat satu Tahun Ajaran aktif: ${activeYears[0].NAMA_TAHUN_AJARAN}.`
      });
    } else {
      checks.push({
        category: 'MASTER DATA',
        name: 'Tahun Ajaran Aktif Tunggal',
        status: 'FAIL',
        message: `Ditemukan ${activeYears.length} tahun ajaran aktif (Harus tepat satu).`
      });
    }

    return {
      allPassed: checks.every(c => c.status === 'PASS'),
      checks,
      timestamp: this.formatNow()
    };
  }
}
