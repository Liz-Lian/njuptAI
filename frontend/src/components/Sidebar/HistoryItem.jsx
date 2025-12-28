function HistoryItem({
  item,
  onSelectSession,
  onDeleteSession,
  isSidebarOpen,
  currentSessionId,
}) {
  const handleDeleteClick = (e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        "确定要删除这个会话吗？该操作将同时清理聊天记录和知识库数据。"
      )
    ) {
      return;
    }

    if (onDeleteSession) {
      onDeleteSession(item.id);
    }
  };

  return (
    <div
      onClick={() => onSelectSession(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelectSession(item.id);
        }
      }}
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
                    ? "bg-blue-100 text-[#0842a0] font-medium" // 选中历史
                    : "text-gray-600 hover:bg-blue-100 hover:text-blue-600" // 没选中
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

      {isSidebarOpen && (
        <button
          type="button"
          onClick={handleDeleteClick}
          className="ml-auto p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-white transition-opacity"
          title="删除会话"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default HistoryItem;
