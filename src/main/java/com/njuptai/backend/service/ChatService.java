package com.njuptai.backend.service;

import com.njuptai.backend.entity.ChatMessage;
import com.njuptai.backend.mapper.ChatMessageMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ChatMessageMapper chatMessageMapper;

    // 构造函数
    public ChatService(ChatClient.Builder builder, ChatMessageMapper chatMessageMapper) {
        this.chatMessageMapper = chatMessageMapper;

        // 1. 按照官方文档：构建一个“消息窗口记忆”，默认保存在内存里
        // maxMessages(10) 表示只保留最近 10 条记录，防止 token 爆炸
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .maxMessages(10)
                .build();

        this.chatClient = builder

                .defaultSystem("你是一个乐于助人的AI助手，名字叫柚子，专注于帮助用户解决各种问题，请用中文回答")
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    /**
     * 核心业务逻辑
     */
    public String chat(Long userId, String userMessage) {

        // 1. 准备 Conversation ID (官方文档要求的 conversationId)
        // 我们用 userId 来区分不同的人，也可以拼上 "session_"
        String conversationId = String.valueOf(userId);

        // 2. 呼叫 AI
        // ❌ 以前的写法：.advisors(new ...Advisor(...))
        // ✅ 官方文档新写法：通过 param 传入 conversationId，Advisor 会自动去查内存
        String aiResponse = chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                .call()
                .content();

        // 3. 存档到 MySQL (这部分逻辑不变，为了持久化存储)
        String sessionId = "session_default_" + userId;
        ChatMessage message = ChatMessage.builder()
                .userId(userId)
                .sessionId(sessionId)
                .userMessage(userMessage)
                .aiResponse(aiResponse)
                .createTime(LocalDateTime.now())
                .build();

        chatMessageMapper.insert(message);

        return aiResponse;
    }
}
