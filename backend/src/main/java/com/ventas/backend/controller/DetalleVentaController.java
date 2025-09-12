package com.ventas.backend.controller;

import com.ventas.backend.model.DetalleVenta;
import com.ventas.backend.repository.DetalleVentaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalleventas")
public class DetalleVentaController {

    private final DetalleVentaRepository detalleVentaRepository;

    public DetalleVentaController(DetalleVentaRepository detalleVentaRepository) {
        this.detalleVentaRepository = detalleVentaRepository;
    }

    @GetMapping
    public List<DetalleVenta> listar() {
        return detalleVentaRepository.findAll();
    }

    @PostMapping
    public DetalleVenta crear(@RequestBody DetalleVenta detalleVenta) {
        return detalleVentaRepository.save(detalleVenta);
    }

    @GetMapping("/{id}")
    public DetalleVenta obtenerPorId(@PathVariable Long id) {
        return detalleVentaRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public DetalleVenta actualizar(@PathVariable Long id, @RequestBody DetalleVenta detalleVenta) {
        detalleVenta.setId(id);
        return detalleVentaRepository.save(detalleVenta);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        detalleVentaRepository.deleteById(id);
    }
}

