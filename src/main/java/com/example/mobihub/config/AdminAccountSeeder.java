package com.example.mobihub.config;

import com.example.mobihub.entity.StoreAccount;
import com.example.mobihub.repository.StoreAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminAccountSeeder implements CommandLineRunner {
    private final StoreAccountRepository accounts;
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();
    @Value("${app.admin.email:admin@mobihub.local}") private String adminEmail;
    @Value("${app.admin.password:Mobihub@123}") private String adminPassword;

    public AdminAccountSeeder(StoreAccountRepository accounts) {
        this.accounts = accounts;
    }

    @Override
    public void run(String... args) {
        if (accounts.existsByEmailIgnoreCase(adminEmail)) return;
        StoreAccount admin = new StoreAccount();
        admin.setEmail(adminEmail.trim().toLowerCase());
        admin.setPasswordHash(passwords.encode(adminPassword));
        admin.setRole("ADMIN");
        admin.setActive(true);
        admin.setCreatedAt(LocalDateTime.now());
        accounts.save(admin);
    }
}