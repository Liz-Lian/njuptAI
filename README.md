# njuptAI（柚子）

> 说明：这是本人学校课设项目，整体仍在迭代中，还存在很多不完善之处，仅供学习参考。

一个带「会话上下文记忆 + 文件 RAG（检索增强）」的对话式 AI 助手。

- 后端：Spring Boot 3 + Spring AI（ZhipuAI）+ MyBatis + MySQL
- 前端：React + Vite + Tailwind + Axios

---

## 功能一览

- 会话列表：展示历史会话（按最近时间排序）
- 会话详情：查看某个会话的消息记录
- 对话持久化：用户消息与 AI 回复写入 MySQL
- 上下文记忆：通过 Spring AI JDBC ChatMemory Repository 保存会话上下文
- 文档 RAG：上传文档 → 解析/切块 → 写入向量库 → 对话时按会话检索增强
- 知识库管理：
  - 查看当前会话已关联文件
  - 删除文件：删除该文件对应的向量切片 + 文件记录
  - 删除会话：清理该会话的聊天记录 + 文件记录 + 向量库数据 + 上下文记忆

当前限制：

- 未接入用户体系，后端临时将 `userId` 固定为 `1`
- 向量库使用 `SimpleVectorStore`，持久化为本地文件 `vectorstore.json`（适合学习与单机运行，不适合作为生产级向量数据库）

---

## 项目结构

- `src/main/java/com/njuptai/backend/`：后端（Controller/Service/Config/Mapper/Entity）
- `src/main/resources/application.yml`：后端默认配置（支持用环境变量覆盖）
- `src/main/resources/schema.sql`：数据库表参考（需要手动执行）
- `frontend/`：前端工程（Vite）
- `vectorstore.json`：向量库本地持久化文件（已加入 `.gitignore`，不会提交到仓库）

---

## 技术/架构说明（快速理解）

一次“发消息”的主要链路：

1. 前端 `POST /chat/send` 发送 `{message, sessionId}`
2. 后端使用 Spring AI ChatClient：
   - MessageChatMemoryAdvisor：读写会话上下文记忆（conversationId = sessionId）
   - QuestionAnswerAdvisor：从向量库检索并注入参考资料（按 `sessionId` 过滤，仅检索该会话上传的文件）
3. 后端把本次问答写入 MySQL 表 `chat_message`

文档 RAG 的数据分层：

- MySQL：只保存“文件元信息”（表 `session_file`）与“聊天记录”（表 `chat_message`）
- 向量库：保存“文档切片向量 + metadata”（metadata 含 `sessionId` 与 `fileId`）
- 向量库持久化：保存为项目根目录下的 `vectorstore.json`，启动时自动加载

---

## 环境要求

- JDK 17
- Node.js 18+（建议）
- MySQL 8+（或兼容版本）

---

## 本地运行（推荐步骤）

### 1）准备 MySQL 数据库与表

默认数据库名：`llm_assistant`。

你可以直接执行项目里的 [src/main/resources/schema.sql](src/main/resources/schema.sql)（包含 `chat_message` 与 `session_file`）。

注意：

- 该 `schema.sql` 是参考脚本；项目当前不会自动对 MySQL 执行它
- Spring AI 的 JDBC ChatMemory 会在启动时自动初始化它所需的表（由配置 `spring.ai.zhipuai.chat.memory.repository.jdbc.initialize-schema=always` 控制）

### 2）配置后端（推荐使用环境变量）

后端关键配置：

- 数据库：
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
- 模型 API Key：
  - `SPRING_AI_ZHIPUAI_API_KEY`

Windows PowerShell 示例：

```powershell
$env:SPRING_AI_ZHIPUAI_API_KEY = "YOUR_KEY"
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://localhost:3306/llm_assistant?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false"
$env:SPRING_DATASOURCE_USERNAME = "root"
$env:SPRING_DATASOURCE_PASSWORD = "YOUR_PASSWORD"
./mvnw.cmd spring-boot:run
```

