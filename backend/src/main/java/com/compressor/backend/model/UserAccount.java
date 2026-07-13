package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserAccount extends BaseEntity {
  @Column(nullable = false, unique = true)
  public String username;
  @JsonIgnore
  @Column(nullable = false)
  public String passwordHash;
  public String displayName;
  @Column(unique = true)
  public String email;
  @Column(nullable = false)
  public String role;
  public String organizationId;
  public Long distributorId;
}
