package com.njuptai.backend.service;

import com.njuptai.backend.entity.ChatResponse;
import com.njuptai.backend.entity.ChatMessage;
import com.njuptai.backend.entity.SessionFile;
import com.njuptai.backend.mapper.ChatMessageMapper;
import com.njuptai.backend.mapper.SessionFileMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ChatMessageMapper chatMessageMapper;
    private final SessionFileMapper sessionFileMapper;
    private final VectorStore vectorStore;
    private final ChatMemory chatMemory;

    // 构造函数
    public ChatService(ChatClient.Builder builder, ChatMessageMapper chatMessageMapper, VectorStore vectorStore, SessionFileMapper sessionFileMapper, ChatMemory chatMemory) {
        this.chatMessageMapper = chatMessageMapper;
        this.sessionFileMapper = sessionFileMapper;
        this.vectorStore = vectorStore;
        this.chatMemory = chatMemory;

        this.chatClient = builder
                .defaultSystem("你是一个乐于助人的AI助手，名字叫柚子，专注于帮助用户解决各种问题，请用中文回答")
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    /**
     * 🗑️ 删除会话：清空 AI 上下文记忆 + 删除数据库聊天记录
     */
    public void deleteSession(String sessionId) {
        chatMemory.clear(sessionId);
        chatMessageMapper.deleteBySessionId(sessionId);
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

    // ✅ 新增：获取当前会话的文件列表
    public List<SessionFile> getSessionFiles(String sessionId) {
        return sessionFileMapper.selectBySessionId(sessionId);
    }

    public ChatResponse chat(Long userId, String sessionId, String userMessage) {
        // 如果前端没传 sessionId (是新对话)，就生成一个新的 UUID
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = java.util.UUID.randomUUID().toString();
        }

        String conversationId = sessionId;

        String filter = "sessionId == '" + sessionId + "'";

        // ✅ 自定义 RAG 提示词模板 (防止 AI 用英文回复 context)
// 1. 定义新的 PromptTemplate
        PromptTemplate customPromptTemplate = PromptTemplate.builder()
                // 使用默认的 { } 定界符即可，或者按文档用 .renderer() 自定义
                .template("""
                你现在是【柚子】。请根据以下参考资料回答问题。
                如果资料中没有答案，请使用你自己的知识回答，并说明该回答非来自资料。
                
                【用户问题】：
                {query}
                
                【参考资料】：
                ---------------------
                {question_answer_context}
                ---------------------
                """)
                .build();

        // 2. 将其注入到 Advisor 中
        String aiResponse = chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a
                        .param(ChatMemory.CONVERSATION_ID, conversationId)
                        .param(QuestionAnswerAdvisor.FILTER_EXPRESSION, filter)
                        .advisors(QuestionAnswerAdvisor.builder(vectorStore)
                                .promptTemplate(customPromptTemplate) // ✅ 使用新版推荐方法
                                .build())
                )
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

        return new ChatResponse(aiResponse, sessionId);
    }
}
