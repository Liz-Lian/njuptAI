-- Reference schema for local development.
-- Note: Spring Boot may NOT auto-run this against MySQL unless SQL init is enabled.

CREATE DATABASE IF NOT EXISTS llm_assistant DEFAULT CHARACTER SET utf8mb4;

USE llm_assistant;

CREATE TABLE IF NOT EXISTS chat_message (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	session_id VARCHAR(64) NOT NULL,
	user_id BIGINT NOT NULL,
	user_message TEXT,
	ai_response MEDIUMTEXT,
	create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_chat_message_user_id (user_id),
	INDEX idx_chat_message_session_id (session_id),
	INDEX idx_chat_message_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS session_file (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	session_id VARCHAR(64) NOT NULL,
	file_name VARCHAR(255) NOT NULL,
	create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_session_file_session_id (session_id),
	INDEX idx_session_file_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
