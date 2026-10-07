package com.example.mobihub.controller;

import com.example.mobihub.entity.*;
import com.example.mobihub.repository.*;
import com.example.mobihub.security.SessionAuth;
import jakarta.transaction.Transactional;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
public class SalesController {
    private final InvoiceRepository invoices;
    private final InvoiceItemRepository items;
    private final ProductRepository products;
    private final CustomerRepository customers;
    private final DeliveryInfoRepository deliveryInfo;
    private final SessionAuth auth;

    public SalesController(InvoiceRepository invoices, InvoiceItemRepository items,
                           ProductRepository products, CustomerRepository customers,
                           DeliveryInfoRepository deliveryInfo, SessionAuth auth) {
        this.invoices = invoices;
        this.items = items;
        this.products = products;
        this.customers = customers;
        this.deliveryInfo = deliveryInfo;
        this.auth = auth;
    }

    @GetMapping
    public List<SaleView> getSales(HttpSession session) {
        auth.requireAdmin(session);
        return invoices.findAllByOrderByCreatedAtDesc().stream()
            .map(invoice -> new SaleView(invoice, items.findByInvoiceId(invoice.getId()),
                deliveryInfo.findByInvoiceId(invoice.getId()).map(DeliveryInfo::getShippingAddress).orElse(null)))
            .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public SaleView createSale(@RequestBody SaleRequest request, HttpSession session) {
        auth.requireAdmin(session);
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hóa đơn chưa có sản phẩm");
        }
        boolean onlineOrder = request.status() != null && !request.status().isBlank();
        if (onlineOrder && !"CHO_XAC_NHAN".equals(request.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn online phải bắt đầu ở trạng thái chờ xác nhận");
        }
        if (onlineOrder && (request.shippingAddress() == null || request.shippingAddress().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn giao hàng cần có địa chỉ nhận hàng");
        }

        Customer customer = request.customerId() == null ? null : customers.findById(request.customerId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        Invoice invoice = new Invoice();
        invoice.setNumber("HD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"))
            + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        invoice.setCustomerId(customer == null ? null : customer.getId());
        invoice.setCustomerName(customer == null ? "Khách lẻ" : customer.getName());
        invoice.setPaymentMethod(request.paymentMethod() == null ? "TIEN_MAT" : request.paymentMethod());
        invoice.setStatus(onlineOrder ? "CHO_XAC_NHAN" : "DA_THANH_TOAN");
        invoice.setCreatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        for (SaleItemRequest requestedItem : request.items()) {
            if (requestedItem.quantity() == null || requestedItem.quantity() < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng bán phải lớn hơn 0");
            }
            Product product = products.findById(requestedItem.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
            if (!Boolean.TRUE.equals(product.getActive()) || product.getStock() < requestedItem.quantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Sản phẩm không kinh doanh hoặc không đủ tồn kho: " + product.getName());
            }
            product.setStock(product.getStock() - requestedItem.quantity());
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(requestedItem.quantity()));
            total = total.add(lineTotal);
        }

        invoice.setTotal(total);
        invoice = invoices.save(invoice);
        if (onlineOrder) {
            DeliveryInfo delivery = new DeliveryInfo();
            delivery.setInvoiceId(invoice.getId());
            delivery.setShippingAddress(request.shippingAddress().trim());
            deliveryInfo.save(delivery);
        }
        for (SaleItemRequest requestedItem : request.items()) {
            Product product = products.findById(requestedItem.productId()).orElseThrow();
            InvoiceItem item = new InvoiceItem();
            item.setInvoiceId(invoice.getId());
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setSku(product.getSku());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(requestedItem.quantity());
            item.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(requestedItem.quantity())));
            item.setWarrantyEndsAt(LocalDate.now().plusMonths(product.getWarrantyMonths()));
            items.save(item);
        }
        return new SaleView(invoice, items.findByInvoiceId(invoice.getId()), request.shippingAddress());
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public SaleView updateStatus(@PathVariable Long id, @RequestBody StatusRequest request, HttpSession session) {
        auth.requireAdmin(session);
        Invoice invoice = invoices.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        String current = invoice.getStatus();
        String next = request.status();
        boolean allowed = switch (current) {
            case "CHO_XAC_NHAN" -> Set.of("DA_XAC_NHAN", "DA_HUY").contains(next);
            case "DA_XAC_NHAN" -> Set.of("DANG_GIAO", "DA_HUY").contains(next);
            case "DANG_GIAO" -> "HOAN_THANH".equals(next);
            default -> false;
        };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể chuyển trạng thái đơn hàng");
        }
        if ("DA_HUY".equals(next)) {
            for (InvoiceItem item : items.findByInvoiceId(id)) {
                if (item.getProductId() != null) {
                    products.findById(item.getProductId()).ifPresent(product -> {
                        product.setStock(product.getStock() + item.getQuantity());
                        products.save(product);
                    });
                }
            }
        }
        invoice.setStatus(next);
        invoice = invoices.save(invoice);
        return new SaleView(invoice, items.findByInvoiceId(id),
            deliveryInfo.findByInvoiceId(id).map(DeliveryInfo::getShippingAddress).orElse(null));
    }

    public record SaleRequest(Long customerId, String paymentMethod, String status,
                              String shippingAddress, List<SaleItemRequest> items) { }
    public record SaleItemRequest(Long productId, Integer quantity) { }
    public record StatusRequest(String status) { }
    public record SaleView(Invoice invoice, List<InvoiceItem> items, String shippingAddress) { }
}