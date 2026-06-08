import KasSelector from './KasSelector'

export default function Header({ kasList, activeKasId, onSelectKas, onAddKas, onRenameKas, onDeleteKas, activeMenu, onMenuChange }) {
  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
        color: '#fff',
        padding: '24px 16px',
        textAlign: 'center',
        marginBottom: 24,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>BUKU KAS</h1>
      <p style={{ opacity: 0.85, fontSize: 14, marginTop: 4 }}>
        Catat pemasukan & pengeluaran harian Anda
      </p>

      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 12 }}>
        {['dashboard', 'transaksi'].map(m => (
          <button
            key={m}
            onClick={() => onMenuChange(m)}
            style={{
              padding: '6px 18px',
              borderRadius: 20,
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeMenu === m ? '#fff' : 'rgba(255,255,255,0.2)',
              color: activeMenu === m ? '#4361ee' : '#fff',
              transition: '0.2s',
            }}
          >
            {m === 'dashboard' ? 'Dashboard' : 'Transaksi'}
          </button>
        ))}
      </div>

      <KasSelector
        kasList={kasList}
        activeKasId={activeKasId}
        onSelect={onSelectKas}
        onAdd={onAddKas}
        onRename={onRenameKas}
        onDelete={onDeleteKas}
      />
    </header>
  )
}
