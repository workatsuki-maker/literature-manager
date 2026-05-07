export default function LiteratureItem({ literature, isSelected, onClick, onToggleFavorite }) {
  const { title, authors, year, journal, favorite } = literature

  return (
    <div
      onClick={onClick}
      className={`relative px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors select-none border-l-2 ${
        isSelected
          ? 'bg-blue-50 border-l-blue-500'
          : 'hover:bg-gray-50 border-l-transparent'
      }`}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggleFavorite(literature.id, !favorite) }}
        className={`absolute top-2.5 right-2 text-base leading-none transition-colors ${
          favorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
        }`}
        title={favorite ? 'お気に入りを解除' : 'お気に入りに追加'}
      >
        ★
      </button>

      <div className={`text-sm font-medium leading-snug line-clamp-2 pr-5 ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
        {title}
      </div>

      {(authors?.length > 0 || year) && (
        <div className="mt-0.5 text-xs text-gray-500 truncate">
          {authors?.length > 0 && (
            <>
              {authors.slice(0, 2).join(', ')}
              {authors.length > 2 && ' et al.'}
            </>
          )}
          {year && <span className="ml-1 text-gray-400">({year})</span>}
        </div>
      )}

      {journal && (
        <div className="text-xs text-gray-400 truncate mt-0.5 italic">{journal}</div>
      )}
    </div>
  )
}
