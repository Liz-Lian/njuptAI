package com.njuptai.backend.service;


import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {
    private final VectorStore vectorStore;

    public RagService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    private File getVectorStoreFile() {
        Path projectRoot = Paths.get(System.getProperty("user.dir"));
        return projectRoot.resolve("vectorstore.json").toFile();
    }


    /**
     * 📥 导入文档
     * @param fileId  关键修改：传入数据库里的文件ID，用来做唯一标记
     */
    public void importDocument(Resource resource, String sessionId, Long fileId) {
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        List<Document> documents = reader.get();

        TokenTextSplitter splitter = new TokenTextSplitter(300, 100, 5, 10000, true);
        List<Document> splitDocuments = splitter.apply(documents);

        // 🏷️ 打标签：给每个碎片贴上 sessionId 和 fileId
        for (Document doc : splitDocuments) {
            doc.getMetadata().put("sessionId", sessionId);
            // 注意：为了 Filter 表达式匹配方便，建议转成 String 存储
            doc.getMetadata().put("fileId", String.valueOf(fileId));
        }

        vectorStore.add(splitDocuments);

        if (vectorStore instanceof SimpleVectorStore simpleStore) {
            File file = getVectorStoreFile();
            try {
                simpleStore.save(file);
            } catch (Exception e) {
                System.err.println("⚠️ 向量库持久化保存失败（add 后）: " + file.getAbsolutePath());
                e.printStackTrace();
            }
        }
        System.out.println("✅ 已存入文件，Tag: [session=" + sessionId + ", file=" + fileId + "]");
    }

    /**
     * 🗑️ 修复版删除：先搜 ID，再删 ID
     */
    public void deleteByFileId(Long fileId) {
        // 1. 构造检索请求：虽然我们要删的是 vector，但 SimpleVectorStore 必须要先搜出来
        // 我们用一个空格作为 query，重点是后面的 filterExpression
        // ✅ 新写法 (Builder 模式):
        SearchRequest request = SearchRequest.builder()
                .query(" ") // 搜索内容为空，只为了匹配 Filter
                .filterExpression("fileId == '" + fileId + "'") // 过滤条件
                .topK(10000) // 尽量多搜一点，确保删干净
                .similarityThreshold(0.0) // 相似度阈值设为0
                .build();

        // 2. 执行搜索
        List<Document> documents = vectorStore.similaritySearch(request);

        // 3. 提取所有切片的 ID
        List<String> ids = documents.stream()
                .map(Document::getId)
                .collect(Collectors.toList());

        // 4. 调用支持的 delete(List<String> ids) 接口
        if (!ids.isEmpty()) {
            vectorStore.delete(ids);

            if (vectorStore instanceof SimpleVectorStore simpleStore) {
                File file = getVectorStoreFile();
                try {
                    simpleStore.save(file);
                } catch (Exception e) {
                    System.err.println("⚠️ 向量库持久化保存失败（delete 后）: " + file.getAbsolutePath());
                    e.printStackTrace();
                }
            }

            System.out.println("✅ 已物理删除文件[" + fileId + "] 的 " + ids.size() + " 条向量切片");
        } else {
            System.out.println("⚠️ 未找到文件[" + fileId + "] 的向量数据，可能已经被删除了");
        }
    }
}
