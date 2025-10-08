package com.ventas.backend.repository;

import com.ventas.backend.model.Empleado;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByEmailAndPassword(String email, String password);
}
