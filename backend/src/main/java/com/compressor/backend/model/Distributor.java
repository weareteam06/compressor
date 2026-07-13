package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "distributors")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Distributor extends BaseEntity {
  public String name;
  public String region;
  public String contactPerson;
  public String designation;
  public String city;
  public String state;
  @Column(columnDefinition = "TEXT")
  public String fullAddress;
  public String phone;
  public String email;
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "json")
  public List<String> authorizedProducts = new ArrayList<>();
  public String status;
}
