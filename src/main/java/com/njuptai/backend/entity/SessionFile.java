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
public class SessionFile {
    private Long id;
    private String sessionId;
    private String fileName;
    private LocalDateTime createTime;
}
