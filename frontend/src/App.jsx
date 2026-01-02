import { useState, useEffect } from "react";
import { apiClient } from "./api/client";
import ChatLayout from "./components/ChatLayout";

function App() {
  const [input, setInput] = useState("");
  // 当前会话 ID（为 null 表示尚未建立会话）
  const [sessionId, setSessionId] = useState(null);
  const [sessionFiles, setSessionFiles] = useState([]);

  // 当前渲染的消息列表
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

  // 初始化：加载历史会话列表
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
  }, [messages]); // messages 变化后刷新侧边栏（保证最新会话置顶）

  useEffect(() => {
    fetchSessionFiles(sessionId);
  }, [sessionId]);

  const handleUploadSuccess = (sid) => {
    if (sessionId !== sid) {
      // 新会话首次上传可能会生成 sid，这里切换到对应会话
      handleSelectSession(sid);
    }
    // 刷新文件列表
    fetchSessionFiles(sid);
  };

  // 切换会话（点击侧边栏）
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

  // 新建对话
  const handleNewChat = () => {
    setSessionId(null); // 清空 ID，表示新会话
    setMessages([{ role: "ai", content: "你好！这是一个新的开始。🌸" }]);
    setSessionFiles([]); // 清空文件列表
  };

  // 删除会话
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

  // 发送消息
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

  // 文件变更回调：上传/删除成功后刷新列表
  const handleFileUpdate = (sid) => {
    // 新会话首次上传可能会生成 sid，这里同步会话状态并刷新侧边栏
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
      sessionFiles={sessionFiles} // 会话文件列表
      onUploadSuccess={handleUploadSuccess} // 上传成功回调
      onFileDeleted={handleFileUpdate} // 删除成功回调
    />
  );
}

export default App;
