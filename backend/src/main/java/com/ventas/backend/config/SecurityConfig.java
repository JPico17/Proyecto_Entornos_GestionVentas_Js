package com.ventas.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desactivar CSRF en desarrollo
                .cors(cors -> {
                }) // Activar CORS global
                .authorizeHttpRequests(auth -> auth
                        // ✅ Permitir preflight (OPTIONS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ Permitir el login
                        .requestMatchers("/api/login").permitAll()

                        // Permitir cualquier otra petición por ahora
                        .anyRequest().permitAll());

        return http.build();
    }
}
