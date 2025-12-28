package com.njuptai.backend.controller;

import com.njuptai.backend.entity.ChatMessage;
import com.njuptai.backend.entity.ChatResponse;
import com.njuptai.backend.entity.SessionFile;
import com.njuptai.backend.mapper.SessionFileMapper;
import com.njuptai.backend.service.ChatService;
import com.njuptai.backend.service.RagService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")

public class ChatController {

    private final ChatService chatService;
    private final RagService ragService;
    private final SessionFileMapper sessionFileMapper;

    public ChatController(ChatService chatService, RagService ragService, SessionFileMapper sessionFileMapper) {
        this.chatService = chatService;
        this.ragService = ragService;
        this.sessionFileMapper = sessionFileMapper;
    }

    @PostMapping("/send")
    public ChatResponse chat(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        String sessionId = payload.get("sessionId"); // ✅ 接收前端传来的 sessionId
        Long userId = 1L;

        return chatService.chat(userId, sessionId, message);
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

    // 4. ✅ 删除会话：清理向量库 + 文件表 + 聊天记录 + AI 上下文记忆
    @DeleteMapping("/session/{sessionId}")
    public Map<String, String> deleteSession(@PathVariable String sessionId) {
        try {
            // 1) 查询该会话下所有文件
            List<SessionFile> files = sessionFileMapper.selectBySessionId(sessionId);

            // 2) 先删除向量库数据
            for (SessionFile file : files) {
                ragService.deleteByFileId(file.getId());
            }

            // 3) 再删除文件表记录
            for (SessionFile file : files) {
                sessionFileMapper.deleteById(file.getId());
            }

            // 4) 最后清理聊天记录与 AI 记忆
            chatService.deleteSession(sessionId);

            return Map.of("status", "success", "message", "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "删除失败");
        }
    }

    @PostMapping("/upload")
    public Map<String, String> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "sessionId", required = false) String sessionId
    ) {
        if (sessionId == null || sessionId.isEmpty() || "null".equals(sessionId)) {
            sessionId = java.util.UUID.randomUUID().toString();
        }

        int successCount = 0;

        try {
            for (MultipartFile file : files) {
                // 1. ⏳ 先存入 MySQL，为了获取自增的 ID
                SessionFile sessionFile = SessionFile.builder()
                        .sessionId(sessionId)
                        .fileName(file.getOriginalFilename())
                        .createTime(LocalDateTime.now())
                        .build();

                // 执行 insert 后，MyBatis 会把生成的 ID 回填到 sessionFile 对象里
                sessionFileMapper.insert(sessionFile);
                Long fileId = sessionFile.getId(); // 拿到 ID 了！

                try {
                    // 2. ⚡️ 再存入向量库 (传入刚才拿到的 fileId)
                    InputStreamResource resource = new InputStreamResource(file.getInputStream()) {
                        @Override
                        public String getFilename() {
                            return file.getOriginalFilename();
                        }
                    };

                    // 调用 RagService
                    ragService.importDocument(resource, sessionId, fileId);
                    successCount++;
                } catch (Exception ex) {
                    // ✅ 如果向量入库失败，回滚刚插入的数据库记录，避免脏数据
                    try {
                        sessionFileMapper.deleteById(fileId);
                    } catch (Exception rollbackEx) {
                        rollbackEx.printStackTrace();
                    }
                    ex.printStackTrace();
                    return Map.of("status", "error", "message", "上传失败");
                }
            }

            return Map.of("status", "success", "message", "上传成功", "sessionId", sessionId);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "上传失败");
        }
    }

    // 删除接口也变得超级简单
    @DeleteMapping("/files/{id}")
    public Map<String, String> deleteFile(@PathVariable Long id) {
        try {
            // 1. 调用 RagService 根据 ID 删除向量
            ragService.deleteByFileId(id);

            // 2. 删除数据库记录
            sessionFileMapper.deleteById(id);

            return Map.of("status", "success", "message", "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "删除失败");
        }
    }
    // ✅ 新增接口：获取某会话的文件列表
    @GetMapping("/files")
    public List<SessionFile> getSessionFiles(@RequestParam("sessionId") String sessionId) {
        return sessionFileMapper.selectBySessionId(sessionId);
    }
}