package com.compressor.backend.repository;

import com.compressor.backend.model.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
  Optional<UserAccount> findByUsername(String username);
  Optional<UserAccount> findByUsernameAndActiveTrue(String username);
  Optional<UserAccount> findByEmailAndActiveTrue(String email);
}
