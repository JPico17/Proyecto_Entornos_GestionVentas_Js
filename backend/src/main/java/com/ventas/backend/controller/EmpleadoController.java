package com.ventas.backend.controller;

import com.ventas.backend.dto.EmpleadoDTO;
import com.ventas.backend.model.Empleado;
import com.ventas.backend.model.Role;
import com.ventas.backend.model.Sucursal;
import com.ventas.backend.repository.EmpleadoRepository;
import com.ventas.backend.repository.SucursalRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoRepository empleadoRepository;
    private final SucursalRepository sucursalRepository;

    public EmpleadoController(EmpleadoRepository empleadoRepository, SucursalRepository sucursalRepository) {
        this.empleadoRepository = empleadoRepository;
        this.sucursalRepository = sucursalRepository;
    }

    @GetMapping
    public List<Empleado> listar() {
        return empleadoRepository.findAll();
    }

    @PostMapping
    public Empleado crear(@RequestBody EmpleadoDTO dto) {
        Empleado e = new Empleado();
        e.setNombre(dto.getNombre());
        e.setCargo(dto.getCargo());
        e.setSalario(dto.getSalario());
        e.setEmail(dto.getEmail());
        e.setPassword(dto.getPassword());
        e.setRole(dto.getRole());

        if (dto.getRole() == Role.EMPLOYEE) {
            if (dto.getSucursalId() == null)
                throw new RuntimeException("El empleado con role EMPLOYEE debe tener sucursal asignada");
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            e.setSucursal(s);
        } else {
            e.setSucursal(null);
        }

        return empleadoRepository.save(e);
    }

    @PutMapping("/{id}")
    public Empleado actualizar(@PathVariable Long id, @RequestBody EmpleadoDTO dto) {
        Empleado e = empleadoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        e.setNombre(dto.getNombre());
        e.setCargo(dto.getCargo());
        e.setSalario(dto.getSalario());
        e.setEmail(dto.getEmail());
        e.setPassword(dto.getPassword());
        e.setRole(dto.getRole());

        if (dto.getRole() == Role.EMPLOYEE) {
            if (dto.getSucursalId() == null)
                throw new RuntimeException("El empleado con role EMPLOYEE debe tener sucursal asignada");
            Sucursal s = sucursalRepository.findById(dto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
            e.setSucursal(s);
        } else {
            e.setSucursal(null);
        }

        return empleadoRepository.save(e);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        empleadoRepository.deleteById(id);
    }

    @GetMapping("/{id}")
    public Empleado obtener(@PathVariable Long id) {
        return empleadoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
    }
}
