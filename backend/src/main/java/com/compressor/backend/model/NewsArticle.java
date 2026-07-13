package com.compressor.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "news_articles")
@JsonIgnoreProperties(ignoreUnknown = true)
public class NewsArticle extends BaseEntity {
  @Column(nullable = false, unique = true)
  public String slug;
  public String title;
  public String category;
  public String date;
  @Column(columnDefinition = "TEXT")
  public String excerpt;
  @Column(columnDefinition = "TEXT")
  public String content;
  @Column(length = 1000)
  public String imageUrl;
  public String author;
  public Boolean featured;
}
