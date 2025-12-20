package com.njuptai.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private Long id;

    // 对应数据库的 session_id
    private String sessionId;

    // 对应 user_id
    private Long userId;

    // 对应 user_message
    private String userMessage;

    // 对应 ai_response
    private String aiResponse;

    // 对应 create_time
    private LocalDateTime createTime;
}
