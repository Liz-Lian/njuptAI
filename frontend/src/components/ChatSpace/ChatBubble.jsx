import React from 'react';

// 简单的 SVG 图标，省得找图片
const RobotIcon = () => (
    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ChatBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mt-4 space-x-3 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}>

            {/* AI 头像 (左侧) */}
            {!isUser && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <RobotIcon />
                </div>
            )}

            {/* 消息气泡 */}
            <div className={`relative max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-6 
        ${isUser
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}
            >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>

            {/* 用户头像 (右侧) */}
            {isUser && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <UserIcon />
                </div>
            )}
        </div>
    );
};

export default ChatBubble;