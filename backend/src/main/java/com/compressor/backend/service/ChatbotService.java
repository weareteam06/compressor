package com.compressor.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ChatbotService {
  private static final URI CHAT_COMPLETIONS_API = URI.create("https://openrouter.ai/api/v1/chat/completions");
  private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

  private final ContentService contentService;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;
  private final String apiKey;
  private final String model;

  public ChatbotService(
      ContentService contentService,
      ObjectMapper objectMapper,
      @Value("${openrouter.api-key:}") String apiKey,
      @Value("${openrouter.model:tencent/hy3:free}") String model) {
    this.contentService = contentService;
    this.objectMapper = objectMapper;
    this.apiKey = apiKey;
    this.model = model;
    this.httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();
  }

  public ChatbotAnswer answer(ChatbotQuestion request) {
    String question = request == null ? "" : clean(request.question());
    if (question.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question is required");
    }
    if (apiKey == null || apiKey.isBlank()) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OpenRouter API key is not configured");
    }

    try {
      ObjectNode payload = objectMapper.createObjectNode();
      payload.put("model", model);
      payload.set("messages", buildMessages(question, request.history()));
      payload.put("max_completion_tokens", 700);
      payload.put("temperature", 0.2);
      ObjectNode responseFormat = objectMapper.createObjectNode();
      responseFormat.put("type", "json_object");
      payload.set("response_format", responseFormat);

      HttpRequest httpRequest = HttpRequest.newBuilder(CHAT_COMPLETIONS_API)
          .timeout(Duration.ofSeconds(30))
          .header("Authorization", "Bearer " + apiKey)
          .header("Content-Type", "application/json")
          .header("HTTP-Referer", "http://localhost:5174")
          .header("X-OpenRouter-Title", "firstAir Compressor")
          .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
          .build();

      HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        String reason = providerErrorMessage(response.body());
        log.warn("OpenRouter chatbot request failed with status {}: {}", response.statusCode(), reason);
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
            "OpenRouter request failed: " + reason);
      }

      String outputText = extractChatContent(objectMapper.readTree(response.body()));
      return parseModelAnswer(outputText);
    } catch (ResponseStatusException ex) {
      throw ex;
    } catch (Exception ex) {
      log.warn("Unable to generate chatbot answer", ex);
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to generate chatbot answer: " + ex.getMessage());
    }
  }

  public ChatbotStatus status() {
    return new ChatbotStatus(apiKey != null && !apiKey.isBlank(), model);
  }

  private String systemInstructions() {
    return """
        You are the official website assistant for firstAir Compressor.
        Reply like a helpful human sales and support assistant, not like a search engine.
        Use only the provided website context. Do not invent products, phone numbers, prices, warranty terms, dealers, or policies.
        Understand intent: model requests, kW requests, service issues, warranty questions, contact questions, about-company questions, dealer questions, and technical selection questions.
        If an exact model is unavailable but a matching kW or nearest product is available, explain that naturally.
        Keep answers concise: 2 to 5 short sentences.
        Always return valid JSON only, with this shape:
        {
          "answer": "Natural language answer",
          "links": [{"label": "Button label", "page": "products|product-detail|services|service-detail|technical|warranty|distributors|contact|about-story|about-timeline|news|news-detail", "param": "optional slug or id"}]
        }
        Return 1 to 3 useful links. Use product-detail links for specific product recommendations.
        """;
  }

  private ArrayNode buildMessages(String question, List<ChatHistoryItem> history) throws Exception {
    ArrayNode messages = objectMapper.createArrayNode();
    ObjectNode system = objectMapper.createObjectNode();
    system.put("role", "system");
    system.put("content", systemInstructions());
    messages.add(system);

    List<ChatHistoryItem> recentHistory = history == null ? List.of() : history.stream().limit(8).toList();
    for (ChatHistoryItem item : recentHistory) {
      String role = "user".equals(item.role()) ? "user" : "assistant";
      String text = clean(item.text());
      if (text.isBlank()) continue;
      ObjectNode message = objectMapper.createObjectNode();
      message.put("role", role);
      message.put("content", text);
      messages.add(message);
    }

    ObjectNode user = objectMapper.createObjectNode();
    user.put("role", "user");
    user.put("content", buildPrompt(question));
    messages.add(user);
    return messages;
  }

  private String buildPrompt(String question) throws Exception {
    ObjectNode context = objectMapper.createObjectNode();
    context.set("siteConfig", contentService.getSiteConfig());
    context.set("products", summarizeArray(contentService.listPublic("products", Optional.empty()), 30,
        "id", "legacyId", "model", "name", "series", "description", "longDescription", "powerKw", "powerHp",
        "pressureMin", "pressureMax", "flowRateCfm", "flowRateM3Min", "features", "applications", "brochureUrl"));
    context.set("services", summarizeArray(contentService.listPublic("services", Optional.empty()), 12,
        "id", "slug", "name", "shortDescription", "fullDescription", "benefits", "process"));
    context.set("industries", summarizeArray(contentService.listPublic("industries", Optional.empty()), 12,
        "id", "slug", "name", "shortDescription", "fullDescription", "applications", "recommendedProducts"));
    context.set("distributors", summarizeArray(contentService.listPublic("distributors", Optional.empty()), 20,
        "name", "region", "city", "state", "contactPerson", "phone", "email", "authorizedProducts"));
    context.set("news", summarizeArray(contentService.listPublic("news", Optional.empty()), 8,
        "id", "slug", "title", "category", "date", "excerpt"));

    ObjectNode routeGuide = objectMapper.createObjectNode();
    routeGuide.put("home", "/");
    routeGuide.put("products", "/products");
    routeGuide.put("product-detail", "/products/{param}");
    routeGuide.put("services", "/services");
    routeGuide.put("service-detail", "/services/{param}");
    routeGuide.put("technical", "/technical-information");
    routeGuide.put("warranty", "/warranty-information");
    routeGuide.put("distributors", "/distributors");
    routeGuide.put("contact", "/contact");
    routeGuide.put("about-story", "/about/story");
    routeGuide.put("about-timeline", "/about/timeline");
    routeGuide.put("news", "/news");
    routeGuide.put("news-detail", "/news/{param}");
    context.set("routeGuide", routeGuide);

    ObjectNode prompt = objectMapper.createObjectNode();
    prompt.put("visitorQuestion", question);
    prompt.set("websiteContext", context);
    return objectMapper.writeValueAsString(prompt);
  }

  private ArrayNode summarizeArray(Object source, int limit, String... fields) {
    JsonNode array = objectMapper.valueToTree(source);
    ArrayNode result = objectMapper.createArrayNode();
    if (!array.isArray()) return result;

    int count = 0;
    for (JsonNode item : array) {
      if (count >= limit) break;
      ObjectNode row = objectMapper.createObjectNode();
      for (String field : fields) {
        JsonNode value = item.get(field);
        if (value != null && !value.isNull()) {
          row.set(field, value);
        }
      }
      result.add(row);
      count++;
    }
    return result;
  }

  private String extractChatContent(JsonNode response) {
    JsonNode choices = response.path("choices");
    if (!choices.isArray() || choices.isEmpty()) return "";
    return choices.get(0).path("message").path("content").asText("");
  }

  private ChatbotAnswer parseModelAnswer(String outputText) throws Exception {
    if (outputText == null || outputText.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty chatbot answer");
    }

    String json = outputText.trim();
    int start = json.indexOf('{');
    int end = json.lastIndexOf('}');
    if (start >= 0 && end > start) {
      json = json.substring(start, end + 1);
    }

    JsonNode node;
    try {
      node = objectMapper.readTree(json);
    } catch (Exception ex) {
      return new ChatbotAnswer(outputText.trim(), List.of(
          new ChatbotLink("Products", "products", null),
          new ChatbotLink("Contact team", "contact", null)));
    }

    String answer = clean(node.path("answer").asText(""));
    if (answer.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid chatbot answer");
    }

    List<ChatbotLink> links = new ArrayList<>();
    JsonNode linkNodes = node.path("links");
    if (linkNodes.isArray()) {
      for (JsonNode linkNode : linkNodes) {
        String label = clean(linkNode.path("label").asText(""));
        String page = clean(linkNode.path("page").asText(""));
        String param = clean(linkNode.path("param").asText(""));
        if (!label.isBlank() && allowedPage(page)) {
          links.add(new ChatbotLink(label, page, param.isBlank() ? null : param));
        }
        if (links.size() >= 3) break;
      }
    }
    return new ChatbotAnswer(answer, links);
  }

  private String providerErrorMessage(String responseBody) {
    try {
      JsonNode body = objectMapper.readTree(responseBody == null ? "{}" : responseBody);
      String message = body.path("error").path("message").asText("");
      if (!message.isBlank()) return message;
    } catch (Exception ignored) {
      // Fall back to a compact body excerpt below.
    }

    String compact = responseBody == null ? "" : responseBody.replaceAll("\\s+", " ").trim();
    if (compact.isBlank()) return "unknown error";
    return compact.length() > 240 ? compact.substring(0, 240) : compact;
  }

  private boolean allowedPage(String page) {
    return List.of(
        "products", "product-detail", "services", "service-detail", "technical", "warranty",
        "distributors", "contact", "about-story", "about-timeline", "news", "news-detail")
        .contains(page);
  }

  private String clean(String value) {
    return value == null ? "" : value.trim();
  }

  public record ChatbotQuestion(String question, List<ChatHistoryItem> history) {}

  public record ChatHistoryItem(String role, String text) {}

  public record ChatbotStatus(boolean configured, String model) {}

  public record ChatbotAnswer(String answer, List<ChatbotLink> links) {}

  public record ChatbotLink(String label, String page, String param) {}
}
