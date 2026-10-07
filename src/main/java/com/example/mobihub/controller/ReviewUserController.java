package com.example.mobihub.controller;

import com.example.mobihub.entity.*;
import com.example.mobihub.repository.*;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/account/reviews")
public class ReviewUserController {
    private final SessionAuth auth;
    private final ProductReviewRepository reviews;
    private final InvoiceRepository invoices;
    private final InvoiceItemRepository items;

    public ReviewUserController(SessionAuth auth, ProductReviewRepository reviews,
                                InvoiceRepository invoices, InvoiceItemRepository items) {
        this.auth = auth;
        this.reviews = reviews;
        this.invoices = invoices;
        this.items = items;
    }

    @GetMapping
    public List<ProductReview> getMyReviews(HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        return reviews.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductReview createReview(@RequestBody ReviewRequest request, HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        if (request.rating() == null || request.rating() < 1 || request.rating() > 5
                || request.content() != null && request.content().length() > 1500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đánh giá cần từ 1 đến 5 sao");
        }
        Invoice invoice = invoices.findById(request.invoiceId())
            .filter(order -> customerId.equals(order.getCustomerId()) && "HOAN_THANH".equals(order.getStatus()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ được đánh giá sản phẩm đã mua và nhận hàng"));
        boolean boughtProduct = items.findByInvoiceId(invoice.getId()).stream()
            .anyMatch(item -> request.productId().equals(item.getProductId()));
        if (!boughtProduct || reviews.existsByCustomerIdAndInvoiceIdAndProductId(customerId, invoice.getId(), request.productId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm không thuộc đơn hàng hoặc đã được đánh giá");
        }
        ProductReview review = new ProductReview();
        review.setProductId(request.productId());
        review.setCustomerId(customerId);
        review.setInvoiceId(invoice.getId());
        review.setRating(request.rating());
        review.setContent(request.content());
        review.setStatus("CHO_DUYET");
        review.setCreatedAt(LocalDateTime.now());
        return reviews.save(review);
    }

    public record ReviewRequest(Long invoiceId, Long productId, Integer rating, String content) { }
}