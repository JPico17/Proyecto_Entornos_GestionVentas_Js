package com.ventas.backend.controller;

import com.ventas.backend.dto.LoginRequest;
import com.ventas.backend.dto.LoginResponse;
import com.ventas.backend.model.Empleado;
import com.ventas.backend.repository.EmpleadoRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Empleado> empleado = empleadoRepository.findByNombreAndContraseña(
                request.getUsername(),
                request.getPassword());

        if (empleado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }

        // Crear respuesta sin incluir contraseña
        LoginResponse response = new LoginResponse(
                empleado.get().getNombre(),
                empleado.get().getCargo(),
                "Login exitoso");

        return ResponseEntity.ok(response);
    }
}
