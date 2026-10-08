package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "leads")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Lead extends BaseEntity {
  @Column(unique = true)
  public String leadNumber;
  public String date;
  public String name;
  public String email;
  public String phone;
  public String company;
  public String productOfInterest;
  public String industry;
  public String type;
  public String source;
  public String priority;
  @Column(columnDefinition = "TEXT")
  public String message;
  public String status;
  public String followUpDate;
  public Long assignedUserId;
  public Long assignedDistributorId;
  @Column(columnDefinition = "TEXT")
  public String notes;
  public String assignedTo;
  public String requiredPressure;
  public String requiredFad;
  public String operatingHours;
  public String currentCompressor;
  public String application;
  public String location;
  @Column(columnDefinition = "TEXT")
  public String requirementDetails;
}
