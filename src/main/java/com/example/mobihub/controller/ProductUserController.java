package com.example.mobihub.controller;

import com.example.mobihub.entity.Product;
import com.example.mobihub.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/store/products")
public class ProductUserController {
    private final ProductRepository products;

    public ProductUserController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<Product> searchProducts(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) Long categoryId) {
        String search = q == null ? "" : q.trim().toLowerCase();
        return products.findAll().stream()
            .filter(product -> Boolean.TRUE.equals(product.getActive()) && product.getStock() > 0)
            .filter(product -> categoryId == null || categoryId.equals(product.getCategoryId()))
            .filter(product -> search.isBlank() || product.getName().toLowerCase().contains(search)
                || product.getSku().toLowerCase().contains(search)
                || (product.getBrand() != null && product.getBrand().toLowerCase().contains(search)))
            .toList();
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return products.findById(id)
            .filter(product -> Boolean.TRUE.equals(product.getActive()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
    }
}