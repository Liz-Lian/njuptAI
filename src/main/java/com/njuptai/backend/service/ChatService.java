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

    // 依赖注入（由 Spring 构造）
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
     * 删除会话数据：清空该会话的对话记忆，并删除持久化的聊天记录。
     */
    public void deleteSession(String sessionId) {
        chatMemory.clear(sessionId);
        chatMessageMapper.deleteBySessionId(sessionId);
    }

    /**
     * 会话与消息查询。
     */
    // 获取历史会话列表（用于侧边栏展示）
    public List<ChatMessage> getHistoryList(Long userId) {
        return chatMessageMapper.selectSessionList(userId);
    }

    // 获取指定会话的消息列表
    public List<ChatMessage> getSessionMessages(String sessionId) {
        return chatMessageMapper.selectBySessionId(sessionId);
    }

    // 获取指定会话关联的文件列表
    public List<SessionFile> getSessionFiles(String sessionId) {
        return sessionFileMapper.selectBySessionId(sessionId);
    }

    public ChatResponse chat(Long userId, String sessionId, String userMessage) {
        // 新会话：前端未传 sessionId 时由后端生成
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = java.util.UUID.randomUUID().toString();
        }

        String conversationId = sessionId;

        String filter = "sessionId == '" + sessionId + "'";

        // RAG 提示词模板：约束回答风格与“资料缺失时”的行为
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

            // 将模板注入到 QuestionAnswerAdvisor，用于基于向量检索结果生成回答
        String aiResponse = chatClient.prompt()
                .user(userMessage)
                .advisors(a -> a
                        .param(ChatMemory.CONVERSATION_ID, conversationId)
                        .param(QuestionAnswerAdvisor.FILTER_EXPRESSION, filter)
                        .advisors(QuestionAnswerAdvisor.builder(vectorStore)
                        .promptTemplate(customPromptTemplate)
                                .build())
                )
                .call()
                .content();

            // 将本轮对话落库，便于历史会话回放
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
