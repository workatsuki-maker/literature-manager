import { useRef } from 'react'

export default function PDFViewer({ pdfUrl, pdfName, onUpload }) {
  const fileRef = useRef()

  const handleChange = e => {
    const file = e.target.files[0]
    if (file?.type === 'application/pdf') onUpload(file)
    e.target.value = ''
  }

  if (!pdfUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-sm text-gray-500 mb-4">PDFが登録されていません</p>
          <label className="cursor-pointer px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            PDFをアップロード
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleChange}
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 shrink-0">
        <span className="truncate flex-1">{pdfName || 'PDF'}</span>
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