也可以使用本地 profile 文件：复制 [src/main/resources/application-local.yml.example](src/main/resources/application-local.yml.example) 为 `src/main/resources/application-local.yml`，然后：

```powershell
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

### 3）启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认地址一般是 `http://localhost:5173`。

前端通过 `VITE_API_BASE_URL` 指向后端（默认 `http://localhost:8080`）。

---

## 配置说明

### 上传大小限制

见 [src/main/resources/application.yml](src/main/resources/application.yml)：

- `spring.servlet.multipart.max-file-size`：单文件最大 50MB
- `spring.servlet.multipart.max-request-size`：单次请求总大小 100MB

### 向量库持久化文件

向量库会保存到项目根目录下 `vectorstore.json`：

- 首次上传/写入后会生成（或更新）该文件
- 后端启动时如果检测到该文件会自动加载
- 若你希望“清空全部知识库”，可以删除 `vectorstore.json`（下次启动会变成空向量库）

---

## 后端 API（可直接用 curl 测试）

统一前缀：`/chat`

### 1）发送消息

`POST /chat/send`

```bash
curl -X POST http://localhost:8080/chat/send \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"你好\",\"sessionId\":null}"
```

返回示例（字段以实际为准）：

```json
{ "answer": "...", "sessionId": "..." }
```

说明：

- `sessionId` 为空/不传时，后端会生成新的会话 ID
- RAG 检索会按 `sessionId` 过滤，仅检索“该会话上传的文档”

### 2）获取会话列表

`GET /chat/history`

```bash
curl http://localhost:8080/chat/history
```

### 3）获取会话详情

`GET /chat/session/{sessionId}`

```bash
curl http://localhost:8080/chat/session/YOUR_SESSION_ID
```

### 4）上传文件（多文件）

`POST /chat/upload`（multipart/form-data）

```bash
curl -X POST http://localhost:8080/chat/upload \
  -F "sessionId=YOUR_SESSION_ID" \
  -F "files=@/path/to/a.pdf" \
  -F "files=@/path/to/b.txt"
```

说明：

- `sessionId` 可选：不传/为空则后端会生成新的会话 ID 并在响应里返回
- 上传时会先写入 `session_file` 拿到 `fileId`，再写入向量库；若向量写入失败会回滚该文件记录

### 5）查看会话已关联文件

`GET /chat/files?sessionId=...`

```bash
curl "http://localhost:8080/chat/files?sessionId=YOUR_SESSION_ID"
```

### 6）删除文件

`DELETE /chat/files/{id}`

```bash
curl -X DELETE http://localhost:8080/chat/files/123
```

### 7）删除会话

`DELETE /chat/session/{sessionId}`

```bash
curl -X DELETE http://localhost:8080/chat/session/YOUR_SESSION_ID
```

该操作会清理：

- 向量库中属于该会话下文件的向量切片
- MySQL 表 `session_file` 中该会话的文件记录
- MySQL 表 `chat_message` 中该会话的聊天记录
- Spring AI JDBC ChatMemory 中该会话的上下文记忆

---

## 常见问题（FAQ）

### 1）RAG 突然“不引用资料”了

- 确认当前会话确实上传过文件，并且在“已关联知识库”里能看到文件
- 检查项目根目录是否存在 `vectorstore.json`，以及后端启动日志是否提示“已加载向量库文件”
- 如果 `vectorstore.json` 内容损坏/无写权限，可能导致无法加载或无法保存

### 2）为什么检索不到别的会话上传的文件？

这是设计使然：向量切片带有 `sessionId` 标签，检索会按 `sessionId` 过滤，保证“知识库与会话绑定”。

### 3）为什么没有登录/多用户？

目前为简化实现，后端 `userId` 固定为 `1`。若要多用户，需要接入登录鉴权，并将 `userId` 从请求上下文中取出。

---

## 开发命令

- 后端测试：

```bash
./mvnw.cmd test
```

- 前端构建：

```bash
cd frontend
npm run build
```
