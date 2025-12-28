import File from "./File";

function Files({ sessionFiles = [], handleDeleteFile }) {
  return (
    <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex gap-2 flex-wrap items-center shadow-inner">
      <span className="text-xs text-gray-400 flex items-center gap-1">
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
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        已关联知识库:
      </span>
      {sessionFiles.map((file) => (
        <File key={file.id} file={file} handleDeleteFile={handleDeleteFile} />
      ))}
    </div>
  );
}

export default Files;
