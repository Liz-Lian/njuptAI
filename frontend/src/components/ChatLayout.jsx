import React, { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatSpace/ChatBubble";
import ChatInput from "./ChatSpace/ChatInput";
import Header from "./Header";
import ChatContent from "./ChatSpace/ChatContent";
import Sidebar from "./Sidebar/Sidebar";
import ChatSpace from "./ChatSpace/ChatSpace";

// 这个组件只负责：长什么样、怎么排版、怎么滚动
const ChatLayout = ({ messages, input, setInput, sendMessage, isLoading }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // 滚动条的逻辑属于“视觉交互”，所以放在 Layout 里最合适
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 每当 messages 变了，就自动滚到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen w-screen  bg-slate-50 text-gray-800 font-sans">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
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
      />
    </div>
  );
};

export default ChatLayout;
