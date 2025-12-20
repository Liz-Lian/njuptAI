import React from "react";
import HistoryItem from "./HistoryItem";
import User from "./User";

// 接收 isOpen 属性，由父组件控制开还是关
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const historyItems = [
    { id: 1, title: "关于 Java 并发的讨论" },
    { id: 2, title: "SpringBoot 报错调试" },
    { id: 3, title: "React 组件拆分建议" },
    { id: 4, title: "中午吃什么？" },
  ];

  return (
    <div
      className={`
        bg-white border-r border-gray-200 h-full flex flex-col 
        transition-all duration-300 ease-in-out
         ${isSidebarOpen ? "w-64" : "w-10"} 
      `}
    >
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none w-10 h-10"
        title={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
      >
        {/* 图标会根据状态稍微变一下，或者一直用这个汉堡图标 */}
        <svg
          className="w-6 h-6"
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
      {/* 内部容器：设置 min-w-64 防止文字换行导致的排版崩坏 */}
      <div className=" flex justify-center">
        <button
          className={`
            flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 
            font-medium rounded-xl transition-all duration-300 border border-indigo-200 border-dashed
            ${
              isSidebarOpen ? "w-full py-3 px-4" : "w-10 h-10 "
            } /* 收起时变成圆钮 */
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

          {/* 文字部分：收起时隐藏，并且不占位 (w-0 overflow-hidden) */}
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
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div
          className={`text-xs font-semibold text-gray-400 px-6 py-2 uppercase tracking-wider transition-opacity duration-100 ${
            isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
          }`}
        >
          最近记录
        </div>

        {isSidebarOpen &&
          historyItems.map((item) => <HistoryItem key={item.id} item={item} />)}
      </div>

      {/* <User isSidebarOpen={isSidebarOpen} /> */}
    </div>
  );
};

export default Sidebar;
