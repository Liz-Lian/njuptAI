import Header from "../Header";
import ChatContent from "./ChatContent";
import ChatInput from "./ChatInput";

function ChatSpace(
  isSidebarOpen,
  setIsSidebarOpen,
  messages,
  input,
  setInput,
  sendMessage,
  isLoading,
  messagesEndRef
) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <ChatContent messages={messages} messagesEndRef={messagesEndRef} />
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default ChatSpace;
