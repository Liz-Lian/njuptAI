import React from "react";
import { Bot } from "lucide-react";

const UserIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const ChatBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full mt-4 space-x-3 max-w-3xl mx-auto ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI 头像 (左侧) */}
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <Bot size={24} className="text-indigo-600" />
        </div>
      )}

      {/* 消息气泡 */}
      <div
        className={`relative max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-6 
        ${
          isUser
            ? "bg-[#e9eef6] text-gray-800 rounded-br-none"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {/* 用户头像 (右侧) */}
      {isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
