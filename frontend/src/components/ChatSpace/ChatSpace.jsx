import Header from "../Header";
import ChatContent from "./ChatContent";
import ChatInput from "./ChatInput";
import Files from "./Files";

function ChatSpace({
  isSidebarOpen,
  setIsSidebarOpen,
  messages,
  input,
  setInput,
  sendMessage,
  isLoading,
  messagesEndRef,
  sessionFiles,
  onUploadSuccess,
  currentSessionId,
  handleDeleteFile
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <ChatContent messages={messages} messagesEndRef={messagesEndRef} />
      <Files sessionFiles={sessionFiles} handleDeleteFile={handleDeleteFile} />
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isLoading={isLoading}
        sessionId={currentSessionId}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
}

export default ChatSpace;
