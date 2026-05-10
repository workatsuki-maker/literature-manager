import { useRef, useState } from 'react'

export default function PDFViewer({ pdfUrl, pdfName, onUpload }) {
  const fileRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleChange = e => {
    const file = e.target.files[0]
    if (file?.type === 'application/pdf') onUpload(file)
    e.target.value = ''
  }

  const handleDragOver = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const file = [...e.dataTransfer.files].find(f => f.type === 'application/pdf')
    if (file) onUpload(file)
  }

  if (!pdfUrl) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`flex-1 flex items-center justify-center cursor-pointer transition-colors ${
          dragging ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="text-center pointer-events-none">
          <div className="text-5xl mb-3">{dragging ? '📥' : '📄'}</div>
          <p className="text-sm text-gray-500 mb-1">
            {dragging ? 'ここにドロップ' : 'PDFが登録されていません'}
          </p>
          <p className="text-xs text-gray-400">クリックまたはドラッグ&ドロップ</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col overflow-hidden relative ${dragging ? 'ring-2 ring-inset ring-blue-400' : ''}`}
    >
      {dragging && (
        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white rounded-xl px-6 py-4 shadow-lg text-center">
            <div className="text-3xl mb-1">📥</div>
            <p className="text-sm font-medium text-blue-700">PDFをここにドロップして差し替え</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 shrink-0">
        <span className="font-medium text-gray-500 shrink-0">PDF</span>
        <span className="truncate flex-1 text-gray-400">{pdfName}</span>
        <label className="cursor-pointer text-blue-500 hover:text-blue-700 shrink-0">
          差し替え
          <input type="file" accept=".pdf" className="hidden" onChange={handleChange} />
        </label>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:text-blue-700 shrink-0"
        >
          別タブで開く
        </a>
      </div>
      <iframe
        src={pdfUrl}
        className="flex-1 w-full border-0"
        title="PDF Preview"
      />
    </div>
  )
}
