# njuptAI（柚子）

一个带“会话记忆 + 文件 RAG”的对话式 AI 助手示例项目：

- 后端：Spring Boot 3 + Spring AI（智谱 ZhipuAI）+ MyBatis + MySQL
- 前端：React + Vite + Tailwind + Axios
- 支持：会话列表/会话详情、消息持久化、上传文件做 RAG、按文件删除向量

> 说明：当前代码中用户体系尚未接入，后端临时将 `userId` 固定为 `1`。

---

## 目录结构

- `src/main/java/...`：Spring Boot 后端
- `src/main/resources/application.yml`：后端配置（端口、数据库、ZhipuAI Key 等）
- `src/main/resources/mapper/`：MyBatis XML 映射
- `frontend/`：前端工程（Vite）

---

## 环境要求

- JDK 17（后端 `pom.xml` 指定）
- Node.js 18+（建议）
- MySQL 8+（或兼容版本）

---

## 快速开始（本地开发）

### 1）准备数据库

后端默认连接：`jdbc:mysql://localhost:3306/llm_assistant`。

在 MySQL 中创建库与表（示例 SQL，按需调整字段/索引）：

```sql
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
```

> 备注：项目里 `src/main/resources/schema.sql` 目前仅作为参考，不一定会被自动执行（取决于 Spring SQL init 配置）。

### 2）配置后端（ZhipuAI Key + 数据库）

后端不建议在仓库里明文写入数据库密码 / API Key。

当前项目已改为通过环境变量注入：

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_AI_ZHIPUAI_API_KEY`

你也可以使用本地 profile 文件：复制 `src/main/resources/application-local.yml.example` 为 `src/main/resources/application-local.yml`（该文件会被 `.gitignore` 忽略，不会提交）。

### 3）启动后端

Windows（项目根目录）：

```bash
mvnw.cmd spring-boot:run
```

如果你使用本地 profile 文件（`application-local.yml`）：

```bash
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

启动后默认端口：`http://localhost:8080`。

### 4）启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认端口：Vite 通常为 `http://localhost:5173`。

> 提示：前端通过环境变量 `VITE_API_BASE_URL` 配置后端地址。
>
> - 将 `frontend/.env.example` 复制为 `frontend/.env.local`
> - 按需修改：`VITE_API_BASE_URL=http://localhost:8080`

---

## 功能说明

### 会话与消息

- 会话 ID：由前端传入（已有会话）或后端生成 UUID（新会话）
- 消息持久化：写入 MySQL 表 `chat_message`

### 文件 RAG（检索增强）

- 上传文件：后端使用 Spring AI + Apache Tika 解析文档，并切分为文本块写入向量库
- 向量库：当前使用 `SimpleVectorStore`（内存型）
  - 重启后端会丢失向量数据（数据库里仅保存文件元信息）
  - 删除文件时会按 `fileId` 过滤删除对应向量切片

上传大小限制（见 `application.yml`）：

- 单文件默认最大 50MB
- 单次请求默认最大 100MB

---

## 配置说明（建议）

本项目已将敏感配置（数据库密码、第三方 API Key）改为通过环境变量注入，仓库中的 `src/main/resources/application.yml` 仅保留占位符/默认值，不包含真实密钥。

建议：不要把真实密钥写进仓库文件；本地请使用环境变量或本地 profile 配置文件。

常用环境变量（Spring Boot 约定格式）：

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_AI_ZHIPUAI_API_KEY`

Windows PowerShell 临时设置环境变量并启动（只对当前终端会话生效）：

```powershell
$env:SPRING_AI_ZHIPUAI_API_KEY = "你的新Key"
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/llm_assistant?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "你的数据库密码"
mvnw.cmd spring-boot:run
```

（可选）使用本地 profile 文件：复制 `src/main/resources/application-local.yml.example` 为 `src/main/resources/application-local.yml`，填入你的配置，然后用 profile 启动：

```powershell
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 后端接口（REST）

统一前缀：`/chat`

- `POST /chat/send`

  - Body（JSON）：`{"message":"...","sessionId":"..."}`（`sessionId` 可空/不传）
  - Response：`{"answer":"...","sessionId":"..."}`

- `GET /chat/history`

  - 返回当前用户（暂固定 userId=1）的会话列表（每个 session 一条摘要）

- `GET /chat/session/{sessionId}`

  - 返回某个会话的所有消息记录

- `POST /chat/upload`（multipart/form-data）

  - 参数：`files`（可多文件），`sessionId`（可选）
  - 返回：`status/message/sessionId`

- `GET /chat/files?sessionId=...`

  - 返回某会话已上传文件列表

- `DELETE /chat/files/{id}`
  - 按文件记录 ID 删除：先删向量，再删 `session_file` 记录

---

## 常见问题

- **为什么上传文件后重启后端，RAG 失效？**

  - 当前向量库是内存型 `SimpleVectorStore`，重启会清空。

- **为什么没有登录系统？**
  - 目前后端代码写死 `userId=1`，如果要多用户需要引入登录与鉴权，并把 `userId` 从请求上下文中取。

---

## 开发者命令

- 后端测试：

```bash
mvnw.cmd test
```

- 前端构建：

```bash
cd frontend
npm run build
```

---

## License

未声明（按需补充）。
