import { useState, useEffect } from 'react'
import { getLaporan, getTransaksi, getSaldo } from '../db'

const formatRp = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function Dashboard({ activeKasId }) {
  const [laporan, setLaporan] = useState(null)
  const [transaksi, setTransaksi] = useState([])
  const [saldo, setSaldo] = useState(null)

  useEffect(() => {
    if (!activeKasId) return
    Promise.all([
      getLaporan(activeKasId),
      getTransaksi(activeKasId),
      getSaldo(activeKasId),
    ]).then(([lap, tx, s]) => {
      setLaporan(lap)
      setTransaksi(tx.slice(0, 5))
      setSaldo(s)
    })
  }, [activeKasId])

  if (!saldo) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Pilih KAS untuk melihat dashboard</div>
  }

  const pemasukan = (laporan?.kategori || []).filter(k => k.jenis === 'pemasukan')
  const pengeluaran = (laporan?.kategori || []).filter(k => k.jenis === 'pengeluaran')
  const bulanan = laporan?.bulanan || []

  const maxPengeluaran = Math.max(...pengeluaran.map(k => k.total), 1)
  const maxPemasukan = Math.max(...pemasukan.map(k => k.total), 1)
  const maxBulan = Math.max(...bulanan.map(k => k.total), 1)

  return (
    <div>
      {/* Ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <SummaryCard label="Saldo Saat Ini" value={formatRp(saldo.saldo)} color={saldo.saldo >= 0 ? '#2d6a4f' : '#d00000'} />
        <SummaryCard label="Total Pemasukan" value={formatRp(saldo.total_pemasukan)} color="#2d6a4f" />
        <SummaryCard label="Total Pengeluaran" value={formatRp(saldo.total_pengeluaran)} color="#d00000" />
        <SummaryCard label="Jumlah Transaksi" value={String(transaksi.length)} color="#4361ee" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Pengeluaran per Kategori */}
        <Panel title="Pengeluaran per Kategori">
          {pengeluaran.length === 0 ? (
            <EmptyText>Belum ada pengeluaran</EmptyText>
          ) : (
            pengeluaran.map(k => (
              <BarRow key={k.kategori} label={k.kategori} value={k.total} max={maxPengeluaran} color="#d00000" />
            ))
          )}
        </Panel>

        {/* Pemasukan per Kategori */}
        <Panel title="Pemasukan per Kategori">
          {pemasukan.length === 0 ? (
            <EmptyText>Belum ada pemasukan</EmptyText>
          ) : (
            pemasukan.map(k => (
              <BarRow key={k.kategori} label={k.kategori} value={k.total} max={maxPemasukan} color="#2d6a4f" />
            ))
          )}
        </Panel>
      </div>

      {/* Grafik Bulanan */}
      {bulanan.length > 0 && (
        <Panel title="Grafik Bulanan" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bulanan.map(b => {
              const bulanLabel = new Date(b.bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
              return (
                <div key={b.bulan + b.jenis}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
                    <span>{bulanLabel} — {b.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</span>
                    <span style={{ fontWeight: 600, color: b.jenis === 'pemasukan' ? '#2d6a4f' : '#d00000' }}>
                      {formatRp(b.total)}
                    </span>
                  </div>
                  <div style={{ background: '#eee', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(b.total / maxBulan) * 100}%`,
                      height: '100%',
                      background: b.jenis === 'pemasukan' ? '#2d6a4f' : '#d00000',
                      borderRadius: 6,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      )}

      {/* Transaksi Terbaru */}
      <Panel title="Transaksi Terbaru">
        {transaksi.length === 0 ? (
          <EmptyText>Belum ada transaksi</EmptyText>
        ) : (
          transaksi.map(tx => (
            <div key={tx.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #f0f0f0',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{tx.kategori}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {new Date(tx.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  {tx.keterangan && <span> — {tx.keterangan}</span>}
                </div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: tx.jenis === 'pemasukan' ? '#2d6a4f' : '#d00000',
              }}>
                {tx.jenis === 'pemasukan' ? '+' : '-'}{formatRp(tx.jumlah)}
              </div>
            </div>
          ))
        )}
      </Panel>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function Panel({ title, children, style }) {
  return (
    <div style={{
      ...style,
      background: '#fff', borderRadius: 12, padding: 20,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <h3 style={{ fontSize: 16, marginBottom: 14, color: '#333' }}>{title}</h3>
      {children}
    </div>
  )
}

function BarRow({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{formatRp(value)}</span>
      </div>
      <div style={{ background: '#eee', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div style={{
          width: `${(value / max) * 100}%`,
          height: '100%', background: color,
          borderRadius: 6, transition: 'width 0.3s',
        }} />
      </div>
    </div>
  )
}

function EmptyText({ children }) {
  return <div style={{ textAlign: 'center', padding: 20, color: '#bbb', fontSize: 13 }}>{children}</div>
}
