package com.compressor.backend.service;

import com.compressor.backend.model.BaseEntity;
import com.compressor.backend.model.Distributor;
import com.compressor.backend.model.ImageAsset;
import com.compressor.backend.model.Industry;
import com.compressor.backend.model.JobOpening;
import com.compressor.backend.model.Lead;
import com.compressor.backend.model.NewsArticle;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
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
    this.siteSections = siteSections;
    this.images = images;
    this.objectMapper = objectMapper;
  }

  public JsonNode getSiteConfig() {
    ObjectNode root = objectMapper.createObjectNode();
    siteSections.findAll().forEach(section -> root.set(section.sectionKey, section.content));
    if (root.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Site content not found");
    }
    return root;
  }

  public JsonNode updateSiteConfig(JsonNode updates) {
    updates.fields().forEachRemaining(entry -> {
      SiteContentSection section = siteSections.findById(entry.getKey()).orElseGet(SiteContentSection::new);
      section.sectionKey = entry.getKey();
      section.content = entry.getValue();
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
    summary.put("siteContentSections", siteSections.count());
    summary.put("imageAssets", images.count());
    return summary;
  }

  public List<?> listPublic(String collection, Optional<String> categoryId) {
    return switch (collection) {
      case "categories" -> categories.findAllByOrderByOrderAsc();
      case "products" -> categoryId.map(this::productsByCategory).orElseGet(products::findAll);
      case "industries" -> industries.findAll();
      case "services" -> services.findAll();
      case "news" -> news.findAllByOrderByDateDesc();
      case "timeline" -> timeline.findAllByOrderByYearAsc();
      case "jobs" -> jobs.findByStatus("Open");
      case "distributors" -> distributors.findByStatus("Active");
      case "images" -> images.findAll();
      default -> throw notFound();
    };
  }

  public List<?> listAdmin(String collection) {
    return switch (collection) {
      case "categories" -> categories.findAll();
      case "products" -> products.findAll();
      case "industries" -> industries.findAll();
      case "services" -> services.findAll();
      case "news" -> news.findAll();
      case "timeline" -> timeline.findAll();
      case "jobs" -> jobs.findAll();
      case "distributors" -> distributors.findAll();
      case "leads" -> visibleLeads();
      case "images" -> images.findAll();
      default -> throw notFound();
    };
  }

  public Object findById(String collection, String id) {
    Long numericId = parseId(id);
    return switch (collection) {
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
      case "images" -> images.findById(requiredId(id)).orElseThrow(this::notFound);
      default -> throw notFound();
    };
  }

  public Object findBySlug(String collection, String slug) {
    return switch (collection) {
      case "categories" -> categories.findBySlug(slug).orElseThrow(this::notFound);
      case "industries" -> industries.findBySlug(slug).orElseThrow(this::notFound);
      case "services" -> services.findBySlug(slug).orElseThrow(this::notFound);
      case "news" -> news.findBySlug(slug).orElseThrow(this::notFound);
      default -> throw notFound();
    };
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
      case "images" -> images.deleteById(numericId);
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
      case "images" -> images;
      default -> throw notFound();
    };
  }

  void saveSiteSection(String sectionKey, JsonNode content) {
    SiteContentSection section = new SiteContentSection();
    section.sectionKey = sectionKey;
    section.content = content;
    siteSections.save(section);
  }

  long siteSectionCount() {
    return siteSections.count();
  }

  void saveImage(String url, String altText, String usageType, Long ownerId) {
    if (url == null || url.isBlank() || images.findByUrl(url).isPresent()) {
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
      return products.findByCategory_Id(numericId);
    }
    ProductCategory category = categories.findByLegacyId(categoryId)
        .or(() -> categories.findBySlug(categoryId))
        .orElseThrow(this::notFound);
    return products.findByCategory_Id(category.id);
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
