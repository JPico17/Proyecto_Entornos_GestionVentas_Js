package com.ventas.backend.controller;

import com.ventas.backend.model.Sucursal;
import com.ventas.backend.repository.SucursalRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    private final SucursalRepository sucursalRepository;

    public SucursalController(SucursalRepository sucursalRepository) {
        this.sucursalRepository = sucursalRepository;
    }

    @GetMapping 
    public List<Sucursal> listar() {
        return sucursalRepository.findAll();
    }

    @PostMapping
    public Sucursal crear(@RequestBody Sucursal sucursal) {
        return sucursalRepository.save(sucursal);
    }

    @GetMapping("/{id}")
    public Sucursal obtenerPorId(@PathVariable Long id) {
        return sucursalRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Sucursal actualizar(@PathVariable Long id, @RequestBody Sucursal sucursal) {
        sucursal.setId(id);
        return sucursalRepository.save(sucursal);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        sucursalRepository.deleteById(id);
    }
}
