package com.burakcanaksoy.realestate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.ResourceRegionHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Configuration
@Slf4j
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/");
    }

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        log.info("start extendMessageConverters");
        try {
            ResourceRegionHttpMessageConverter regionConverter = new ResourceRegionHttpMessageConverter();
            // Critical fix: The default supported media types might not include "video/mp4"
            // which matches the controller's response
            // So we explicitly set it to support ALL media types to avoid "No converter
            // found" error
            regionConverter.setSupportedMediaTypes(List.of(org.springframework.http.MediaType.ALL));

            // Force it to be checked first
            converters.add(0, regionConverter);
            log.info("Added ResourceRegionHttpMessageConverter at index 0 with ALL media types support");
        } catch (Exception e) {
            log.error("Error adding converter", e);
        }
    }
}
