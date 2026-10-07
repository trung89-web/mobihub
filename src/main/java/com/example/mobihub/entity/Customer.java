package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "khach_hang")
@Data
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 150)
    private String name;

    @Column(name = "so_dien_thoai", nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "dia_chi", length = 500)
    private String address;

    @Column(name = "ngay_sinh")
    private LocalDate dateOfBirth;
}