package com.example.mobihub.controller;

import com.example.mobihub.entity.Invoice;
import com.example.mobihub.entity.InvoiceItem;
import com.example.mobihub.repository.InvoiceItemRepository;
import com.example.mobihub.repository.InvoiceRepository;
import com.example.mobihub.repository.ProductRepository;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/warranties")
public class AdminWarrantyController {
    private final SessionAuth auth;
    private final InvoiceRepository invoices;
    private final InvoiceItemRepository items;
    private final ProductRepository products;

    public AdminWarrantyController(SessionAuth auth, InvoiceRepository invoices,
                                   InvoiceItemRepository items, ProductRepository products) {
        this.auth = auth;
        this.invoices = invoices;
        this.items = items;
        this.products = products;
    }

    @GetMapping
    public List<WarrantyRecord> getWarranties(HttpSession session) {
        auth.requireAdmin(session);
        return invoices.findAllByOrderByCreatedAtDesc().stream()
            .flatMap(invoice -> items.findByInvoiceId(invoice.getId()).stream()
                .map(item -> view(invoice, item))).toList();
    }

    private WarrantyRecord view(Invoice invoice, InvoiceItem item) {
        LocalDate purchasedAt = invoice.getCreatedAt().toLocalDate();
        LocalDate endsAt = item.getWarrantyEndsAt();
        if (endsAt == null && item.getProductId() != null) {
            endsAt = products.findById(item.getProductId())
                .map(product -> purchasedAt.plusMonths(product.getWarrantyMonths())).orElse(purchasedAt);
        }
        return new WarrantyRecord(invoice.getNumber(), invoice.getCustomerName(), item.getProductName(), item.getSku(),
            item.getQuantity(), purchasedAt, endsAt, endsAt != null && !endsAt.isBefore(LocalDate.now()));
    }

    public record WarrantyRecord(String orderNumber, String customerName, String productName, String sku,
                                 Integer quantity, LocalDate purchasedAt, LocalDate warrantyEndsAt, boolean active) { }
}