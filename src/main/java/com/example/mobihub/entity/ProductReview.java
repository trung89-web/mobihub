package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "danh_gia")
@Data
public class ProductReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "san_pham_id", nullable = false)
    private Long productId;

    @Column(name = "khach_hang_id", nullable = false)
    private Long customerId;

    @Column(name = "hoa_don_id", nullable = false)
    private Long invoiceId;

    @Column(name = "so_sao", nullable = false)
    private Integer rating;

    @Column(name = "noi_dung", length = 1500)
    private String content;

    @Column(name = "trang_thai", nullable = false, length = 20)
    private String status = "CHO_DUYET";

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime createdAt;
}