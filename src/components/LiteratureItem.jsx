export default function LiteratureItem({ literature, isSelected, onClick }) {
  const { title, authors, year, journal, tags } = literature

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors select-none border-l-2 ${
        isSelected
          ? 'bg-blue-50 border-l-blue-500'
          : 'hover:bg-gray-50 border-l-transparent'
      }`}
    >
      <div className={`text-sm font-medium leading-snug line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
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

      {tags?.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-400">+{tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  )
}
