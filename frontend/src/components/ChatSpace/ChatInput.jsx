import { apiClient } from "../../api/client";
import React, { useRef, useState } from "react";

const ChatInput = ({
  input,
  setInput,
  sendMessage,
  isLoading,
  sessionId,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 多文件上传
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    // 传递当前 sessionId；为空时由后端生成新会话 ID
    formData.append("sessionId", sessionId || "");

    try {
      // 发请求
      const res = await apiClient.post("/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // 新会话首次上传可能会生成新的 sessionId，这里通知父组件更新
      if (res.data.sessionId && res.data.sessionId !== sessionId) {
        onUploadSuccess(res.data.sessionId);
      } else {
        onUploadSuccess(sessionId); // 仅刷新文件列表
      }
      alert("上传成功！");
    } catch (error) {
      console.error(error);
      alert("上传失败，请检查文件大小限制。");
    } finally {
      setIsUploading(false);
      e.target.value = null; // 重置 input，允许重复选择同一文件
    }
  };

  return (
    <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 w-full">
      <div className="max-w-3xl mx-auto flex gap-3 items-center">
        {/* 上传按钮 */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple // 支持多选
            accept=".pdf,.docx,.doc,.txt,.md,.json,.pptx,.xlsx" // 允许的文件类型
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
            className={`p-2 rounded-full transition-colors border ${
              isUploading
                ? "bg-gray-100 cursor-wait"
                : "hover:bg-gray-100 text-gray-500 hover:text-blue-600 border-transparent"
            } focus:outline-none focus:ring-0`}
            title="上传文档 (支持多选)"
          >
            {/* 图标 */}
            <svg
              className="w-6 h-6"
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
          </button>
        </div>
        <div className="flex flex-1 gap-3 bg-gray-50 p-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all focus:border-none">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            placeholder="和我说点什么吧..."
            className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-4 py-2 text-gray-700 resize-none h-10 leading-6 placeholder-gray-400"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input?.trim()}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2
              ${
                isLoading || !input?.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform active:scale-95"
              } focus:outline-none focus:ring-0`}
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
      </div>
      <div className="text-center mt-2 text-xs text-gray-400">
        Powered by Spring AI & React
      </div>
    </div>
  );
};

export default ChatInput;
