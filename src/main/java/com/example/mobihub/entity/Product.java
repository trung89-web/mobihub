package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "san_pham")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_san_pham", nullable = false, unique = true, length = 40)
    private String sku;

    @Column(name = "ten_san_pham", nullable = false, length = 180)
    private String name;

    @Column(name = "thuong_hieu", length = 100)
    private String brand;

    @Column(name = "danh_muc_id", nullable = false)
    private Long categoryId;

    @Column(name = "gia", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "so_luong_ton", nullable = false)
    private Integer stock = 0;

    @Column(name = "thoi_han_bao_hanh_thang", nullable = false)
    private Integer warrantyMonths = 12;

    @Column(name = "anh_url", length = 1000)
    private String imageUrl;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String description;

    @Column(name = "dang_kinh_doanh", nullable = false)
    private Boolean active = true;
}