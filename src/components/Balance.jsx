export default function Balance({ saldo }) {
  const formatRp = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Saldo Saat Ini</div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: saldo.saldo >= 0 ? '#2d6a4f' : '#d00000',
          }}
        >
          {formatRp(saldo.saldo)}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Total Pemasukan</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#2d6a4f' }}>
          {formatRp(saldo.total_pemasukan)}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Total Pengeluaran</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#d00000' }}>
          {formatRp(saldo.total_pengeluaran)}
        </div>
      </div>
    </div>
  )
}
