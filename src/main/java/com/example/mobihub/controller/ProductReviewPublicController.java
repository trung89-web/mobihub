package com.example.mobihub.controller;

import com.example.mobihub.entity.ProductReview;
import com.example.mobihub.repository.CustomerRepository;
import com.example.mobihub.repository.ProductReviewRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store/products/{productId}/reviews")
public class ProductReviewPublicController {
    private final ProductReviewRepository reviews;
    private final CustomerRepository customers;

    public ProductReviewPublicController(ProductReviewRepository reviews, CustomerRepository customers) {
        this.reviews = reviews;
        this.customers = customers;
    }

    @GetMapping
    public List<PublicReview> getApprovedReviews(@PathVariable Long productId) {
        return reviews.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "DA_DUYET").stream()
            .map(review -> new PublicReview(review.getRating(), review.getContent(),
                customers.findById(review.getCustomerId()).map(customer -> customer.getName()).orElse("Khách hàng"),
                review.getCreatedAt())).toList();
    }

    public record PublicReview(Integer rating, String content, String customerName, java.time.LocalDateTime createdAt) { }
}