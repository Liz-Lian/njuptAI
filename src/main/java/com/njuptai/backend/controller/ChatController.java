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
        String sessionId = payload.get("sessionId"); // 可为空：新会话由后端生成
        Long userId = 1L;

        return chatService.chat(userId, sessionId, message);
    }

    // 获取会话列表
    @GetMapping("/history")
    public List<ChatMessage> getHistory() {
        Long userId = 1L;
        return chatService.getHistoryList(userId);
    }

    // 获取指定会话的消息详情
    @GetMapping("/session/{sessionId}")
    public List<ChatMessage> getSessionDetail(@PathVariable String sessionId) {
        return chatService.getSessionMessages(sessionId);
    }

    // 删除会话：删除向量切片与文件记录，并清理聊天记录与会话记忆
    @DeleteMapping("/session/{sessionId}")
    public Map<String, String> deleteSession(@PathVariable String sessionId) {
        try {
            // 查询会话下的文件列表
            List<SessionFile> files = sessionFileMapper.selectBySessionId(sessionId);

            // 删除向量库中与文件关联的切片
            for (SessionFile file : files) {
                ragService.deleteByFileId(file.getId());
            }

            // 删除文件表记录
            for (SessionFile file : files) {
                sessionFileMapper.deleteById(file.getId());
            }

            // 清理聊天记录与会话记忆
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
            // 先写入文件记录以获取 fileId（用于向量切片关联）
                SessionFile sessionFile = SessionFile.builder()
                        .sessionId(sessionId)
                        .fileName(file.getOriginalFilename())
                        .createTime(LocalDateTime.now())
                        .build();

            // insert 后 MyBatis 会将自增主键回填到 sessionFile.id
                sessionFileMapper.insert(sessionFile);
            Long fileId = sessionFile.getId();

                try {
                    // 写入向量库（传入刚获取的 fileId 用于关联与删除）
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
                    // 若向量入库失败，则回滚文件记录，避免遗留无效数据
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

    // 删除单个文件：先删向量切片，再删文件记录
    @DeleteMapping("/files/{id}")
    public Map<String, String> deleteFile(@PathVariable Long id) {
        try {
            // 删除向量切片
            ragService.deleteByFileId(id);

            // 删除数据库记录
            sessionFileMapper.deleteById(id);

            return Map.of("status", "success", "message", "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "删除失败");
        }
    }

    // 获取会话关联的文件列表
    @GetMapping("/files")
    public List<SessionFile> getSessionFiles(@RequestParam("sessionId") String sessionId) {
        return sessionFileMapper.selectBySessionId(sessionId);
    }
}