package com.ventas.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "empleado")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String cargo;
    private BigDecimal salario;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // reemplaza "contraseña" para compatibilidad

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = true)
    @JsonBackReference
    private Sucursal sucursal;

    public Empleado() {}

    public Empleado(String nombre, String cargo, BigDecimal salario, String email, String password, Role role, Sucursal sucursal) {
        this.nombre = nombre;
        this.cargo = cargo;
        this.salario = salario;
        this.email = email;
        this.password = password;
        this.role = role;
        this.sucursal = sucursal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public BigDecimal getSalario() { return salario; }
    public void setSalario(BigDecimal salario) { this.salario = salario; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Sucursal getSucursal() { return sucursal; }
    public void setSucursal(Sucursal sucursal) { this.sucursal = sucursal; }
}

