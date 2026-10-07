package com.example.mobihub.controller;

import com.example.mobihub.repository.*;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashBoardController {
    private final ProductRepository products;
    private final CustomerRepository customers;
    private final InvoiceRepository invoices;
    private final ProductReviewRepository reviews;
    private final SessionAuth auth;

    public DashBoardController(ProductRepository products, CustomerRepository customers,
                               InvoiceRepository invoices, ProductReviewRepository reviews, SessionAuth auth) {
        this.products = products;
        this.customers = customers;
        this.invoices = invoices;
        this.reviews = reviews;
        this.auth = auth;
    }

    @GetMapping
    public DashboardStats getStats(HttpSession session) {
        auth.requireAdmin(session);
        return new DashboardStats(products.count(), products.findAll().stream().mapToLong(product -> product.getStock()).sum(),
            products.findAll().stream().filter(product -> product.getStock() < 5).count(), customers.count(),
            invoices.count(), invoices.findAll().stream().filter(order -> "CHO_XAC_NHAN".equals(order.getStatus())).count(),
            reviews.findAll().stream().filter(review -> "CHO_DUYET".equals(review.getStatus())).count());
    }

    public record DashboardStats(long productCount, long stockCount, long lowStockCount,
                                 long customerCount, long orderCount, long pendingOrders,
                                 long pendingReviews) { }
}