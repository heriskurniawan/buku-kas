import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Balance from './components/Balance'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'

const API = '/api'

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [saldo, setSaldo] = useState({ total_pemasukan: 0, total_pengeluaran: 0, saldo: 0 })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [kasList, setKasList] = useState([])
  const [activeKasId, setActiveKasId] = useState(null)
  const [menu, setMenu] = useState('dashboard')

  const fetchKas = useCallback(async () => {
    const res = await fetch(`${API}/kas`)
    const data = await res.json()
    setKasList(data)
    if (data.length > 0 && !activeKasId) {
      setActiveKasId(data[0].id)
    }
  }, [activeKasId])

  useEffect(() => { fetchKas() }, [fetchKas])

  const fetchData = useCallback(async () => {
    if (!activeKasId) return
    const params = new URLSearchParams({ kas_id: activeKasId })
    const [txRes, saldoRes] = await Promise.all([
      fetch(`${API}/transaksi?${params}`),
      fetch(`${API}/saldo?${params}`),
    ])
    setTransactions(await txRes.json())
    setSaldo(await saldoRes.json())
  }, [activeKasId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSelectKas = (id) => {
    setActiveKasId(id)
  }

  const handleAddKas = async (nama) => {
    await fetch(`${API}/kas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama }),
    })
    fetchKas()
  }

  const handleRenameKas = async (id, nama) => {
    await fetch(`${API}/kas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama }),
    })
    fetchKas()
  }

  const handleDeleteKas = async (id) => {
    if (!confirm('Yakin ingin menghapus KAS ini?')) return
    const res = await fetch(`${API}/kas/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Gagal menghapus KAS')
      return
    }
    if (activeKasId === id) {
      setActiveKasId(null)
    }
    fetchKas()
  }

  const handleSubmit = async (data) => {
    if (editing) {
      await fetch(`${API}/transaksi/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch(`${API}/transaksi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setEditing(null)
    setShowForm(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return
    await fetch(`${API}/transaksi/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleEdit = (tx) => {
    setEditing(tx)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
  }

  return (
    <div>
      <Header
        kasList={kasList}
        activeKasId={activeKasId}
        onSelectKas={handleSelectKas}
        onAddKas={handleAddKas}
        onRenameKas={handleRenameKas}
        onDeleteKas={handleDeleteKas}
        activeMenu={menu}
        onMenuChange={setMenu}
      />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 40px' }}>
        {menu === 'dashboard' ? (
          <Dashboard activeKasId={activeKasId} />
        ) : (
          <>
            <Balance saldo={saldo} />
            <button
              onClick={() => { setShowForm(!showForm); setEditing(null) }}
              style={btnStyle}
            >
              {showForm ? 'Tutup Form' : '+ Tambah Transaksi'}
            </button>
            {showForm && (
              <TransactionForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                initial={editing}
                kasList={kasList}
                activeKasId={activeKasId}
              />
            )}
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>
    </div>
  )
}

const btnStyle = {
  display: 'inline-block',
  padding: '10px 20px',
  background: '#4361ee',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: 20,
}
