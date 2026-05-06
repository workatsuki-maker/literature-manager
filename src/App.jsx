import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import LiteratureList from './components/LiteratureList'
import LiteratureDetail from './components/LiteratureDetail'
import AddEditModal from './components/AddEditModal'
import CSVImportModal from './components/CSVImportModal'
import { db } from './utils/db'

const STORAGE_KEY = 'refmanager_data'

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function App() {
  const [literatures, setLiteratures] = useState(loadData)
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTagFilters, setActiveTagFilters] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLit, setEditingLit] = useState(null)
  const [showCSVModal, setShowCSVModal] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(literatures))
    } catch {
      // localStorage quota exceeded — PDFs are in IndexedDB so metadata is small
    }
  }, [literatures])

  const allTags = [...new Set(literatures.flatMap(l => l.tags || []))]

  const filtered = literatures.filter(lit => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const hit =
        lit.title?.toLowerCase().includes(q) ||
        lit.authors?.some(a => a.toLowerCase().includes(q)) ||
        lit.keywords?.some(k => k.toLowerCase().includes(q)) ||
        lit.journal?.toLowerCase().includes(q) ||
        lit.notes?.toLowerCase().includes(q)
      if (!hit) return false
    }
    if (activeTagFilters.length > 0) {
      if (!activeTagFilters.every(t => lit.tags?.includes(t))) return false
    }
    return true
  })

  const updateLit = updated => {
    setLiteratures(prev => prev.map(l => l.id === updated.id ? updated : l))
    setSelected(prev => prev?.id === updated.id ? updated : prev)
  }

  const handleAdd = lit => {
    setLiteratures(prev => [lit, ...prev])
    setSelected(lit)
    setShowAddModal(false)
  }

  const handleEdit = lit => {
    updateLit(lit)
    setEditingLit(null)
  }

  const handleDelete = async id => {
    if (!window.confirm('この文献を削除しますか？')) return
    await db.deletePDF(id)
    setLiteratures(prev => prev.filter(l => l.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handleImportCSV = lits => {
    setLiteratures(prev => [...lits, ...prev])
    setShowCSVModal(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">📚</span>
          <h1 className="text-lg font-bold text-blue-700">RefManager</h1>
        </div>
        <div className="flex-1 max-w-xl">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex gap-2 ml-auto shrink-0">
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            CSV取込
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 文献追加
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <LiteratureList
          literatures={filtered}
          selected={selected}
          allTags={allTags}
          activeTagFilters={activeTagFilters}
          onTagFiltersChange={setActiveTagFilters}
          onSelect={setSelected}
          totalCount={literatures.length}
        />
        <LiteratureDetail
          literature={selected}
          onEdit={setEditingLit}
          onDelete={handleDelete}
          onUpdateLit={updateLit}
        />
      </div>

      {showAddModal && (
        <AddEditModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
      {editingLit && (
        <AddEditModal
          literature={editingLit}
          onSave={handleEdit}
          onClose={() => setEditingLit(null)}
        />
      )}
      {showCSVModal && (
        <CSVImportModal onImport={handleImportCSV} onClose={() => setShowCSVModal(false)} />
      )}
    </div>
  )
}
