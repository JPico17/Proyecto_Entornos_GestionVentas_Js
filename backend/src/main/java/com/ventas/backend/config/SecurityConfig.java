package com.ventas.backend.config;

import com.ventas.backend.filters.JwtTokenValidator;
import com.ventas.backend.utils.JwtUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtUtils jwtUtils;

    public SecurityConfig(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/api/login").permitAll()
                        // Permitir temporalmente listar y modificar empleados sin token (solo para depuración)
                        .requestMatchers(HttpMethod.GET, "/api/empleados").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/empleados").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/empleados/*").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/empleados/*").permitAll()
            // Ejemplo: proteger /api/** excepto las excepciones anteriores
            .requestMatchers("/api/**").authenticated()
            .anyRequest().permitAll())
                // ✅ registrar nuestro filtro JWT
                .addFilterBefore(new JwtTokenValidator(jwtUtils), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
