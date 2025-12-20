package com.njuptai.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 允许所有的路径
                .allowedOriginPatterns("*") // 允许所有的前端域名 (5173, 3000, 等等)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许的方法
                .allowedHeaders("*") // 允许所有的请求头
                .allowCredentials(true); // 允许携带 Cookie (如果你以后做登录会用到)
    }
}