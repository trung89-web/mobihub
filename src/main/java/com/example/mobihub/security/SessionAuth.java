package com.example.mobihub.security;

import com.example.mobihub.entity.StoreAccount;
import com.example.mobihub.repository.StoreAccountRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class SessionAuth {
    private final StoreAccountRepository accounts;

    public SessionAuth(StoreAccountRepository accounts) {
        this.accounts = accounts;
    }

    public StoreAccount requireUser(HttpSession session) {
        Object id = session.getAttribute("accountId");
        if (!(id instanceof Long accountId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }
        StoreAccount account = accounts.findById(accountId)
            .filter(user -> Boolean.TRUE.equals(user.getActive()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ"));
        return account;
    }

    public StoreAccount requireAdmin(HttpSession session) {
        StoreAccount account = requireUser(session);
        if (!"ADMIN".equals(account.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Admin được phép truy cập");
        }
        return account;
    }

    public StoreAccount requireCustomer(HttpSession session) {
        StoreAccount account = requireUser(session);
        if (!"CUSTOMER".equals(account.getRole()) || account.getCustomerId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản khách hàng không hợp lệ");
        }
        return account;
    }
}