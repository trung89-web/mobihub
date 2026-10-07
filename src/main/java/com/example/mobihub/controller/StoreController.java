package com.example.mobihub.controller;

import com.example.mobihub.entity.Category;
import com.example.mobihub.entity.Customer;
import com.example.mobihub.repository.CategoryRepository;
import com.example.mobihub.repository.CustomerRepository;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class StoreController {
    private final CategoryRepository categories;
    private final CustomerRepository customers;
    private final SessionAuth auth;

    public StoreController(CategoryRepository categories, CustomerRepository customers, SessionAuth auth) {
        this.categories = categories;
        this.customers = customers;
        this.auth = auth;
    }

    @GetMapping("/api/categories")
    public List<Category> getCategories() {
        return categories.findAll();
    }

    @PostMapping("/api/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public Category createCategory(@RequestBody Category category, HttpSession session) {
        auth.requireAdmin(session);
        return categories.save(category);
    }

    @GetMapping("/api/admin/customers")
    public List<Customer> getCustomers(HttpSession session) {
        auth.requireAdmin(session);
        return customers.findAll();
    }
}