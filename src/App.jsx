import { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Balance from './components/Balance'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import {
  getKasList, createKas, updateKas, deleteKas,
  getTransaksi, createTransaksi, updateTransaksi, deleteTransaksi,
  getSaldo,
} from './db'

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [saldo, setSaldo] = useState({ total_pemasukan: 0, total_pengeluaran: 0, saldo: 0 })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [kasList, setKasList] = useState([])
  const [activeKasId, setActiveKasId] = useState(null)
  const [menu, setMenu] = useState('dashboard')

  useEffect(() => {
    getKasList().then(data => {
      setKasList(data)
      if (data.length > 0 && !activeKasId) {
        setActiveKasId(data[0].id)
      }
    })
  }, [])

  const fetchData = () => {
    if (!activeKasId) return
    Promise.all([
      getTransaksi(activeKasId),
      getSaldo(activeKasId),
    ]).then(([tx, s]) => {
      setTransactions(tx)
      setSaldo(s)
    })
  }

  useEffect(() => { fetchData() }, [activeKasId])

  const refreshKas = () => {
    getKasList().then(setKasList)
  }

  const handleSelectKas = (id) => {
    setActiveKasId(id)
  }

  const handleAddKas = async (nama) => {
    await createKas(nama)
    refreshKas()
  }

  const handleRenameKas = async (id, nama) => {
    await updateKas(id, nama)
    refreshKas()
  }

  const handleDeleteKas = async (id) => {
    if (!confirm('Yakin ingin menghapus KAS ini?')) return
    try {
      await deleteKas(id)
      if (activeKasId === id) setActiveKasId(null)
      refreshKas()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSubmit = async (data) => {
    if (editing) {
      await updateTransaksi(editing.id, data)
    } else {
      await createTransaksi(data)
    }
    setEditing(null)
    setShowForm(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return
    await deleteTransaksi(id)
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
