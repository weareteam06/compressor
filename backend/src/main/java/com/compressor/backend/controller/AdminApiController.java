package com.compressor.backend.controller;

import com.compressor.backend.service.ContentService;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
public class AdminApiController {
  private final ContentService contentService;
  private static final String COLLECTION_PATTERN =
      "{collection:categories|products|industries|services|news|timeline|jobs|distributors|leads|images}";

  public AdminApiController(ContentService contentService) {
    this.contentService = contentService;
  }

  @PutMapping("/site-config")
  public JsonNode updateSiteConfig(@RequestBody JsonNode body) {
    return contentService.updateSiteConfig(body);
  }

  @GetMapping("/database-summary")
  public Map<String, Object> databaseSummary() {
    return contentService.databaseSummary();
  }

  @GetMapping("/" + COLLECTION_PATTERN)
  public List<?> list(@PathVariable String collection) {
    return contentService.listAdmin(collection);
  }

  @PostMapping("/" + COLLECTION_PATTERN)
  @ResponseStatus(HttpStatus.CREATED)
  public Object create(@PathVariable String collection, @RequestBody JsonNode body) {
    return contentService.create(collection, body);
  }

  @PutMapping("/" + COLLECTION_PATTERN + "/{id}")
  public Object update(@PathVariable String collection, @PathVariable String id, @RequestBody JsonNode body) {
    return contentService.update(collection, id, body);
  }

  @DeleteMapping("/" + COLLECTION_PATTERN + "/{id}")
  public Map<String, Boolean> delete(@PathVariable String collection, @PathVariable String id) {
    contentService.delete(collection, id);
    return Map.of("success", true);
  }
}
