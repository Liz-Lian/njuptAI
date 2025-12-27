function HistoryItem({
  item,
  onSelectSession,
  isSidebarOpen,
  currentSessionId,
}) {
  return (
    <button
      key={item.id}
      onClick={() => onSelectSession(item.id)}
      className={`
                w-full flex items-center rounded-lg text-sm transition-colors group
                ${
                  isSidebarOpen
                    ? "px-3 py-3 gap-3 justify-start"
                    : "p-3 justify-center"
                }
                /* 选中高亮逻辑 */
                ${
                  currentSessionId === item.id
                    ? "bg-gray-100 text-gray-900 font-medium" // 选中历史
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600" // 没选中
                }
              `}
      title={!isSidebarOpen ? item.title : ""}
    >
      <svg
        className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0"
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
