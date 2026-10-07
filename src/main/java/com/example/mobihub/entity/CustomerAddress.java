package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "dia_chi_khach_hang")
@Data
public class CustomerAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "khach_hang_id", nullable = false)
    private Long customerId;

    @Column(name = "nhan", nullable = false, length = 60)
    private String label = "Nhà riêng";

    @Column(name = "nguoi_nhan", nullable = false, length = 150)
    private String recipientName;

    @Column(name = "so_dien_thoai", nullable = false, length = 20)
    private String phone;

    @Column(name = "dia_chi", nullable = false, length = 500)
    private String address;

    @Column(name = "mac_dinh", nullable = false)
    private Boolean defaultAddress = false;
}