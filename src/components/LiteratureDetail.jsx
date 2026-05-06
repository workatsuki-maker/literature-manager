import { useState, useEffect } from 'react'
import PDFViewer from './PDFViewer'
import { db } from '../utils/db'

export default function LiteratureDetail({ literature, onEdit, onDelete, onUpdateLit }) {
  const [tab, setTab] = useState('info')
  const [pdfUrl, setPdfUrl] = useState(null)

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

  const handlePDFUpload = async file => {
    await db.savePDF(literature.id, file)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    onUpdateLit({ ...literature, pdfName: file.name, updatedAt: Date.now() })
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-200 px-4 shrink-0">
        <div className="flex">
          {[['info', '詳細情報'], ['pdf', 'PDF']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              {key === 'pdf' && !pdfUrl && (
                <span className="ml-1 text-xs font-normal text-gray-400">(未登録)</span>
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2 py-2">
          <button
            onClick={() => onEdit(literature)}
            className="px-3 py-1 text-xs text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
          >
            編集
          </button>
          <button
            onClick={() => onDelete(literature.id)}
            className="px-3 py-1 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          >
            削除
          </button>
        </div>
      </div>

      {tab === 'info' ? (
        <DetailView literature={literature} />
      ) : (
        <PDFViewer
          pdfUrl={pdfUrl}
          pdfName={literature.pdfName}
          onUpload={handlePDFUpload}
        />
      )}
    </div>
  )
}

function DetailView({ literature }) {
  const { title, authors, year, journal, keywords, tags, notes } = literature

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>

      <div className="mt-6 space-y-4">
        {authors?.length > 0 && (
          <Row label="著者">
            <span className="text-sm text-gray-700">{authors.join(', ')}</span>
          </Row>
        )}

        {(year || journal) && (
          <Row label="出典">
            <span className="text-sm text-gray-700">
              {[journal, year].filter(Boolean).join(', ')}
            </span>
          </Row>
        )}

        {keywords?.length > 0 && (
          <Row label="キーワード">
            <div className="flex flex-wrap gap-1">
              {keywords.map(k => (
                <span key={k} className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {k}
                </span>
              ))}
            </div>
          </Row>
        )}

        {tags?.length > 0 && (
          <Row label="タグ">
            <div className="flex flex-wrap gap-1">
              {tags.map(t => (
                <span key={t} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </Row>
        )}

        {notes && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">メモ</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100 leading-relaxed">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex gap-4">
      <span className="w-20 shrink-0 text-xs font-medium text-gray-400 pt-0.5">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}
