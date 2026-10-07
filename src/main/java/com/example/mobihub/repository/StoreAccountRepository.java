package com.example.mobihub.repository;

import com.example.mobihub.entity.StoreAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StoreAccountRepository extends JpaRepository<StoreAccount, Long> {
    Optional<StoreAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}