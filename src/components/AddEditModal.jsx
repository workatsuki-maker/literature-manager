import { useState, useEffect, useRef } from 'react'

const INPUT_CLASS =
  'w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function TagInput({ label, value, onChange, placeholder, colorClass = 'bg-blue-100 text-blue-800' }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const tag = input.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }

  const handleKey = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !input) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-md min-h-[40px] cursor-text focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
        onClick={e => e.currentTarget.querySelector('input')?.focus()}
      >
        {value.map((tag, i) => (
          <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded ${colorClass}`}>
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(value.filter((_, idx) => idx !== i)) }}
              className="ml-0.5 opacity-60 hover:opacity-100 font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5">Enter またはカンマで追加</p>
    </div>
  )
}

export default function AddEditModal({ literature, onSave, onClose }) {
  const isEdit = !!literature
  const titleRef = useRef()

  const [form, setForm] = useState({
    title:    literature?.title    ?? '',
    authors:  literature?.authors  ?? [],
    year:     literature?.year     ?? '',
    journal:  literature?.journal  ?? '',
    keywords: literature?.keywords ?? [],
    tags:     literature?.tags     ?? [],
    notes:    literature?.notes    ?? '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    const onEsc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'タイトルは必須です'
    if (form.year !== '' && form.year !== null) {
      const y = Number(form.year)
      if (isNaN(y) || y < 1000 || y > 2100) errs.year = '1000〜2100の年を入力してください'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = e => {
    e?.preventDefault()
    if (!validate()) return
    const now = Date.now()
    onSave({
      id:        literature?.id ?? crypto.randomUUID(),
      title:     form.title.trim(),
      authors:   form.authors,
      year:      form.year !== '' ? parseInt(form.year) : null,
      journal:   form.journal.trim(),
      keywords:  form.keywords,
      tags:      form.tags,
      notes:     form.notes.trim(),
      pdfName:   literature?.pdfName ?? null,
      createdAt: literature?.createdAt ?? now,
      updatedAt: now,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? '文献を編集' : '文献を追加'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
              className={INPUT_CLASS}
              placeholder="論文タイトルを入力"
            />
            {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
          </div>

          {/* Authors */}
          <TagInput
            label="著者"
            value={form.authors}
            onChange={v => set('authors', v)}
            placeholder="著者名を入力してEnter"
            colorClass="bg-purple-100 text-purple-800"
          />

          {/* Year + Journal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">発行年</label>
              <input
                type="number"
                value={form.year}
                onChange={e => set('year', e.target.value)}
                className={INPUT_CLASS}
                placeholder="2024"
                min="1000"
                max="2100"
              />
              {errors.year && <p className="text-xs text-red-500 mt-0.5">{errors.year}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ジャーナル / 会議</label>
              <input
                type="text"
                value={form.journal}
                onChange={e => set('journal', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Nature, ICML, ..."
              />
            </div>
          </div>

          {/* Keywords */}
          <TagInput
            label="キーワード"
            value={form.keywords}
            onChange={v => set('keywords', v)}
            placeholder="キーワードを入力してEnter"
            colorClass="bg-emerald-100 text-emerald-800"
          />

          {/* Tags */}
          <TagInput
            label="タグ"
            value={form.tags}
            onChange={v => set('tags', v)}
            placeholder="タグを入力してEnter"
            colorClass="bg-blue-100 text-blue-800"
          />

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className={`${INPUT_CLASS} h-28 resize-none`}
              placeholder="概要・感想・参照箇所など"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            {isEdit ? '保存' : '追加'}
          </button>
        </div>
      </div>
    </div>
  )
}
