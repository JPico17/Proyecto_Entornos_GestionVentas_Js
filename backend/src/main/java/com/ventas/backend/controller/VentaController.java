package com.ventas.backend.controller;

import com.ventas.backend.model.Venta;
import com.ventas.backend.repository.VentaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaRepository ventaRepository;

    public VentaController(VentaRepository ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    @GetMapping
    public List<Venta> listar() {
        return ventaRepository.findAll();
    }

    @PostMapping
    public Venta crear(@RequestBody Venta venta) {
        return ventaRepository.save(venta);
    }

    @GetMapping("/{id}")
    public Venta obtenerPorId(@PathVariable Long id) {
        return ventaRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Venta actualizar(@PathVariable Long id, @RequestBody Venta venta) {
        venta.setId(id);
        return ventaRepository.save(venta);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        ventaRepository.deleteById(id);
    }
}

