import { useState, useEffect } from 'react'

const today = () => new Date().toISOString().split('T')[0]
const kategoriList = [
  'Gaji', 'Bonus', 'Freelance', 'Investasi', 'Makanan',
  'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan',
  'Pendidikan', 'Lainnya'
]

export default function TransactionForm({ onSubmit, onCancel, initial, kasList, activeKasId }) {
  const [form, setForm] = useState({
    kas_id: activeKasId || 1,
    tanggal: today(),
    jenis: 'pemasukan',
    kategori: '',
    jumlah: '',
    keterangan: '',
  })

  useEffect(() => {
    if (initial) {
      setForm({
        kas_id: initial.kas_id,
        tanggal: initial.tanggal,
        jenis: initial.jenis,
        kategori: initial.kategori,
        jumlah: String(initial.jumlah),
        keterangan: initial.keterangan,
      })
    } else {
      setForm((prev) => ({ ...prev, kas_id: activeKasId || 1 }))
    }
  }, [initial, activeKasId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.jumlah || Number(form.jumlah) <= 0) {
      alert('Jumlah harus lebih dari 0')
      return
    }
    if (!form.kategori) {
      alert('Pilih kategori')
      return
    }
    onSubmit({
      ...form,
      jumlah: Number(form.jumlah),
    })
    setForm({ tanggal: today(), jenis: 'pemasukan', kategori: '', jumlah: '', keterangan: '' })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: 20,
      }}
    >
      <h3 style={{ marginBottom: 16, fontSize: 18 }}>
        {initial ? 'Edit Transaksi' : 'Tambah Transaksi'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Kas</label>
          <select name="kas_id" value={form.kas_id} onChange={handleChange} style={inputStyle}>
            {kasList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Jenis</label>
          <select name="jenis" value={form.jenis} onChange={handleChange} style={inputStyle}>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Kategori</label>
          <select name="kategori" value={form.kategori} onChange={handleChange} style={inputStyle}>
            <option value="">-- Pilih --</option>
            {kategoriList.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Jumlah (Rp)</label>
          <input
            type="number"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            placeholder="0"
            min="0"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Keterangan (opsional)</label>
        <input
          type="text"
          name="keterangan"
          value={form.keterangan}
          onChange={handleChange}
          placeholder="Catatan tambahan..."
          style={{ ...inputStyle, width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" style={primaryBtnStyle}>
          {initial ? 'Simpan Perubahan' : 'Simpan'}
        </button>
        {initial && (
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>
            Batal
          </button>
        )}
      </div>
    </form>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#555',
  marginBottom: 4,
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
}

const primaryBtnStyle = {
  padding: '10px 24px',
  background: '#4361ee',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const cancelBtnStyle = {
  padding: '10px 24px',
  background: '#e0e0e0',
  color: '#333',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}
