import { useState, useRef, useEffect } from 'react'
import { parseCSV } from '../utils/csvParser'

export default function CSVImportModal({ onImport, onClose }) {
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    const onEsc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  const processFile = file => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('CSVファイル (.csv) を選択してください')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const result = parseCSV(e.target.result)
        if (result.length === 0) throw new Error('取り込める文献が見つかりませんでした')
        setParsed(result)
        setError(null)
      } catch (err) {
        setError(err.message)
        setParsed(null)
      }
    }
    reader.onerror = () => setError('ファイルの読み込みに失敗しました')
    reader.readAsText(file, 'utf-8')
  }

  const handleDrop = e => {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">CSV インポート</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Help text */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="font-medium text-gray-600">Notionエクスポート CSV に対応しています。</p>
            <p>認識する列名 (大文字小文字・日英両対応):</p>
            <div className="grid grid-cols-2 gap-x-4 mt-1">
              {[
                ['タイトル列', 'title / タイトル / name / 名前'],
                ['著者列', 'authors / 著者'],
                ['発行年列', 'year / 発行年 / published year'],
                ['ジャーナル列', 'journal / ジャーナル / venue'],
                ['キーワード列', 'keywords / キーワード'],
                ['タグ列', 'tags / タグ / category'],
                ['メモ列', 'notes / メモ / abstract / 概要'],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-1">
                  <span className="text-gray-400 shrink-0">{label}:</span>
                  <span className="text-gray-600">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="text-4xl mb-2">📂</div>
            <p className="text-sm text-gray-600">CSVファイルをドラッグ＆ドロップ</p>
            <p className="text-xs text-gray-400 mt-1">またはクリックしてファイルを選択</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => processFile(e.target.files[0])}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Preview table */}
          {parsed && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                <span className="text-blue-600">{parsed.length} 件</span> の文献を検出しました（先頭5件のプレビュー）
              </p>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      {['タイトル', '著者', '年', 'ジャーナル', 'タグ'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 5).map((lit, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 max-w-[180px] truncate text-gray-800">{lit.title}</td>
                        <td className="px-3 py-2 text-gray-600 max-w-[120px] truncate">
                          {lit.authors.slice(0, 2).join(', ')}{lit.authors.length > 2 ? ' et al.' : ''}
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{lit.year || '—'}</td>
                        <td className="px-3 py-2 text-gray-600 max-w-[120px] truncate">{lit.journal || '—'}</td>
                        <td className="px-3 py-2 text-gray-600 max-w-[100px] truncate">{lit.tags.join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 5 && (
                  <p className="text-xs text-gray-400 text-center py-2">… 他 {parsed.length - 5} 件</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            キャンセル
          </button>
          {parsed && (
            <button
              onClick={() => onImport(parsed)}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              {parsed.length} 件を取り込む
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
