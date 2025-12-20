package com.njuptai.backend.controller;

import com.njuptai.backend.entity.ChatMessage;
import com.njuptai.backend.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")

public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/send")
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        String sessionId = payload.get("sessionId"); // ✅ 接收前端传来的 sessionId
        Long userId = 1L;

        // 调用 Service
        String rawResponse = chatService.chat(userId, sessionId, message);

        // 拆解 Service 返回的 "回复||sessionId"
        String[] parts = rawResponse.split("\\|\\|");
        String aiResponse = parts[0];
        String newSessionId = parts.length > 1 ? parts[1] : sessionId;

        return Map.of("response", aiResponse, "sessionId", newSessionId);
    }
    // 2. ✅ 获取会话列表接口
    @GetMapping("/history")
    public List<ChatMessage> getHistory() {
        Long userId = 1L;
        return chatService.getHistoryList(userId);
    }

    // 3. ✅ 获取某个会话详情接口
    @GetMapping("/session/{sessionId}")
    public List<ChatMessage> getSessionDetail(@PathVariable String sessionId) {
        return chatService.getSessionMessages(sessionId);
    }
}