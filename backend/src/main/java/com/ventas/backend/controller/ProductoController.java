package com.ventas.backend.controller;

import com.ventas.backend.model.Producto;
import com.ventas.backend.model.Sucursal;
import com.ventas.backend.repository.ProductoRepository;
import com.ventas.backend.repository.SucursalRepository;
import com.ventas.backend.dto.ProductoDTO;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;
    private final SucursalRepository sucursalRepository;

    public ProductoController(ProductoRepository productoRepository, SucursalRepository sucursalRepository) {
        this.productoRepository = productoRepository;
        this.sucursalRepository = sucursalRepository;
    }

    @GetMapping
    public List<Producto> listar(@RequestParam(name = "sucursalId", required = false) Long sucursalId) {
        if (sucursalId != null) {
            return productoRepository.findBySucursalId(sucursalId);
        }
        return productoRepository.findAll();
    }

    @PostMapping
    public Producto crear(@RequestBody ProductoDTO dto) {
        Producto p = new Producto();
        p.setNombre(dto.getNombre());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());
        if (dto.getSucursalId() != null) {
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            p.setSucursal(s);
        }
        return productoRepository.save(p);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @RequestBody ProductoDTO dto) {
        Producto p = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no existe"));
        p.setNombre(dto.getNombre());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock());
        if (dto.getSucursalId() != null) {
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            p.setSucursal(s);
        } else {
            p.setSucursal(null);
        }
        return productoRepository.save(p);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoRepository.deleteById(id);
    }

    @GetMapping("/{id}")
    public Producto obtener(@PathVariable Long id) {
        return productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No encontrado"));
    }
}
