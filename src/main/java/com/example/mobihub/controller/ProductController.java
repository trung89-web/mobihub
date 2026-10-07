package com.example.mobihub.controller;

import com.example.mobihub.entity.Product;
import com.example.mobihub.repository.ProductRepository;
import com.example.mobihub.security.SessionAuth;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class ProductController {
    private final ProductRepository products;
    private final SessionAuth auth;

    public ProductController(ProductRepository products, SessionAuth auth) {
        this.products = products;
        this.auth = auth;
    }

    @GetMapping
    public List<Product> getProducts(HttpSession session) {
        auth.requireAdmin(session);
        return products.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(@RequestBody Product product, HttpSession session) {
        auth.requireAdmin(session);
        validateProduct(product);
        if (products.existsBySku(product.getSku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã sản phẩm đã tồn tại");
        }
        return products.save(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product, HttpSession session) {
        auth.requireAdmin(session);
        Product current = products.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        validateProduct(product);
        if (products.existsBySkuAndIdNot(product.getSku(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã sản phẩm đã tồn tại");
        }
        product.setId(current.getId());
        return products.save(product);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id, HttpSession session) {
        auth.requireAdmin(session);
        if (!products.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        products.deleteById(id);
    }

    private void validateProduct(Product product) {
        if (product.getSku() == null || product.getSku().isBlank()
                || product.getName() == null || product.getName().isBlank()
                || product.getCategoryId() == null || product.getPrice() == null
                || product.getPrice().signum() < 0 || product.getStock() == null
                || product.getStock() < 0 || product.getWarrantyMonths() == null
                || product.getWarrantyMonths() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin sản phẩm không hợp lệ");
        }
    }
}