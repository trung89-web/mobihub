package com.example.mobihub.controller;

import com.example.mobihub.entity.Customer;
import com.example.mobihub.entity.CustomerAddress;
import com.example.mobihub.entity.StoreAccount;
import com.example.mobihub.repository.CustomerAddressRepository;
import com.example.mobihub.repository.CustomerRepository;
import com.example.mobihub.repository.StoreAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final StoreAccountRepository accounts;
    private final CustomerRepository customers;
    private final CustomerAddressRepository addresses;
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();

    public AuthController(StoreAccountRepository accounts, CustomerRepository customers,
                          CustomerAddressRepository addresses) {
        this.accounts = accounts;
        this.customers = customers;
        this.addresses = addresses;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public UserView register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String email = normalizeEmail(request.email());
        if (request.name() == null || request.name().isBlank() || request.phone() == null
                || request.phone().isBlank() || request.password() == null || request.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập đủ thông tin; mật khẩu tối thiểu 8 ký tự");
        }
        if (accounts.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký");
        }
        if (customers.existsByPhone(request.phone().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại đã được đăng ký");
        }
        Customer customer = new Customer();
        customer.setName(request.name().trim());
        customer.setPhone(request.phone().trim());
        customer.setEmail(email);
        customer.setAddress(request.address());
        customer = customers.save(customer);
        if (request.address() != null && !request.address().isBlank()) {
            CustomerAddress address = new CustomerAddress();
            address.setCustomerId(customer.getId());
            address.setLabel("Nhà riêng");
            address.setRecipientName(customer.getName());
            address.setPhone(customer.getPhone());
            address.setAddress(request.address().trim());
            address.setDefaultAddress(true);
            addresses.save(address);
        }

        StoreAccount account = new StoreAccount();
        account.setCustomerId(customer.getId());
        account.setEmail(email);
        account.setPasswordHash(passwords.encode(request.password()));
        account.setRole("CUSTOMER");
        account.setActive(true);
        account.setCreatedAt(LocalDateTime.now());
        account = accounts.save(account);
        return establishSession(account, httpRequest);
    }

    @PostMapping("/login")
    public UserView login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        StoreAccount account = accounts.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .filter(user -> Boolean.TRUE.equals(user.getActive()))
            .filter(user -> passwords.matches(request.password() == null ? "" : request.password(), user.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));
        return establishSession(account, httpRequest);
    }

    @GetMapping("/me")
    public UserView current(HttpSession session) {
        Object id = session.getAttribute("accountId");
        if (!(id instanceof Long accountId)) return null;
        return accounts.findById(accountId).map(this::view).orElse(null);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpSession session) {
        session.invalidate();
    }

    private UserView establishSession(StoreAccount account, HttpServletRequest request) {
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) oldSession.invalidate();
        HttpSession session = request.getSession(true);
        session.setAttribute("accountId", account.getId());
        return view(account);
    }

    private UserView view(StoreAccount account) {
        String name = account.getCustomerId() == null ? "Quản trị viên" : customers.findById(account.getCustomerId())
            .map(Customer::getName).orElse("Khách hàng");
        return new UserView(account.getId(), account.getEmail(), account.getRole(), account.getCustomerId(), name);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        return email.trim().toLowerCase();
    }

    public record LoginRequest(String email, String password) { }
    public record RegisterRequest(String name, String phone, String email, String password, String address) { }
    public record UserView(Long id, String email, String role, Long customerId, String name) { }
}