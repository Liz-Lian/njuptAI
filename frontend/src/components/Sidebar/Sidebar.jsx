import React from "react";
import HistoryItem from "./HistoryItem";

// 侧边栏组件：开合状态由父组件控制
const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  historyList,
  onSelectSession,
  onNewChat,
  currentSessionId,
  onDeleteSession,
}) => {
  return (
    <div
      className={`
        bg-[#e9eef6] border-r border-gray-200 h-full flex flex-col py-4 
        transition-all duration-300 ease-in-out 
         ${isSidebarOpen ? "w-72 px-4" : "w-14 px-2"} 
      `}
    >
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`p-2 rounded-lg bg-transparent hover:bg-blue-100 text-gray-600 transition-colors focus:outline-none w-10 h-10 ${
          isSidebarOpen ? "-ml-2" : ""
        }`}
        title={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
      >
        {/* 折叠/展开按钮 */}
        <svg
          className="w-6 h-6 "
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </button>
      {/* 内部容器：通过最小宽度避免换行影响布局 */}
      <div className=" flex justify-center">
        <button
          onClick={onNewChat}
          className={`
            flex items-center justify-center gap-2 bg-blue-100/40 hover:bg-blue-200 text-gray-600 
            font-medium rounded-full transition-all duration-300 border border-gray-200 hover:border-gray-300 border-dashed hover:text-blue-600
            my-3 
            ${isSidebarOpen ? "w-full py-3 px-4" : "w-10 h-10 "}
          `}
          title="新建对话"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          {/* 文字部分：收起时隐藏 */}
          {isSidebarOpen && (
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-100 
              }`}
            >
              新建对话
            </span>
          )}
        </button>
      </div>

      {/* 中间：历史记录列表 */}
      <div className="flex-1 overflow-y-auto  py-2 space-y-1">
        <div
          className={`text-xs font-semibold  text-gray-400 px-6 py-2 uppercase tracking-wider transition-opacity duration-100  ${
            isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
          }`}
        >
          最近记录
        </div>

        {isSidebarOpen &&
          historyList.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onSelectSession={onSelectSession}
              onDeleteSession={onDeleteSession}
              isSidebarOpen={isSidebarOpen}
              currentSessionId={currentSessionId}
            />
          ))}
      </div>

      {/* <User isSidebarOpen={isSidebarOpen} /> */}
    </div>
  );
};

export default Sidebar;
