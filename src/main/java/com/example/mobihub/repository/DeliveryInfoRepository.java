package com.example.mobihub.repository;

import com.example.mobihub.entity.DeliveryInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryInfoRepository extends JpaRepository<DeliveryInfo, Long> {
    Optional<DeliveryInfo> findByInvoiceId(Long invoiceId);
}