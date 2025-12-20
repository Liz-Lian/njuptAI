package com.njuptai.backend.mapper;

import com.njuptai.backend.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ChatMessageMapper {
    // 保存一条聊天记录
    int insert(ChatMessage chatMessage);
    
}
