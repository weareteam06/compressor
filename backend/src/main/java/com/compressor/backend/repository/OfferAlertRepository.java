package com.compressor.backend.repository;

import com.compressor.backend.model.OfferAlert;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferAlertRepository extends JpaRepository<OfferAlert, Long> {
  List<OfferAlert> findAllByActiveTrueAndStartsAtLessThanEqualAndEndsAtGreaterThanOrderByStartsAtDesc(
      Instant startsBefore, Instant endsAfter);
}
