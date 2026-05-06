import LiteratureItem from './LiteratureItem'

export default function LiteratureList({
  literatures,
  selected,
  allTags,
  activeTagFilters,
  onTagFiltersChange,
  onSelect,
  totalCount,
}) {
  const toggleTag = tag => {
    onTagFiltersChange(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="p-3 border-b border-gray-100 flex flex-wrap gap-1">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                activeTagFilters.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Count + clear */}
      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 bg-gray-50 flex items-center">
        <span>
          {literatures.length === totalCount
            ? `${totalCount} 件`
            : `${literatures.length} / ${totalCount} 件`}
        </span>
        {activeTagFilters.length > 0 && (
          <button
            onClick={() => onTagFiltersChange([])}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            フィルタをクリア
          </button>
        )}
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
            />
          ))
        )}
      </div>
    </aside>
  )
}
