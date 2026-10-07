package com.example.mobihub.controller;

import com.example.mobihub.entity.Invoice;
import com.example.mobihub.repository.InvoiceRepository;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/revenue")
public class RevenueController {
    private final InvoiceRepository invoices;
    private final SessionAuth auth;

    public RevenueController(InvoiceRepository invoices, SessionAuth auth) {
        this.invoices = invoices;
        this.auth = auth;
    }

    @GetMapping
    public RevenueReport getRevenue(@RequestParam(required = false) LocalDate from,
                                    @RequestParam(required = false) LocalDate to,
                                    HttpSession session) {
        auth.requireAdmin(session);
        var eligible = invoices.findAll().stream()
            .filter(invoice -> "DA_THANH_TOAN".equals(invoice.getStatus()) || "HOAN_THANH".equals(invoice.getStatus()))
            .filter(invoice -> from == null || !invoice.getCreatedAt().toLocalDate().isBefore(from))
            .filter(invoice -> to == null || !invoice.getCreatedAt().toLocalDate().isAfter(to))
            .toList();
        BigDecimal total = eligible.stream().map(Invoice::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<LocalDate, BigDecimal> daily = eligible.stream().collect(Collectors.groupingBy(
            invoice -> invoice.getCreatedAt().toLocalDate(),
            Collectors.mapping(Invoice::getTotal, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
        return new RevenueReport(total, eligible.size(), eligible.isEmpty() ? BigDecimal.ZERO
            : total.divide(BigDecimal.valueOf(eligible.size()), 2, java.math.RoundingMode.HALF_UP), daily);
    }

    public record RevenueReport(BigDecimal total, long orderCount, BigDecimal averageOrder,
                                Map<LocalDate, BigDecimal> daily) { }
}