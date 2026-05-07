const FIELD_ALIASES = {
  title:    ['title', 'タイトル', 'name', '名前', '論文名', 'paper title', '題名'],
  authors:  ['authors', '著者', 'author', 'writers', '著者名'],
  year:     ['year', '発行年', 'published year', 'publication year', '年', '出版年'],
  journal:  ['journal', 'ジャーナル', 'publication', 'venue', 'conference', '雑誌', '掲載誌', '出版元'],
  keywords: ['keywords', 'キーワード', 'keyword'],
  tags:     ['tags', 'タグ', 'tag', 'category', 'categories', 'label', 'labels'],
  notes:    ['notes', 'メモ', 'note', 'abstract', '概要', '備考', 'comments', 'memo', 'アブスト'],
  url:      ['url', 'link', 'リンク', 'doi', '論文url', '論文リンク', 'paper url', 'paper link'],
}

function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }
  fields.push(current.trim())
  return fields
}

function matchHeader(header, aliases) {
  const h = header.toLowerCase().trim()
  return aliases.some(a => h === a.toLowerCase() || h.startsWith(a.toLowerCase()))
}

export function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim())
  if (lines.length < 2) throw new Error('データが不足しています（ヘッダ行＋1行以上が必要）')

  const headers = parseCSVLine(lines[0])

  const colMap = {}
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const idx = headers.findIndex(h => matchHeader(h, aliases))
    if (idx !== -1) colMap[field] = idx
  }

  if (colMap.title === undefined) {
    throw new Error(
      'タイトル列が見つかりません。\n' +
      '検出された列: ' + headers.join(', ') + '\n' +
      '対応する列名例: title, タイトル, name, 名前'
    )
  }

  const splitList = val =>
    val ? val.split(/[,;|、・]/).map(s => s.trim()).filter(Boolean) : []

  const results = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const get = field => colMap[field] !== undefined ? (values[colMap[field]] || '') : ''

    const title = get('title')
    if (!title) continue

    results.push({
      id: crypto.randomUUID(),
      title,
      authors:  splitList(get('authors')),
      year:     parseInt(get('year')) || null,
      journal:  get('journal'),
      keywords: splitList(get('keywords')),
      tags:     splitList(get('tags')),
      notes:    get('notes'),
      url:      get('url'),
      pdfName:  null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }

  return results
}
