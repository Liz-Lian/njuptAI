import React from "react";

const ChatInput = ({ input, setInput, sendMessage, isLoading }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 w-full">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 bg-gray-50 p-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            placeholder="和我说点什么吧..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-gray-700 resize-none h-10 leading-6 placeholder-gray-400"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input?.trim()}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2
              ${
                isLoading || !input?.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transform active:scale-95"
              }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                思考中
              </span>
            ) : (
              "发送"
            )}
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-gray-400">
          Powered by Spring AI & React
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
