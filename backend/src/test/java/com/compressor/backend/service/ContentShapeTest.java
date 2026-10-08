package com.compressor.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

class ContentShapeTest {
  private final ObjectMapper mapper = new ObjectMapper();

  @Test void acceptsEditedCopyAndEmptyLists() throws Exception {
    var template = mapper.readTree("{\"slides\":[{\"title\":\"Default\",\"highlights\":[\"One\"]}]}");
    assertTrue(ContentShape.matches(mapper.readTree("{\"slides\":[]}"), template));
    assertTrue(ContentShape.matches(mapper.readTree("{\"slides\":[{\"title\":\"Edited\",\"highlights\":[]}]}"), template));
    assertFalse(ContentShape.matches(mapper.readTree("{\"slides\":[{\"title\":42}]}"), template));
  }

  @Test void validatesSeedAndRejectsMalformedHero() throws Exception {
    try (var stream = getClass().getResourceAsStream("/data/site-config.json")) {
      var template = mapper.readTree(stream).path("publicContent");
      assertTrue(ContentShape.matches(template.deepCopy(), template));
      ObjectNode edited = template.deepCopy();
      ((ObjectNode) edited.path("heroSlides").get(0)).put("highlights", "invalid");
      assertFalse(ContentShape.matches(edited, template));
    }
  }
}
