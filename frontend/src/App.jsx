import { useState, useEffect } from "react";
import { apiClient } from "./api/client";
import ChatLayout from "./components/ChatLayout";

function App() {
  const [input, setInput] = useState("");
  // 当前的会话 ID (如果是 null 表示正在新建)
  const [sessionId, setSessionId] = useState(null);
  const [sessionFiles, setSessionFiles] = useState([]);

  // 当前显示的消息列表
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "你好呀！我是柚子，点击左侧“新建对话”开始新话题，或者点击历史记录回看。🌸",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  // 侧边栏的会话列表数据
  const [historyList, setHistoryList] = useState([]);

  // ✅ 1. 初始化加载历史会话列表
  const fetchHistory = async () => {
    try {
      const res = await apiClient.get("/chat/history");
      // 后端返回的是 ChatMessage 对象列表，我们需要把它转换成 Sidebar 能用的格式
      const formatted = res.data.map((item) => ({
        id: item.sessionId,
        title: item.userMessage || "无标题会话", // 用第一句用户消息做标题
      }));
      setHistoryList(formatted);
    } catch (e) {
      console.error("加载历史记录失败", e);
    }
  };

  const fetchSessionFiles = async (sid) => {
    if (!sid) {
      setSessionFiles([]); // 新对话，清空文件列表
      return;
    }
    try {
      const res = await apiClient.get(`/chat/files?sessionId=${sid}`);
      setSessionFiles(res.data);
    } catch (e) {
      console.error("加载文件列表失败", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [messages]); // 每当发完消息，重新刷新一下列表（把最新的置顶）

  useEffect(() => {
    fetchSessionFiles(sessionId);
  }, [sessionId]);

  const handleUploadSuccess = (sid) => {
    if (sessionId !== sid) {
      // 如果是新对话生成的 ID，先切换过去
      handleSelectSession(sid);
    }
    // 刷新文件列表
    fetchSessionFiles(sid);
  };

  // ✅ 2. 切换会话 (点击侧边栏)
  const handleSelectSession = async (sid) => {
    setSessionId(sid);
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/chat/session/${sid}`);
      // 把后端返回的数据库记录，转成前端的消息格式
      const msgs = [];
      res.data.forEach((item) => {
        msgs.push({ role: "user", content: item.userMessage });
        msgs.push({ role: "ai", content: item.aiResponse });
      });
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 3. 新建对话
  const handleNewChat = () => {
    setSessionId(null); // 清空 ID，表示新会话
    setMessages([{ role: "ai", content: "你好！这是一个新的开始。🌸" }]);
    setSessionFiles([]); // 清空文件列表
  };

  // ✅ 3.1 删除会话
  const handleDeleteSession = async (sid) => {
    if (!sid) return;

    try {
      await apiClient.delete(`/chat/session/${sid}`);

      // 更新侧边栏列表
      setHistoryList((prev) => prev.filter((item) => item.id !== sid));

      // 如果删除的是当前会话，重置到新会话
      if (sid === sessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error("删除会话失败", error);
      alert("删除会话失败");
    }
  };

  // ✅ 4. 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 发送时带上 sessionId
      const response = await apiClient.post("/chat/send", {
        message: input,
        sessionId: sessionId, // 如果是新对话，这里是 null
      });

      const aiMessage = { role: "ai", content: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);

      // 如果后端返回了新的 sessionId (说明刚才创建了新会话)，我们要更新状态
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "😵 后端连接失败" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 回调：当文件上传或删除成功时，刷新列表
  const handleFileUpdate = (sid) => {
    // 如果是新会话生成的 ID，先切换 ID
    if (sid && sid !== sessionId) {
      setSessionId(sid);
      fetchHistory(); // 刷新侧边栏
    }
    // 刷新文件列表
    fetchSessionFiles(sid || sessionId);
  };

  return (
    <ChatLayout
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
      isLoading={isLoading}
      // 传给 Sidebar 的数据和方法
      historyList={historyList}
      onSelectSession={handleSelectSession}
      onNewChat={handleNewChat}
      onDeleteSession={handleDeleteSession}
      currentSessionId={sessionId}
      sessionFiles={sessionFiles} // 👈 传进去
      onUploadSuccess={handleUploadSuccess} // 👈 传进去
      onFileDeleted={handleFileUpdate} // 删除成功回调
    />
  );
}

export default App;
