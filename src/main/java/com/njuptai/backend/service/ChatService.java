package com.njuptai.backend.service;

import com.njuptai.backend.entity.ChatMessage;
import com.njuptai.backend.mapper.ChatMessageMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ChatMessageMapper chatMessageMapper;
    private final VectorStore vectorStore;

    // 构造函数
    public ChatService(ChatClient.Builder builder, ChatMessageMapper chatMessageMapper, VectorStore vectorStore) {
        this.chatMessageMapper = chatMessageMapper;
        this.vectorStore = vectorStore;

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
    // ✅ 获取历史列表
    public List<ChatMessage> getHistoryList(Long userId) {
        return chatMessageMapper.selectSessionList(userId);
    }

    // ✅ 获取某次对话详情
    public List<ChatMessage> getSessionMessages(String sessionId) {
        return chatMessageMapper.selectBySessionId(sessionId);
    }

    public String chat(Long userId, String sessionId, String userMessage) {
        // 如果前端没传 sessionId (是新对话)，就生成一个新的 UUID
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = java.util.UUID.randomUUID().toString();
        }

        String conversationId = sessionId;

        // ✅ 自定义 RAG 提示词模板 (防止 AI 用英文回复 context)
        String ragPrompt = """
            请根据以下【参考资料】回答用户的问题。如果资料中没有答案，请使用你自己的知识回答。
            
            【参考资料】：
            {question_answer_context}
            
            【用户问题】：
            {user_text}
            """;

        // 2. 呼叫 AI
        // ❌ 以前的写法：.advisors(new ...Advisor(...))
        // ✅ 官方文档新写法：通过 param 传入 conversationId，Advisor 会自动去查内存
        String aiResponse = chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a
                        .param(ChatMemory.CONVERSATION_ID, conversationId)
                        .advisors(QuestionAnswerAdvisor.builder(vectorStore).build()))
                .call()
                .content();

        // 3. 存档到 MySQL (这部分逻辑不变，为了持久化存储)
        ChatMessage message = ChatMessage.builder()
                .userId(userId)
                .sessionId(sessionId)
                .userMessage(userMessage)
                .aiResponse(aiResponse)
                .createTime(LocalDateTime.now())
                .build();

        chatMessageMapper.insert(message);

        // ✅ 返回 sessionId，因为如果是新对话，前端需要知道生成了啥
        return aiResponse + "||" + sessionId;
        // ⚠️ 小技巧：为了省事，我把 sessionId 拼在回答后面返回，前端再拆开。
        // (规范做法是封装一个对象返回，但咱们先怎么快怎么来)
    }
}
