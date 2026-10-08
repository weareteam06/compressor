package com.compressor.backend.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FrontendController {
  @GetMapping(value = { "/", "/products", "/products/**", "/industries", "/industries/**",
      "/services", "/services/**", "/news", "/news/**", "/about", "/about/**",
      "/technical-information", "/warranty-information", "/faq", "/contact",
      "/distributors", "/support", "/login", "/admin", "/admin/**", "/dealer/login", "/employee/login" },
      produces = MediaType.TEXT_HTML_VALUE)
  public ResponseEntity<String> index() throws Exception {
    Path userDir = Path.of(System.getProperty("user.dir")).toAbsolutePath();
    String configured = System.getenv("FRONTEND_DIST");
    List<Path> candidates = List.of(
        configured == null ? userDir.resolve("frontend/dist/index.html") : Path.of(configured).resolve("index.html"),
        userDir.resolve("frontend/dist/index.html"),
        userDir.resolve("../frontend/dist/index.html"));

    for (Path candidate : candidates) {
      if (Files.exists(candidate.normalize())) {
        return ResponseEntity.ok(Files.readString(candidate.normalize()));
      }
    }

    return ResponseEntity.status(404)
        .body("Frontend build not found. Run `npm --prefix frontend run build` first.");
  }
}
