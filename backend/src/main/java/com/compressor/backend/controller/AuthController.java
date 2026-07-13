package com.compressor.backend.controller;

import com.compressor.backend.model.UserAccount;
import com.compressor.backend.repository.UserAccountRepository;
import com.compressor.backend.security.JwtService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthController(UserAccountRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  public Map<String, Object> login(@RequestBody LoginRequest request) {
    String login = request.username() == null ? "" : request.username().trim();
    UserAccount user = users.findByUsernameAndActiveTrue(login)
        .or(() -> users.findByEmailAndActiveTrue(login))
        .orElseThrow(() -> unauthorized());

    if (!passwordEncoder.matches(request.password(), user.passwordHash)) {
      throw unauthorized();
    }

    Map<String, Object> session = new LinkedHashMap<>();
    session.put("success", true);
    session.put("token", jwtService.issueToken(user));
    session.put("userId", user.id);
    session.put("username", user.username);
    session.put("displayName", user.displayName);
    session.put("role", user.role);
    session.put("distributorId", user.distributorId);
    return session;
  }

  private ResponseStatusException unauthorized() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
  }

  public record LoginRequest(String username, String password) {
  }
}
