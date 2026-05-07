import { useState, useEffect, useRef } from 'react'
import PDFViewer from './PDFViewer'
import { db } from '../utils/db'

const INPUT_CLASS =
  'w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent bg-white'

export default function LiteratureDetail({ literature, onDelete, onUpdate }) {
  const [splitRatio, setSplitRatio] = useState(45)
  const [isDragging, setIsDragging] = useState(false)
  const draggingRef = useRef(false)
  const containerRef = useRef()

  const [pdfUrl, setPdfUrl] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [isDirty, setIsDirty] = useState(false)

  // PDF loading
  useEffect(() => {
    const state = { cancelled: false, url: null }

    if (!literature?.id) {
      setPdfUrl(null)
      return
    }

    db.getPDF(literature.id).then(blob => {
      if (state.cancelled) return
      if (!blob) { setPdfUrl(null); return }
      state.url = URL.createObjectURL(blob)
      if (state.cancelled) { URL.revokeObjectURL(state.url); return }
      setPdfUrl(state.url)
    })

    return () => {
      state.cancelled = true
      if (state.url) URL.revokeObjectURL(state.url)
      setPdfUrl(null)
    }
  }, [literature?.id])

  // Edit form: reset when selecting a different literature
  useEffect(() => {
    if (literature) {
      setEditForm({
        title:   literature.title ?? '',
        authors: (literature.authors || []).join(', '),
        year:    literature.year ?? '',
        journal: literature.journal ?? '',
        url:     literature.url ?? '',
        notes:   literature.notes ?? '',
      })
      setIsDirty(false)
    }
  }, [literature?.id])

  // Divider drag: window-level listeners to work over iframe
  useEffect(() => {
    const onMouseMove = e => {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = ((e.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(Math.max(ratio, 20), 80))
    }
    const onMouseUp = () => {
      draggingRef.current = false
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const startDrag = () => {
    draggingRef.current = true
    setIsDragging(true)
  }

  const setField = (field, value) => {
    setEditForm(f => ({ ...f, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    const updated = {
      ...literature,
      title:   editForm.title.trim(),
      authors: editForm.authors.split(',').map(s => s.trim()).filter(Boolean),
      year:    editForm.year !== '' ? parseInt(editForm.year) || null : null,
      journal: editForm.journal.trim(),
      url:     editForm.url.trim(),
      notes:   editForm.notes,
      updatedAt: Date.now(),
    }
    onUpdate(updated)
    setIsDirty(false)
  }

  const handlePDFUpload = async file => {
    await db.savePDF(literature.id, file)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    onUpdate({ ...literature, pdfName: file.name, updatedAt: Date.now() })
  }

  if (!literature) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300 bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-sm text-gray-400">左のリストから文献を選択してください</p>
        </div>
      </div>
    )
  }

  if (!editForm) return null

  return (
    <div
      ref={containerRef}
      className="flex-1 flex overflow-hidden bg-white"
      style={{ cursor: isDragging ? 'col-resize' : 'auto', userSelect: isDragging ? 'none' : 'auto' }}
    >
      {/* Left pane: detail / inline edit */}
      <div className="flex flex-col overflow-hidden" style={{ width: `${splitRatio}%` }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 shrink-0">
          <span className="text-xs font-medium text-gray-500">詳細情報</span>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            )}
            <button
              onClick={() => onDelete(literature.id)}
              className="px-2 py-1 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-0.5">タイトル</label>
            <input
              type="text"
              value={editForm.title}
              onChange={e => setField('title', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-0.5">著者（カンマ区切り）</label>
            <input
              type="text"
              value={editForm.authors}
              onChange={e => setField('authors', e.target.value)}
              className={INPUT_CLASS}
              placeholder="著者A, 著者B, ..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-0.5">発行年</label>
              <input
                type="number"
                value={editForm.year}
                onChange={e => setField('year', e.target.value)}
                className={INPUT_CLASS}
                placeholder="2024"
                min="1000"
                max="2100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-0.5">出典</label>
              <input
                type="text"
                value={editForm.journal}
                onChange={e => setField('journal', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Nature, ICML, ..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-0.5">URL / DOI</label>
            <div className="flex gap-1">
              <input
                type="url"
                value={editForm.url}
                onChange={e => setField('url', e.target.value)}
                className={`${INPUT_CLASS} flex-1`}
                placeholder="https://..."
              />
              {editForm.url && (
                <a
                  href={editForm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 text-xs text-blue-500 border border-blue-200 rounded hover:bg-blue-50 shrink-0 whitespace-nowrap"
                >
                  開く
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-0.5">メモ</label>
            <textarea
              value={editForm.notes}
              onChange={e => setField('notes', e.target.value)}
              className={`${INPUT_CLASS} resize-none`}
              rows={10}
              placeholder="読んだメモ、要点など..."
            />
          </div>
        </div>
      </div>

      {/* Divider: wide hit area, thin visual line */}
      <div
        onMouseDown={startDrag}
        className="w-3 relative flex items-stretch justify-center cursor-col-resize shrink-0 group"
        title="ドラッグして幅を調整"
      >
        <div className={`w-0.5 transition-colors ${isDragging ? 'bg-blue-400' : 'bg-gray-200 group-hover:bg-blue-400'}`} />
      </div>

      {/* Right pane: PDF */}
      <div className="flex flex-col overflow-hidden flex-1 relative">
        <div className="px-4 py-2 border-b border-gray-200 shrink-0">
          <span className="text-xs font-medium text-gray-500">PDF</span>
        </div>
        <PDFViewer
          pdfUrl={pdfUrl}
          pdfName={literature.pdfName}
          onUpload={handlePDFUpload}
        />
        {/* Transparent overlay during drag to prevent iframe from capturing mouse events */}
        {isDragging && (
          <div className="absolute inset-0 z-10" style={{ cursor: 'col-resize' }} />
        )}
      </div>
    </div>
  )
}
