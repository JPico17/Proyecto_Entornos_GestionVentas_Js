package com.ventas.backend.repository;

import com.ventas.backend.model.Venta;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    // Suma el total de ventas en el rango [start, end)
    @Query("SELECT SUM(v.total) FROM Venta v WHERE v.fecha >= :start AND v.fecha < :end")
    java.math.BigDecimal sumTotalByFechaRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

