// ============================================================================
// GOOGLE APPS SCRIPT SYNC SERVICE
// Menangani integrasi ke Google Sheets & Google Apps Script
// ============================================================================

import { DbEngine } from './dbEngine';

export interface GasSyncConfig {
  webAppUrl: string;
  autoSyncOnTransaction: boolean;
  lastSyncTime?: string;
  spreadsheetId?: string;
}

const STORAGE_KEY = 'pesantren_gas_config';
const DEFAULT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx6YcwFBmhi4eNFMlTrxXTnEX0suwJ-MRtfXE5OMoxQD0qo6iBwqdr-hJ32_RGH3wrs9A/exec';

export const GasSyncService = {
  // Ambil konfigurasi
  getConfig(): GasSyncConfig {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        webAppUrl: DEFAULT_WEB_APP_URL,
        autoSyncOnTransaction: false,
      };
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.webAppUrl) {
        parsed.webAppUrl = DEFAULT_WEB_APP_URL;
      }
      return parsed;
    } catch {
      return { webAppUrl: DEFAULT_WEB_APP_URL, autoSyncOnTransaction: false };
    }
  },

  // Simpan konfigurasi
  saveConfig(config: GasSyncConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },

  // Uji koneksi ke Google Apps Script Web App
  async testConnection(url: string): Promise<{ success: boolean; message: string }> {
    if (!url || !url.startsWith('https://script.google.com/')) {
      return { success: false, message: 'URL Apps Script harus diawali dengan https://script.google.com/' };
    }

    try {
      const response = await fetch(`${url}?action=ping`, {
        method: 'GET',
        mode: 'cors',
      });
      const data = await response.json();
      if (data && data.success) {
        return { success: true, message: data.message || 'Koneksi ke Apps Script & Spreadsheet Berhasil!' };
      }
      return { success: false, message: data?.error || 'Gagal tersambung dengan Google Apps Script' };
    } catch (err: any) {
      // Seringkali Apps Script me-redirect atau CORS issue jika belum di-set Everyone
      return {
        success: false,
        message: 'Koneksi gagal atau terblokir CORS. Pastikan "Who has access" di Apps Script dipilih "Anyone (Siapa saja)".',
      };
    }
  },

  // Kirim (Push) seluruh database pesantren ke Google Spreadsheet
  async pushAllToSheets(url?: string): Promise<{ success: boolean; message: string }> {
    const webAppUrl = (url || this.getConfig().webAppUrl || '').trim();
    if (!webAppUrl) {
      return { success: false, message: 'URL Apps Script belum diisi. Masukkan URL Web App di Tab 1 (Panduan & Sambungan URL).' };
    }

    try {
      const db = DbEngine.getInstance();
      const state = db.getState();

      const payload = {
        action: 'syncAll',
        timestamp: new Date().toISOString(),
        database: state,
      };

      // Gunakan Content-Type text/plain agar browser tidak mengirim CORS preflight (OPTIONS)
      // yang sering gagal di Google Apps Script endpoint
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      // Update waktu sinkronisasi terakhir
      const cfg = this.getConfig();
      cfg.webAppUrl = webAppUrl;
      cfg.lastSyncTime = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      this.saveConfig(cfg);

      return {
        success: true,
        message: 'Data berhasil dikirim ke Google Sheets! Spreadsheet Anda sedang mengupdate 16 lembar kerja.',
      };
    } catch (err: any) {
      return { success: false, message: 'Gagal mengirim data ke Google Sheets: ' + (err?.message || err) };
    }
  },

  // Tarik (Pull) data dari Google Spreadsheet ke Local Database
  async pullAllFromSheets(url?: string): Promise<{ success: boolean; message: string }> {
    const webAppUrl = url || this.getConfig().webAppUrl;
    if (!webAppUrl) {
      return { success: false, message: 'URL Apps Script belum diisi di Pengaturan.' };
    }

    try {
      const res = await fetch(`${webAppUrl}?action=getAll`, {
        method: 'GET',
        mode: 'cors',
      });
      const result = await res.json();

      if (result && result.success && result.data) {
        const db = DbEngine.getInstance();
        db.restoreBackupJson(JSON.stringify(result.data));
        const cfg = this.getConfig();
        cfg.lastSyncTime = new Date().toLocaleString('id-ID');
        this.saveConfig(cfg);
        return { success: true, message: 'Data berhasil disinkronkan dari Google Sheets ke aplikasi!' };
      }
      return { success: false, message: result?.error || 'Format data dari Spreadsheet tidak valid.' };
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal menarik data dari Google Sheets. Pastikan akses deployment Web App adalah "Anyone".',
      };
    }
  },

  // Menghasilkan Kode Code.gs Siap Pakai untuk Google Apps Script
  generateCodeGs(): string {
    return `// ============================================================================
// GOOGLE APPS SCRIPT (Code.gs)
// SISTEM KEUANGAN & PEMBAYARAN PESANTREN TERPADU
// ============================================================================
// CARA PEMASANGAN:
// 1. Buat Google Spreadsheet baru di Google Drive Anda.
// 2. Klik menu 'Ekstensi' > 'Apps Script'.
// 3. Hapus semua kode bawaan, tempelkan SELURUH isi kode ini ke Code.gs.
// 4. Tambahkan file 'Index.html' di Apps Script, lalu tempelkan kode Index.html yang diunduh dari aplikasi.
// 5. Klik 'Deploy' > 'New deployment' > Pilih jenis 'Web app'.
//    - Execute as: 'Me' (email Anda)
//    - Who has access: 'Anyone' (Siapa saja)
// 6. Klik 'Deploy' dan izinkan akses (Authorize).
// 7. Salin URL Web App yang dihasilkan.
// ============================================================================

/**
 * Melayani tampilan antarmuka web (Index.html)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';

  // 1. Endpoint Ping untuk uji koneksi
  if (action === 'ping') {
    return createJsonResponse({
      success: true,
      message: 'Koneksi ke Apps Script & Google Spreadsheet Aktif dan Siap!',
      spreadsheetTitle: SpreadsheetApp.getActiveSpreadsheet().getName(),
      timestamp: new Date().toISOString()
    });
  }

  // 2. Endpoint Mengambil Data dari Semua Sheet (atau 1 sheet tertentu)
  if (action === 'getAll') {
    return handleGetAll(e.parameter.sheet);
  }

  // 3. Default: Render Halaman Antarmuka Web App Pesantren
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Sistem Keuangan Pesantren')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    // Fallback otomatis jika file Index belum dibuat atau salah ketik nama
    var fallbackHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Sistem Keuangan Pesantren</title>' +
      '<style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#f8fafc;}</style></head>' +
      '<body><iframe src="https://ais-pre-bdhttgbwfdqelxbpt6twwf-668653354293.asia-east1.run.app" ' +
      'style="width:100%;height:100%;border:none;display:block;" allow="clipboard-read; clipboard-write; camera"></iframe></body></html>';

    return HtmlService.createHtmlOutput(fallbackHtml)
      .setTitle('Sistem Keuangan Pesantren')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Menangani simpan / update data dari Web App ke Spreadsheet
 */
function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    var action = payload.action || 'syncAll';

    // Aksi 1: Sinkronisasi Massal Seluruh Tabel (16 Sheet)
    if (action === 'syncAll' && payload.database) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var db = payload.database;

      for (var sheetName in db) {
        if (db.hasOwnProperty(sheetName)) {
          var rows = db[sheetName];
          if (Array.isArray(rows) && rows.length > 0) {
            writeTableToSheet(ss, sheetName, rows);
          }
        }
      }
      return createJsonResponse({
        success: true,
        message: 'Seluruh data berhasil disinkronkan ke Google Spreadsheet!'
      });
    }

    // Aksi 2: Tambah 1 data transaksi/santri baru secara realtime
    if (action === 'insertRow' && payload.sheet && payload.data) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      appendRowToSheet(ss, payload.sheet, payload.data);
      return createJsonResponse({
        success: true,
        message: 'Data baru berhasil dicatat di sheet: ' + payload.sheet
      });
    }

    return createJsonResponse({ success: false, error: 'Aksi POST tidak dikenali' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Tulis tabel array of object ke dalam Sheet dengan styling rapi
 */
function writeTableToSheet(ss, sheetName, rows) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();

  if (rows.length === 0) return;

  var headers = Object.keys(rows[0]);
  var values = [headers];

  for (var i = 0; i < rows.length; i++) {
    var rowObj = rows[i];
    var rowArr = [];
    for (var j = 0; j < headers.length; j++) {
      var val = rowObj[headers[j]];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      rowArr.push(val !== undefined && val !== null ? val : '');
    }
    values.push(rowArr);
  }

  // Tulis ke spreadsheet sekaligus (batch write lebih cepat)
  var range = sheet.getRange(1, 1, values.length, headers.length);
  range.setValues(values);

  // Format Header Cantik (Warna Hijau Pesantren & Freeze Baris 1)
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#047857'); // Emerald green
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  // Auto-fit kolom agar tidak terpotong
  for (var c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Tambah satu baris data ke sheet
 */
function appendRowToSheet(ss, sheetName, dataObj) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    writeTableToSheet(ss, sheetName, [dataObj]);
    return;
  }

  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    writeTableToSheet(ss, sheetName, [dataObj]);
    return;
  }

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var val = dataObj[headers[i]];
    if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
    newRow.push(val !== undefined && val !== null ? val : '');
  }
  sheet.appendRow(newRow);
}

/**
 * Ambil data dari sheet menjadi JSON
 */
function handleGetAll(targetSheet) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (targetSheet) {
    var sheet = ss.getSheetByName(targetSheet);
    if (!sheet) return createJsonResponse({ success: false, error: 'Sheet tidak ditemukan: ' + targetSheet });
    return createJsonResponse({ success: true, data: sheetToObjects(sheet) });
  }

  var sheets = ss.getSheets();
  var db = {};
  for (var s = 0; s < sheets.length; s++) {
    var sh = sheets[s];
    db[sh.getName()] = sheetToObjects(sh);
  }

  return createJsonResponse({ success: true, data: db });
}

function sheetToObjects(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var list = [];

  for (var i = 1; i < values.length; i++) {
    var obj = {};
    var hasValue = false;
    for (var j = 0; j < headers.length; j++) {
      var val = values[i][j];
      if (val !== '') hasValue = true;
      obj[headers[j]] = val;
    }
    if (hasValue) list.push(obj);
  }
  return list;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi pembantu jika dipanggil langsung dari google.script.run di Index.html
 */
function apiSimpanDatabase(jsonDbString) {
  try {
    var db = JSON.parse(jsonDbString);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    for (var sheetName in db) {
      if (db.hasOwnProperty(sheetName)) {
        var rows = db[sheetName];
        if (Array.isArray(rows) && rows.length > 0) {
          writeTableToSheet(ss, sheetName, rows);
        }
      }
    }
    return { success: true, message: 'Berhasil menyimpan seluruh data ke Spreadsheet!' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function apiAmbilDatabase() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var db = {};
    for (var s = 0; s < sheets.length; s++) {
      var sh = sheets[s];
      db[sh.getName()] = sheetToObjects(sh);
    }
    return { success: true, database: db };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
`;
  },

  // Menghasilkan Wrapper Index.html untuk Apps Script
  generateIndexHtml(appUrl: string): string {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Keuangan & Tagihan Pesantren</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
    }
    .iframe-container {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    .banner-sync {
      position: fixed;
      bottom: 12px;
      right: 12px;
      background: #047857;
      color: white;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 9999;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <!-- Container Aplikasi Keuangan Pesantren -->
  <iframe 
    src="${appUrl}" 
    class="iframe-container"
    allow="clipboard-read; clipboard-write; camera"
    title="Sistem Keuangan Pesantren"
  ></iframe>

  <div class="banner-sync">
    <span>🟢 Terhubung dengan Google Spreadsheet</span>
  </div>

  <script>
    // Listener jembatan komunikasi antara Web App dan Google Apps Script
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'SYNC_TO_SHEETS') {
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(function(res) {
              console.log('Sync result:', res);
            })
            .apiSimpanDatabase(JSON.stringify(event.data.database));
        }
      }
    });
  </script>
</body>
</html>`;
  },
};
