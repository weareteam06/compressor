package com.compressor.backend.controller;

import com.compressor.backend.service.ContentService;
import com.compressor.backend.service.ChatbotService;
import com.compressor.backend.service.ChatbotService.ChatbotAnswer;
import com.compressor.backend.service.ChatbotService.ChatbotQuestion;
import com.compressor.backend.service.ChatbotService.ChatbotStatus;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.concurrent.TimeUnit;
import com.compressor.backend.model.ImageAsset;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class PublicApiController {
  private final ContentService contentService;
  private final ChatbotService chatbotService;

  public PublicApiController(ContentService contentService, ChatbotService chatbotService) {
    this.contentService = contentService;
    this.chatbotService = chatbotService;
  }

  @GetMapping("/health")
  public Map<String, Boolean> health() {
    return Map.of("ok", true);
  }

  @GetMapping("/site-config")
  public JsonNode siteConfig() {
    return contentService.getSiteConfig();
  }

  @GetMapping("/product-categories")
  public List<?> categories() {
    return contentService.listPublic("categories", Optional.empty());
  }

  @GetMapping("/product-categories/{slug}")
  public Object categoryBySlug(@PathVariable String slug) {
    return contentService.findPublicBySlug("categories", slug);
  }

  @GetMapping("/products")
  public List<?> products(@RequestParam Optional<String> categoryId) {
    return contentService.listPublic("products", categoryId);
  }

  @GetMapping("/products/{id}")
  public Object productById(@PathVariable String id) {
    return contentService.findPublicById("products", id);
  }

  @GetMapping("/industries")
  public List<?> industries() {
    return contentService.listPublic("industries", Optional.empty());
  }

  @GetMapping("/industries/{slug}")
  public Object industryBySlug(@PathVariable String slug) {
    return contentService.findPublicBySlug("industries", slug);
  }

  @GetMapping("/services")
  public List<?> services() {
    return contentService.listPublic("services", Optional.empty());
  }

  @GetMapping("/services/{slug}")
  public Object serviceBySlug(@PathVariable String slug) {
    return contentService.findPublicBySlug("services", slug);
  }

  @GetMapping("/news")
  public List<?> news() {
    return contentService.listPublic("news", Optional.empty());
  }

  @GetMapping("/news/{slug}")
  public Object newsBySlug(@PathVariable String slug) {
    return contentService.findPublicBySlug("news", slug);
  }

  @GetMapping("/timeline")
  public List<?> timeline() {
    return contentService.listPublic("timeline", Optional.empty());
  }

  @GetMapping("/jobs")
  public List<?> jobs() {
    return contentService.listPublic("jobs", Optional.empty());
  }

  @GetMapping("/distributors")
  public List<?> distributors() {
    return contentService.listPublic("distributors", Optional.empty());
  }

  @GetMapping("/images")
  public List<?> images() {
    return contentService.listPublic("images", Optional.empty());
  }

  @GetMapping("/media/{storageKey:.+}")
  public ResponseEntity<byte[]> media(@PathVariable String storageKey) {
    ImageAsset media = contentService.getMedia(storageKey);
    MediaType contentType = MediaType.parseMediaType(media.contentType);
    ResponseEntity.BodyBuilder response = ResponseEntity.ok()
        .contentType(contentType)
        .contentLength(media.data.length)
        .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic());
    if (MediaType.APPLICATION_PDF.isCompatibleWith(contentType)) {
      // An explicit filename prevents Spring MVC's RFD fallback of "f.txt".
      String filename = storageKey.replaceAll("[^a-zA-Z0-9._-]", "_");
      if (!filename.toLowerCase(java.util.Locale.ROOT).endsWith(".pdf")) filename += ".pdf";
      response.header(HttpHeaders.CONTENT_DISPOSITION,
          ContentDisposition.inline().filename(filename).build().toString());
    }
    return response.body(media.data);
  }

  @PostMapping("/leads")
  @ResponseStatus(HttpStatus.CREATED)
  public Object submitLead(@RequestBody JsonNode body) {
    return contentService.submitLead(body);
  }

  @PostMapping("/chatbot")
  public ChatbotAnswer chatbot(@RequestBody ChatbotQuestion question) {
    return chatbotService.answer(question);
  }

  @GetMapping("/chatbot/status")
  public ChatbotStatus chatbotStatus() {
    return chatbotService.status();
  }
}
