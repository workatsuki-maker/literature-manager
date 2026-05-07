function escapeCSV(val) {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function exportToCSV(literatures) {
  const headers = ['タイトル', '著者', '発行年', 'ジャーナル名', 'URL']
  const rows = literatures.map(l => [
    l.title ?? '',
    (l.authors || []).join('; '),
    l.year ?? '',
    l.journal ?? '',
    l.url ?? '',
  ])
  // BOM付きUTF-8（Excelで文字化けしない）
  const csv = '﻿' + [headers, ...rows].map(r => r.map(escapeCSV).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'literatures.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
