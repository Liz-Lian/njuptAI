import React, { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatSpace/ChatBubble";
import ChatInput from "./ChatSpace/ChatInput";
import Header from "./Header";
import ChatContent from "./ChatSpace/ChatContent";
import Sidebar from "./Sidebar/Sidebar";
import ChatSpace from "./ChatSpace/ChatSpace";
import { apiClient } from "../api/client";

// 仅负责页面布局与滚动等 UI 组织逻辑（不承载业务状态）
const ChatLayout = ({
  messages,
  input,
  setInput,
  sendMessage,
  isLoading,
  historyList,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  currentSessionId,
  sessionFiles,
  onUploadSuccess,
  onFileDeleted,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // 自动滚动属于 UI 交互逻辑，放在 Layout 层集中处理
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // messages 变化时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 删除文件
  const handleDeleteFile = async (fileId) => {
    // 删除前二次确认，避免误操作
    if (!window.confirm("确定要移除这个知识库文档吗？")) return;

    try {
      await apiClient.delete(`/chat/files/${fileId}`);

      // 通知父组件刷新列表
      if (onFileDeleted) {
        onFileDeleted(currentSessionId);
      }
    } catch (error) {
      console.error("删除失败", error);
      alert("删除失败");
    }
  };

  return (
    <div className="flex h-screen w-screen  bg-slate-50 text-gray-800 font-sans">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        historyList={historyList} // 列表数据
        onSelectSession={onSelectSession} // 点击事件
        onNewChat={onNewChat} // 新建事件
        currentSessionId={currentSessionId} // 当前选中的ID（用来高亮）
        onDeleteSession={onDeleteSession}
      />
      <ChatSpace
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        sessionFiles={sessionFiles}
        onUploadSuccess={onUploadSuccess}
        currentSessionId={currentSessionId}
        handleDeleteFile={handleDeleteFile}
      />
    </div>
  );
};

export default ChatLayout;
