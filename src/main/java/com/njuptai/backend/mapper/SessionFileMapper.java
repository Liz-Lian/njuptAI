package com.njuptai.backend.mapper;

import com.njuptai.backend.entity.SessionFile;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface SessionFileMapper {
    // 插入记录（表结构仅包含 session_id、file_name、create_time）
    // useGeneratedKeys 用于将自增主键回填到实体，便于后续将 fileId 传递给 RagService
    @Insert("INSERT INTO session_file (session_id, file_name, create_time) VALUES (#{sessionId}, #{fileName}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(SessionFile sessionFile);

    // 查询会话关联的文件列表
    @Select("SELECT * FROM session_file WHERE session_id = #{sessionId} ORDER BY create_time DESC")
    List<SessionFile> selectBySessionId(String sessionId);

    // 删除指定文件记录
    @Delete("DELETE FROM session_file WHERE id = #{id}")
    void deleteById(Long id);

    // 根据 ID 查询单条记录
    @Select("SELECT * FROM session_file WHERE id = #{id}")
    SessionFile selectById(Long id);
}
