package com.example.mobihub.controller;

import com.example.mobihub.entity.Customer;
import com.example.mobihub.entity.CustomerAddress;
import com.example.mobihub.entity.StoreAccount;
import com.example.mobihub.repository.CustomerAddressRepository;
import com.example.mobihub.repository.CustomerRepository;
import com.example.mobihub.repository.StoreAccountRepository;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/account")
public class CustomerAccountController {
    private final SessionAuth auth;
    private final CustomerRepository customers;
    private final CustomerAddressRepository addresses;
    private final StoreAccountRepository accounts;
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();

    public CustomerAccountController(SessionAuth auth, CustomerRepository customers,
                                     CustomerAddressRepository addresses, StoreAccountRepository accounts) {
        this.auth = auth;
        this.customers = customers;
        this.addresses = addresses;
        this.accounts = accounts;
    }

    @GetMapping("/profile")
    public ProfileView getProfile(HttpSession session) {
        StoreAccount account = auth.requireCustomer(session);
        Customer customer = getCustomer(account);
        return new ProfileView(account.getEmail(), customer.getName(), customer.getPhone(), customer.getDateOfBirth(),
            account.getDefaultPaymentMethod());
    }

    @PutMapping("/profile")
    @Transactional
    public ProfileView updateProfile(@RequestBody ProfileRequest request, HttpSession session) {
        StoreAccount account = auth.requireCustomer(session);
        Customer customer = getCustomer(account);
        if (request.name() == null || request.name().isBlank() || request.phone() == null || request.phone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên và số điện thoại là bắt buộc");
        }
        String phone = request.phone().trim();
        if (customers.existsByPhoneAndIdNot(phone, customer.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại đã được tài khoản khác sử dụng");
        }
        customer.setName(request.name().trim());
        customer.setPhone(phone);
        customer.setDateOfBirth(request.dateOfBirth());
        customers.save(customer);
        return new ProfileView(account.getEmail(), customer.getName(), customer.getPhone(), customer.getDateOfBirth(),
            account.getDefaultPaymentMethod());
    }

    @PostMapping("/password")
    public void changePassword(@RequestBody PasswordRequest request, HttpSession session) {
        StoreAccount account = auth.requireCustomer(session);
        if (request.newPassword() == null || request.newPassword().length() < 8
                || !passwords.matches(request.currentPassword() == null ? "" : request.currentPassword(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng hoặc mật khẩu mới chưa đủ 8 ký tự");
        }
        account.setPasswordHash(passwords.encode(request.newPassword()));
        accounts.save(account);
    }

    @PutMapping("/payment-method")
    public ProfileView updatePaymentMethod(@RequestBody PaymentMethodRequest request, HttpSession session) {
        StoreAccount account = auth.requireCustomer(session);
        if (!List.of("COD", "CHUYEN_KHOAN").contains(request.method())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ");
        }
        account.setDefaultPaymentMethod(request.method());
        accounts.save(account);
        Customer customer = getCustomer(account);
        return new ProfileView(account.getEmail(), customer.getName(), customer.getPhone(), customer.getDateOfBirth(),
            account.getDefaultPaymentMethod());
    }

    @GetMapping("/addresses")
    public List<CustomerAddress> getAddresses(HttpSession session) {
        return addresses.findByCustomerIdOrderByDefaultAddressDescIdDesc(auth.requireCustomer(session).getCustomerId());
    }

    @PostMapping("/addresses")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public CustomerAddress createAddress(@RequestBody AddressRequest request, HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        validateAddress(request);
        CustomerAddress address = new CustomerAddress();
        address.setCustomerId(customerId);
        apply(address, request);
        address.setDefaultAddress(Boolean.TRUE.equals(request.defaultAddress()) || addresses.countByCustomerId(customerId) == 0);
        if (Boolean.TRUE.equals(address.getDefaultAddress())) clearDefault(customerId);
        return addresses.save(address);
    }

    @PutMapping("/addresses/{id}")
    @Transactional
    public CustomerAddress updateAddress(@PathVariable Long id, @RequestBody AddressRequest request, HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        validateAddress(request);
        CustomerAddress address = getAddress(id, customerId);
        apply(address, request);
        if (Boolean.TRUE.equals(request.defaultAddress())) {
            clearDefault(customerId);
            address.setDefaultAddress(true);
        }
        return addresses.save(address);
    }

    @PatchMapping("/addresses/{id}/default")
    @Transactional
    public CustomerAddress setDefaultAddress(@PathVariable Long id, HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        CustomerAddress address = getAddress(id, customerId);
        clearDefault(customerId);
        address.setDefaultAddress(true);
        return addresses.save(address);
    }

    @DeleteMapping("/addresses/{id}")
    @Transactional
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(@PathVariable Long id, HttpSession session) {
        Long customerId = auth.requireCustomer(session).getCustomerId();
        CustomerAddress address = getAddress(id, customerId);
        boolean wasDefault = Boolean.TRUE.equals(address.getDefaultAddress());
        addresses.delete(address);
        if (wasDefault) addresses.findByCustomerIdOrderByDefaultAddressDescIdDesc(customerId).stream().findFirst()
            .ifPresent(next -> { next.setDefaultAddress(true); addresses.save(next); });
    }

    private Customer getCustomer(StoreAccount account) {
        return customers.findById(account.getCustomerId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản khách hàng không hợp lệ"));
    }

    private CustomerAddress getAddress(Long id, Long customerId) {
        return addresses.findByIdAndCustomerId(id, customerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ"));
    }

    private void validateAddress(AddressRequest request) {
        if (request.recipientName() == null || request.recipientName().isBlank()
                || request.phone() == null || request.phone().isBlank()
                || request.address() == null || request.address().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Người nhận, số điện thoại và địa chỉ là bắt buộc");
        }
    }

    private void apply(CustomerAddress address, AddressRequest request) {
        address.setLabel(request.label() == null || request.label().isBlank() ? "Nhà riêng" : request.label().trim());
        address.setRecipientName(request.recipientName().trim());
        address.setPhone(request.phone().trim());
        address.setAddress(request.address().trim());
    }

    private void clearDefault(Long customerId) {
        addresses.findByCustomerIdOrderByDefaultAddressDescIdDesc(customerId).stream()
            .filter(address -> Boolean.TRUE.equals(address.getDefaultAddress()))
            .forEach(address -> { address.setDefaultAddress(false); addresses.save(address); });
    }

    public record ProfileRequest(String name, String phone, LocalDate dateOfBirth) { }
    public record ProfileView(String email, String name, String phone, LocalDate dateOfBirth, String defaultPaymentMethod) { }
    public record PasswordRequest(String currentPassword, String newPassword) { }
    public record PaymentMethodRequest(String method) { }
    public record AddressRequest(String label, String recipientName, String phone, String address, Boolean defaultAddress) { }
}