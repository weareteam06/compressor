package com.compressor.backend.service;

import com.compressor.backend.model.BaseEntity;
import com.compressor.backend.model.Distributor;
import com.compressor.backend.model.ImageAsset;
import com.compressor.backend.model.Industry;
import com.compressor.backend.model.JobOpening;
import com.compressor.backend.model.Lead;
import com.compressor.backend.model.NewsArticle;
import com.compressor.backend.model.OfferAlert;
import com.compressor.backend.model.Product;
import com.compressor.backend.model.ProductCategory;
import com.compressor.backend.model.ServiceOffering;
import com.compressor.backend.model.SiteContentSection;
import com.compressor.backend.model.TimelineEvent;
import com.compressor.backend.repository.DistributorRepository;
import com.compressor.backend.repository.ImageAssetRepository;
import com.compressor.backend.repository.IndustryRepository;
import com.compressor.backend.repository.JobOpeningRepository;
import com.compressor.backend.repository.LeadRepository;
import com.compressor.backend.repository.NewsArticleRepository;
import com.compressor.backend.repository.OfferAlertRepository;
import com.compressor.backend.repository.ProductCategoryRepository;
import com.compressor.backend.repository.ProductRepository;
import com.compressor.backend.repository.ServiceOfferingRepository;
import com.compressor.backend.repository.SiteContentSectionRepository;
import com.compressor.backend.repository.TimelineEventRepository;
import com.compressor.backend.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.LocalDate;
import java.time.Instant;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContentService {
  private static final Map<String, String> PREFIXES = Map.ofEntries(
      Map.entry("categories", "cat"),
      Map.entry("products", "p"),
      Map.entry("industries", "ind"),
      Map.entry("services", "srv"),
      Map.entry("news", "news"),
      Map.entry("timeline", "tl"),
      Map.entry("jobs", "job"),
      Map.entry("distributors", "dist"),
      Map.entry("leads", "lead"),
      Map.entry("offers", "offer"),
      Map.entry("images", "img"));

  private final ProductCategoryRepository categories;
  private final UserAccountRepository users;
  private final ProductRepository products;
  private final IndustryRepository industries;
  private final ServiceOfferingRepository services;
  private final NewsArticleRepository news;
  private final TimelineEventRepository timeline;
  private final JobOpeningRepository jobs;
  private final DistributorRepository distributors;
  private final LeadRepository leads;
  private final OfferAlertRepository offers;
  private final SiteContentSectionRepository siteSections;
  private final ImageAssetRepository images;
  private final ObjectMapper objectMapper;

  public ContentService(
      ProductCategoryRepository categories,
      UserAccountRepository users,
      ProductRepository products,
      IndustryRepository industries,
      ServiceOfferingRepository services,
      NewsArticleRepository news,
      TimelineEventRepository timeline,
      JobOpeningRepository jobs,
      DistributorRepository distributors,
      LeadRepository leads,
      OfferAlertRepository offers,
      SiteContentSectionRepository siteSections,
      ImageAssetRepository images,
      ObjectMapper objectMapper) {
    this.categories = categories;
    this.users = users;
    this.products = products;
    this.industries = industries;
    this.services = services;
    this.news = news;
    this.timeline = timeline;
    this.jobs = jobs;
    this.distributors = distributors;
    this.leads = leads;
    this.offers = offers;
    this.siteSections = siteSections;
    this.images = images;
    this.objectMapper = objectMapper;
  }

  public JsonNode getSiteConfig() {
    ObjectNode root = objectMapper.createObjectNode();
    siteSections.findAll().stream()
        .filter(section -> !Boolean.FALSE.equals(section.active))
        .sorted(java.util.Comparator.comparing(section -> Optional.ofNullable(section.displayOrder).orElse(0)))
        .forEach(section -> root.set(section.sectionKey, section.content));
    if (root.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Site content not found");
    }
    return root;
  }

  public JsonNode updateSiteConfig(JsonNode updates) {
    if (updates == null || !updates.isObject()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Site settings must be an object");
    }
    if (updates.has("publicContent")) {
      try (var stream = new org.springframework.core.io.ClassPathResource("data/site-config.json").getInputStream()) {
        JsonNode template = objectMapper.readTree(stream).path("publicContent");
        if (!ContentShape.matches(updates.get("publicContent"), template)) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Public content has missing fields or invalid value types. Keep field names and use empty arrays to hide lists.");
        }
      } catch (java.io.IOException exception) {
        throw new IllegalStateException("Public content schema is unavailable", exception);
      }
    }
    updates.fields().forEachRemaining(entry -> {
      SiteContentSection section = siteSections.findById(entry.getKey()).orElseGet(SiteContentSection::new);
      section.sectionKey = entry.getKey();
      section.content = entry.getValue();
      section.active = true;
      section.updatedBy = currentUsername();
      siteSections.save(section);
    });
    return getSiteConfig();
  }

  public Map<String, Object> databaseSummary() {
    Map<String, Object> summary = new LinkedHashMap<>();
    summary.put("source", "mysql-jpa");
    summary.put("users", users.count());
    summary.put("productCategories", categories.count());
    summary.put("products", products.count());
    summary.put("industries", industries.count());
    summary.put("services", services.count());
    summary.put("newsArticles", news.count());
    summary.put("timelineEvents", timeline.count());
    summary.put("jobOpenings", jobs.count());
    summary.put("distributors", distributors.count());
    summary.put("leads", leads.count());
    summary.put("offers", offers.count());
    summary.put("siteContentSections", siteSections.count());
    summary.put("imageAssets", images.count());
    return summary;
  }

  public List<Map<String, Object>> siteContentInventory() {
    return siteSections.findAll().stream()
        .sorted(java.util.Comparator.comparing(section -> Optional.ofNullable(section.displayOrder).orElse(0)))
        .map(section -> {
          Map<String, Object> item = new LinkedHashMap<>();
          item.put("sectionKey", section.sectionKey);
          item.put("active", !Boolean.FALSE.equals(section.active));
          item.put("displayOrder", Optional.ofNullable(section.displayOrder).orElse(0));
          item.put("updatedBy", Optional.ofNullable(section.updatedBy).orElse("system"));
          item.put("updatedAt", section.updatedAt);
          item.put("fieldCount", section.content != null && section.content.isObject() ? section.content.size() : 0);
          return item;
        }).toList();
  }

  public Map<String, Object> cmsAudit() {
    Map<String, Object> audit = new LinkedHashMap<>();
    audit.put("siteSections", siteContentInventory());
    audit.put("inactive", Map.of(
        "categories", inactiveCount(categories.findAll()),
        "products", inactiveCount(products.findAll()),
        "industries", inactiveCount(industries.findAll()),
        "services", inactiveCount(services.findAll()),
        "news", inactiveCount(news.findAll())));
    audit.put("mediaMissingAltText", images.findAll().stream()
        .filter(image -> !Boolean.FALSE.equals(image.active))
        .filter(image -> image.altText == null || image.altText.isBlank())
        .count());
    audit.put("generatedAt", java.time.Instant.now());
    return audit;
  }

  public List<?> listPublic(String collection, Optional<String> categoryId) {
    return switch (collection) {
      case "categories" -> published(categories.findAllByOrderByOrderAsc());
      case "products" -> categoryId.map(this::productsByCategory).orElseGet(() -> published(uniqueProducts(products.findAll())));
      case "industries" -> published(industries.findAllByOrderByOrderAsc());
      case "services" -> published(services.findAllByOrderByOrderAsc());
      case "news" -> published(news.findAllByOrderByDateDesc());
      case "timeline" -> published(timeline.findAllByOrderByYearAsc());
      case "jobs" -> jobs.findByStatus("Open");
      case "distributors" -> distributors.findByStatus("Active");
      case "images" -> images.findAll().stream().filter(image -> !Boolean.FALSE.equals(image.active) && image.data != null && image.data.length > 0).toList();
      default -> throw notFound();
    };
  }

  public List<OfferAlert> activeOffers() {
    Instant now = Instant.now();
    return offers.findAllByActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanOrderByStartsAtDesc(now, now);
  }

  public List<?> listAdmin(String collection) {
    return switch (collection) {
      case "categories" -> categories.findAll();
      case "products" -> uniqueProducts(products.findAll());
      case "industries" -> industries.findAll();
      case "services" -> services.findAll();
      case "news" -> news.findAll();
      case "timeline" -> timeline.findAll();
      case "jobs" -> jobs.findAll();
      case "distributors" -> distributors.findAll();
      case "leads" -> visibleLeads();
      case "offers" -> offers.findAll();
      case "images" -> images.findAll().stream().filter(image -> image.data != null && image.data.length > 0).toList();
      default -> throw notFound();
    };
  }

  public Object findById(String collection, String id) {
    Long numericId = parseId(id);
    Object found = switch (collection) {
      case "products" -> numericId == null
          ? products.findByLegacyId(id).orElseThrow(this::notFound)
          : products.findById(numericId).orElseThrow(this::notFound);
      case "categories" -> numericId == null
          ? categories.findByLegacyId(id).orElseThrow(this::notFound)
          : categories.findById(numericId).orElseThrow(this::notFound);
      case "industries" -> industries.findById(requiredId(id)).orElseThrow(this::notFound);
      case "services" -> services.findById(requiredId(id)).orElseThrow(this::notFound);
      case "news" -> news.findById(requiredId(id)).orElseThrow(this::notFound);
      case "timeline" -> timeline.findById(requiredId(id)).orElseThrow(this::notFound);
      case "jobs" -> jobs.findById(requiredId(id)).orElseThrow(this::notFound);
      case "distributors" -> distributors.findById(requiredId(id)).orElseThrow(this::notFound);
      case "leads" -> leads.findById(requiredId(id)).orElseThrow(this::notFound);
      case "offers" -> offers.findById(requiredId(id)).orElseThrow(this::notFound);
      case "images" -> images.findById(requiredId(id)).orElseThrow(this::notFound);
      default -> throw notFound();
    };
    return found;
  }

  public Object findBySlug(String collection, String slug) {
    Object found = switch (collection) {
      case "categories" -> categories.findBySlug(slug).orElseThrow(this::notFound);
      case "industries" -> industries.findBySlug(slug).orElseThrow(this::notFound);
      case "services" -> services.findBySlug(slug).orElseThrow(this::notFound);
      case "news" -> news.findBySlug(slug).orElseThrow(this::notFound);
      default -> throw notFound();
    };
    return found;
  }

  public Object findPublicById(String collection, String id) {
    Object found = findById(collection, id);
    if (found instanceof BaseEntity entity && Boolean.FALSE.equals(entity.active)) throw notFound();
    return found;
  }

  public Object findPublicBySlug(String collection, String slug) {
    Object found = findBySlug(collection, slug);
    if (found instanceof BaseEntity entity && Boolean.FALSE.equals(entity.active)) throw notFound();
    return found;
  }

  public Object create(String collection, JsonNode body) {
    ObjectNode payload = objectBody(body);
    Object saved = saveConverted(collection, payload);
    syncImageFromPayload(collection, saved, payload);
    return saved;
  }

  public Lead submitLead(JsonNode body) {
    ObjectNode payload = objectBody(body);
    payload.put("leadNumber", "LEAD-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis());
    payload.put("date", LocalDate.now().toString());
    payload.put("status", "New");
    if (payload.path("source").asText("").isBlank()) {
      payload.put("source", "Website");
    }
    payload.put("priority", "Medium");
    payload.put("notes", "");
    return (Lead) saveConverted("leads", payload);
  }

  public Object update(String collection, String id, JsonNode updates) {
    if ("leads".equals(collection)) {
      assertLeadAccess(requiredId(id), false);
    }
    JsonNode current = objectMapper.valueToTree(findById(collection, id));
    ObjectNode merged = objectBody(current);
    updates.fields().forEachRemaining(entry -> merged.set(entry.getKey(), entry.getValue()));
    merged.put("id", requiredId(id));
    Object saved = saveConverted(collection, merged);
    syncImageFromPayload(collection, saved, merged);
    return saved;
  }

  public void delete(String collection, String id) {
    Long numericId = requiredId(id);
    if ("leads".equals(collection)) {
      assertLeadAccess(numericId, true);
    }
    switch (collection) {
      case "categories" -> categories.deleteById(numericId);
      case "products" -> products.deleteById(numericId);
      case "industries" -> industries.deleteById(numericId);
      case "services" -> services.deleteById(numericId);
      case "news" -> news.deleteById(numericId);
      case "timeline" -> timeline.deleteById(numericId);
      case "jobs" -> jobs.deleteById(numericId);
      case "distributors" -> distributors.deleteById(numericId);
      case "leads" -> leads.deleteById(numericId);
      case "offers" -> offers.deleteById(numericId);
      case "images" -> deleteMedia(numericId);
      default -> throw notFound();
    }
  }

  Object saveConverted(String collection, JsonNode payload) {
    ObjectNode normalized = normalizeIdentity(payload);
    return switch (collection) {
      case "categories" -> categories.save(objectMapper.convertValue(normalized, ProductCategory.class));
      case "products" -> saveProduct(normalized, payload);
      case "industries" -> industries.save(objectMapper.convertValue(normalized, Industry.class));
      case "services" -> services.save(objectMapper.convertValue(normalized, ServiceOffering.class));
      case "news" -> news.save(objectMapper.convertValue(normalized, NewsArticle.class));
      case "timeline" -> timeline.save(objectMapper.convertValue(normalized, TimelineEvent.class));
      case "jobs" -> jobs.save(objectMapper.convertValue(normalized, JobOpening.class));
      case "distributors" -> distributors.save(objectMapper.convertValue(normalized, Distributor.class));
      case "leads" -> saveLead(normalized);
      case "offers" -> saveOffer(normalized);
      case "images" -> images.save(objectMapper.convertValue(normalized, ImageAsset.class));
      default -> throw notFound();
    };
  }

  JpaRepository<?, Long> repositoryFor(String collection) {
    return switch (collection) {
      case "categories" -> categories;
      case "products" -> products;
      case "industries" -> industries;
      case "services" -> services;
      case "news" -> news;
      case "timeline" -> timeline;
      case "jobs" -> jobs;
      case "distributors" -> distributors;
      case "leads" -> leads;
      case "offers" -> offers;
      case "images" -> images;
      default -> throw notFound();
    };
  }

  void saveSiteSection(String sectionKey, JsonNode content) {
    SiteContentSection section = siteSections.findById(sectionKey).orElseGet(SiteContentSection::new);
    section.sectionKey = sectionKey;
    section.content = content;
    section.active = true;
    section.updatedBy = currentUsername();
    siteSections.save(section);
  }

  private <T extends BaseEntity> List<T> published(List<T> items) {
    return items.stream().filter(item -> !Boolean.FALSE.equals(item.active)).toList();
  }

  private long inactiveCount(List<? extends BaseEntity> items) {
    return items.stream().filter(item -> Boolean.FALSE.equals(item.active)).count();
  }

  private String currentUsername() {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication == null || !authentication.isAuthenticated() ? "system" : authentication.getName();
  }

  long siteSectionCount() {
    return siteSections.count();
  }

  boolean siteSectionExists(String sectionKey) {
    return siteSections.existsById(sectionKey);
  }

  boolean productExistsByLegacyId(String legacyId) {
    return legacyId != null && !legacyId.isBlank() && products.findByLegacyId(legacyId).isPresent();
  }

  boolean productExistsByModel(String model) {
    return model != null && !model.isBlank() && !products.findAllByModelIgnoreCase(model).isEmpty();
  }

  void saveImage(String url, String altText, String usageType, Long ownerId) {
    if (url == null || url.isBlank() || images.existsByUrl(url)) {
      return;
    }
    ImageAsset image = new ImageAsset();
    image.url = url;
    image.altText = altText;
    image.usageType = usageType;
    image.ownerType = usageType;
    image.ownerId = ownerId;
    images.save(image);
  }

  public ImageAsset saveMedia(String storageKey, String fileName, String contentType, byte[] data, String altText, String usageType) {
    ImageAsset image = images.findByStorageKey(storageKey).orElseGet(ImageAsset::new);
    image.storageKey = storageKey;
    image.fileName = fileName;
    image.contentType = contentType;
    image.mediaType = "application/pdf".equalsIgnoreCase(contentType) ? "document"
        : contentType != null && contentType.startsWith("video/") ? "video" : "image";
    image.sizeBytes = (long) data.length;
    image.data = data;
    image.altText = altText;
    image.usageType = usageType;
    image.ownerType = "site-media";
    image.url = "/api/media/" + storageKey;
    return images.save(image);
  }

  public ImageAsset uploadMedia(MultipartFile file, String altText, String usageType) throws IOException {
    String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("media");
    String baseKey = originalName.toLowerCase()
        .replaceAll("[^a-z0-9._-]+", "-")
        .replaceAll("(^-+|-+$)", "");
    if (baseKey.isBlank()) baseKey = "media";
    String storageKey = baseKey;
    int suffix = 2;
    while (images.findByStorageKey(storageKey).isPresent()) {
      storageKey = suffix++ + "-" + baseKey;
    }
    return saveMedia(storageKey, originalName,
        Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"),
        file.getBytes(), altText, usageType);
  }

  public ImageAsset getMedia(String storageKey) {
    return images.findByStorageKey(storageKey)
        .filter(image -> !Boolean.FALSE.equals(image.active))
        .orElseThrow(this::notFound);
  }

  public boolean mediaExists(String storageKey) {
    return images.findByStorageKey(storageKey).filter(image -> image.data != null && image.data.length > 0).isPresent();
  }

  public void replaceMediaUrls(Map<String, String> replacements) {
    products.findAll().forEach(item -> {
      boolean changed = false;
      if (replacements.containsKey(item.imageUrl)) { item.imageUrl = replacements.get(item.imageUrl); changed = true; }
      if (replacements.containsKey(item.brochureUrl)) { item.brochureUrl = replacements.get(item.brochureUrl); changed = true; }
      if (replacements.containsKey(item.datasheetUrl)) { item.datasheetUrl = replacements.get(item.datasheetUrl); changed = true; }
      if (item.imageUrls != null) {
        for (int index = 0; index < item.imageUrls.size(); index++) {
          String replacement = replacements.get(item.imageUrls.get(index));
          if (replacement != null) { item.imageUrls.set(index, replacement); changed = true; }
        }
      }
      if (changed) products.save(item);
    });
    categories.findAll().forEach(item -> { if (replacements.containsKey(item.imageUrl)) { item.imageUrl = replacements.get(item.imageUrl); categories.save(item); } });
    industries.findAll().forEach(item -> { if (replacements.containsKey(item.imageUrl)) { item.imageUrl = replacements.get(item.imageUrl); industries.save(item); } });
    services.findAll().forEach(item -> { if (replacements.containsKey(item.imageUrl)) { item.imageUrl = replacements.get(item.imageUrl); services.save(item); } });
    news.findAll().forEach(item -> { if (replacements.containsKey(item.imageUrl)) { item.imageUrl = replacements.get(item.imageUrl); news.save(item); } });
    offers.findAll().forEach(item -> { if (replacements.containsKey(item.imageUrl)) { item.imageUrl = replacements.get(item.imageUrl); offers.save(item); } });
    siteSections.findAll().forEach(section -> {
      JsonNode replaced = replaceUrls(section.content, replacements);
      if (!replaced.equals(section.content)) { section.content = replaced; siteSections.save(section); }
    });
  }

  private void deleteMedia(Long id) {
    ImageAsset media = images.findById(id).orElseThrow(this::notFound);
    String url = media.url;
    boolean used = products.findAll().stream().anyMatch(item -> url.equals(item.imageUrl) || url.equals(item.brochureUrl) || url.equals(item.datasheetUrl) || (item.imageUrls != null && item.imageUrls.contains(url)))
        || categories.findAll().stream().anyMatch(item -> url.equals(item.imageUrl))
        || industries.findAll().stream().anyMatch(item -> url.equals(item.imageUrl))
        || services.findAll().stream().anyMatch(item -> url.equals(item.imageUrl))
        || news.findAll().stream().anyMatch(item -> url.equals(item.imageUrl))
        || offers.findAll().stream().anyMatch(item -> url.equals(item.imageUrl))
        || siteSections.findAll().stream().anyMatch(section -> containsText(section.content, url));
    if (used) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "This media file is currently used by website content. Replace it there before deleting it.");
    }
    images.delete(media);
  }

  private boolean containsText(JsonNode node, String value) {
    if (node.isTextual()) return value.equals(node.asText());
    if (node.isContainerNode()) {
      for (JsonNode child : node) if (containsText(child, value)) return true;
    }
    return false;
  }

  private JsonNode replaceUrls(JsonNode node, Map<String, String> replacements) {
    if (node.isTextual()) return objectMapper.getNodeFactory().textNode(replacements.getOrDefault(node.asText(), node.asText()));
    JsonNode copy = node.deepCopy();
    if (copy.isObject()) copy.fields().forEachRemaining(entry -> ((ObjectNode) copy).set(entry.getKey(), replaceUrls(entry.getValue(), replacements)));
    else if (copy.isArray()) for (int i = 0; i < copy.size(); i++) ((com.fasterxml.jackson.databind.node.ArrayNode) copy).set(i, replaceUrls(copy.get(i), replacements));
    return copy;
  }

  private void syncImageFromPayload(String collection, Object saved, JsonNode payload) {
    String imageUrl = payload.path("imageUrl").asText("");
    if (!imageUrl.isBlank() && saved instanceof BaseEntity entity) {
      saveImage(imageUrl, payload.path("name").asText(payload.path("title").asText("")), collection, entity.id);
    }
  }

  private Product saveProduct(ObjectNode normalized, JsonNode originalPayload) {
    String legacyId = normalized.path("legacyId").asText("");
    if (!legacyId.isBlank()) {
      products.findByLegacyId(legacyId).ifPresent(existing -> normalized.put("id", existing.id));
    }
    if (!normalized.has("id")) {
      String model = normalized.path("model").asText("");
      products.findAllByModelIgnoreCase(model).stream().findFirst().ifPresent(existing -> normalized.put("id", existing.id));
    }
    normalized.remove("categoryId");
    Product product = objectMapper.convertValue(normalized, Product.class);
    product.category = resolveCategory(originalPayload.path("categoryId"));
    return products.save(product);
  }

  private Lead saveLead(ObjectNode normalized) {
    if (normalized.path("leadNumber").asText("").isBlank()) {
      normalized.put("leadNumber", "LEAD-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis());
    }
    if (normalized.path("status").asText("").isBlank()) {
      normalized.put("status", "New");
    }
    if (normalized.path("source").asText("").isBlank()) {
      normalized.put("source", "Website");
    }
    if (normalized.path("priority").asText("").isBlank()) {
      normalized.put("priority", "Medium");
    }
    return leads.save(objectMapper.convertValue(normalized, Lead.class));
  }

  private OfferAlert saveOffer(ObjectNode normalized) {
    OfferAlert offer = objectMapper.convertValue(normalized, OfferAlert.class);
    if (offer.title == null || offer.title.isBlank()
        || offer.message == null || offer.message.isBlank()
        || offer.startsAt == null || offer.endsAt == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Offer title, message, start date/time, and end date/time are required");
    }
    if (!offer.endsAt.isAfter(offer.startsAt)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Offer end date/time must be after the start date/time");
    }
    return offers.save(offer);
  }

  private ProductCategory resolveCategory(JsonNode categoryNode) {
    if (categoryNode == null || categoryNode.isMissingNode() || categoryNode.asText("").isBlank()) {
      return null;
    }
    if (categoryNode.canConvertToLong()) {
      return categories.findById(categoryNode.asLong()).orElseThrow(this::notFound);
    }
    String categoryRef = categoryNode.asText();
    return categories.findByLegacyId(categoryRef)
        .or(() -> categories.findBySlug(categoryRef))
        .orElseThrow(this::notFound);
  }

  private List<Product> productsByCategory(String categoryId) {
    Long numericId = parseId(categoryId);
    if (numericId != null) {
      return published(uniqueProducts(products.findByCategory_Id(numericId)));
    }
    ProductCategory category = categories.findByLegacyId(categoryId)
        .or(() -> categories.findBySlug(categoryId))
        .orElseThrow(this::notFound);
    if (Boolean.FALSE.equals(category.active)) throw notFound();
    return published(uniqueProducts(products.findByCategory_Id(category.id)));
  }

  private List<Product> uniqueProducts(List<Product> items) {
    Map<String, Product> unique = new LinkedHashMap<>();
    items.stream()
        .sorted((left, right) -> left.id.compareTo(right.id))
        .forEach(product -> unique.putIfAbsent(
            product.model == null ? "id:" + product.id : product.model.trim().toUpperCase(), product));
    return List.copyOf(unique.values());
  }

  private ObjectNode normalizeIdentity(JsonNode payload) {
    ObjectNode normalized = objectBody(payload);
    JsonNode id = normalized.get("id");
    if (id != null && id.isTextual()) {
      normalized.put("legacyId", id.asText());
      normalized.remove("id");
    }
    return normalized;
  }

  private Long requiredId(String id) {
    Long parsed = parseId(id);
    if (parsed == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected numeric id");
    }
    return parsed;
  }

  private Long parseId(String id) {
    try {
      return Long.valueOf(id);
    } catch (NumberFormatException ex) {
      return null;
    }
  }

  private ObjectNode objectBody(JsonNode body) {
    if (body instanceof ObjectNode objectNode) {
      return objectNode.deepCopy();
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected JSON object");
  }

  private ResponseStatusException notFound() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
  }

  private List<Lead> visibleLeads() {
    return currentUser().map(user -> {
      if (isAdminRole(user.role)) {
        return leads.findAll();
      }
      if ("DISTRIBUTOR".equals(user.role) && user.distributorId != null) {
        return leads.findByAssignedDistributorId(user.distributorId);
      }
      return leads.findByAssignedUserId(user.id);
    }).orElseGet(List::of);
  }

  private void assertLeadAccess(Long leadId, boolean deleting) {
    Lead lead = leads.findById(leadId).orElseThrow(this::notFound);
    currentUser().ifPresentOrElse(user -> {
      if (isAdminRole(user.role)) {
        return;
      }
      if (deleting) {
        throw forbidden();
      }
      boolean assignedToUser = user.id != null && user.id.equals(lead.assignedUserId);
      boolean assignedToDistributor = "DISTRIBUTOR".equals(user.role)
          && user.distributorId != null
          && user.distributorId.equals(lead.assignedDistributorId);
      if (!assignedToUser && !assignedToDistributor) {
        throw forbidden();
      }
    }, () -> {
      throw forbidden();
    });
  }

  private Optional<com.compressor.backend.model.UserAccount> currentUser() {
    Object principal = SecurityContextHolder.getContext().getAuthentication() == null
        ? null
        : SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (principal == null) {
      return Optional.empty();
    }
    return users.findByUsernameAndActiveTrue(String.valueOf(principal));
  }

  private boolean isAdminRole(String role) {
    return "SUPER_ADMIN".equals(role) || "ADMIN".equals(role);
  }

  private ResponseStatusException forbidden() {
    return new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
  }
}
