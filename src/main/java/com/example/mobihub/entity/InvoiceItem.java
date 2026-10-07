package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "chi_tiet_hoa_don")
@Data
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hoa_don_id", nullable = false)
    private Long invoiceId;

    @Column(name = "san_pham_id")
    private Long productId;

    @Column(name = "ten_san_pham", nullable = false, length = 180)
    private String productName;

    @Column(name = "ma_san_pham", nullable = false, length = 40)
    private String sku;

    @Column(name = "don_gia", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "so_luong", nullable = false)
    private Integer quantity;

    @Column(name = "thanh_tien", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "bao_hanh_den")
    private LocalDate warrantyEndsAt;
}