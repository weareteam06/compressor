package com.compressor.backend.service;

import com.compressor.backend.model.UserAccount;
import com.compressor.backend.model.UserRole;
import com.compressor.backend.model.Industry;
import com.compressor.backend.model.Product;
import com.compressor.backend.model.ServiceOffering;
import com.compressor.backend.repository.DistributorRepository;
import com.compressor.backend.repository.IndustryRepository;
import com.compressor.backend.repository.ProductCategoryRepository;
import com.compressor.backend.repository.ProductRepository;
import com.compressor.backend.repository.ServiceOfferingRepository;
import com.compressor.backend.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {
  private static final List<String> COLLECTIONS = List.of(
      "categories",
      "products",
      "industries",
      "services",
      "news",
      "timeline",
      "jobs",
      "distributors",
      "leads");

  private final ContentService contentService;
  private final UserAccountRepository users;
  private final DistributorRepository distributors;
  private final ProductCategoryRepository categories;
  private final ProductRepository products;
  private final IndustryRepository industries;
  private final ServiceOfferingRepository services;
  private final PasswordEncoder passwordEncoder;
  private final ObjectMapper objectMapper;

  public DatabaseSeeder(
      ContentService contentService,
      UserAccountRepository users,
      DistributorRepository distributors,
      ProductCategoryRepository categories,
      ProductRepository products,
      IndustryRepository industries,
      ServiceOfferingRepository services,
      PasswordEncoder passwordEncoder,
      ObjectMapper objectMapper) {
    this.contentService = contentService;
    this.users = users;
    this.distributors = distributors;
    this.categories = categories;
    this.products = products;
    this.industries = industries;
    this.services = services;
    this.passwordEncoder = passwordEncoder;
    this.objectMapper = objectMapper;
  }

  @Override
  public void run(String... args) throws Exception {
    seedSiteConfig();
    migrateSocialLinks();
    migrateWarrantySupportEmail();
    migrateContactDetails();
    migrateContactHeadquarters();
    migrateFooterBrief();
    migrateAboutHeroContent();
    migrateNavigationCareers();
    migrateAboutNavigation();
    migrateServicesPageContent();
    migrateProductNavigation();
    migrateProductFooterLinks();
    migrateFooterCompanyLinks();
    migrateFasmSeriesHeading();
    migrateHomeIndustryLimit();
    migrateUltraPackDestination();
    migrateFslHeroImage();
    migrateFasLargeHeroImage();
    migrateRequestModalLabels();
    for (String collection : COLLECTIONS) {
      seedCollection(collection);
    }
    migratePhase3ProductTaxonomy();
    migratePhase4ProductDetails();
    migratePhase5Industries();
    migrateSolarIndustryName();
    migrateIndustryDisplayOrder();
    migrateIndustryRecommendations();
    migrateIndustryImages();
    migratePhase6Services();
    seedMedia();
    migrateFasFourToElevenProductImages();
    migrateFas15To250ProductImages();
    migrateFslProductImages();
    migrateFsgProductImages();
    migrateFasmProductImages();
    migrateFasSmallFeatureConsistency();
    migrateFas15To250MaintenanceFeature();
    migrateFslFeatureConsistency();
    seedUsers();
  }

  private void seedMedia() throws Exception {
    JsonNode items = readJson("data/media.json");
    Map<String, String> replacements = new LinkedHashMap<>();
    for (JsonNode item : items) {
      String sourcePath = item.path("path").asText();
      String storageKey = item.path("key").asText();
      // Refresh the supplied FAS 4–11 cutout so an existing database cannot retain its old white-background copy.
      boolean refreshManagedCutout = "fas-4-11-product.png".equals(storageKey)
          || "catalogs-fas-4-11-product-transparent-v2.png".equals(storageKey)
          || "catalogs-fas-15-250-product-transparent.png".equals(storageKey)
          || "catalogs-fasm-product-v2.png".equals(storageKey)
          || "catalogs-fasm-product-cabinet-transparent.png".equals(storageKey);
      if (contentService.mediaExists(storageKey) && !refreshManagedCutout) {
        replacements.put("/" + sourcePath, "/api/media/" + storageKey);
        continue;
      }
      ClassPathResource resource = new ClassPathResource("media/" + sourcePath);
      byte[] data;
      try (InputStream stream = resource.getInputStream()) {
        data = stream.readAllBytes();
      }
      var saved = contentService.saveMedia(
          storageKey,
          resource.getFilename(),
          item.path("contentType").asText("application/octet-stream"),
          data,
          item.path("altText").asText(""),
          item.path("usageType").asText("general"));
      replacements.put("/" + sourcePath, saved.url);
    }
    // Move every seeded FASM product to the shared transparent FASM 37 artwork.
    replacements.put("/products/fas-4-11-product.png", "/api/media/catalogs-fas-4-11-product-transparent-v2.png");
    replacements.put("/catalogs/fas-4-11-product-transparent.png", "/api/media/catalogs-fas-4-11-product-transparent-v2.png");
    replacements.put("/api/media/fas-4-11-product.png", "/api/media/catalogs-fas-4-11-product-transparent-v2.png");
    replacements.put("/hero/fas-small-product.png", "/api/media/catalogs-fas-4-11-product-transparent-v2.png");
    replacements.put("/api/media/hero-fas-small-product.png", "/api/media/catalogs-fas-4-11-product-transparent-v2.png");
    replacements.put("/api/media/catalogs-fas-15-250-product-transparent.png", "/api/media/catalogs-fas-15-250-product-transparent.png");
    replacements.put("https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS15-400x400.png", "/api/media/catalogs-fas-15-250-product-transparent.png");
    replacements.put("https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS18-400x400.png", "/api/media/catalogs-fas-15-250-product-transparent.png");
    replacements.put("https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS22-400x400.png", "/api/media/catalogs-fas-15-250-product-transparent.png");
    replacements.put("https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS30-400x400.png", "/api/media/catalogs-fas-15-250-product-transparent.png");
    replacements.put("https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS37-400x400.png", "/api/media/catalogs-fas-15-250-product-transparent.png");
    replacements.put("/catalogs/fas-15-250-product-transparent.png", "/api/media/catalogs-fas-15-250-product-transparent.png");
    replacements.put("/catalogs/FASM-product.png", "/api/media/catalogs-fasm-product-cabinet-transparent.png");
    replacements.put("/api/media/catalogs-fasm-product.png", "/api/media/catalogs-fasm-product-cabinet-transparent.png");
    replacements.put("/catalogs/FASM-product-v2.png", "/api/media/catalogs-fasm-product-cabinet-transparent.png");
    replacements.put("/api/media/catalogs-fasm-product-v2.png", "/api/media/catalogs-fasm-product-cabinet-transparent.png");
    // Use the cleaned hero artwork for every FSL product and remove the old catalog image from live records.
    replacements.put("/catalogs/FSL-product.png", "/api/media/catalogs-fsl-product-hero-clean.png");
    replacements.put("/api/media/catalogs-fsl-product.png", "/api/media/catalogs-fsl-product-hero-clean.png");
    contentService.replaceMediaUrls(replacements);
  }

  /** Keeps home-page solution cards aligned with the product-family rules. */
  private void migrateUltraPackDestination() {
    JsonNode current = contentService.getSiteConfig();
    JsonNode homeNode = current.path("home");
    if (!homeNode.isObject() || !homeNode.path("solutionCards").isArray()) return;

    var home = (com.fasterxml.jackson.databind.node.ObjectNode) homeNode.deepCopy();
    var cards = (com.fasterxml.jackson.databind.node.ArrayNode) home.path("solutionCards");
    boolean changed = false;
    for (JsonNode cardNode : cards) {
      if (!cardNode.isObject()) continue;
      var card = (com.fasterxml.jackson.databind.node.ObjectNode) cardNode;
      String id = card.path("id").asText();
      if ("oil-free".equals(id)) {
        changed |= setText(card, "title", "Ultra Pack");
        changed |= setText(card, "description", "FAS 4–11 kW compact compressor packages for general industrial compressed-air applications.");
        changed |= setText(card, "page", "products");
        changed |= setText(card, "param", "fas-small");
        changed |= removeField(card, "url");
        changed |= removeField(card, "external");
      } else if ("variable-speed".equals(id)) {
        changed |= setText(card, "title", "Variable Speed Compressors");
        changed |= setText(card, "description", "FASM VFD models with variable-speed control for changing air demand.");
        changed |= setText(card, "page", "products");
        changed |= setText(card, "param", "fasm");
      } else if ("low-pressure".equals(id)) {
        changed |= setText(card, "title", "Low Pressure Compressors");
        changed |= setText(card, "page", "products");
        changed |= setText(card, "param", "fsl");
      } else if ("pm-motor".equals(id)) {
        changed |= setText(card, "description", "Variable-speed compressor models with permanent-magnet motor and VFD control.");
        changed |= setText(card, "page", "products");
        changed |= setText(card, "param", "fasm");
      } else if ("portable".equals(id)) {
        changed |= setText(card, "title", "Electric Portable Compressors");
        changed |= setText(card, "page", "products");
        changed |= setText(card, "param", "fsg");
      } else if ("oil-lubricated".equals(id)) {
        changed |= setText(card, "page", "products");
        changed |= removeField(card, "param");
      }
    }
    if (changed) contentService.saveSiteSection("home", home);
  }

  private boolean setText(com.fasterxml.jackson.databind.node.ObjectNode object, String field, String value) {
    if (value.equals(object.path(field).asText())) return false;
    object.put(field, value);
    return true;
  }

  private boolean removeField(com.fasterxml.jackson.databind.node.ObjectNode object, String field) {
    return object.remove(field) != null;
  }

  private void seedUsers() {
    saveUser("superadmin", "superadmin123", "Super Administrator", "superadmin@fscompressors.in", UserRole.SUPER_ADMIN, null);
    saveUser("admin", "Admin123", "Site Administrator", "admin@fscompressors.in", UserRole.ADMIN, null);
    saveUser("user", "user123", "Operations User", "user@fscompressors.in", UserRole.USER, null);
    saveUser("dealer", "dealer123", "Dealer Portal User", "dealer@example.com", UserRole.DEALER, distributorId("dist-1"));
    saveUser("distributor", "distributor123", "Distributor Portal User", "distributor@example.com", UserRole.DISTRIBUTOR, distributorId("dist-2"));
  }

  /** Keeps existing installations aligned with the shared FAS 4–11 product artwork. */
  private void migrateFasFourToElevenProductImages() {
    Map<String, String> imageByModel = Map.of(
        "FAS-4", "/api/media/catalogs-fas-4-11-product-transparent-v2.png",
        "FAS-6", "/api/media/catalogs-fas-6-product-transparent.png",
        "FAS-8", "/api/media/catalogs-fas-8-product-transparent.png",
        "FAS-11", "/api/media/catalogs-fas-11-product-transparent.png",
        "FAS-11(HE)", "/api/media/catalogs-fas-11-he-product-transparent.png");
    for (Map.Entry<String, String> entry : imageByModel.entrySet()) {
      for (Product product : products.findAllByModelIgnoreCase(entry.getKey())) {
        product.imageUrl = entry.getValue();
        if (product.imageUrls == null) product.imageUrls = new java.util.ArrayList<>();
        if (product.imageUrls.isEmpty()) product.imageUrls.add(product.imageUrl);
        else product.imageUrls.set(0, product.imageUrl);
        products.save(product);
      }
    }
  }

  /** Keeps every FAS 15–250 kW product on the shared transparent product artwork. */
  private void migrateFas15To250ProductImages() {
    Map<String, String> modelImages = Map.ofEntries(
        Map.entry("FAS-15", "/api/media/catalogs-fas-15-product-transparent.png"),
        Map.entry("FAS-18", "/api/media/catalogs-fas-18-product-transparent.png"),
        Map.entry("FAS-22", "/api/media/catalogs-fas-22-product-transparent.png"),
        Map.entry("FAS-30", "/api/media/catalogs-fas-30-product-transparent.png"),
        Map.entry("FAS-37", "/api/media/catalogs-fas-37-product-transparent.png"),
        Map.entry("FAS-45", "/api/media/catalogs-fas-45-product-transparent.png"),
        Map.entry("FAS-55", "/api/media/catalogs-fas-55-product-transparent.png"),
        Map.entry("FAS-75", "/api/media/catalogs-fas-75-product-transparent.png"),
        Map.entry("FAS-90", "/api/media/catalogs-fas-90-product-transparent.png"),
        Map.entry("FAS-110", "/api/media/catalogs-fas-110-product-transparent.png"),
        Map.entry("FAS-132", "/api/media/catalogs-fas-132-product-transparent.png"),
        Map.entry("FAS-160", "/api/media/catalogs-fas-160-product-transparent.png"),
        Map.entry("FAS-185", "/api/media/catalogs-fas-185-product-transparent.png"),
        Map.entry("FAS-200", "/api/media/catalogs-fas-200-product-transparent.png"),
        Map.entry("FAS-220", "/api/media/catalogs-fas-220-product-transparent.png"),
        Map.entry("FAS-250", "/api/media/catalogs-fas-250-product-transparent.png"));
    for (Product product : products.findAll()) {
      String model = product.model == null ? "" : product.model.trim().toUpperCase();
      if (!model.startsWith("FAS-") || product.powerKw == null || product.powerKw < 15 || product.powerKw > 250) continue;
      product.imageUrl = modelImages.getOrDefault(model, "/api/media/catalogs-fas-15-250-product-transparent.png");
      if (product.imageUrls == null) product.imageUrls = new java.util.ArrayList<>();
      if (product.imageUrls.isEmpty()) product.imageUrls.add(product.imageUrl);
      else product.imageUrls.set(0, product.imageUrl);
      products.save(product);
    }
  }

  /** Keeps every FSL/FSLV product on its model-specific transparent artwork. */
  private void migrateFslProductImages() {
    Map<String, String> modelImages = Map.ofEntries(
        Map.entry("FSL30A-4.5", "/api/media/catalogs-fsl30a-4-5-product-transparent.png"),
        Map.entry("FSL37A-4.5", "/api/media/catalogs-fsl37a-4-5-product-transparent.png"),
        Map.entry("FSL55A-4.5", "/api/media/catalogs-fsl55a-4-5-product-transparent.png"),
        Map.entry("FSL75A-4.5", "/api/media/catalogs-fsl75a-4-5-product-transparent.png"),
        Map.entry("FSL90A-4.5", "/api/media/catalogs-fsl90a-4-5-product-transparent.png"),
        Map.entry("FSL110A-4.5", "/api/media/catalogs-fsl110a-4-5-product-transparent.png"),
        Map.entry("FSL132A-4.5", "/api/media/catalogs-fsl132a-4-5-product-transparent.png"),
        Map.entry("FSL160A-4.5", "/api/media/catalogs-fsl160a-4-5-product-transparent.png"),
        Map.entry("FSL185A-4.5", "/api/media/catalogs-fsl185a-4-5-product-transparent.png"),
        Map.entry("FSL220A-4.5", "/api/media/catalogs-fsl220a-4-5-product-transparent.png"),
        Map.entry("FSLV30A-4.5", "/api/media/catalogs-fslv30a-4-5-product-transparent.png"),
        Map.entry("FSLV37A-4.5", "/api/media/catalogs-fslv37a-4-5-product-transparent.png"),
        Map.entry("FSLV55A-4.5", "/api/media/catalogs-fslv55a-4-5-product-transparent.png"),
        Map.entry("FSLV75-4.5", "/api/media/catalogs-fslv75-4-5-product-transparent.png"),
        Map.entry("FSLV90A-4.5", "/api/media/catalogs-fslv90a-4-5-product-transparent.png"),
        Map.entry("FSLV110A-4.5", "/api/media/catalogs-fslv110a-4-5-product-transparent.png"),
        Map.entry("FSLV132A-4.5", "/api/media/catalogs-fslv132a-4-5-product-transparent.png"),
        Map.entry("FSLV160A-4.5", "/api/media/catalogs-fslv160a-4-5-product-transparent.png"),
        Map.entry("FSLV185A-4.5", "/api/media/catalogs-fslv185a-4-5-product-transparent.png"),
        Map.entry("FSLV220A-4.5", "/api/media/catalogs-fslv220a-4-5-product-transparent.png"));
    for (Product product : products.findAll()) {
      String model = product.model == null ? "" : product.model.trim().toUpperCase();
      String imageUrl = modelImages.get(model);
      if (imageUrl == null) continue;
      product.imageUrl = imageUrl;
      if (product.imageUrls == null) product.imageUrls = new java.util.ArrayList<>();
      if (product.imageUrls.isEmpty()) product.imageUrls.add(product.imageUrl);
      else product.imageUrls.set(0, product.imageUrl);
      products.save(product);
    }
  }

  /** Keeps the visible feature bullets consistent across the FAS 4–11 product cards. */
  /** Keeps every FSG product on its model-specific transparent artwork. */
  private void migrateFsgProductImages() {
    Map<String, String> modelImages = Map.ofEntries(
        Map.entry("FSG270A", "/api/media/catalogs-fsg270a-product-transparent.png"),
        Map.entry("FSG340A", "/api/media/catalogs-fsg340a-product-transparent.png"),
        Map.entry("FSG460A", "/api/media/catalogs-fsg460a-product-transparent.png"),
        Map.entry("FSG760A", "/api/media/catalogs-fsg760a-product-transparent.png"),
        Map.entry("FSG860A", "/api/media/catalogs-fsg860a-product-transparent.png"),
        Map.entry("FSG1060A", "/api/media/catalogs-fsg1060a-product-transparent.png"));
    for (Product product : products.findAll()) {
      String model = product.model == null ? "" : product.model.trim().toUpperCase();
      String imageUrl = modelImages.get(model);
      if (imageUrl == null) continue;
      product.imageUrl = imageUrl;
      if (product.imageUrls == null) product.imageUrls = new java.util.ArrayList<>();
      if (product.imageUrls.isEmpty()) product.imageUrls.add(product.imageUrl);
      else product.imageUrls.set(0, product.imageUrl);
      products.save(product);
    }
  }

  /** Keeps every FASM product on its model-specific transparent artwork. */
  private void migrateFasmProductImages() {
    Map<String, String> modelImages = Map.ofEntries(
        Map.entry("FASM08A", "/api/media/catalogs-fasm08a-product-transparent.png"),
        Map.entry("FASM11A", "/api/media/catalogs-fasm11a-product-transparent.png"),
        Map.entry("FASM15A", "/api/media/catalogs-fasm15a-product-transparent.png"),
        Map.entry("FASM18A", "/api/media/catalogs-fasm18a-product-transparent.png"),
        Map.entry("FASM22A", "/api/media/catalogs-fasm22a-product-transparent.png"),
        Map.entry("FASM30A", "/api/media/catalogs-fasm30a-product-transparent.png"),
        Map.entry("FASM37A", "/api/media/catalogs-fasm37a-product-transparent.png"));
    for (Product product : products.findAll()) {
      String model = product.model == null ? "" : product.model.trim().toUpperCase();
      String imageUrl = modelImages.get(model);
      if (imageUrl == null) continue;
      product.imageUrl = imageUrl;
      if (product.imageUrls == null) product.imageUrls = new java.util.ArrayList<>();
      if (product.imageUrls.isEmpty()) product.imageUrls.add(product.imageUrl);
      else product.imageUrls.set(0, product.imageUrl);
      products.save(product);
    }
  }

  private void migrateFasSmallFeatureConsistency() {
    List<String> models = List.of("FAS-4", "FAS-6", "FAS-8", "FAS-11", "FAS-11(HE)");
    List<String> standardFeatures = List.of(
        "High efficient rotary screw air compressor",
        "Air cooled",
        "Maintenance free design");
    for (String model : models) {
      for (Product product : products.findAllByModelIgnoreCase(model)) {
        if (product.features == null || product.features.size() < standardFeatures.size()) continue;
        boolean changed = false;
        var features = new java.util.ArrayList<>(product.features);
        for (int index = 0; index < standardFeatures.size(); index++) {
          if (!standardFeatures.get(index).equals(features.get(index))) {
            features.set(index, standardFeatures.get(index));
            changed = true;
          }
        }
        if (changed) {
          product.features = features;
          products.save(product);
        }
      }
    }
  }

  /** Uses the same first and maintenance feature wording across the FAS 15–250 kW cards. */
  private void migrateFas15To250MaintenanceFeature() {
    for (Product product : products.findAll()) {
      String model = product.model == null ? "" : product.model.trim().toUpperCase();
      if (!model.startsWith("FAS-") || product.powerKw == null || product.powerKw < 15 || product.powerKw > 250
          || product.features == null || product.features.size() < 3) continue;
      if ("High efficient rotary screw air compressor".equals(product.features.get(0))
          && "Maintenance free design".equals(product.features.get(2))) continue;
      var features = new java.util.ArrayList<>(product.features);
      features.set(0, "High efficient rotary screw air compressor");
      features.set(2, "Maintenance free design");
      product.features = features;
      products.save(product);
    }
  }

  /** Keeps the visible feature bullets consistent across all FSL/FSLV product cards. */
  private void migrateFslFeatureConsistency() {
    List<String> standardFeatures = List.of(
        "Dedicated low-pressure screw airend",
        "Enlarged oil separator",
        "Low-pressure minimum pressure valve");
    for (Product product : products.findAll()) {
      String model = product.model == null ? "" : product.model.trim().toUpperCase();
      if (!model.startsWith("FSL") || product.features == null || product.features.size() < standardFeatures.size()) continue;
      var features = new java.util.ArrayList<>(product.features);
      boolean changed = false;
      for (int index = 0; index < standardFeatures.size(); index++) {
        if (!standardFeatures.get(index).equals(features.get(index))) {
          features.set(index, standardFeatures.get(index));
          changed = true;
        }
      }
      if (changed) {
        product.features = features;
        products.save(product);
      }
    }
  }

  private void saveUser(
      String username,
      String password,
      String displayName,
      String email,
      UserRole role,
      Long distributorId) {
    UserAccount user = users.findByUsername(username).orElseGet(UserAccount::new);
    boolean isNewUser = user.id == null;
    user.username = username;
    if (isNewUser || shouldUpgradeSeedPassword(username, user.passwordHash)) {
      user.passwordHash = passwordEncoder.encode(password);
    }
    user.displayName = displayName;
    user.email = email;
    user.role = role.name();
    user.distributorId = distributorId;
    user.active = true;
    users.save(user);
  }

  private boolean shouldUpgradeSeedPassword(String username, String currentHash) {
    return "admin".equals(username)
        && currentHash != null
        && passwordEncoder.matches("admin123", currentHash);
  }

  private void seedSiteConfig() throws Exception {
    JsonNode config = readJson("data/site-config.json");
    config.fields().forEachRemaining(entry -> {
      if (!contentService.siteSectionExists(entry.getKey())) {
        contentService.saveSiteSection(entry.getKey(), entry.getValue());
      } else {
        JsonNode existing = contentService.getSiteConfig().path(entry.getKey());
        if (existing.isObject() && entry.getValue().isObject()) {
          var merged = (com.fasterxml.jackson.databind.node.ObjectNode) existing.deepCopy();
          if (mergeMissingFields(merged, entry.getValue())) {
            contentService.saveSiteSection(entry.getKey(), merged);
          }
        }
      }
    });
    migratePhase2HomeContent(config);
    migratePhase7AboutContent(config);
    migratePhase8ProductNavigation();
  }

  private void migrateHomeIndustryLimit() {
    JsonNode current = contentService.getSiteConfig().path("home");
    if (!current.isObject()) return;
    var home = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    if (home.path("industriesLimit").asInt(0) == 6) return;
    home.put("industriesLimit", 6);
    contentService.saveSiteSection("home", home);
  }

  private void migrateFasmSeriesHeading() {
    JsonNode current = contentService.getSiteConfig().path("publicContent");
    if (!current.isObject() || !current.path("productSeries").isArray()) return;

    var publicContent = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var productSeries = (com.fasterxml.jackson.databind.node.ArrayNode) publicContent.path("productSeries");
    boolean changed = false;
    for (JsonNode series : productSeries) {
      if (series.isObject()
          && "fasm".equals(series.path("key").asText())
          && "7.5-37 kW Permanent Magnet VFD".equals(series.path("range").asText())) {
        ((com.fasterxml.jackson.databind.node.ObjectNode) series)
            .put("range", "7.5-37 kW with Permanent Magnet motor and VFD");
        changed = true;
      }
    }
    if (changed) contentService.saveSiteSection("publicContent", publicContent);
  }

  private void migratePhase8ProductNavigation() {
    JsonNode current = contentService.getSiteConfig().path("navigation");
    if (!current.isObject() || !current.path("items").isArray()) return;
    var navigation = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var items = (com.fasterxml.jackson.databind.node.ArrayNode) navigation.path("items");
    for (JsonNode item : items) {
      if (!"products".equals(item.path("id").asText()) || !item.path("children").isArray()) continue;
      var children = (com.fasterxml.jackson.databind.node.ArrayNode) item.path("children");
      for (JsonNode child : children) {
        if ("fsl".equals(child.path("id").asText())) return;
      }
      var fsl = objectMapper.createObjectNode();
      fsl.put("id", "fsl");
      fsl.put("label", "FSL / FSLV low-pressure compressors");
      fsl.put("page", "products");
      fsl.put("param", "fsl");
      fsl.put("active", true);
      int insertAt = children.size();
      for (int index = 0; index < children.size(); index++) {
        String childId = children.get(index).path("id").asText();
        if ("fsg".equals(childId) || "all-products".equals(childId)) { insertAt = index; break; }
      }
      children.insert(insertAt, fsl);
      contentService.saveSiteSection("navigation", navigation);
      return;
    }
  }

  private void migrateProductNavigation() {
    JsonNode current = contentService.getSiteConfig().path("navigation");
    if (!current.isObject() || !current.path("items").isArray()) return;
    var navigation = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var items = (com.fasterxml.jackson.databind.node.ArrayNode) navigation.path("items");
    for (JsonNode item : items) {
      if (!"products".equals(item.path("id").asText())) continue;
      var children = objectMapper.createArrayNode();
      addProductNavigationItem(children, "fas-small", "FAS 4-11 kW Fixed Speed", "fas-small");
      addProductNavigationItem(children, "fas-large", "FAS 15-250 kW Fixed Speed", "fas");
      addProductNavigationItem(children, "fasm", "FASM Variable Speed", "fasm");
      addProductNavigationItem(children, "fsl", "FSL Low Pressure", "fsl");
      addProductNavigationItem(children, "fsg", "FSG High Capacity", "fsg");
      ((com.fasterxml.jackson.databind.node.ObjectNode) item).set("children", children);
      contentService.saveSiteSection("navigation", navigation);
      return;
    }
  }

  private void addProductNavigationItem(com.fasterxml.jackson.databind.node.ArrayNode children, String id, String label, String param) {
    var item = objectMapper.createObjectNode();
    item.put("id", id);
    item.put("label", label);
    item.put("page", "products");
    item.put("param", param);
    item.put("active", true);
    children.add(item);
  }

  private void migrateProductFooterLinks() {
    JsonNode current = contentService.getSiteConfig().path("publicContent");
    if (!current.isObject()) return;
    var publicContent = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var links = objectMapper.createArrayNode();
    addProductFooterLink(links, "FAS 4-11 kW Fixed Speed", "fas-small");
    addProductFooterLink(links, "FAS 4-11 kW Variable Speed", "variable-fas-small");
    addProductFooterLink(links, "FAS 15-250 kW Fixed Speed", "fas");
    addProductFooterLink(links, "FAS 15-250 kW Variable Speed", "variable-fas-large");
    addProductFooterLink(links, "FASM Variable Speed", "variable-fasm");
    addProductFooterLink(links, "FSLV Low Pressure", "variable-fsl");
    addProductFooterLink(links, "FSG Electric Portable", "fsg");
    publicContent.set("productLinks", links);
    contentService.saveSiteSection("publicContent", publicContent);
  }

  private void addProductFooterLink(com.fasterxml.jackson.databind.node.ArrayNode links, String label, String param) {
    var item = objectMapper.createObjectNode();
    item.put("label", label);
    item.put("page", "products");
    item.put("param", param);
    links.add(item);
  }

  private void migrateFooterCompanyLinks() {
    JsonNode current = contentService.getSiteConfig().path("publicContent");
    if (!current.isObject() || !current.path("companyLinks").isArray()) return;
    var publicContent = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var companyLinks = objectMapper.createArrayNode();
    for (JsonNode link : current.path("companyLinks")) {
      String label = link.path("label").asText("").trim();
      if (!"Careers".equalsIgnoreCase(label) && !"Dealer Finder".equalsIgnoreCase(label)) companyLinks.add(link);
    }
    if (companyLinks.size() == current.path("companyLinks").size()) return;
    publicContent.set("companyLinks", companyLinks);
    contentService.saveSiteSection("publicContent", publicContent);
  }

  private void migrateServicesPageContent() {
    JsonNode current = contentService.getSiteConfig().path("pageContent");
    JsonNode services = current.path("services");
    if (!current.isObject() || !services.isObject()) return;

    var pageContent = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var updatedServices = (com.fasterxml.jackson.databind.node.ObjectNode) services.deepCopy();
    boolean changed = false;
    if (!"".equals(updatedServices.path("heroEyebrow").asText())) {
      updatedServices.put("heroEyebrow", "");
      changed = true;
    }
    if (!"Complete Service Support".equals(updatedServices.path("heroTitle").asText())) {
      updatedServices.put("heroTitle", "Complete Service Support");
      changed = true;
    }
    if (changed) {
      pageContent.set("services", updatedServices);
      contentService.saveSiteSection("pageContent", pageContent);
    }
  }

  private void migrateContactDetails() {
    JsonNode current = contentService.getSiteConfig().path("contact");
    if (!current.isObject()) return;
    var contact = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    if ("service@fscurtis.in".equals(contact.path("serviceEmail").asText())) return;
    contact.put("serviceEmail", "service@fscurtis.in");
    contentService.saveSiteSection("contact", contact);
  }

  private void migrateSocialLinks() {
    JsonNode current = contentService.getSiteConfig().path("social");
    if (!current.isObject()) return;

    String linkedin = "https://www.linkedin.com/company/fs-compressors-india/";
    String facebook = "https://www.facebook.com/profile.php?id=61590244457735";
    String instagram = "https://www.instagram.com/fscompressors_india/";
    var social = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    boolean changed = false;
    if (!linkedin.equals(social.path("linkedin").asText())) {
      social.put("linkedin", linkedin);
      changed = true;
    }
    if (!facebook.equals(social.path("facebook").asText())) {
      social.put("facebook", facebook);
      changed = true;
    }
    if (!instagram.equals(social.path("instagram").asText())) {
      social.put("instagram", instagram);
      changed = true;
    }
    if (changed) contentService.saveSiteSection("social", social);
  }

  private void migrateContactHeadquarters() {
    JsonNode current = contentService.getSiteConfig().path("contact");
    if (!current.isObject() || !current.path("headquarters").isObject()) return;
    var contact = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var headquarters = (com.fasterxml.jackson.databind.node.ObjectNode) contact.path("headquarters").deepCopy();
    boolean changed = false;
    if (!"FS Compressors India Pvt. Ltd.".equals(headquarters.path("name").asText())) {
      headquarters.put("name", "FS Compressors India Pvt. Ltd.");
      changed = true;
    }
    if (!"Plot No. S-3, Phase-II, Chakan MIDC, Village Sawardari, Khed, Pune 410501, Maharashtra".equals(headquarters.path("address").asText())) {
      headquarters.put("address", "Plot No. S-3, Phase-II, Chakan MIDC, Village Sawardari, Khed, Pune 410501, Maharashtra");
      changed = true;
    }
    if (changed) {
      contact.set("headquarters", headquarters);
      contentService.saveSiteSection("contact", contact);
    }
  }

  private void migrateFooterBrief() {
    JsonNode current = contentService.getSiteConfig().path("publicContent");
    JsonNode text = current.path("text");
    JsonNode footer = text.path("Footer");
    if (!current.isObject() || !text.isObject() || !footer.isObject()) return;

    String key = "fixed_speed_fas_permanent_magnet_variable_speed_fasm_and_high_capacity";
    String brief = "FirstAir offers reliable, energy-efficient rotary screw air compressors designed for industrial applications, delivering dependable performance, operational efficiency, and cost-effective compressed air solutions.";
    if (brief.equals(footer.path(key).asText())) return;

    var publicContent = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    var updatedText = (com.fasterxml.jackson.databind.node.ObjectNode) text.deepCopy();
    var updatedFooter = (com.fasterxml.jackson.databind.node.ObjectNode) footer.deepCopy();
    updatedFooter.put(key, brief);
    updatedText.set("Footer", updatedFooter);
    publicContent.set("text", updatedText);
    contentService.saveSiteSection("publicContent", publicContent);
  }

  private void migrateAboutHeroContent() {
    JsonNode current = contentService.getSiteConfig().path("about");
    if (!current.isObject()) return;

    String title = "FirstAir – Powering Industries with Reliable Compressed Air Solutions";
    String intro = "FirstAir delivers reliable, energy-efficient and cost-effective compressed air solutions, designed to meet the diverse needs of modern industries";
    String imageUrl = "/api/media/about-products-showcase.png";
    var about = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    boolean changed = false;
    if (!title.equals(about.path("heroTitle").asText())) {
      about.put("heroTitle", title);
      changed = true;
    }
    if (!intro.equals(about.path("heroIntro").asText())) {
      about.put("heroIntro", intro);
      changed = true;
    }
    if (!imageUrl.equals(about.path("heroImageUrl").asText())) {
      about.put("heroImageUrl", imageUrl);
      changed = true;
    }
    if (!"FirstAir five-series compressor product range".equals(about.path("heroImageAlt").asText())) {
      about.put("heroImageAlt", "FirstAir five-series compressor product range");
      changed = true;
    }
    if (changed) contentService.saveSiteSection("about", about);
  }

  private void migrateNavigationCareers() {
    JsonNode current = contentService.getSiteConfig().path("navigation");
    if (!current.isObject() || !current.path("items").isArray()) return;

    var navigation = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    boolean changed = false;
    for (JsonNode itemNode : navigation.path("items")) {
      if (!itemNode.isObject() || !itemNode.path("children").isArray()) continue;
      var item = (com.fasterxml.jackson.databind.node.ObjectNode) itemNode;
      var children = objectMapper.createArrayNode();
      for (JsonNode child : item.path("children")) {
        if (!"about-careers".equals(child.path("id").asText()) && !"Careers".equalsIgnoreCase(child.path("label").asText().trim())) {
          children.add(child);
        } else {
          changed = true;
        }
      }
      if (changed) item.set("children", children);
    }
    if (changed) contentService.saveSiteSection("navigation", navigation);
  }

  private void migrateAboutNavigation() {
    JsonNode current = contentService.getSiteConfig().path("navigation");
    if (!current.isObject() || !current.path("items").isArray()) return;

    var navigation = (com.fasterxml.jackson.databind.node.ObjectNode) current.deepCopy();
    boolean changed = false;
    for (JsonNode itemNode : navigation.path("items")) {
      if (!itemNode.isObject() || !"about".equals(itemNode.path("id").asText())) continue;
      var item = (com.fasterxml.jackson.databind.node.ObjectNode) itemNode;
      if (item.has("children")) {
        item.remove("children");
        changed = true;
      }
      if (!"about-story".equals(item.path("page").asText())) {
        item.put("page", "about-story");
        changed = true;
      }
    }
    if (changed) contentService.saveSiteSection("navigation", navigation);
  }

  private void migrateWarrantySupportEmail() {
    JsonNode current = contentService.getSiteConfig();
    boolean changed = false;

    if (current.path("pages").isObject() && current.path("pages").path("warranty").isObject()) {
      var pages = (com.fasterxml.jackson.databind.node.ObjectNode) current.path("pages").deepCopy();
      var warranty = (com.fasterxml.jackson.databind.node.ObjectNode) pages.path("warranty").deepCopy();
      var points = (com.fasterxml.jackson.databind.node.ArrayNode) warranty.path("points");
      for (int index = 0; index < points.size(); index++) {
        if (points.get(index).asText().startsWith("Support email:")) {
          points.set(index, "Support email: info@fscurtis.in");
          changed = true;
        }
      }
      if (changed) {
        pages.set("warranty", warranty);
        contentService.saveSiteSection("pages", pages);
      }
    }

    current = contentService.getSiteConfig();
    if (current.path("publicContent").isObject()
        && current.path("publicContent").path("infoPages").isObject()
        && current.path("publicContent").path("infoPages").path("warranty").isObject()) {
      var publicContent = (com.fasterxml.jackson.databind.node.ObjectNode) current.path("publicContent").deepCopy();
      var infoPages = (com.fasterxml.jackson.databind.node.ObjectNode) publicContent.path("infoPages").deepCopy();
      var warranty = (com.fasterxml.jackson.databind.node.ObjectNode) infoPages.path("warranty").deepCopy();
      var points = (com.fasterxml.jackson.databind.node.ArrayNode) warranty.path("points");
      boolean publicChanged = false;
      for (int index = 0; index < points.size(); index++) {
        if (points.get(index).asText().startsWith("Support email:")) {
          points.set(index, "Support email: info@fscurtis.in");
          publicChanged = true;
        }
      }
      if (publicChanged) {
        infoPages.set("warranty", warranty);
        publicContent.set("infoPages", infoPages);
        contentService.saveSiteSection("publicContent", publicContent);
      }
    }
  }

  private void migrateRequestModalLabels() {
    JsonNode current = contentService.getSiteConfig();
    JsonNode publicContent = current.path("publicContent");
    JsonNode requestModal = publicContent.path("text").path("RequestModal");
    if (!publicContent.isObject() || !requestModal.isObject()) return;

    var updatedPublicContent = (com.fasterxml.jackson.databind.node.ObjectNode) publicContent.deepCopy();
    var text = (com.fasterxml.jackson.databind.node.ObjectNode) publicContent.path("text").deepCopy();
    var updatedRequestModal = (com.fasterxml.jackson.databind.node.ObjectNode) requestModal.deepCopy();
    updatedRequestModal.put("application_and_technical_details_optional", "Requirements detail");
    updatedRequestModal.put("requirement_details", "Remark");
    text.set("RequestModal", updatedRequestModal);
    updatedPublicContent.set("text", text);
    contentService.saveSiteSection("publicContent", updatedPublicContent);
  }

  /** Updates existing installations to the cleaned FSL hero product artwork. */
  private void migrateFslHeroImage() {
    JsonNode current = contentService.getSiteConfig();
    JsonNode publicContent = current.path("publicContent");
    JsonNode heroSlides = publicContent.path("heroSlides");
    if (!publicContent.isObject() || !heroSlides.isArray()) return;

    var updatedPublicContent = (com.fasterxml.jackson.databind.node.ObjectNode) publicContent.deepCopy();
    var updatedHeroSlides = (com.fasterxml.jackson.databind.node.ArrayNode) heroSlides.deepCopy();
    boolean changed = false;
    for (JsonNode slide : updatedHeroSlides) {
      if ("fsl".equals(slide.path("id").asText()) && slide.isObject()
          && !"/api/media/catalogs-fsl-product-hero-clean.png".equals(slide.path("imageUrl").asText())) {
        ((com.fasterxml.jackson.databind.node.ObjectNode) slide).put("imageUrl", "/api/media/catalogs-fsl-product-hero-clean.png");
        changed = true;
      }
    }
    if (changed) {
      updatedPublicContent.set("heroSlides", updatedHeroSlides);
      contentService.saveSiteSection("publicContent", updatedPublicContent);
    }
  }

  /** Updates existing installations to the shared transparent FAS 15–250 hero artwork. */
  private void migrateFasLargeHeroImage() {
    JsonNode current = contentService.getSiteConfig();
    JsonNode publicContent = current.path("publicContent");
    JsonNode heroSlides = publicContent.path("heroSlides");
    if (!publicContent.isObject() || !heroSlides.isArray()) return;

    var updatedPublicContent = (com.fasterxml.jackson.databind.node.ObjectNode) publicContent.deepCopy();
    var updatedHeroSlides = (com.fasterxml.jackson.databind.node.ArrayNode) heroSlides.deepCopy();
    boolean changed = false;
    for (JsonNode slide : updatedHeroSlides) {
      if ("fas-large".equals(slide.path("id").asText()) && slide.isObject()
          && !"/api/media/catalogs-fas-15-250-product-transparent.png".equals(slide.path("imageUrl").asText())) {
        ((com.fasterxml.jackson.databind.node.ObjectNode) slide).put("imageUrl", "/api/media/catalogs-fas-15-250-product-transparent.png");
        changed = true;
      }
    }
    if (changed) {
      updatedPublicContent.set("heroSlides", updatedHeroSlides);
      contentService.saveSiteSection("publicContent", updatedPublicContent);
    }
  }

  private void migratePhase7AboutContent(JsonNode defaults) {
    JsonNode current = contentService.getSiteConfig();
    if (!current.path("about").isObject()) return;
    var about = (com.fasterxml.jackson.databind.node.ObjectNode) current.path("about").deepCopy();
    boolean changed = replaceLegacy(about, "storyShort", "firstAir offers FAS and FSG air-cooled rotary screw compressor ranges for industrial compressed air users.", defaults.path("about").path("storyShort").asText());
    changed |= replaceLegacy(about, "storyLong", "firstAir compressors support workshops, manufacturing units, service teams, site work, and continuous plant air requirements with cataloged models from compact packages through high-capacity industrial compressors.", defaults.path("about").path("storyLong").asText());
    changed |= replaceLegacy(about, "mission", "To provide practical, economical, and reliable air compressor packages for industrial users.", defaults.path("about").path("mission").asText());
    changed |= replaceLegacy(about, "vision", "To make compressor selection simple through clear FAS and FSG model data, technical information, warranty support, and responsive service.", defaults.path("about").path("vision").asText());
    for (String removedField : List.of("groupEyebrow", "groupTitle", "groupIntro", "brandCards", "responsibilityTitle", "responsibilityIntro", "responsibilityRows", "approvalNotice")) {
      if (about.has(removedField)) { about.remove(removedField); changed = true; }
    }
    if (changed) contentService.saveSiteSection("about", about);
  }

  private void migratePhase2HomeContent(JsonNode defaults) {
    JsonNode current = contentService.getSiteConfig();
    if (current.path("hero").isObject()) {
      var hero = (com.fasterxml.jackson.databind.node.ObjectNode) current.path("hero").deepCopy();
      boolean changed = replaceLegacy(hero, "title", "Air cooled single stage rotary screw compressors", defaults.path("hero").path("title").asText());
      changed |= replaceLegacy(hero, "cta", "View Products", defaults.path("hero").path("cta").asText());
      changed |= replaceLegacy(hero, "secondaryCta", "Technical Information", defaults.path("hero").path("secondaryCta").asText());
      if (hero.path("subtitle").asText("").startsWith("FAS")) { hero.put("subtitle", defaults.path("hero").path("subtitle").asText()); changed = true; }
      if (changed) contentService.saveSiteSection("hero", hero);
    }
    if (current.path("home").isObject()) {
      var home = (com.fasterxml.jackson.databind.node.ObjectNode) current.path("home").deepCopy();
      boolean changed = replaceLegacy(home, "rangeTitle", "Choose the right air system", defaults.path("home").path("rangeTitle").asText());
      changed |= replaceLegacy(home, "whyTitle", "Built for productive, efficient operation", defaults.path("home").path("whyTitle").asText());
      changed |= replaceLegacy(home, "industriesTitle", "Compressed air that fits your application", defaults.path("home").path("industriesTitle").asText());
      changed |= replaceLegacy(home, "serviceTitle", "Support beyond the compressor", defaults.path("home").path("serviceTitle").asText());
      changed |= replaceLegacy(home, "powerRange", "4–185 kW", defaults.path("home").path("powerRange").asText());
      if (changed) contentService.saveSiteSection("home", home);
    }
  }

  private boolean replaceLegacy(com.fasterxml.jackson.databind.node.ObjectNode node, String field, String legacyValue, String replacement) {
    if (!legacyValue.equals(node.path(field).asText())) return false;
    node.put(field, replacement);
    return true;
  }

  private boolean mergeMissingFields(com.fasterxml.jackson.databind.node.ObjectNode target, JsonNode defaults) {
    boolean changed = false;
    var fields = defaults.fields();
    while (fields.hasNext()) {
      var entry = fields.next();
      JsonNode current = target.get(entry.getKey());
      if (current == null || current.isNull()) {
        target.set(entry.getKey(), entry.getValue().deepCopy());
        changed = true;
      } else if (current.isObject() && entry.getValue().isObject()) {
        changed |= mergeMissingFields((com.fasterxml.jackson.databind.node.ObjectNode) current, entry.getValue());
      }
    }
    return changed;
  }

  private void normalizeCatalogPowerRange() {
    JsonNode config = contentService.getSiteConfig();

    if (config.path("hero").isObject()) {
      var hero = (com.fasterxml.jackson.databind.node.ObjectNode) config.path("hero").deepCopy();
      hero.put("subtitle", "FAS, FASM, and FSG air-cooled rotary screw compressors from 4 kW to 250 kW for workshops, plant air, and demanding industrial applications.");
      contentService.saveSiteSection("hero", hero);
    }

    if (config.path("about").isObject()) {
      var about = (com.fasterxml.jackson.databind.node.ObjectNode) config.path("about").deepCopy();
      about.put("storyShort", "firstAir offers air-cooled single-stage rotary screw compressors across a complete 4 kW to 250 kW product range.");
      contentService.saveSiteSection("about", about);
    }

    if (config.path("home").isObject()) {
      var home = (com.fasterxml.jackson.databind.node.ObjectNode) config.path("home").deepCopy();
      home.put("powerRange", "4–250 kW");
      contentService.saveSiteSection("home", home);
    }

    if (config.path("pages").isObject() && config.path("pages").path("technical").isObject()) {
      var pages = (com.fasterxml.jackson.databind.node.ObjectNode) config.path("pages").deepCopy();
      var technical = (com.fasterxml.jackson.databind.node.ObjectNode) pages.path("technical");
      var points = technical.withArray("points");
      for (int index = 0; index < points.size(); index++) {
        String point = points.get(index).asText("");
        if (point.toLowerCase().contains("motor") && point.toLowerCase().contains("power range")) {
          points.set(index, objectMapper.getNodeFactory().textNode("Catalog motor power range: 4 kW to 250 kW"));
        }
      }
      contentService.saveSiteSection("pages", pages);
    }
  }

  private void seedCollection(String collection) throws Exception {
    if ("categories".equals(collection)) {
      seedCategories();
      return;
    }
    if ("products".equals(collection)) {
      seedProducts();
      return;
    }
    if ("industries".equals(collection)) {
      seedIndustries();
      return;
    }
    if ("services".equals(collection)) {
      seedServices();
      return;
    }
    if (contentService.repositoryFor(collection).count() > 0) {
      return;
    }
    JsonNode items = readJson("data/" + collection + ".json");
    for (JsonNode item : items) {
      Object saved = contentService.saveConverted(collection, item);
      String label = item.path("name").asText(item.path("title").asText(item.path("model").asText("")));
      Long ownerId = saved instanceof com.compressor.backend.model.BaseEntity entity ? entity.id : null;
      contentService.saveImage(item.path("imageUrl").asText(""), label, collection, ownerId);
    }
  }

  private void seedServices() throws Exception {
    JsonNode items = readJson("data/services.json");
    for (JsonNode item : items) {
      String legacyId = item.path("id").asText("");
      String slug = item.path("slug").asText("");
      if (services.findAll().stream().anyMatch(existing -> legacyId.equals(existing.legacyId)) || services.findBySlug(slug).isPresent()) continue;
      contentService.saveConverted("services", item);
    }
  }

  private void migratePhase6Services() throws Exception {
    JsonNode defaults = readJson("data/services.json");
    for (JsonNode item : defaults) {
      String legacyId = item.path("id").asText();
      services.findAll().stream().filter(existing -> legacyId.equals(existing.legacyId)).findFirst().ifPresent(existing -> {
        boolean legacyInstallation = "srv-installation".equals(legacyId) && "installation-support".equals(existing.slug) && "Installation Support".equals(existing.name);
        boolean legacyMaintenance = "srv-maintenance".equals(legacyId) && "maintenance-support".equals(existing.slug) && "Maintenance Support".equals(existing.name);
        if (!legacyInstallation && !legacyMaintenance) return;
        String replacementSlug = item.path("slug").asText();
        var existingReplacement = services.findBySlug(replacementSlug);
        if (existingReplacement.isPresent() && !existingReplacement.get().id.equals(existing.id)) {
          existing.active = false;
          services.save(existing);
          return;
        }
        var normalized = (com.fasterxml.jackson.databind.node.ObjectNode) item.deepCopy();
        normalized.remove("id");
        ServiceOffering replacement = objectMapper.convertValue(normalized, ServiceOffering.class);
        replacement.id = existing.id;
        replacement.legacyId = existing.legacyId;
        replacement.createdAt = existing.createdAt;
        services.save(replacement);
      });
    }
    services.findBySlug("compressor-selection").ifPresent(existing -> {
      if ("srv-product-selection".equals(existing.legacyId) && "Compressor Selection".equals(existing.name)) { existing.active = false; services.save(existing); }
    });
  }

  private void seedIndustries() throws Exception {
    JsonNode items = readJson("data/industries.json");
    for (JsonNode item : items) {
      String legacyId = item.path("id").asText("");
      String slug = item.path("slug").asText("");
      if (industries.findAll().stream().anyMatch(existing -> legacyId.equals(existing.legacyId)) || industries.findBySlug(slug).isPresent()) continue;
      contentService.saveConverted("industries", item);
    }
  }

  private void migratePhase5Industries() throws Exception {
    JsonNode defaults = readJson("data/industries.json");
    for (JsonNode item : defaults) {
      String legacyId = item.path("id").asText();
      industries.findAll().stream().filter(existing -> legacyId.equals(existing.legacyId)).findFirst().ifPresent(existing -> {
        boolean legacyAutomotive = "ind-automotive".equals(legacyId) && "automotive".equals(existing.slug) && "Automotive".equals(existing.name);
        boolean legacyManufacturing = "ind-manufacturing".equals(legacyId) && "manufacturing".equals(existing.slug) && "Manufacturing".equals(existing.name);
        if (!legacyAutomotive && !legacyManufacturing) return;
        String replacementSlug = item.path("slug").asText();
        var existingReplacement = industries.findBySlug(replacementSlug);
        if (existingReplacement.isPresent() && !existingReplacement.get().id.equals(existing.id)) {
          existing.active = false;
          industries.save(existing);
          return;
        }
        var normalized = ((com.fasterxml.jackson.databind.node.ObjectNode) item.deepCopy());
        normalized.remove("id");
        Industry replacement = objectMapper.convertValue(normalized, Industry.class);
        replacement.id = existing.id;
        replacement.legacyId = existing.legacyId;
        replacement.createdAt = existing.createdAt;
        industries.save(replacement);
      });
    }
    for (String legacySlug : List.of("workshops", "packaging", "general-plant-air")) {
      industries.findBySlug(legacySlug).ifPresent(existing -> {
        String expectedName = switch (legacySlug) { case "workshops" -> "Workshops"; case "packaging" -> "Packaging"; default -> "General Plant Air"; };
        if (existing.legacyId != null && existing.legacyId.startsWith("ind-") && expectedName.equals(existing.name)) { existing.active = false; industries.save(existing); }
      });
    }
  }

  private void migrateIndustryRecommendations() {
    Map<String, List<String>> recommendations = Map.of(
        "textile", List.of("FSL37A-4.5", "FAS-22"),
        "cement", List.of("FSL55A-4.5", "FAS-55"),
        "power-ash-handling", List.of("FSL55A-4.5", "FAS-75"),
        "mining", List.of("FSG270A", "FSG460A", "FSG760A"));
    recommendations.forEach((slug, models) -> industries.findBySlug(slug).ifPresent(industry -> {
      industry.recommendedProducts = new java.util.ArrayList<>(models);
      industries.save(industry);
    }));
  }

  private void migrateIndustryDisplayOrder() {
    Map<String, Integer> displayOrder = Map.of(
        "general-manufacturing", 1,
        "automotive-auto-components", 2,
        "textile", 3,
        "cement", 4,
        "mining", 5,
        "power-ash-handling", 6,
        "steel-metal", 7,
        "semiconductor-electronics", 8,
        "solar", 9);
    industries.findAll().forEach(industry -> {
      Integer expectedOrder = displayOrder.get(industry.slug);
      if (expectedOrder != null && !expectedOrder.equals(industry.order)) {
        industry.order = expectedOrder;
        industries.save(industry);
      }
    });
  }

  private void migrateSolarIndustryName() {
    industries.findBySlug("solar").ifPresent(industry -> {
      if (!"Solar Sheet Manufacturing".equals(industry.name)) {
        industry.name = "Solar Sheet Manufacturing";
        industries.save(industry);
      }
    });
  }

  private void migrateIndustryImages() {
    Map<String, String> images = Map.of(
        "textile", "/industries/textile-industry-india.png",
        "automotive-auto-components", "/industries/automotive-industry-india.png",
        "semiconductor-electronics", "/industries/semiconductor-electronics-india.png",
        "solar", "/industries/solar-manufacturing-india.png",
        "steel-metal", "/industries/steel-metal-india.png",
        "cement", "/industries/cement-industry-india.png",
        "power-ash-handling", "/industries/power-ash-india.png",
        "mining", "/industries/mining-industry-india.png",
        "general-manufacturing", "/industries/general-manufacturing-india.png");
    Map<String, String> imageAlts = Map.of(
        "textile", "Indian textile manufacturing facility",
        "automotive-auto-components", "Indian automotive and auto-components manufacturing facility",
        "semiconductor-electronics", "Indian semiconductor and electronics manufacturing facility",
        "solar", "Indian solar panel manufacturing facility",
        "steel-metal", "Indian steel and metal manufacturing plant",
        "cement", "Indian cement manufacturing plant",
        "power-ash-handling", "Indian power generation and ash-handling facility",
        "mining", "Indian mining and mineral-processing operation",
        "general-manufacturing", "Indian general manufacturing and engineering facility");
    images.forEach((slug, imageUrl) -> industries.findBySlug(slug).ifPresent(industry -> {
      industry.imageUrl = imageUrl;
      industry.imageAlt = imageAlts.get(slug);
      industries.save(industry);
    }));
  }

  private void seedCategories() throws Exception {
    JsonNode items = readJson("data/categories.json");
    for (JsonNode item : items) {
      String legacyId = item.path("id").asText("");
      String slug = item.path("slug").asText("");
      if (categories.findByLegacyId(legacyId).isPresent() || categories.findBySlug(slug).isPresent()) continue;
      contentService.saveConverted("categories", item);
    }
  }

  private void migratePhase3ProductTaxonomy() throws Exception {
    JsonNode defaults = readJson("data/categories.json");
    JsonNode oilDefault = defaults.get(0);
    categories.findByLegacyId("cat-air-compressors").ifPresent(category -> {
      if (!"air-compressors".equals(category.slug)) return;
      category.slug = oilDefault.path("slug").asText();
      category.name = oilDefault.path("name").asText();
      category.shortName = oilDefault.path("shortName").asText();
      category.description = oilDefault.path("description").asText();
      category.longDescription = oilDefault.path("longDescription").asText();
      category.external = false;
      categories.save(category);
    });
    products.findAll().forEach(product -> {
      if (product.categorySlugs == null) product.categorySlugs = new java.util.ArrayList<>();
      if (!product.categorySlugs.isEmpty()) return;
      product.categorySlugs.add("oil-lubricated-screw-compressors");
      String model = product.model == null ? "" : product.model.toUpperCase();
      if (model.startsWith("FASM")) {
        product.categorySlugs.add("variable-speed-compressors");
        product.categorySlugs.add("permanent-magnet-motor-compressors");
      }
      if (model.startsWith("FSL")) {
        product.categorySlugs.add("low-pressure-compressors");
      }
      products.save(product);
    });
  }

  private void migratePhase4ProductDetails() {
    products.findAll().forEach(product -> {
      boolean changed = false;
      if (product.motorPower == null || product.motorPower.isBlank()) { product.motorPower = product.powerKw + " kW"; changed = true; }
      if (product.motorType == null || product.motorType.isBlank()) { product.motorType = product.series != null && product.series.toUpperCase().startsWith("FASM") ? "Permanent magnet variable-speed motor" : "IE3 industrial motor"; changed = true; }
      if (product.coolingMethod == null || product.coolingMethod.isBlank()) { product.coolingMethod = "Air cooled"; changed = true; }
      if (product.imageUrls == null) { product.imageUrls = new java.util.ArrayList<>(); changed = true; }
      if (product.imageUrls.isEmpty() && product.imageUrl != null && !product.imageUrl.isBlank()) { product.imageUrls.add(product.imageUrl); changed = true; }
      if (product.benefits == null) { product.benefits = new java.util.ArrayList<>(); changed = true; }
      if (product.benefits.isEmpty()) {
        product.benefits.add("Reliable compressed-air delivery for industrial operation");
        product.benefits.add("Energy-efficient motor and compressor package");
        product.benefits.add("Maintenance-friendly design for practical service access");
        changed = true;
      }
      if (product.specifications == null) { product.specifications = new java.util.ArrayList<>(); changed = true; }
      changed |= addSpecification(product, "Power Rating", product.powerKw + " kW / " + product.powerHp + " HP");
      changed |= addSpecification(product, "Motor Power", product.motorPower);
      changed |= addSpecification(product, "Working Pressure", product.pressureMin + "–" + product.pressureMax + " bar");
      changed |= addSpecification(product, "FAD", product.flowRateCfm + " CFM / " + product.flowRateM3Min + " m³/min");
      changed |= addSpecification(product, "Motor Type", product.motorType);
      changed |= addSpecification(product, "Cooling Method", product.coolingMethod);
      if (changed) products.save(product);
    });
  }

  private boolean addSpecification(com.compressor.backend.model.Product product, String label, String value) {
    if (value == null || value.isBlank() || product.specifications.stream().anyMatch(item -> label.equalsIgnoreCase(item.getOrDefault("label", "")))) return false;
    product.specifications.add(new LinkedHashMap<>(Map.of("label", label, "value", value)));
    return true;
  }

  private void seedProducts() throws Exception {
    JsonNode items = readJson("data/products.json");
    for (JsonNode item : items) {
      if (contentService.productExistsByLegacyId(item.path("id").asText(""))
          || contentService.productExistsByModel(item.path("model").asText(""))) {
        continue;
      }
      Object saved = contentService.saveConverted("products", item);
      String label = item.path("model").asText(item.path("name").asText(""));
      Long ownerId = saved instanceof com.compressor.backend.model.BaseEntity entity ? entity.id : null;
      contentService.saveImage(item.path("imageUrl").asText(""), label, "products", ownerId);
    }
  }

  private Long distributorId(String legacyId) {
    return distributors.findAll().stream()
        .filter(distributor -> legacyId.equals(distributor.legacyId))
        .map(distributor -> distributor.id)
        .findFirst()
        .orElse(null);
  }

  private JsonNode readJson(String path) throws Exception {
    ClassPathResource resource = new ClassPathResource(path);
    try (InputStream stream = resource.getInputStream()) {
      return objectMapper.readTree(stream);
    }
  }
}
