package com.compressor.backend.service;

import com.compressor.backend.model.UserAccount;
import com.compressor.backend.model.UserRole;
import com.compressor.backend.repository.UserAccountRepository;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserAdminService {
  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;

  public UserAdminService(UserAccountRepository users, PasswordEncoder passwordEncoder) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
  }

  public List<UserAccount> listUsers() {
    return users.findAll();
  }

  public UserAccount currentUser(String username) {
    return users.findByUsernameAndActiveTrue(username).orElseThrow(this::notFound);
  }

  public UserAccount createUser(UserRequest request) {
    if (request.password() == null || request.password().isBlank()) {
      throw badRequest("Password is required");
    }
    users.findByUsernameAndActiveTrue(request.username()).ifPresent(existing -> {
      throw badRequest("Username already exists");
    });
    UserAccount user = new UserAccount();
    apply(user, request);
    user.passwordHash = passwordEncoder.encode(request.password());
    return users.save(user);
  }

  public UserAccount updateUser(Long id, UserRequest request) {
    UserAccount user = users.findById(id).orElseThrow(this::notFound);
    apply(user, request);
    if (request.password() != null && !request.password().isBlank()) {
      user.passwordHash = passwordEncoder.encode(request.password());
    }
    return users.save(user);
  }

  public Map<String, Boolean> deleteUser(Long id) {
    UserAccount user = users.findById(id).orElseThrow(this::notFound);
    user.active = false;
    users.save(user);
    return Map.of("success", true);
  }

  private void apply(UserAccount user, UserRequest request) {
    if (request.username() == null || request.username().isBlank()) {
      throw badRequest("Username is required");
    }
    if (request.role() == null || request.role().isBlank()) {
      throw badRequest("Role is required");
    }
    try {
      UserRole.valueOf(request.role());
    } catch (IllegalArgumentException ex) {
      throw badRequest("Invalid role");
    }
    user.username = request.username();
    user.displayName = request.displayName();
    user.email = request.email();
    user.role = request.role();
    user.organizationId = request.organizationId();
    user.distributorId = request.distributorId();
    user.active = request.active() == null || request.active();
  }

  private ResponseStatusException badRequest(String message) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }

  private ResponseStatusException notFound() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
  }

  public record UserRequest(
      String username,
      String password,
      String displayName,
      String email,
      String role,
      String organizationId,
      Long distributorId,
      Boolean active) {
  }
}
