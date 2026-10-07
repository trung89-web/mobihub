package com.example.mobihub.controller;

import com.example.mobihub.entity.ProductReview;
import com.example.mobihub.repository.ProductReviewRepository;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
public class ReviewController {
    private final ProductReviewRepository reviews;
    private final SessionAuth auth;

    public ReviewController(ProductReviewRepository reviews, SessionAuth auth) {
        this.reviews = reviews;
        this.auth = auth;
    }

    @GetMapping
    public List<ProductReview> getReviews(HttpSession session) {
        auth.requireAdmin(session);
        return reviews.findAllByOrderByCreatedAtDesc();
    }

    @PatchMapping("/{id}")
    public ProductReview moderate(@PathVariable Long id, @RequestBody ModerationRequest request, HttpSession session) {
        auth.requireAdmin(session);
        if (!List.of("DA_DUYET", "TU_CHOI").contains(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái kiểm duyệt không hợp lệ");
        }
        ProductReview review = reviews.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá"));
        review.setStatus(request.status());
        return reviews.save(review);
    }

    public record ModerationRequest(String status) { }
}