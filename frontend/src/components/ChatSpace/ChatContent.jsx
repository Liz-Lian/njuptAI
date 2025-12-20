import ChatBubble from "./ChatBubble";

function ChatContent({ messages, messagesEndRef }) {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 scrollbar-hide">
      {messages?.map((msg, index) => (
        <ChatBubble key={index} message={msg} />
      ))}
      {/* 隐形锚点，用于自动滚动 */}
      <div ref={messagesEndRef} />
    </main>
  );
}

export default ChatContent;
