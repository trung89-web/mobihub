package com.example.mobihub.repository;

import com.example.mobihub.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findAllByOrderByCreatedAtDesc();
    List<Invoice> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}