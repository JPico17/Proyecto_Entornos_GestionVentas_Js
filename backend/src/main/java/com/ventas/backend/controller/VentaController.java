package com.ventas.backend.controller;

import com.ventas.backend.dto.VentaDTO;
import com.ventas.backend.model.Venta;
import com.ventas.backend.service.VentaService;
import com.ventas.backend.repository.VentaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;
    private final VentaRepository ventaRepository;

    public VentaController(VentaService ventaService, VentaRepository ventaRepository) {
        this.ventaService = ventaService;
        this.ventaRepository = ventaRepository;
    }

    @GetMapping
    public List<Venta> listarVentas() {
        return ventaService.listarTodas();
    }

    @PostMapping
    public ResponseEntity<?> registrarVenta(@RequestBody VentaDTO dto) {
        try {
            Venta nueva = ventaService.registrarVenta(dto);
            return ResponseEntity.ok(nueva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Devuelve el total de ventas del día (double)
    @GetMapping("/hoy")
    public ResponseEntity<Double> getVentasDeHoy() {
        LocalDate hoy = LocalDate.now();
        LocalDate mañana = hoy.plusDays(1);
        java.time.LocalDateTime start = hoy.atStartOfDay();
        java.time.LocalDateTime end = mañana.atStartOfDay();
        java.math.BigDecimal totalBd = ventaRepository.sumTotalByFechaRange(start, end);
        double total = (totalBd == null) ? 0.0 : totalBd.doubleValue();
        return ResponseEntity.ok(total);
    }

}


