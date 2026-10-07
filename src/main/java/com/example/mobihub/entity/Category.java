package com.example.mobihub.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "danh_muc")
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_danh_muc", nullable = false, unique = true, length = 120)
    private String name;

    @Column(name = "mo_ta", length = 500)
    private String description;
}