package com.compressor.backend.controller;

import com.compressor.backend.model.UserAccount;
import com.compressor.backend.service.UserAdminService;
import com.compressor.backend.service.UserAdminService.UserRequest;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class UserAdminController {
  private final UserAdminService userAdminService;

  public UserAdminController(UserAdminService userAdminService) {
    this.userAdminService = userAdminService;
  }

  @GetMapping("/api/auth/me")
  public UserAccount me(Principal principal) {
    return userAdminService.currentUser(principal.getName());
  }

  @GetMapping("/api/admin/users")
  public List<UserAccount> listUsers() {
    return userAdminService.listUsers();
  }

  @PostMapping("/api/admin/users")
  @ResponseStatus(HttpStatus.CREATED)
  public UserAccount createUser(@RequestBody UserRequest request) {
    return userAdminService.createUser(request);
  }

  @PutMapping("/api/admin/users/{id}")
  public UserAccount updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
    return userAdminService.updateUser(id, request);
  }

  @DeleteMapping("/api/admin/users/{id}")
  public Map<String, Boolean> deleteUser(@PathVariable Long id) {
    return userAdminService.deleteUser(id);
  }
}
