package com.compressor.backend.service;

import com.compressor.backend.model.UserAccount;
import com.compressor.backend.model.UserRole;
import com.compressor.backend.repository.DistributorRepository;
import com.compressor.backend.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.List;
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
  private final PasswordEncoder passwordEncoder;
  private final ObjectMapper objectMapper;

  public DatabaseSeeder(
      ContentService contentService,
      UserAccountRepository users,
      DistributorRepository distributors,
      PasswordEncoder passwordEncoder,
      ObjectMapper objectMapper) {
    this.contentService = contentService;
    this.users = users;
    this.distributors = distributors;
    this.passwordEncoder = passwordEncoder;
    this.objectMapper = objectMapper;
  }

  @Override
  public void run(String... args) throws Exception {
    seedSiteConfig();
    for (String collection : COLLECTIONS) {
      seedCollection(collection);
    }
    seedUsers();
  }

  private void seedUsers() {
    saveUser("superadmin", "superadmin123", "Super Administrator", "superadmin@fscompressors.in", UserRole.SUPER_ADMIN, null);
    saveUser("admin", "Admin123", "Site Administrator", "admin@fscompressors.in", UserRole.ADMIN, null);
    saveUser("user", "user123", "Operations User", "user@fscompressors.in", UserRole.USER, null);
    saveUser("dealer", "dealer123", "Dealer Portal User", "dealer@example.com", UserRole.DEALER, distributorId("dist-1"));
    saveUser("distributor", "distributor123", "Distributor Portal User", "distributor@example.com", UserRole.DISTRIBUTOR, distributorId("dist-2"));
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
    if (contentService.siteSectionCount() > 0) {
      return;
    }
    JsonNode config = readJson("data/site-config.json");
    config.fields().forEachRemaining(entry -> contentService.saveSiteSection(entry.getKey(), entry.getValue()));
  }

  private void seedCollection(String collection) throws Exception {
    if ("products".equals(collection)) {
      seedProducts();
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

  private void seedProducts() throws Exception {
    JsonNode items = readJson("data/products.json");
    for (JsonNode item : items) {
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
