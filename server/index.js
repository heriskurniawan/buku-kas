import express from 'express'
import cors from 'cors'
import dbModule from './db.js'

const app = express()
const { stmts } = dbModule

app.use(cors())
app.use(express.json())

app.get('/api/kas', (req, res) => {
  try {
    res.json(stmts.kasAll.all())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/kas', (req, res) => {
  try {
    const { nama } = req.body
    if (!nama) return res.status(400).json({ error: 'Nama kas wajib diisi' })
    const info = stmts.kasCreate.run(nama)
    const row = stmts.kasGet.get(info.lastInsertRowid)
    res.status(201).json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/kas/:id', (req, res) => {
  try {
    const old = stmts.kasGet.get(req.params.id)
    if (!old) return res.status(404).json({ error: 'Kas tidak ditemukan' })
    const { nama } = req.body
    if (!nama) return res.status(400).json({ error: 'Nama kas wajib diisi' })
    stmts.kasUpdate.run(nama, req.params.id)
    res.json(stmts.kasGet.get(req.params.id))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/kas/:id', (req, res) => {
  try {
    const old = stmts.kasGet.get(req.params.id)
    if (!old) return res.status(404).json({ error: 'Kas tidak ditemukan' })
    const { count } = stmts.kasTxCount.get(req.params.id)
    if (count > 0) return res.status(400).json({ error: 'Kas masih memiliki transaksi' })
    stmts.kasDelete.run(req.params.id)
    res.json({ message: 'Kas berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/transaksi', (req, res) => {
  try {
    const { kas_id } = req.query
    const rows = kas_id ? stmts.allByKas.all(Number(kas_id)) : stmts.all.all()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/transaksi/:id', (req, res) => {
  try {
    const row = stmts.get.get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Transaksi tidak ditemukan' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/transaksi', (req, res) => {
  try {
    const { kas_id, tanggal, jenis, kategori, jumlah, keterangan } = req.body
    if (!jenis || !kategori || !jumlah) {
      return res.status(400).json({ error: 'jenis, kategori, dan jumlah wajib diisi' })
    }
    if (!['pemasukan', 'pengeluaran'].includes(jenis)) {
      return res.status(400).json({ error: 'jenis harus pemasukan atau pengeluaran' })
    }
    const info = stmts.create.run(
      kas_id || 1,
      tanggal || new Date().toISOString().split('T')[0],
      jenis,
      kategori,
      Number(jumlah),
      keterangan || ''
    )
    const row = stmts.get.get(info.lastInsertRowid)
    res.status(201).json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/transaksi/:id', (req, res) => {
  try {
    const old = stmts.get.get(req.params.id)
    if (!old) return res.status(404).json({ error: 'Transaksi tidak ditemukan' })
    const { kas_id, tanggal, jenis, kategori, jumlah, keterangan } = req.body
    stmts.update.run(
      kas_id ?? old.kas_id,
      tanggal ?? old.tanggal,
      jenis ?? old.jenis,
      kategori ?? old.kategori,
      jumlah != null ? Number(jumlah) : old.jumlah,
      keterangan ?? old.keterangan,
      req.params.id
    )
    const row = stmts.get.get(req.params.id)
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/transaksi/:id', (req, res) => {
  try {
    const old = stmts.get.get(req.params.id)
    if (!old) return res.status(404).json({ error: 'Transaksi tidak ditemukan' })
    stmts.delete.run(req.params.id)
    res.json({ message: 'Transaksi berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/saldo', (req, res) => {
  try {
    const { kas_id } = req.query
    const result = kas_id ? stmts.saldoByKas.get(Number(kas_id)) : stmts.saldo.get()
    res.json({
      total_pemasukan: result.total_pemasukan,
      total_pengeluaran: result.total_pengeluaran,
      saldo: result.total_pemasukan - result.total_pengeluaran
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/laporan', (req, res) => {
  try {
    const { kas_id } = req.query
    if (!kas_id) return res.status(400).json({ error: 'kas_id wajib diisi' })
    const kategori = stmts.laporanPerKategori.all(Number(kas_id))
    const bulanan = stmts.laporanBulanan.all(Number(kas_id))
    res.json({ kategori, bulanan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server Buku Kas running on http://localhost:${PORT}`)
})
