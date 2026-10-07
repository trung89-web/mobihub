package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "thong_tin_giao_hang")
@Data
public class DeliveryInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hoa_don_id", nullable = false, unique = true)
    private Long invoiceId;

    @Column(name = "dia_chi_giao_hang", nullable = false, length = 500)
    private String shippingAddress;
}