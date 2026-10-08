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
    for (String collection : COLLECTIONS) {
      seedCollection(collection);
    }
    migratePhase3ProductTaxonomy();
    migratePhase4ProductDetails();
    migratePhase5Industries();
    migratePhase6Services();
    seedMedia();
    migrateFasFourToElevenProductImages();
    seedUsers();
  }

  private void seedMedia() throws Exception {
    JsonNode items = readJson("data/media.json");
    Map<String, String> replacements = new LinkedHashMap<>();
    for (JsonNode item : items) {
      String sourcePath = item.path("path").asText();
      String storageKey = item.path("key").asText();
      // Refresh the supplied FAS 4–11 cutout so an existing database cannot retain its old white-background copy.
      boolean refreshFasFourToElevenCutout = "fas-4-11-product.png".equals(storageKey);
      if (contentService.mediaExists(storageKey) && !refreshFasFourToElevenCutout) {
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
    // Move seeded FASM products to the supplied transparent FASM 37 artwork.
    replacements.put("/catalogs/FASM-product.png", "/api/media/catalogs-fasm-product-v2.png");
    replacements.put("/api/media/catalogs-fasm-product.png", "/api/media/catalogs-fasm-product-v2.png");
    contentService.replaceMediaUrls(replacements);
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
    List<String> models = List.of("FAS-4", "FAS-6", "FAS-8", "FAS-11", "FAS-11(HE)");
    for (String model : models) {
      for (Product product : products.findAllByModelIgnoreCase(model)) {
        product.imageUrl = "/api/media/fas-4-11-product.png";
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
