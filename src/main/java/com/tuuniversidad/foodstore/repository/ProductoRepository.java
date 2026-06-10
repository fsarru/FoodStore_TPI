package com.tuuniversidad.foodstore.repository;

import com.tuuniversidad.foodstore.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}{
}
