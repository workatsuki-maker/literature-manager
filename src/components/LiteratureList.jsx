import LiteratureItem from './LiteratureItem'

export default function LiteratureList({
  literatures,
  selected,
  favoriteOnly,
  onFavoriteOnlyChange,
  onSelect,
  onToggleFavorite,
  totalCount,
}) {
  return (
    <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Favorite filter */}
      <div className="p-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={() => onFavoriteOnlyChange(!favoriteOnly)}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            favoriteOnly
              ? 'bg-yellow-400 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ★ お気に入りのみ
        </button>
      </div>

      {/* Count */}
      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 bg-gray-50 flex items-center">
        <span>
          {literatures.length === totalCount
            ? `${totalCount} 件`
            : `${literatures.length} / ${totalCount} 件`}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {literatures.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            <p>文献が見つかりません</p>
          </div>
        ) : (
          literatures.map(lit => (
            <LiteratureItem
              key={lit.id}
              literature={lit}
              isSelected={selected?.id === lit.id}
              onClick={() => onSelect(lit)}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>
    </aside>
  )
}
