import Dexie from 'dexie'

const db = new Dexie('BukuKasDB')

db.version(1).stores({
  kas: '++id, nama',
  transaksi: '++id, kas_id, tanggal, jenis, kategori',
})

db.on('populate', () => {
  db.kas.bulkAdd([
    { nama: 'KAS Negara' },
    { nama: 'KAS Dapur' },
    { nama: 'KAS Perumahan' },
  ])
})

export async function getKasList() {
  return db.kas.toArray()
}

export async function createKas(nama) {
  const id = await db.kas.add({ nama })
  return db.kas.get(id)
}

export async function updateKas(id, nama) {
  await db.kas.update(id, { nama })
  return db.kas.get(id)
}

export async function deleteKas(id) {
  const count = await db.transaksi.where('kas_id').equals(id).count()
  if (count > 0) throw new Error('Kas masih memiliki transaksi')
  await db.kas.delete(id)
}

export async function getTransaksi(kas_id) {
  return db.transaksi
    .where('kas_id').equals(kas_id)
    .reverse()
    .sortBy('tanggal')
    .then(rows => rows.reverse())
}

export async function getTransaksiById(id) {
  return db.transaksi.get(id)
}

export async function createTransaksi(data) {
  const id = await db.transaksi.add(data)
  return db.transaksi.get(id)
}

export async function updateTransaksi(id, data) {
  await db.transaksi.update(id, data)
  return db.transaksi.get(id)
}

export async function deleteTransaksi(id) {
  await db.transaksi.delete(id)
}

export async function getSaldo(kas_id) {
  const rows = await db.transaksi.where('kas_id').equals(kas_id).toArray()
  const total_pemasukan = rows.filter(r => r.jenis === 'pemasukan').reduce((s, r) => s + r.jumlah, 0)
  const total_pengeluaran = rows.filter(r => r.jenis === 'pengeluaran').reduce((s, r) => s + r.jumlah, 0)
  return { total_pemasukan, total_pengeluaran, saldo: total_pemasukan - total_pengeluaran }
}

export async function getLaporan(kas_id) {
  const rows = await db.transaksi.where('kas_id').equals(kas_id).toArray()

  const byKategori = {}
  for (const r of rows) {
    const key = r.jenis + '|' + r.kategori
    if (!byKategori[key]) byKategori[key] = { jenis: r.jenis, kategori: r.kategori, total: 0 }
    byKategori[key].total += r.jumlah
  }

  const kategori = Object.values(byKategori).sort((a, b) => a.jenis.localeCompare(b.jenis) || b.total - a.total)

  const byBulan = {}
  for (const r of rows) {
    const bulan = r.tanggal.slice(0, 7)
    const key = bulan + '|' + r.jenis
    if (!byBulan[key]) byBulan[key] = { bulan, jenis: r.jenis, total: 0 }
    byBulan[key].total += r.jumlah
  }

  const bulanan = Object.values(byBulan).sort((a, b) => b.bulan.localeCompare(a.bulan))

  return { kategori, bulanan }
}

export async function getKasTxCount(kas_id) {
  return db.transaksi.where('kas_id').equals(kas_id).count()
}

export default db
