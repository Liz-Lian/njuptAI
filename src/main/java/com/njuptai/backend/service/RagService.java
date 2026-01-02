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
        * 导入文档到向量库，并为后续按会话/文件维度检索与删除写入元数据标签。
        *
        * @param fileId 数据库中的文件记录 ID，用作向量切片的唯一关联标识
     */
    public void importDocument(Resource resource, String sessionId, Long fileId) {
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        List<Document> documents = reader.get();

        TokenTextSplitter splitter = new TokenTextSplitter(300, 100, 5, 10000, true);
        List<Document> splitDocuments = splitter.apply(documents);

        // 为每个切片写入元数据，便于过滤检索与按文件删除
        for (Document doc : splitDocuments) {
            doc.getMetadata().put("sessionId", sessionId);
            // Filter 表达式以字符串比较为主，这里统一按 String 存储
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
         * 删除指定文件对应的向量切片。
         *
         * 说明：部分 VectorStore 实现需要先检索出文档 ID，再按 ID 批量删除。
     */
    public void deleteByFileId(Long fileId) {
        // 构造检索请求：通过 filterExpression 命中文档，query 使用占位内容即可
        SearchRequest request = SearchRequest.builder()
            .query(" ") // 占位查询内容，主要依赖 filterExpression 过滤
            .filterExpression("fileId == '" + fileId + "'")
            .topK(10000) // 预期最多切片数量；取大一些以尽量覆盖
            .similarityThreshold(0.0)
                .build();

        // 执行搜索
        List<Document> documents = vectorStore.similaritySearch(request);

        // 提取切片 ID
        List<String> ids = documents.stream()
                .map(Document::getId)
                .collect(Collectors.toList());

        // 按 ID 批量删除
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
