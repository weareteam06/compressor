package com.compressor.backend.repository;

import com.compressor.backend.model.TimelineEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimelineEventRepository extends JpaRepository<TimelineEvent, Long> {
  List<TimelineEvent> findAllByOrderByYearAsc();
}
