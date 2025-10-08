package com.ventas.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ventas.backend.repository.*;
import com.ventas.backend.model.*;
import com.ventas.backend.dto.VentaDTO;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class VentaService {
    private final VentaRepository ventaRepo;
    private final ProductoRepository productoRepo;
    private final ClienteRepository clienteRepo;
    private final EmpleadoRepository empleadoRepo;
    private final SucursalRepository sucursalRepo;

    public VentaService(VentaRepository ventaRepo, ProductoRepository productoRepo,
                        ClienteRepository clienteRepo, EmpleadoRepository empleadoRepo,
                        SucursalRepository sucursalRepo) {
        this.ventaRepo = ventaRepo;
        this.productoRepo = productoRepo;
        this.clienteRepo = clienteRepo;
        this.empleadoRepo = empleadoRepo;
        this.sucursalRepo = sucursalRepo;
    }

    @Transactional
    public Venta registrarVenta(VentaDTO dto) {
        Cliente cliente = clienteRepo.findById(dto.getClienteId()).orElseThrow();
        Empleado empleado = empleadoRepo.findById(dto.getEmpleadoId()).orElseThrow();
        Sucursal sucursal = sucursalRepo.findById(dto.getSucursalId()).orElseThrow();

        Venta venta = new Venta();
        venta.setCliente(cliente);
        venta.setEmpleado(empleado);
        venta.setSucursal(sucursal);

        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (VentaDTO.Item item : dto.getItems()) {
            Producto producto = productoRepo.findById(item.getProductoId()).orElseThrow();
            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para producto: " + producto.getNombre());
            }
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepo.save(producto);

            DetalleVenta det = new DetalleVenta();
            det.setProducto(producto);
            det.setCantidad(item.getCantidad());
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            det.setSubtotal(subtotal);
            det.setVenta(venta);
            detalles.add(det);
            total = total.add(subtotal);
        }

        venta.setDetalles(detalles);
        venta.setTotal(total);

        return ventaRepo.save(venta);
    }
    @Transactional(readOnly = true)
    public List<Venta> listarTodas() {
        List<Venta> ventas = ventaRepo.findAll();
        // Forzamos la carga de los detalles (y sus productos)
        for (Venta v : ventas) {
            v.getDetalles().size(); // Inicializa la colección
            if (v.getDetalles() != null) {
                v.getDetalles().forEach(d -> d.getProducto().getNombre());
            }
        }
        return ventas;
    }

    public List<DetalleVenta> listarDetallesPorVenta(Long ventaId) {
    return ventaRepo.findById(ventaId)
        .map(Venta::getDetalles)
        .orElse(List.of());
    }


}
