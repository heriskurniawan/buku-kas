import { useState } from 'react'

export default function KasSelector({ kasList, activeKasId, onSelect, onAdd, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const handleStartEdit = (k) => {
    setEditingId(k.id)
    setEditValue(k.nama)
  }

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onRename(editingId, editValue.trim())
    }
    setEditingId(null)
    setEditValue('')
  }

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim())
      setNewName('')
      setAdding(false)
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <select
          value={activeKasId || ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            cursor: 'pointer',
            minWidth: 180,
          }}
        >
          {kasList.map((k) => (
            <option key={k.id} value={k.id} style={{ color: '#333' }}>
              {k.nama}
            </option>
          ))}
        </select>

        {!adding ? (
          <button onClick={() => setAdding(true)} style={miniBtnStyle}>+</button>
        ) : (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kas baru"
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                width: 140,
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} style={miniBtnStyle}>Simpan</button>
            <button onClick={() => { setAdding(false); setNewName('') }} style={miniBtnStyle}>Batal</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {kasList.filter(k => k.id === activeKasId).map((k) => (
          <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {editingId === k.id ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: 'none',
                    fontSize: 12,
                    width: 130,
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <button onClick={handleSaveEdit} style={tinyBtnStyle}>Simpan</button>
                <button onClick={() => setEditingId(null)} style={tinyBtnStyle}>Batal</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 12, opacity: 0.85, cursor: 'pointer' }} onClick={() => handleStartEdit(k)}>
                  ✏️
                </span>
                <span style={{ fontSize: 12, opacity: 0.85, cursor: 'pointer', marginLeft: 4 }} onClick={() => onDelete(k.id)}>
                  🗑️
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const miniBtnStyle = {
  padding: '6px 12px',
  background: 'rgba(255,255,255,0.2)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const tinyBtnStyle = {
  padding: '3px 8px',
  background: 'rgba(255,255,255,0.2)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 4,
  fontSize: 11,
  cursor: 'pointer',
}
