package com.example.mobihub.repository;

import com.example.mobihub.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, String status);
    List<ProductReview> findAllByOrderByCreatedAtDesc();
    List<ProductReview> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    boolean existsByCustomerIdAndInvoiceIdAndProductId(Long customerId, Long invoiceId, Long productId);
}