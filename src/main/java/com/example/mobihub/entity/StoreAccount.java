package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tai_khoan")
@Data
public class StoreAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "khach_hang_id")
    private Long customerId;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "mat_khau_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "vai_tro", nullable = false, length = 20)
    private String role;

    @Column(name = "phuong_thuc_thanh_toan_mac_dinh", nullable = false, length = 40)
    private String defaultPaymentMethod = "COD";

    @Column(name = "dang_hoat_dong", nullable = false)
    private Boolean active = true;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime createdAt;
}