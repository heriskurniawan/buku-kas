import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '..', 'buku_kas.db')

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS kas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL UNIQUE
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kas_id INTEGER NOT NULL DEFAULT 1 REFERENCES kas(id),
    tanggal TEXT NOT NULL DEFAULT (date('now','localtime')),
    jenis TEXT NOT NULL CHECK(jenis IN ('pemasukan','pengeluaran')),
    kategori TEXT NOT NULL,
    jumlah REAL NOT NULL CHECK(jumlah > 0),
    keterangan TEXT DEFAULT ''
  )
`)

const hasKasId = db.pragma('table_info(transaksi)').some(c => c.name === 'kas_id')
if (!hasKasId) {
  db.exec(`ALTER TABLE transaksi ADD COLUMN kas_id INTEGER NOT NULL DEFAULT 1 REFERENCES kas(id)`)
}

db.exec(`
  INSERT OR IGNORE INTO kas (id, nama) VALUES
    (1, 'KAS Negara'),
    (2, 'KAS Dapur'),
    (3, 'KAS Perumahan')
`)

const stmts = {
  all: db.prepare('SELECT t.*, k.nama as kas_nama FROM transaksi t JOIN kas k ON k.id = t.kas_id ORDER BY t.tanggal DESC, t.id DESC'),
  allByKas: db.prepare('SELECT t.*, k.nama as kas_nama FROM transaksi t JOIN kas k ON k.id = t.kas_id WHERE t.kas_id = ? ORDER BY t.tanggal DESC, t.id DESC'),
  get: db.prepare('SELECT t.*, k.nama as kas_nama FROM transaksi t JOIN kas k ON k.id = t.kas_id WHERE t.id = ?'),
  create: db.prepare(
    'INSERT INTO transaksi (kas_id, tanggal, jenis, kategori, jumlah, keterangan) VALUES (?, ?, ?, ?, ?, ?)'
  ),
  update: db.prepare(
    'UPDATE transaksi SET kas_id = ?, tanggal = ?, jenis = ?, kategori = ?, jumlah = ?, keterangan = ? WHERE id = ?'
  ),
  delete: db.prepare('DELETE FROM transaksi WHERE id = ?'),
  saldo: db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END), 0) as total_pemasukan,
      COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END), 0) as total_pengeluaran
    FROM transaksi
  `),
  saldoByKas: db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END), 0) as total_pemasukan,
      COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END), 0) as total_pengeluaran
    FROM transaksi WHERE kas_id = ?
  `),
  kasAll: db.prepare('SELECT * FROM kas ORDER BY id'),
  kasGet: db.prepare('SELECT * FROM kas WHERE id = ?'),
  kasCreate: db.prepare('INSERT INTO kas (nama) VALUES (?)'),
  kasUpdate: db.prepare('UPDATE kas SET nama = ? WHERE id = ?'),
  kasDelete: db.prepare('DELETE FROM kas WHERE id = ?'),
  kasTxCount: db.prepare('SELECT COUNT(*) as count FROM transaksi WHERE kas_id = ?'),
  laporanPerKategori: db.prepare(`
    SELECT jenis, kategori, SUM(jumlah) as total, COUNT(*) as count
    FROM transaksi WHERE kas_id = ?
    GROUP BY jenis, kategori ORDER BY jenis, total DESC
  `),
  laporanBulanan: db.prepare(`
    SELECT substr(tanggal,1,7) as bulan, jenis, SUM(jumlah) as total
    FROM transaksi WHERE kas_id = ?
    GROUP BY bulan, jenis ORDER BY bulan DESC
  `),
}

export default { db, stmts }
