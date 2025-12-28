function File({ file, handleDeleteFile }) {
  return (
    <div
      key={file.id}
      className="bg-white border border-indigo-100 text-blue-600 px-2 py-1 rounded-md text-xs flex items-center gap-1 shadow-sm"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span className="max-w-[150px] truncate" title={file.fileName}>
        {file.fileName}
      </span>
      {/* 🗑️ 删除按钮 */}
      <button
        onClick={() => handleDeleteFile(file.id)}
        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
        title="移除此文档"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export default File;
