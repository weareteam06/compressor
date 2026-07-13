package com.compressor.backend.repository;

import com.compressor.backend.model.NewsArticle;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
  Optional<NewsArticle> findBySlug(String slug);
  List<NewsArticle> findAllByOrderByDateDesc();
}
