import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import LiteratureList from './components/LiteratureList'
import LiteratureDetail from './components/LiteratureDetail'
import AddEditModal from './components/AddEditModal'
import CSVImportModal from './components/CSVImportModal'
import HelpModal from './components/HelpModal'
import LoadingSpinner from './components/LoadingSpinner'
import { db } from './utils/db'
import { litDB } from './utils/supabase'

export default function App({ user, onSignOut }) {
  const [literatures, setLiteratures] = useState([])
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTagFilters, setActiveTagFilters] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLit, setEditingLit] = useState(null)
  const [showCSVModal, setShowCSVModal] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    litDB.fetchAll(user.id)
      .then(data => { setLiteratures(data); setDataLoading(false) })
      .catch(() => { setError('データの読み込みに失敗しました。'); setDataLoading(false) })
  }, [user.id])

  if (dataLoading) return <LoadingSpinner />

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

  const handleAdd = async lit => {
    try {
      await litDB.insert(lit, user.id)
      setLiteratures(prev => [lit, ...prev])
      setSelected(lit)
      setShowAddModal(false)
    } catch {
      setError('文献の追加に失敗しました。')
    }
  }

  const handleEdit = async lit => {
    try {
      await litDB.update(lit, user.id)
      updateLit(lit)
      setEditingLit(null)
    } catch {
      setError('文献の更新に失敗しました。')
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('この文献を削除しますか？')) return
    try {
      await Promise.all([db.deletePDF(id), litDB.remove(id)])
      setLiteratures(prev => prev.filter(l => l.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch {
      setError('文献の削除に失敗しました。')
    }
  }

  const handleImportCSV = async lits => {
    try {
      await litDB.insertMany(lits, user.id)
      setLiteratures(prev => [...lits, ...prev])
      setShowCSVModal(false)
    } catch {
      setError('CSVの取り込みに失敗しました。')
    }
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
            onClick={() => setShowHelp(true)}
            className="px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="使い方"
          >
            ? 使い方
          </button>
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
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-2 flex items-center justify-between text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

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
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}
