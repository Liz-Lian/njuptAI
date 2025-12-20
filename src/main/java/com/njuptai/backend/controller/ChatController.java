package com.njuptai.backend.controller;

import com.njuptai.backend.entity.ChatMessage;
import com.njuptai.backend.service.ChatService;
import com.njuptai.backend.service.RagService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")

public class ChatController {

    private final ChatService chatService;
    private final RagService ragService;

    public ChatController(ChatService chatService, RagService ragService) {
        this.chatService = chatService;
        this.ragService = ragService;
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

    // ✅ 新增：多文件上传接口
    @PostMapping("/upload")
    public Map<String, String> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        int successCount = 0;
        try {
            for (MultipartFile file : files) {
                // 转换文件流，并手动设置文件名 (Tika 需要文件名来判断类型)
                InputStreamResource resource = new InputStreamResource(file.getInputStream()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();
                    }
                };

                // 调用 Service 存入向量库
                ragService.importDocument(resource);
                successCount++;
            }

            return Map.of("status", "success", "message", "成功学习了 " + successCount + " 个文档！");

        } catch (IOException e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "上传失败：" + e.getMessage());
        }
    }
}