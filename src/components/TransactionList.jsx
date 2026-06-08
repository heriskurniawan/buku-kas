export default function TransactionList({ transactions, onEdit, onDelete }) {
  const formatRp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const formatDate = (d) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999', background: '#fff', borderRadius: 12 }}>
        Belum ada transaksi. Klik "Tambah Transaksi" untuk memulai.
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ fontSize: 18, marginBottom: 12, color: '#333' }}>Riwayat Transaksi</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {transactions.map((tx) => (
          <div
            key={tx.id}
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: '14px 18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>
                {tx.kategori}
                {tx.keterangan && (
                  <span style={{ fontWeight: 400, color: '#888', marginLeft: 8 }}>
                    - {tx.keterangan}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {formatDate(tx.tanggal)}
                <span style={{ marginLeft: 8, background: '#eef0ff', color: '#4361ee', padding: '1px 6px', borderRadius: 4 }}>
                  {tx.kas_nama}
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: tx.jenis === 'pemasukan' ? '#2d6a4f' : '#d00000',
              }}
            >
              {tx.jenis === 'pemasukan' ? '+' : '-'}{formatRp(tx.jumlah)}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onEdit(tx)} style={actionBtnStyle('#4361ee')}>
                Edit
              </button>
              <button onClick={() => onDelete(tx.id)} style={actionBtnStyle('#d00000')}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const actionBtnStyle = (color) => ({
  padding: '5px 12px',
  background: 'transparent',
  color,
  border: `1.5px solid ${color}`,
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
})
