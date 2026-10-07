package com.example.mobihub.controller;

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
@RequestMapping("/api/account/warranties")
public class WarrantyController {
    private final SessionAuth auth;
    private final InvoiceRepository invoices;
    private final InvoiceItemRepository items;
    private final ProductRepository products;

    public WarrantyController(SessionAuth auth, InvoiceRepository invoices, InvoiceItemRepository items,
                              ProductRepository products) {
        this.auth = auth;
        this.invoices = invoices;
        this.items = items;
        this.products = products;
    }

    @GetMapping
    public List<WarrantyView> getWarranties(HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        return invoices.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
            .filter(invoice -> "DA_THANH_TOAN".equals(invoice.getStatus()) || "HOAN_THANH".equals(invoice.getStatus()))
            .flatMap(invoice -> items.findByInvoiceId(invoice.getId()).stream()
                .map(item -> toView(invoice.getNumber(), invoice.getCreatedAt().toLocalDate(), item)))
            .toList();
    }

    private WarrantyView toView(String orderNumber, LocalDate purchasedAt, InvoiceItem item) {
        LocalDate endsAt = item.getWarrantyEndsAt();
        if (endsAt == null && item.getProductId() != null) {
            endsAt = products.findById(item.getProductId())
                .map(product -> purchasedAt.plusMonths(product.getWarrantyMonths())).orElse(purchasedAt);
        }
        boolean valid = endsAt != null && !endsAt.isBefore(LocalDate.now());
        return new WarrantyView(item.getProductName(), item.getSku(), item.getQuantity(), orderNumber,
            purchasedAt, endsAt, valid ? "CON_HAN" : "HET_HAN");
    }

    public record WarrantyView(String productName, String sku, Integer quantity, String orderNumber,
                               LocalDate purchasedAt, LocalDate warrantyEndsAt, String status) { }
}