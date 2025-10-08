package com.ventas.backend.controller;

import com.ventas.backend.dto.LoginRequest;
import com.ventas.backend.model.Empleado;
import com.ventas.backend.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Empleado> empleadoOpt = empleadoRepository.findByEmailAndPassword(
                request.getEmail(),
                request.getPassword()
        );

        if (empleadoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "❌ Credenciales inválidas"));
        }

        Empleado empleado = empleadoOpt.get();

        // Asegurar que la sucursal se cargue correctamente
        Long sucursalId = empleado.getSucursal() != null ? empleado.getSucursal().getId() : null;

        return ResponseEntity.ok(Map.of(
                "id", empleado.getId(),
                "nombre", empleado.getNombre(),
                "email", empleado.getEmail(),
                "role", empleado.getRole().toString(),
                "sucursalId", sucursalId,
                "mensaje", "✅ Login exitoso"
        ));
    }
}



