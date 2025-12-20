package com.njuptai.backend.mapper;

import com.njuptai.backend.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ChatMessageMapper {
    // 保存一条聊天记录
    int insert(ChatMessage chatMessage);

    List<ChatMessage> selectSessionList(Long userId);
    List<ChatMessage> selectBySessionId(String sessionId);

}
