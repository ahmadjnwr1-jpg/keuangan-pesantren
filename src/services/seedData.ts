import { DatabaseState } from '../types/database';

export const INITIAL_DATABASE: DatabaseState = {
  USERS: [
    {
      ID_USER: 'U001',
      NAMA_LENGKAP: 'Ranran Siti Nurhasanah, S.Pd, M.Pd',
      USERNAME: 'ranran',
      PASSWORD_HASH: '12000$salt$RanranKabid2026!',
      ROLE: 'KEPALA_BIDANG_KEUANGAN',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-26 21:00:00',
      CREATED_AT: '2026-01-01 08:00:00',
      UPDATED_AT: '2026-09-26 21:00:00'
    },
    {
      ID_USER: 'U002',
      NAMA_LENGKAP: 'Astri Sriwulandari',
      USERNAME: 'astri',
      PASSWORD_HASH: '12000$salt$AstriAdmin2026!',
      ROLE: 'ADMIN',
      STATUS: 'AKTIF',
      LAST_LOGIN: '2026-09-26 21:30:00',
      CREATED_AT: '2026-01-01 08:00:00',
      UPDATED_AT: '2026-09-26 21:30:00'
    }
  ],

  TAHUN_AJARAN: [
    {
      ID_TAHUN_AJARAN: 'TA-2026',
      NAMA_TAHUN_AJARAN: '2026/2027',
      TANGGAL_MULAI: '2026-07-15',
      TANGGAL_SELESAI: '2027-06-25',
      STATUS: 'AKTIF',
      KETERANGAN: 'Tahun Ajaran Aktif Berjalan',
      CREATED_AT: '2026-06-01 09:00:00',
      UPDATED_AT: '2026-06-01 09:00:00'
    },
    {
      ID_TAHUN_AJARAN: 'TA-2025',
      NAMA_TAHUN_AJARAN: '2025/2026',
      TANGGAL_MULAI: '2025-07-15',
      TANGGAL_SELESAI: '2026-06-25',
      STATUS: 'NONAKTIF',
      KETERANGAN: 'Tahun Ajaran Lalu',
      CREATED_AT: '2025-06-01 09:00:00',
      UPDATED_AT: '2026-07-01 10:00:00'
    }
  ],

  JENJANG: [
    {
      ID_JENJANG: 'JEN-01',
      KODE_JENJANG: 'MTS',
      NAMA_JENJANG: 'Madrasah Tsanawiyah (MTs)',
      STATUS: 'AKTIF'
    },
    {
      ID_JENJANG: 'JEN-02',
      KODE_JENJANG: 'MA',
      NAMA_JENJANG: 'Madrasah Aliyah (MA)',
      STATUS: 'AKTIF'
    }
  ],

  KELAS: [
    {
      ID_KELAS: 'KLS-MTS-7A',
      ID_JENJANG: 'JEN-01',
      KODE_KELAS: 'MTS07A',
      NAMA_KELAS: 'Kelas 7A MTs Putra',
      STATUS: 'AKTIF'
    },
    {
      ID_KELAS: 'KLS-MTS-7B',
      ID_JENJANG: 'JEN-01',
      KODE_KELAS: 'MTS07B',
      NAMA_KELAS: 'Kelas 7B MTs Putri',
      STATUS: 'AKTIF'
    },
    {
      ID_KELAS: 'KLS-MTS-8A',
      ID_JENJANG: 'JEN-01',
      KODE_KELAS: 'MTS08A',
      NAMA_KELAS: 'Kelas 8A MTs Putra',
      STATUS: 'AKTIF'
    },
    {
      ID_KELAS: 'KLS-MTS-9A',
      ID_JENJANG: 'JEN-01',
      KODE_KELAS: 'MTS09A',
      NAMA_KELAS: 'Kelas 9A MTs Putra',
      STATUS: 'AKTIF'
    },
    {
      ID_KELAS: 'KLS-MA-10A',
      ID_JENJANG: 'JEN-02',
      KODE_KELAS: 'MA10A',
      NAMA_KELAS: 'Kelas 10A MA Keagamaan',
      STATUS: 'AKTIF'
    },
    {
      ID_KELAS: 'KLS-MA-11A',
      ID_JENJANG: 'JEN-02',
      KODE_KELAS: 'MA11A',
      NAMA_KELAS: 'Kelas 11A MA Keagamaan',
      STATUS: 'AKTIF'
    }
  ],

  JENIS_TAGIHAN: [
    {
      ID_JENIS_TAGIHAN: 'JTG-SPP',
      KODE_TAGIHAN: 'SPP',
      NAMA_TAGIHAN: 'SPP Bulanan Pesantren',
      SIFAT: 'BERULANG',
      STATUS: 'AKTIF'
    },
    {
      ID_JENIS_TAGIHAN: 'JTG-MAKAN',
      KODE_TAGIHAN: 'MAKAN',
      NAMA_TAGIHAN: 'Uang Makan & Konsumsi',
      SIFAT: 'BERULANG',
      STATUS: 'AKTIF'
    },
    {
      ID_JENIS_TAGIHAN: 'JTG-DU',
      KODE_TAGIHAN: 'DU',
      NAMA_TAGIHAN: 'Daftar Ulang & Pembangunan',
      SIFAT: 'SEKALI_BAYAR',
      STATUS: 'AKTIF'
    },
    {
      ID_JENIS_TAGIHAN: 'JTG-KITAB',
      KODE_TAGIHAN: 'KTB',
      NAMA_TAGIHAN: 'Kitab & Pengajian Santri',
      SIFAT: 'SEKALI_BAYAR',
      STATUS: 'AKTIF'
    }
  ],

  TARIF_TAGIHAN: [
    {
      ID_TARIF: 'TRF-001',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7A',
      ID_JENIS_TAGIHAN: 'JTG-SPP',
      NOMINAL: 350000,
      STATUS: 'AKTIF'
    },
    {
      ID_TARIF: 'TRF-002',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7A',
      ID_JENIS_TAGIHAN: 'JTG-MAKAN',
      NOMINAL: 450000,
      STATUS: 'AKTIF'
    },
    {
      ID_TARIF: 'TRF-003',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7A',
      ID_JENIS_TAGIHAN: 'JTG-DU',
      NOMINAL: 1500000,
      STATUS: 'AKTIF'
    },
    {
      ID_TARIF: 'TRF-004',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7B',
      ID_JENIS_TAGIHAN: 'JTG-SPP',
      NOMINAL: 350000,
      STATUS: 'AKTIF'
    },
    {
      ID_TARIF: 'TRF-005',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7B',
      ID_JENIS_TAGIHAN: 'JTG-MAKAN',
      NOMINAL: 450000,
      STATUS: 'AKTIF'
    },
    {
      ID_TARIF: 'TRF-006',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-02',
      ID_KELAS: 'KLS-MA-10A',
      ID_JENIS_TAGIHAN: 'JTG-SPP',
      NOMINAL: 400000,
      STATUS: 'AKTIF'
    },
    {
      ID_TARIF: 'TRF-007',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-02',
      ID_KELAS: 'KLS-MA-10A',
      ID_JENIS_TAGIHAN: 'JTG-MAKAN',
      NOMINAL: 450000,
      STATUS: 'AKTIF'
    },
    {
      ID_TARIF: 'TRF-008',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-02',
      ID_KELAS: 'KLS-MA-10A',
      ID_JENIS_TAGIHAN: 'JTG-DU',
      NOMINAL: 1800000,
      STATUS: 'AKTIF'
    }
  ],

  SANTRI: [
    {
      ID_SANTRI: 'SAN-20260901-000001',
      NIS: '202607001',
      NAMA_LENGKAP: 'Muhammad Fadhil Al-Hafidz',
      NISN: '0098765431',
      NIK: '3204123456780001',
      TEMPAT_LAHIR: 'Bandung',
      TANGGAL_LAHIR: '2013-05-12',
      JENIS_KELAMIN: 'L',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7A',
      STATUS: 'AKTIF',
      ALAMAT: 'Kp. Pasir Salam RT 02/05 Mandalasari, Cikancung, Bandung',
      NO_TELEPON_AYAH: '081234567891',
      NO_TELEPON_IBU: '081234567892',
      NO_TELEPON_WALI: '081234567891',
      NAMA_AYAH_KANDUNG: 'H. Ahmad Supriyadi',
      NAMA_IBU_KANDUNG: 'Hj. Siti Maryam',
      NAMA_WALI: 'H. Ahmad Supriyadi',
      KEBUTUHAN_KHUSUS: 'Tidak Ada',
      DISABILITAS: 'Tidak Ada',
      NOMOR_KIP_PIP: '',
      TANGGAL_MASUK: '2026-07-15',
      TANGGAL_KELUAR: '',
      KETERANGAN: 'Santri Mukim Tahfidz',
      CREATED_AT: '2026-07-15 08:30:00',
      UPDATED_AT: '2026-07-15 08:30:00'
    },
    {
      ID_SANTRI: 'SAN-20260901-000002',
      NIS: '202607002',
      NAMA_LENGKAP: 'Ahmad Raihan Muzakki',
      NISN: '0098765432',
      NIK: '3204123456780002',
      TEMPAT_LAHIR: 'Garut',
      TANGGAL_LAHIR: '2013-08-20',
      JENIS_KELAMIN: 'L',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7A',
      STATUS: 'AKTIF',
      ALAMAT: 'Jl. Raya Limbangan No. 45, Garut',
      NO_TELEPON_AYAH: '082198765431',
      NO_TELEPON_IBU: '082198765432',
      NO_TELEPON_WALI: '082198765431',
      NAMA_AYAH_KANDUNG: 'Dedi Kurniawan',
      NAMA_IBU_KANDUNG: 'Eni Rohaeni',
      NAMA_WALI: 'Dedi Kurniawan',
      KEBUTUHAN_KHUSUS: 'Tidak Ada',
      DISABILITAS: 'Tidak Ada',
      NOMOR_KIP_PIP: 'PIP-2026-9921',
      TANGGAL_MASUK: '2026-07-15',
      TANGGAL_KELUAR: '',
      KETERANGAN: 'Santri Penerima Bantuan PIP',
      CREATED_AT: '2026-07-15 09:00:00',
      UPDATED_AT: '2026-07-15 09:00:00'
    },
    {
      ID_SANTRI: 'SAN-20260901-000003',
      NIS: '202607003',
      NAMA_LENGKAP: 'Aisyah Nurul Jannah',
      NISN: '0098765433',
      NIK: '3204123456780003',
      TEMPAT_LAHIR: 'Sumedang',
      TANGGAL_LAHIR: '2013-03-14',
      JENIS_KELAMIN: 'P',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7B',
      STATUS: 'AKTIF',
      ALAMAT: 'Dsn. Tanjung Sari RT 01/03, Sumedang',
      NO_TELEPON_AYAH: '085211223344',
      NO_TELEPON_IBU: '085211223345',
      NO_TELEPON_WALI: '085211223345',
      NAMA_AYAH_KANDUNG: 'Iwan Setiawan',
      NAMA_IBU_KANDUNG: 'Ratna Sari',
      NAMA_WALI: 'Ratna Sari',
      KEBUTUHAN_KHUSUS: 'Tidak Ada',
      DISABILITAS: 'Tidak Ada',
      NOMOR_KIP_PIP: '',
      TANGGAL_MASUK: '2026-07-15',
      TANGGAL_KELUAR: '',
      KETERANGAN: 'Santriwati Mukim',
      CREATED_AT: '2026-07-15 09:30:00',
      UPDATED_AT: '2026-07-15 09:30:00'
    },
    {
      ID_SANTRI: 'SAN-20260901-000004',
      NIS: '202607004',
      NAMA_LENGKAP: 'Zulfikar Ali Ridho',
      NISN: '0087654321',
      NIK: '3204123456780004',
      TEMPAT_LAHIR: 'Tasikmalaya',
      TANGGAL_LAHIR: '2010-11-05',
      JENIS_KELAMIN: 'L',
      ID_JENJANG: 'JEN-02',
      ID_KELAS: 'KLS-MA-10A',
      STATUS: 'AKTIF',
      ALAMAT: 'Jl. KH. Zaenal Mustofa No. 88, Tasikmalaya',
      NO_TELEPON_AYAH: '087788990011',
      NO_TELEPON_IBU: '087788990012',
      NO_TELEPON_WALI: '087788990011',
      NAMA_AYAH_KANDUNG: 'H. Mahfudz Siddiq',
      NAMA_IBU_KANDUNG: 'Hj. Halimah',
      NAMA_WALI: 'H. Mahfudz Siddiq',
      KEBUTUHAN_KHUSUS: 'Tidak Ada',
      DISABILITAS: 'Tidak Ada',
      NOMOR_KIP_PIP: '',
      TANGGAL_MASUK: '2026-07-15',
      TANGGAL_KELUAR: '',
      KETERANGAN: 'Santri MA Aliyah',
      CREATED_AT: '2026-07-15 10:00:00',
      UPDATED_AT: '2026-07-15 10:00:00'
    }
  ],

  RIWAYAT_KELAS: [
    {
      ID_RIWAYAT: 'RKL-20260715-000001',
      ID_SANTRI: 'SAN-20260901-000001',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7A'
    },
    {
      ID_RIWAYAT: 'RKL-20260715-000002',
      ID_SANTRI: 'SAN-20260901-000002',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7A'
    },
    {
      ID_RIWAYAT: 'RKL-20260715-000003',
      ID_SANTRI: 'SAN-20260901-000003',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-01',
      ID_KELAS: 'KLS-MTS-7B'
    },
    {
      ID_RIWAYAT: 'RKL-20260715-000004',
      ID_SANTRI: 'SAN-20260901-000004',
      ID_TAHUN_AJARAN: 'TA-2026',
      ID_JENJANG: 'JEN-02',
      ID_KELAS: 'KLS-MA-10A'
    }
  ],

  TAGIHAN: [
    {
      ID_TAGIHAN: 'TAG-20260901-000001',
      ID_SANTRI: 'SAN-20260901-000001',
      ID_JENIS_TAGIHAN: 'JTG-SPP',
      NAMA_TAGIHAN: 'SPP Bulanan Pesantren',
      ID_TAHUN_AJARAN: 'TA-2026',
      PERIODE_TAGIHAN: '2026-09',
      TANGGAL_TERBIT: '2026-09-01',
      TANGGAL_JATUH_TEMPO: '2026-09-10',
      NOMINAL: 350000,
      STATUS: 'AKTIF',
      KETERANGAN: 'SPP September 2026'
    },
    {
      ID_TAGIHAN: 'TAG-20260901-000002',
      ID_SANTRI: 'SAN-20260901-000001',
      ID_JENIS_TAGIHAN: 'JTG-MAKAN',
      NAMA_TAGIHAN: 'Uang Makan & Konsumsi',
      ID_TAHUN_AJARAN: 'TA-2026',
      PERIODE_TAGIHAN: '2026-09',
      TANGGAL_TERBIT: '2026-09-01',
      TANGGAL_JATUH_TEMPO: '2026-09-10',
      NOMINAL: 450000,
      STATUS: 'AKTIF',
      KETERANGAN: 'Makan September 2026'
    },
    {
      ID_TAGIHAN: 'TAG-20260901-000003',
      ID_SANTRI: 'SAN-20260901-000002',
      ID_JENIS_TAGIHAN: 'JTG-SPP',
      NAMA_TAGIHAN: 'SPP Bulanan Pesantren',
      ID_TAHUN_AJARAN: 'TA-2026',
      PERIODE_TAGIHAN: '2026-09',
      TANGGAL_TERBIT: '2026-09-01',
      TANGGAL_JATUH_TEMPO: '2026-09-10',
      NOMINAL: 350000,
      STATUS: 'AKTIF',
      KETERANGAN: 'SPP September 2026'
    },
    {
      ID_TAGIHAN: 'TAG-20260901-000004',
      ID_SANTRI: 'SAN-20260901-000003',
      ID_JENIS_TAGIHAN: 'JTG-SPP',
      NAMA_TAGIHAN: 'SPP Bulanan Pesantren',
      ID_TAHUN_AJARAN: 'TA-2026',
      PERIODE_TAGIHAN: '2026-09',
      TANGGAL_TERBIT: '2026-09-01',
      TANGGAL_JATUH_TEMPO: '2026-09-10',
      NOMINAL: 350000,
      STATUS: 'AKTIF',
      KETERANGAN: 'SPP September 2026'
    },
    {
      ID_TAGIHAN: 'TAG-20260901-000005',
      ID_SANTRI: 'SAN-20260901-000004',
      ID_JENIS_TAGIHAN: 'JTG-DU',
      NAMA_TAGIHAN: 'Daftar Ulang & Pembangunan',
      ID_TAHUN_AJARAN: 'TA-2026',
      PERIODE_TAGIHAN: '',
      TANGGAL_TERBIT: '2026-07-20',
      TANGGAL_JATUH_TEMPO: '2026-09-30',
      NOMINAL: 1800000,
      STATUS: 'AKTIF',
      KETERANGAN: 'Daftar Ulang Santri Baru MA'
    }
  ],

  PEMBAYARAN: [
    {
      ID_PEMBAYARAN: 'PAY-20260905-000001',
      NOMOR_TRANSAKSI: 'TRX-SPP-MTS07A-202607001-2026-0001',
      ID_TAGIHAN: 'TAG-20260901-000001',
      TANGGAL_PEMBAYARAN: '2026-09-05',
      NOMINAL: 350000,
      METODE: 'TRANSFER',
      REFERENSI: 'BSI-TRF-99210041',
      KETERANGAN: 'Lunas SPP September Muhammad Fadhil'
    },
    {
      ID_PEMBAYARAN: 'PAY-20260905-000002',
      NOMOR_TRANSAKSI: 'TRX-MAKAN-MTS07A-202607001-2026-0001',
      ID_TAGIHAN: 'TAG-20260901-000002',
      TANGGAL_PEMBAYARAN: '2026-09-05',
      NOMINAL: 450000,
      METODE: 'TRANSFER',
      REFERENSI: 'BSI-TRF-99210042',
      KETERANGAN: 'Lunas Uang Makan September Muhammad Fadhil'
    },
    {
      ID_PEMBAYARAN: 'PAY-20260908-000003',
      NOMOR_TRANSAKSI: 'TRX-SPP-MTS07A-202607002-2026-0001',
      ID_TAGIHAN: 'TAG-20260901-000003',
      TANGGAL_PEMBAYARAN: '2026-09-08',
      NOMINAL: 200000,
      METODE: 'TUNAI',
      REFERENSI: 'KWT-TUNAI-081',
      KETERANGAN: 'Cicilan 1 SPP September Ahmad Raihan'
    },
    {
      ID_PEMBAYARAN: 'PAY-20260910-000004',
      NOMOR_TRANSAKSI: 'TRX-DU-MA10A-202607004-2026-0001',
      ID_TAGIHAN: 'TAG-20260901-000005',
      TANGGAL_PEMBAYARAN: '2026-09-10',
      NOMINAL: 1000000,
      METODE: 'TRANSFER',
      REFERENSI: 'MANDIRI-883199',
      KETERANGAN: 'Cicilan 1 Daftar Ulang Zulfikar Ali'
    }
  ],

  KATEGORI_PENGELUARAN: [
    {
      ID_KATEGORI: 'KAT-OPS',
      KODE_KATEGORI: 'OPERASIONAL',
      NAMA_KATEGORI: 'Biaya Operasional & Sarana',
      STATUS: 'AKTIF'
    },
    {
      ID_KATEGORI: 'KAT-GURU',
      KODE_KATEGORI: 'ASATIDZ',
      NAMA_KATEGORI: 'Honorarium & Kesejahteraan Asatidz',
      STATUS: 'AKTIF'
    },
    {
      ID_KATEGORI: 'KAT-DAPUR',
      KODE_KATEGORI: 'KONSUMSI',
      NAMA_KATEGORI: 'Bahan Pokok Dapur & Konsumsi',
      STATUS: 'AKTIF'
    },
    {
      ID_KATEGORI: 'KAT-KGT',
      KODE_KATEGORI: 'KEGIATAN',
      NAMA_KATEGORI: 'Kegiatan Santri & PHBI',
      STATUS: 'AKTIF'
    }
  ],

  PENGELUARAN: [
    {
      ID_PENGELUARAN: 'EXP-20260910-000001',
      TANGGAL_PENGAJUAN: '2026-09-10',
      DIAJUKAN_OLEH: 'U001',
      ID_KATEGORI: 'KAT-DAPUR',
      URAIAN: 'Belanja Beras 2 Kwintal & Lauk Dapur Asrama',
      NOMINAL_PENGAJUAN: 650000,
      STATUS: 'LUNAS',
      DISETUJUI_OLEH: 'U002',
      TANGGAL_PERSETUJUAN: '2026-09-10 11:00:00',
      TANGGAL_PEMBAYARAN: '2026-09-10',
      METODE: 'TUNAI',
      REFERENSI: 'BKK-09-001',
      KETERANGAN: 'Dapur Santri Putra & Putri'
    },
    {
      ID_PENGELUARAN: 'EXP-20260915-000002',
      TANGGAL_PENGAJUAN: '2026-09-15',
      DIAJUKAN_OLEH: 'U001',
      ID_KATEGORI: 'KAT-OPS',
      URAIAN: 'Tagihan Listrik PLN & Token Pesantren Gedung Utama',
      NOMINAL_PENGAJUAN: 420000,
      STATUS: 'LUNAS',
      DISETUJUI_OLEH: 'U002',
      TANGGAL_PERSETUJUAN: '2026-09-15 13:00:00',
      TANGGAL_PEMBAYARAN: '2026-09-15',
      METODE: 'TRANSFER',
      REFERENSI: 'PLN-9912048821',
      KETERANGAN: 'Listrik Mandalasari Cikancung'
    },
    {
      ID_PENGELUARAN: 'EXP-20260920-000003',
      TANGGAL_PENGAJUAN: '2026-09-20',
      DIAJUKAN_OLEH: 'U001',
      ID_KATEGORI: 'KAT-KGT',
      URAIAN: 'Pengadaan Kitab Kuning Safinatun Naja & Jurumiyyah santri baru',
      NOMINAL_PENGAJUAN: 350000,
      STATUS: 'DISETUJUI',
      DISETUJUI_OLEH: 'U002',
      TANGGAL_PERSETUJUAN: '2026-09-21 09:15:00',
      TANGGAL_PEMBAYARAN: '',
      METODE: '',
      REFERENSI: '',
      KETERANGAN: 'Menunggu pencairan kas'
    },
    {
      ID_PENGELUARAN: 'EXP-20260925-000004',
      TANGGAL_PENGAJUAN: '2026-09-25',
      DIAJUKAN_OLEH: 'U001',
      ID_KATEGORI: 'KAT-OPS',
      URAIAN: 'Perbaikan Kran Air dan Pompa Asrama Timur',
      NOMINAL_PENGAJUAN: 280000,
      STATUS: 'DIAJUKAN',
      DISETUJUI_OLEH: '',
      TANGGAL_PERSETUJUAN: '',
      TANGGAL_PEMBAYARAN: '',
      METODE: '',
      REFERENSI: '',
      KETERANGAN: 'Estimasi belanja pipa dan toren'
    }
  ],

  PENGATURAN: [
    {
      KEY: 'NAMA_PONDOK',
      NILAI: 'Pondok Pesantren Inayatul Muhajirin',
      KETERANGAN: 'Nama Resmi Lembaga Pesantren'
    },
    {
      KEY: 'NAMA_YAYASAN',
      NILAI: 'Yayasan Pendidikan Islam Inayatul Muhajirin',
      KETERANGAN: 'Nama Badan Hukum Yayasan'
    },
    {
      KEY: 'ALAMAT_PONDOK',
      NILAI: 'Kp. Pasir Salam RT 02/05 Desa Mandalasari, Kec. Cikancung, Kab. Bandung, Jawa Barat 40396',
      KETERANGAN: 'Alamat Surat Menyurat'
    },
    {
      KEY: 'PENANDATANGAN_KEUANGAN',
      NILAI: 'Ranran Siti Nurhasanah, S.Pd, M.Pd',
      KETERANGAN: 'Nama Lengkap Pejabat Keuangan'
    },
    {
      KEY: 'JABATAN_PENANDATANGAN_KEUANGAN',
      NILAI: 'Kepala Bidang Keuangan',
      KETERANGAN: 'Jabatan Resmi di Kwitansi & Invoice'
    },
    {
      KEY: 'NOMOR_KONTAK_PESANTREN',
      NILAI: '081223344556',
      KETERANGAN: 'Nomor WhatsApp Konfirmasi Keuangan'
    },
    {
      KEY: 'REKENING_BANK',
      NILAI: 'BSI (Bank Syariah Indonesia) 7182991023 a.n. Pontren Inayatul Muhajirin',
      KETERANGAN: 'Rekening Resmi Penerimaan Tagihan'
    }
  ],

  LOG_AKTIVITAS: [
    {
      ID_LOG: 'LOG-20260926-000001',
      WAKTU: '2026-09-26 10:00:00',
      ID_USER: 'U001',
      NAMA_USER: 'Ranran Siti Nurhasanah, S.Pd, M.Pd',
      MODUL: 'SISTEM',
      AKSI: 'INISIALISASI_DATABASE',
      ID_DATA: 'SYSTEM',
      KETERANGAN: 'Inisialisasi blueprint 16 sheet Pondok Pesantren Inayatul Muhajirin',
      DATA_LAMA: '',
      DATA_BARU: '{"status":"OK","sheets":16}'
    }
  ],

  DOKUMEN: [
    {
      ID_DOKUMEN: 'DOC-20260905-000001',
      JENIS_DOKUMEN: 'INVOICE_PEMBAYARAN',
      ID_REFERENSI: 'PAY-20260905-000001',
      NAMA_FILE: 'INVOICE-TRX-SPP-MTS07A-202607001-2026-0001.pdf',
      URL_FILE: 'https://inayatulmuhajirin.pesantren.id/docs/inv-0001.pdf',
      DIBUAT_OLEH: 'U001',
      TANGGAL_DIBUAT: '2026-09-05 10:15:00',
      KETERANGAN: 'Invoice resmi pembayaran SPP September Fadhil'
    }
  ],

  PENUTUPAN_PERIODE: [
    {
      ID_PERIODE: 'PER-202608-000001',
      TAHUN: '2026',
      BULAN: '08',
      STATUS: 'DITUTUP',
      DITUTUP_OLEH: 'U002',
      TANGGAL_PENUTUPAN: '2026-09-01 17:00:00',
      KETERANGAN: 'Tutup buku periode Agustus 2026'
    },
    {
      ID_PERIODE: 'PER-202609-000002',
      TAHUN: '2026',
      BULAN: '09',
      STATUS: 'DIBUKA',
      DITUTUP_OLEH: '',
      TANGGAL_PENUTUPAN: '',
      KETERANGAN: 'Periode operasional aktif berjalan'
    }
  ]
};
