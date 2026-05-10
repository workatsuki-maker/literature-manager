import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vercel 環境変数が未設定の場合に画面に表示するエラーメッセージ
export const configError = (!supabaseUrl || !supabaseKey)
  ? `Supabase 環境変数が未設定です（Vercel ダッシュボード → Settings → Environment Variables で確認）: ${[
      !supabaseUrl && 'VITE_SUPABASE_URL',
      !supabaseKey && 'VITE_SUPABASE_ANON_KEY',
    ].filter(Boolean).join(', ')}`
  : null

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder',
  {
    auth: {
      flowType: 'implicit',
    },
  }
)

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    authors: row.authors ?? [],
    year: row.year,
    journal: row.journal ?? '',
    notes: row.notes ?? '',
    url: row.url ?? '',
    pdfName: row.pdf_name,
    favorite: row.favorite ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRow(lit, userId) {
  return {
    id: lit.id,
    user_id: userId,
    title: lit.title,
    authors: lit.authors,
    year: lit.year,
    journal: lit.journal,
    notes: lit.notes,
    url: lit.url,
    pdf_name: lit.pdfName,
    favorite: lit.favorite ?? false,
    created_at: lit.createdAt,
    updated_at: lit.updatedAt,
  }
}

export const pdfStorage = {
  async upload(userId, litId, file) {
    const path = `${userId}/${litId}.pdf`
    const { error } = await supabase.storage.from('pdfs').upload(path, file, { upsert: true })
    if (error) throw error
  },

  async getSignedUrl(userId, litId) {
    const path = `${userId}/${litId}.pdf`
    const { data, error } = await supabase.storage.from('pdfs').createSignedUrl(path, 3600)
    if (error) return null
    return data?.signedUrl ?? null
  },

  async remove(userId, litId) {
    const path = `${userId}/${litId}.pdf`
    await supabase.storage.from('pdfs').remove([path])
  },
}

export const litDB = {
  async fetchAll(userId) {
    const { data, error } = await supabase
      .from('literatures')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(fromRow)
  },

  async insert(lit, userId) {
    const { error } = await supabase.from('literatures').insert(toRow(lit, userId))
    if (error) throw error
  },

  async update(lit, userId) {
    const { error } = await supabase
      .from('literatures')
      .update(toRow(lit, userId))
      .eq('id', lit.id)
    if (error) throw error
  },

  async remove(id) {
    const { error } = await supabase.from('literatures').delete().eq('id', id)
    if (error) throw error
  },

  async insertMany(lits, userId) {
    const { error } = await supabase
      .from('literatures')
      .insert(lits.map(l => toRow(l, userId)))
    if (error) throw error
  },
}
