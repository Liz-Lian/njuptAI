package com.njuptai.backend.controller;

import com.njuptai.backend.service.ChatService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/chat")
// 允许跨域，方便后面写前端时直接调用
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/send")
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        // 1. 获取前端发来的消息
        String message = payload.get("message");

        // 2. 暂时把用户ID写死为 1L (等以后做登录了再改)
        Long userId = 1L;

        // 3. 调用 Service 获得 AI 回答
        String response = chatService.chat(userId, message);

        // 4. 返回 JSON 格式给前端
        return Map.of("response", response);
    }
}