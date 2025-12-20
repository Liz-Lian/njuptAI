function HistoryItem({ item }) {
  return (
    <button
      key={item.id}
      className="w-full text-left px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center gap-3 group whitespace-nowrap"
    >
      <svg
        className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <span className="truncate">{item.title}</span>
    </button>
  );
}

export default HistoryItem;
