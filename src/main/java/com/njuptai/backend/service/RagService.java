package com.njuptai.backend.service;


import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagService {
    private final VectorStore vectorStore;

    public RagService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void importDocument(Resource resource) {
        // 1. 读取: 使用 Tika 自动识别并提取文本
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        List<Document> documents = reader.get();

        // 2. 切割: 把长文档切成小块 (每块约 300 token)
        TokenTextSplitter splitter = new TokenTextSplitter(300, 100, 5, 10000, true);
        List<Document> splitDocuments = splitter.apply(documents);

        // 3. 存储: 存入向量数据库
        vectorStore.add(splitDocuments);

        System.out.println("✅ 已学习文档: " + resource.getFilename() + "，生成切片数: " + splitDocuments.size());
    }
}
