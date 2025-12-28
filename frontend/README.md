# njuptAI Frontend

该目录为前端工程（Vite + React + Tailwind），用于调用后端接口完成：

- 会话列表/会话详情展示
- 发送消息
- 上传文件并进行 RAG
- 删除会话文件（并触发后端删除向量）
- 删除会话（并触发后端清理聊天记录/文件/向量库/上下文记忆）

更多整体说明见项目根目录 README。

---

## 环境要求

- Node.js 18+（建议）
- npm 9+（或 pnpm/yarn 亦可自行调整）

---

## 本地启动

```bash
npm install
npm run dev
```

默认会在 `http://localhost:5173` 启动。

---

## 后端依赖

请确保后端已启动：`http://localhost:8080`。

前端通过环境变量 `VITE_API_BASE_URL` 配置后端地址：

- 复制示例：将 `frontend/.env.example` 复制为 `frontend/.env.local`
- 修改为你的后端地址，例如：`VITE_API_BASE_URL=http://localhost:8080`

---

## 构建与预览

```bash
npm run build
npm run preview
```
