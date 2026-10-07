package com.example.mobihub.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentInfoController {
    @Value("${app.payment.bank-id:}") private String bankId;
    @Value("${app.payment.account-no:}") private String accountNo;
    @Value("${app.payment.account-name:}") private String accountName;

    @GetMapping("/api/store/payment-info")
    public PaymentInfo getPaymentInfo() {
        boolean configured = !bankId.isBlank() && !accountNo.isBlank() && !accountName.isBlank();
        return new PaymentInfo(configured, configured ? bankId : null, configured ? accountNo : null,
            configured ? accountName : null);
    }

    public record PaymentInfo(boolean qrConfigured, String bankId, String accountNo, String accountName) { }
}