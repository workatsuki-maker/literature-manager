import { useEffect } from 'react'

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">{title}</h3>
    <div className="text-sm text-gray-600 space-y-1.5">{children}</div>
  </div>
)

const Step = ({ num, children }) => (
  <div className="flex gap-2">
    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
      {num}
    </span>
    <span>{children}</span>
  </div>
)

const Tip = ({ children }) => (
  <div className="flex gap-1.5 text-xs text-gray-500">
    <span className="shrink-0 text-gray-400">•</span>
    <span>{children}</span>
  </div>
)

const Field = ({ name, desc }) => (
  <div className="flex gap-2 text-xs">
    <span className="w-28 shrink-0 font-medium text-gray-700">{name}</span>
    <span className="text-gray-500">{desc}</span>
  </div>
)

export default function HelpModal({ onClose }) {
  useEffect(() => {
    const onEsc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">RefManager 使い方ガイド</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 文献を追加する */}
          <Section title="文献を追加する">
            <Step num="1">右上の「＋ 文献追加」ボタンをクリック</Step>
            <Step num="2">タイトル（必須）・著者・発行年・出典・URLを入力</Step>
            <Step num="3">PDFを添付する場合は、フォーム下部のエリアにドロップ（任意）</Step>
            <Step num="4">「追加」ボタンで登録。左リストに表示されます</Step>
            <div className="mt-2 space-y-1">
              <Tip>著者はカンマ区切りで複数入力できます（例：山田太郎, 鈴木花子）</Tip>
              <Tip>URL には DOI リンク（https://doi.org/...）や論文ページのURLを登録すると詳細画面から直接開けます</Tip>
            </div>
          </Section>

          {/* 詳細情報の編集 */}
          <Section title="詳細情報を編集する">
            <Tip>文献を選択すると左ペインに詳細情報が表示され、そのまま直接編集できます</Tip>
            <Tip>内容を変更すると「保存」ボタンが表示されます。押すと変更が保存されます</Tip>
            <Tip>右ペインでPDFを見ながら、左ペインのメモ欄に内容を書き込めます</Tip>
          </Section>

          {/* PDFを添付する */}
          <Section title="PDFを添付・表示する">
            <Step num="1">文献を選択すると右ペインにPDFエリアが表示されます</Step>
            <Step num="2">PDFをドラッグ＆ドロップ、またはクリックしてファイルを選択</Step>
            <Step num="3">ブラウザ上でプレビュー表示されます</Step>
            <div className="mt-2 space-y-1">
              <Tip>中央の境界線をドラッグすると左右のペイン幅を調整できます（20〜80%の範囲）</Tip>
              <Tip>PDFはブラウザの IndexedDB に保存されます。ブラウザのデータをクリアすると失われますのでご注意ください</Tip>
            </div>
          </Section>

          {/* お気に入り */}
          <Section title="お気に入り">
            <Tip>リスト内の各文献の右端にある ★ をクリックするとお気に入りに登録されます</Tip>
            <Tip>サイドバー上部の「★ お気に入りのみ」ボタンでお気に入り文献だけを表示できます</Tip>
            <Tip>画面上部に「全〇〇件 / お気に入り〇〇件」が常時表示されます</Tip>
          </Section>

          {/* 検索 */}
          <Section title="検索">
            <Tip>上部の検索バーでタイトル・著者・出典・メモを横断検索できます</Tip>
            <Tip>お気に入りフィルタと検索は組み合わせて使えます</Tip>
          </Section>

          {/* CSVインポート・エクスポート */}
          <Section title="CSVインポート・エクスポート">
            <div className="space-y-1">
              <p className="font-medium text-gray-700 text-xs">インポート（Notion形式対応）</p>
              <Step num="1">右上の「CSV取込」ボタンをクリック</Step>
              <Step num="2">CSVファイルをドラッグ＆ドロップしてプレビューを確認</Step>
              <Step num="3">「取り込む」ボタンで一括登録</Step>
            </div>
            <div className="mt-3 border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-1">
              <p className="text-xs font-medium text-gray-600 mb-1">認識する列名（一例）</p>
              <Field name="タイトル" desc="title / タイトル / name" />
              <Field name="著者" desc="authors / 著者 / author" />
              <Field name="発行年" desc="year / 発行年 / published year" />
              <Field name="出典" desc="journal / ジャーナル / venue / conference" />
              <Field name="メモ" desc="notes / メモ / abstract / 概要" />
              <Field name="URL" desc="url / link / リンク / doi" />
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-medium text-gray-700 text-xs">エクスポート</p>
              <Tip>右上の「CSVエクスポート」ボタンで全文献データをCSVファイルで保存できます</Tip>
              <Tip>出力項目：タイトル・著者・発行年・出典・URL（メモは含まれません）</Tip>
              <Tip>BOM付きUTF-8形式のためExcelでもそのまま開けます</Tip>
            </div>
          </Section>

          {/* データの保存について */}
          <Section title="データの保存場所">
            <div className="space-y-1">
              <Field name="文献メタ情報" desc="Supabase（クラウドDB）に保存 — 複数端末から参照可能" />
              <Field name="PDFファイル" desc="ブラウザの IndexedDB に保存 — 端末ローカルのみ" />
            </div>
            <div className="mt-2 space-y-1">
              <Tip>文献情報はGoogleアカウントに紐づいて保存されます</Tip>
              <Tip>PDFはブラウザのデータをクリアすると失われます。定期的にバックアップを推奨します</Tip>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
