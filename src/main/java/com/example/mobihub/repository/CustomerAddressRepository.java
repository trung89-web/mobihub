package com.example.mobihub.repository;

import com.example.mobihub.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    List<CustomerAddress> findByCustomerIdOrderByDefaultAddressDescIdDesc(Long customerId);
    Optional<CustomerAddress> findByIdAndCustomerId(Long id, Long customerId);
    long countByCustomerId(Long customerId);
}