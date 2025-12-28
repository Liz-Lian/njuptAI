package com.njuptai.backend.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class RagConfig {

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel){

        SimpleVectorStore store = SimpleVectorStore.builder(embeddingModel).build();

        Path projectRoot = Paths.get(System.getProperty("user.dir"));
        File file = projectRoot.resolve("vectorstore.json").toFile();
        if (file.exists() && file.isFile()) {
            try {
                store.load(file);
                System.out.println("✅ 已加载向量库文件: " + file.getAbsolutePath());
            } catch (Exception e) {
                System.err.println("⚠️ 加载向量库文件失败，将使用空向量库: " + file.getAbsolutePath());
                e.printStackTrace();
            }
        }

        return store;
    }
}
