import { useState } from "react";
import axios from "axios";
import ChatLayout from "./components/ChatLayout";

function App() {
  // ----------------------------------------------------
  // 1. 纯粹的业务逻辑 (Brain)
  // ----------------------------------------------------
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "你好呀！我是柚子。🌸" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // 乐观更新 UI (先把用户的消息放上去)
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 发送请求
      const response = await axios.post("http://localhost:8080/chat/send", {
        message: input,
      });

      // 接收 AI 回复
      const aiMessage = { role: "ai", content: response.data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "ai",
        content: "😵 糟糕，后端好像断开了...",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // 2. 渲染 (View) - 只需要把数据传给 Layout
  // ----------------------------------------------------
  return (
    <ChatLayout
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
      isLoading={isLoading}
    />
  );
}

export default App;
