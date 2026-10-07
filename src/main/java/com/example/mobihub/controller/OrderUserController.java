package com.example.mobihub.controller;

import com.example.mobihub.entity.*;
import com.example.mobihub.repository.*;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/account/orders")
public class OrderUserController {
    private final SessionAuth auth;
    private final InvoiceRepository invoices;
    private final InvoiceItemRepository items;
    private final ProductRepository products;
    private final DeliveryInfoRepository delivery;
    private final CustomerRepository customers;
    private final CustomerAddressRepository addresses;

    public OrderUserController(SessionAuth auth, InvoiceRepository invoices, InvoiceItemRepository items,
                               ProductRepository products, DeliveryInfoRepository delivery,
                               CustomerRepository customers, CustomerAddressRepository addresses) {
        this.auth = auth;
        this.invoices = invoices;
        this.items = items;
        this.products = products;
        this.delivery = delivery;
        this.customers = customers;
        this.addresses = addresses;
    }

    @GetMapping
    public List<OrderView> getMyOrders(HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        return invoices.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
            .map(invoice -> view(invoice)).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public OrderView placeOrder(@RequestBody OrderRequest request, HttpSession session) {
        StoreAccount account = auth.requireCustomer(session);
        if (request.items() == null || request.items().isEmpty()
            || request.addressId() == null && (request.address() == null || request.address().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giỏ hàng và địa chỉ giao hàng là bắt buộc");
        }
        Customer customer = customers.findById(account.getCustomerId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản khách hàng không hợp lệ"));
        String shippingAddress = request.addressId() == null ? request.address().trim()
            : addresses.findByIdAndCustomerId(request.addressId(), customer.getId())
                .map(address -> address.getRecipientName() + " · " + address.getPhone() + " · " + address.getAddress())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest line : request.items()) {
            if (line.productId() == null || line.quantity() == null || line.quantity() < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm hoặc số lượng không hợp lệ");
            }
            Product product = products.findById(line.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
            if (!Boolean.TRUE.equals(product.getActive()) || product.getStock() < line.quantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Không đủ tồn kho: " + product.getName());
            }
            product.setStock(product.getStock() - line.quantity());
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }

        Invoice invoice = new Invoice();
        invoice.setNumber("MH" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"))
            + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        invoice.setCustomerId(customer.getId());
        invoice.setCustomerName(customer.getName());
        invoice.setPaymentMethod(request.paymentMethod() == null ? "COD" : request.paymentMethod());
        invoice.setStatus("CHO_XAC_NHAN");
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setTotal(total);
        invoice = invoices.save(invoice);

        DeliveryInfo deliveryInfo = new DeliveryInfo();
        deliveryInfo.setInvoiceId(invoice.getId());
        deliveryInfo.setShippingAddress(shippingAddress);
        delivery.save(deliveryInfo);
        for (OrderItemRequest line : request.items()) {
            Product product = products.findById(line.productId()).orElseThrow();
            InvoiceItem item = new InvoiceItem();
            item.setInvoiceId(invoice.getId());
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setSku(product.getSku());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(line.quantity());
            item.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
            item.setWarrantyEndsAt(LocalDateTime.now().toLocalDate().plusMonths(product.getWarrantyMonths()));
            items.save(item);
        }
        return view(invoice);
    }

    @PostMapping("/{id}/cancel")
    @Transactional
    public OrderView cancelOrder(@PathVariable Long id, HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        Invoice invoice = invoices.findById(id)
            .filter(order -> customerId.equals(order.getCustomerId()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        if (!"CHO_XAC_NHAN".equals(invoice.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ có thể hủy đơn đang chờ xác nhận");
        }
        restoreStock(id);
        invoice.setStatus("DA_HUY");
        return view(invoices.save(invoice));
    }

    private void restoreStock(Long invoiceId) {
        for (InvoiceItem line : items.findByInvoiceId(invoiceId)) {
            if (line.getProductId() != null) {
                products.findById(line.getProductId()).ifPresent(product -> {
                    product.setStock(product.getStock() + line.getQuantity());
                    products.save(product);
                });
            }
        }
    }

    private OrderView view(Invoice invoice) {
        return new OrderView(invoice, items.findByInvoiceId(invoice.getId()),
            delivery.findByInvoiceId(invoice.getId()).map(DeliveryInfo::getShippingAddress).orElse(null));
    }

    public record OrderRequest(String address, Long addressId, String paymentMethod, List<OrderItemRequest> items) { }
    public record OrderItemRequest(Long productId, Integer quantity) { }
    public record OrderView(Invoice invoice, List<InvoiceItem> items, String shippingAddress) { }
}