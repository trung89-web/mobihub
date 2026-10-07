package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoa_don")
@Data
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_hoa_don", nullable = false, unique = true, length = 40)
    private String number;

    @Column(name = "khach_hang_id")
    private Long customerId;

    @Column(name = "ten_khach_hang", nullable = false, length = 150)
    private String customerName;

    @Column(name = "tong_tien", nullable = false, precision = 15, scale = 2)
    private BigDecimal total;

    @Column(name = "phuong_thuc_thanh_toan", nullable = false, length = 40)
    private String paymentMethod;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String status = "DA_THANH_TOAN";

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime createdAt;
}