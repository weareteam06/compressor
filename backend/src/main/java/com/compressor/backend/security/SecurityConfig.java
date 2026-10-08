package com.compressor.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> {})
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/api/health", "/api/auth/login").permitAll()
            .requestMatchers("/api/auth/me").authenticated()
            .requestMatchers(HttpMethod.GET,
                "/api/site-config",
                "/api/product-categories/**",
                "/api/products/**",
                "/api/industries/**",
                "/api/services/**",
                "/api/news/**",
                "/api/timeline",
                "/api/jobs",
                "/api/distributors",
                "/api/images",
                "/api/media/**",
                "/api/chatbot/status").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/leads").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/chatbot").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/admin/users").hasAnyRole("SUPER_ADMIN", "ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/admin/users").hasRole("SUPER_ADMIN")
            .requestMatchers("/api/admin/users/**").hasRole("SUPER_ADMIN")
            .requestMatchers("/api/admin/leads/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "DEALER", "DISTRIBUTOR")
            .requestMatchers(HttpMethod.GET, "/api/admin/distributors").hasAnyRole("SUPER_ADMIN", "ADMIN", "DEALER", "DISTRIBUTOR")
            .requestMatchers("/api/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
            .anyRequest().permitAll())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }
}
