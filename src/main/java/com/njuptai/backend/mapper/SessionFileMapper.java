package com.njuptai.backend.mapper;

import com.njuptai.backend.entity.SessionFile;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface SessionFileMapper {
    // 1. ✅ 插入：只存 session_id, file_name, create_time
    // (千万别写 vector_ids 了，表里已经没这个字段了)
    // ⚠️ 注意：这里加了 Options 注解，为了让 insert 执行后能把自增 ID 回填给对象
    // 这样 Controller 里才能拿到 fileId 传给 RagService
    @Insert("INSERT INTO session_file (session_id, file_name, create_time) VALUES (#{sessionId}, #{fileName}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(SessionFile sessionFile);

    // 2. 查询列表
    @Select("SELECT * FROM session_file WHERE session_id = #{sessionId} ORDER BY create_time DESC")
    List<SessionFile> selectBySessionId(String sessionId);

    // 3. 删除
    @Delete("DELETE FROM session_file WHERE id = #{id}")
    void deleteById(Long id);

    // (可选) 根据ID查单个，万一以后用得着
    @Select("SELECT * FROM session_file WHERE id = #{id}")
    SessionFile selectById(Long id);
}
