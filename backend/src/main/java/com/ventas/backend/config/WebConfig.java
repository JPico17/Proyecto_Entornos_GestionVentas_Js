package com.ventas.backend.config;

import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // @Override
    // public void addCorsMappings(CorsRegistry registry) {
    // registry.addMapping("/api/**")
    // .allowedOrigins("http://localhost:3000") // React dev server
    // .allowedMethods("GET", "POST", "PUT", "DELETE");
    // }

    // dejar todos los puertos abiertos por mientras y el desarrollo
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("*")
                .allowedHeaders("*");
    }

}
