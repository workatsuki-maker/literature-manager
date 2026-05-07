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

          {/* Overview */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            修士論文の作成を支援する文献管理ツールです。登録データはすべてブラウザ内に保存されます（サーバーへの送信なし）。
          </div>

          {/* 文献を追加する */}
          <Section title="文献を追加する">
            <Step num="1">右上の「＋ 文献追加」ボタンをクリック</Step>
            <Step num="2">タイトル（必須）・著者・発行年・ジャーナル・URLなどを入力</Step>
            <Step num="3">「追加」ボタンで登録。左リストに表示されます</Step>
            <div className="mt-2 space-y-1">
              <Tip>著者・キーワード・タグは Enter またはカンマで複数入力できます</Tip>
              <Tip>URL には DOI リンク（https://doi.org/...）や論文ページのURLを登録すると詳細画面から直接開けます</Tip>
            </div>
          </Section>

          {/* PDFを添付する */}
          <Section title="PDFを添付する">
            <Step num="1">左リストから文献を選択し、右の「PDF」タブをクリック</Step>
            <Step num="2">PDFファイルをドラッグ＆ドロップ、またはクリックして選択</Step>
            <Step num="3">ブラウザ上でプレビュー表示されます</Step>
            <div className="mt-2 space-y-1">
              <Tip>PDFはブラウザの IndexedDB に保存されます。ブラウザのキャッシュを削除すると失われますのでご注意ください</Tip>
            </div>
          </Section>

          {/* 検索・絞り込み */}
          <Section title="検索・絞り込み">
            <Tip>上部の検索バーでタイトル・著者・キーワード・ジャーナル・メモを横断検索できます</Tip>
            <Tip>左リスト上部のタグをクリックすると絞り込み。複数タグのAND絞り込みも可能です</Tip>
          </Section>

          {/* CSVインポート */}
          <Section title="CSVインポート（Notion対応）">
            <Step num="1">右上の「CSV取込」ボタンをクリック</Step>
            <Step num="2">CSVファイルをドラッグ＆ドロップ</Step>
            <Step num="3">プレビューを確認して「取り込む」ボタンを押す</Step>
            <div className="mt-2 space-y-1 border border-gray-100 rounded-lg p-3 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-1">認識する列名（一例）</p>
              <Field name="タイトル" desc="title / タイトル / name" />
              <Field name="著者" desc="authors / 著者 / author" />
              <Field name="発行年" desc="year / 発行年 / published year" />
              <Field name="ジャーナル" desc="journal / ジャーナル / venue" />
              <Field name="キーワード" desc="keywords / キーワード" />
              <Field name="タグ" desc="tags / タグ / category" />
              <Field name="メモ" desc="notes / メモ / abstract / 概要" />
              <Field name="URL" desc="url / link / リンク / doi" />
            </div>
          </Section>

          {/* データの保存について */}
          <Section title="データの保存場所">
            <div className="space-y-1">
              <Field name="文献メタ情報" desc="ブラウザの localStorage に保存" />
              <Field name="PDFファイル" desc="ブラウザの IndexedDB に保存" />
            </div>
            <div className="mt-2 space-y-1">
              <Tip>ブラウザのデータをクリアすると登録内容が消えます</Tip>
              <Tip>複数端末での共有には対応していません（同じブラウザ・同じ端末での利用を推奨）</Tip>
              <Tip>定期的に CSV でエクスポート（準備中）してバックアップすることを推奨します</Tip>
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
