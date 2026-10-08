package com.compressor.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class FrontendControllerTest {
  @TempDir Path directory;

  @Test void servesFrontendDeepLinksWithoutCapturingApiRoutes() throws Exception {
    Path dist = Files.createDirectories(directory.resolve("frontend/dist"));
    Files.writeString(dist.resolve("index.html"), "<!doctype html><div id=\"root\"></div>");
    String previous = System.getProperty("user.dir");
    try {
      System.setProperty("user.dir", directory.toString());
      var mvc = MockMvcBuilders.standaloneSetup(new FrontendController()).build();
      for (String path : new String[]{"/", "/faq", "/products/54", "/technical-information", "/admin/settings", "/admin/login", "/employee/login", "/dealer/login"}) {
        mvc.perform(get(path)).andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("text/html"));
      }
      mvc.perform(get("/api/not-a-route")).andExpect(status().isNotFound());
    } finally {
      System.setProperty("user.dir", previous);
    }
  }
}
