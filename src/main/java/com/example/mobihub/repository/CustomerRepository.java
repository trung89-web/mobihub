package com.example.mobihub.repository;

import com.example.mobihub.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
	boolean existsByPhone(String phone);
	boolean existsByPhoneAndIdNot(String phone, Long id);
}