package com.compressor.backend.security;

import com.compressor.backend.model.UserAccount;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final ObjectMapper objectMapper;
  private final byte[] secret;
  private final long expirationSeconds;

  public JwtService(
      ObjectMapper objectMapper,
      @Value("${app.jwt.secret:change-this-development-secret-to-a-long-random-production-value}") String secret,
      @Value("${app.jwt.expiration-seconds:86400}") long expirationSeconds) {
    this.objectMapper = objectMapper;
    this.secret = secret.getBytes(StandardCharsets.UTF_8);
    this.expirationSeconds = expirationSeconds;
  }

  public String issueToken(UserAccount user) {
    long now = Instant.now().getEpochSecond();
    Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("sub", user.username);
    payload.put("uid", user.id);
    payload.put("name", user.displayName);
    payload.put("role", user.role);
    payload.put("distributorId", user.distributorId);
    payload.put("iat", now);
    payload.put("exp", now + expirationSeconds);

    String unsigned = base64Json(header) + "." + base64Json(payload);
    return unsigned + "." + sign(unsigned);
  }

  public Map<String, Object> verify(String token) {
    try {
      String[] parts = token.split("\\.");
      if (parts.length != 3) {
        throw new IllegalArgumentException("Invalid token");
      }
      String unsigned = parts[0] + "." + parts[1];
      if (!constantTimeEquals(sign(unsigned), parts[2])) {
        throw new IllegalArgumentException("Invalid signature");
      }
      Map<String, Object> payload = objectMapper.readValue(
          Base64.getUrlDecoder().decode(parts[1]),
          new TypeReference<Map<String, Object>>() {});
      Number exp = (Number) payload.get("exp");
      if (exp == null || exp.longValue() < Instant.now().getEpochSecond()) {
        throw new IllegalArgumentException("Expired token");
      }
      return payload;
    } catch (Exception error) {
      throw new IllegalArgumentException("Invalid token", error);
    }
  }

  private String base64Json(Object value) {
    try {
      return Base64.getUrlEncoder().withoutPadding()
          .encodeToString(objectMapper.writeValueAsBytes(value));
    } catch (Exception error) {
      throw new IllegalStateException("Unable to encode JWT", error);
    }
  }

  private String sign(String value) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret, "HmacSHA256"));
      return Base64.getUrlEncoder().withoutPadding()
          .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception error) {
      throw new IllegalStateException("Unable to sign JWT", error);
    }
  }

  private boolean constantTimeEquals(String left, String right) {
    return MessageDigestUtil.equals(left.getBytes(StandardCharsets.UTF_8), right.getBytes(StandardCharsets.UTF_8));
  }
}
