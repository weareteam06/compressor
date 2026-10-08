package com.compressor.backend.controller;

import com.compressor.backend.model.ImageAsset;
import com.compressor.backend.service.ChatbotService;
import com.compressor.backend.service.ContentService;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PublicApiControllerMediaTest {
  private ContentService contentService;
  private MockMvc mvc;

  @BeforeEach
  void setup() {
    contentService = mock(ContentService.class);
    mvc = MockMvcBuilders.standaloneSetup(
        new PublicApiController(contentService, mock(ChatbotService.class))).build();
  }

  private byte[] media(String key, String type) {
    ImageAsset asset = new ImageAsset();
    asset.contentType = type;
    asset.data = "%PDF-1.7\nTest PDF bytes".getBytes(StandardCharsets.US_ASCII);
    when(contentService.getMedia(key)).thenReturn(asset);
    return asset.data;
  }

  @Test
  void pdfPreviewAndDownloadUsePdfFilenameInsteadOfSpringTxtFallback() throws Exception {
    String key = "catalog-fas-15-250kw.pdf";
    byte[] bytes = media(key, "application/pdf");
    mvc.perform(get("/api/media/{key}", key))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/pdf"))
        .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
            "inline; filename=\"catalog-fas-15-250kw.pdf\""))
        .andExpect(content().bytes(bytes));
    mvc.perform(head("/api/media/{key}", key))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
            "inline; filename=\"catalog-fas-15-250kw.pdf\""));
  }

  @Test
  void pdfWithExtensionlessStorageKeyStillSavesAsPdf() throws Exception {
    media("brochure", "application/pdf");
    mvc.perform(get("/api/media/brochure"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
            "inline; filename=\"brochure.pdf\""));
  }

  @Test
  void imageResponsesKeepTheirOriginalTypeAndBytes() throws Exception {
    byte[] bytes = media("compressor.png", "image/png");
    mvc.perform(get("/api/media/compressor.png"))
        .andExpect(status().isOk())
        .andExpect(content().contentType("image/png"))
        .andExpect(header().doesNotExist(HttpHeaders.CONTENT_DISPOSITION))
        .andExpect(content().bytes(bytes));
  }
}
