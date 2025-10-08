(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const role = (localStorage.getItem("role") || "EMPLOYEE").toUpperCase();
  const nombre = localStorage.getItem("nombre") || "";
  const navbar = qs("#navbar");
  const content = qs("#dynamicContent");

  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);

  const formatMoney = (n) => Number(n).toLocaleString("es-CO");

  // ====== NAVBAR ======
  function renderNavbar() {
    const userHtml = `<span class="user">Hola, ${nombre || "Usuario"}</span>`;

    navbar.innerHTML = role === "ADMIN"
      ? `
        <div class="container nav-inner">
          <a href="#" class="brand"><span class="tag">ADMIN</span> Gestión de Ventas</a>
          <div class="nav-links">
            <a href="#" data-route="dashboard" class="btn">Dashboard</a>
            <a href="#" data-route="empleados" class="btn">Empleados</a>
            <a href="#" data-route="productos" class="btn">Productos</a>
            <button id="themeToggle" class="btn ghost">🌗</button>
            <button id="logoutBtn" class="btn">Cerrar sesión</button>
          </div>
        </div>`
      : `
        <div class="container nav-inner">
          <a href="#" class="brand"><span class="tag">Empleado</span> Gestión de Ventas</a>
          <div class="nav-links">
            <a href="#" data-route="inventario" class="btn">Inventario</a>
            <a href="#" data-route="ventas" class="btn">Ventas</a>
            <button id="themeToggle" class="btn ghost">🌗</button>
            <button id="logoutBtn" class="btn">Cerrar sesión</button>
          </div>
        </div>`;

    qs("#userInfo")?.insertAdjacentHTML("beforeend", userHtml);

    qs("#logoutBtn").addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });

    qs("#themeToggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });

    qsa(".nav-links [data-route]").forEach((a) => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        routeDispatcher(a.getAttribute("data-route"));
      });
    });
  }

  function routeDispatcher(route) {
    switch (route) {
      case "dashboard": renderAdminDashboard(); break;
      case "empleados": renderEmpleados(); break;
      case "productos": renderProductos(); break;
      case "inventario": renderEmployeeHome(); break;
      case "ventas": renderVentas(); break;
      default:
        role === "ADMIN" ? renderAdminDashboard() : renderEmployeeHome();
    }
  }

  // ====== VISTAS ======
  function renderAdminDashboard() {
    content.innerHTML = `
      <section>
        <h2>📊 Panel de Administración</h2>
        <div class="grid cols-3">
          <div class="card"><h3>Total Empleados</h3><p id="totalEmpleados">...</p></div>
          <div class="card"><h3>Total Productos</h3><p id="totalProductos">...</p></div>
          <div class="card"><h3>Ventas Hoy</h3><p id="ventasHoy">...</p></div>
        </div>
      </section>`;
    // Aseguramos refresco de KPIs cada vez que se renderiza el dashboard
    cargarKPIs();
    // También forzamos un nuevo cálculo un poco después para evitar condiciones de carrera en navegadores
    setTimeout(() => {
      try { cargarKPIs(); } catch (e) { console.debug('Error segundo refresh KPIs', e); }
    }, 200);
  }

  function renderEmpleados() {
    content.innerHTML = `
      <section>
        <h2>👥 Empleados</h2>
        <table class="table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Cargo</th></tr></thead>
          <tbody id="empleadosBody"></tbody>
        </table>
      </section>`;
    cargarEmpleados();
  }

  function renderProductos() {
    content.innerHTML = `
      <section>
        <h2>📦 Productos</h2>
        <table class="table">
          <thead><tr><th>ID</th><th>Producto</th><th>Precio</th><th>Stock</th></tr></thead>
          <tbody id="productosBody"></tbody>
        </table>
      </section>`;
    cargarProductos();
  }

  function renderEmployeeHome() {
    content.innerHTML = `
      <section>
        <h2>🛒 Módulo de Ventas</h2>
        <p>Bienvenido empleado. Aquí puedes ver productos y registrar ventas.</p>
        <table class="table">
          <thead><tr><th>ID</th><th>Producto</th><th>Precio</th><th>Stock</th></tr></thead>
          <tbody id="productosBody"></tbody>
        </table>
      </section>`;
    cargarProductos();
  }

  // ====== REGISTRAR VENTAS ======
  async function renderVentas() {
    content.innerHTML = `
      <section>
        <h2>💳 Registrar Venta</h2>
        <form id="ventaForm" class="card">
          <label class="field"><span>Producto</span>
            <select id="ventaProducto" required><option value="">-- Selecciona --</option></select>
          </label>
          <div id="productoInfo" class="info-box" style="display:none;">
            <p><b>Nombre:</b> <span id="infoNombre"></span></p>
            <p><b>Precio:</b> $<span id="infoPrecio"></span></p>
            <p><b>Stock:</b> <span id="infoStock"></span></p>
          </div>
          <label class="field"><span>Cantidad</span>
            <input id="ventaCantidad" type="number" min="1" value="1" required />
          </label>
          <div class="actions"><button type="submit" class="btn">Registrar venta</button></div>
        </form>
      </section>`;

    const role = (localStorage.getItem("role") || "").toUpperCase();
    const sucursalId = parseInt(localStorage.getItem("sucursalId"));
    const empleadoId = parseInt(localStorage.getItem("empleadoId"));
    const productoSelect = qs("#ventaProducto");
    const infoBox = qs("#productoInfo");
    const infoNombre = qs("#infoNombre");
    const infoPrecio = qs("#infoPrecio");
    const infoStock = qs("#infoStock");
    const ventaForm = qs("#ventaForm");

    if (!empleadoId || (role !== "ADMIN" && !sucursalId)) {
      alert("⚠️ No se pudo obtener el empleado o la sucursal. Inicia sesión nuevamente.");
      window.location.href = "login.html";
      return;
    }

    try {
      const res = await fetch("http://localhost:9090/api/productos");
      const data = await res.json();

      const productosSucursal = data.filter(p => !p.sucursal || p.sucursal.id === sucursalId);

      productosSucursal.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = `${p.nombre} - $${formatMoney(p.precio)}`;
        productoSelect.appendChild(option);
      });

      productoSelect.addEventListener("change", () => {
        const prod = productosSucursal.find(p => p.id == productoSelect.value);
        if (prod) {
          infoBox.style.display = "block";
          infoNombre.textContent = prod.nombre;
          infoPrecio.textContent = formatMoney(prod.precio);
          infoStock.textContent = prod.stock;
        } else infoBox.style.display = "none";
      });

      ventaForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const productoId = parseInt(productoSelect.value);
        const cantidad = parseInt(qs("#ventaCantidad").value);
        const producto = productosSucursal.find(p => p.id === productoId);

        if (!producto || cantidad > producto.stock) {
          alert("❌ Producto inválido o sin stock suficiente.");
          return;
        }

        const venta = {
          clienteId: 1,
          empleadoId,
          sucursalId,
          items: [{ productoId, cantidad }]
        };

        const resp = await fetch("http://localhost:9090/api/ventas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(venta)
        });

        if (resp.ok) {
          // Leemos la venta creada desde la respuesta para actualizar KPIs inmediatamente
          const nuevaVenta = await resp.json();
          alert("✅ Venta registrada con éxito.");
          qs("#ventaForm").reset();
          infoBox.style.display = "none";
          try {
            // Actualizamos el KPI localmente sumando el total devuelto por la API
            const currentText = qs('#ventasHoy') ? qs('#ventasHoy').textContent : '$0';
            const currentNum = Number((currentText || '').replace(/[^0-9.-]+/g, '')) || 0;
            const added = nuevaVenta?.total != null ? Number(nuevaVenta.total) : 0;
            const newTotal = currentNum + added;
            if (qs('#ventasHoy')) qs('#ventasHoy').textContent = '$' + formatMoney(newTotal || 0);

            // Refrescar indicadores y tabla de productos (fallback y consistencia)
            await cargarKPIs();
            await cargarProductos();
            // Re-renderizar el formulario para reconstruir el select y la info del producto
            renderVentas();
          } catch (e) {
            console.error('Error al refrescar UI tras venta:', e);
          }
        } else {
          const err = await resp.text();
          console.error(err);
          alert("❌ Error al registrar la venta.");
        }
      });
    } catch (err) {
      console.error(err);
      alert("⚠️ Error al cargar productos.");
    }
  }

  // ====== CARGAS ======
// ====== CARGAS ======
async function cargarKPIs() {
  try {
    // Pedimos empleados y productos en paralelo.
    const [eRes, pRes] = await Promise.all([
      fetch("http://localhost:9090/api/empleados"),
      fetch("http://localhost:9090/api/productos")
    ]);

    const e = await eRes.json();
    const p = await pRes.json();

    qs("#totalEmpleados").textContent = Array.isArray(e) ? e.length : (e?.length || 0);
    qs("#totalProductos").textContent = Array.isArray(p) ? p.length : (p?.length || 0);

    // Intentamos primero obtener el total del día desde /api/ventas/hoy (más eficiente).
    let totalHoy = 0;
    try {
      // Forzamos no-cache y registramos la respuesta para depuración
      const hoyUrl = "http://localhost:9090/api/ventas/hoy?t=" + Date.now();
      console.debug('Solicitando total hoy a', hoyUrl);
      const hoyRes = await fetch(hoyUrl, { cache: 'no-store', headers: { Accept: 'application/json' } });
      console.debug('Respuesta /api/ventas/hoy ->', hoyRes.status);
      if (hoyRes.ok) {
        const num = await hoyRes.json();
        console.debug('/api/ventas/hoy payload:', num);
        totalHoy = Number(num) || 0;
      } else if (hoyRes.status === 404) {
        // caemos a descargar lista si el endpoint no existe
        throw new Error('No existe endpoint /hoy');
      } else {
        throw new Error('Error al obtener total de hoy');
      }
    } catch (e) {
      // Falló obtener el total directo: descargamos la lista de ventas y calculamos
      try {
        const vUrl = "http://localhost:9090/api/ventas?t=" + Date.now();
        console.debug('Solicitando lista de ventas a', vUrl);
        const vRes = await fetch(vUrl, { cache: 'no-store', headers: { Accept: 'application/json' } });
        console.debug('/api/ventas status ->', vRes.status);
        if (vRes.ok) {
          const ventas = await vRes.json();
          if (Array.isArray(ventas)) {
            const today = new Date().toDateString();
            totalHoy = ventas.reduce((acc, venta) => {
              const fecha = venta?.fecha ? new Date(venta.fecha) : null;
              const isToday = fecha ? (fecha.toDateString() === today) : true;
              const t = venta?.total != null ? parseFloat(venta.total) : 0;
              return acc + (isToday ? t : 0);
            }, 0);
          } else if (typeof ventas === 'number' || (!isNaN(parseFloat(ventas)) && isFinite(ventas))) {
            totalHoy = Number(ventas) || 0;
          }
        }
      } catch (err) {
        console.error('Error al obtener lista de ventas como fallback:', err);
      }
    }

  qs("#ventasHoy").textContent = "$" + formatMoney(totalHoy || 0);
  // Registro de depuración: valor final y contenido del DOM
  console.debug('KPIs actualizados: ventasHoy=', qs('#ventasHoy') ? qs('#ventasHoy').textContent : null, 'innerHTML=', qs('#ventasHoy') ? qs('#ventasHoy').innerHTML : null);
  } catch (error) {
    console.error("Error al cargar KPIs:", error);
    qs("#totalEmpleados").textContent = "—";
    qs("#totalProductos").textContent = "—";
    qs("#ventasHoy").textContent = "$0";
  }
}


  async function cargarEmpleados() {
    const res = await fetch("http://localhost:9090/api/empleados");
    const data = await res.json();
    const tbody = qs("#empleadosBody");
    tbody.innerHTML = data.map(e => `<tr><td>${e.id}</td><td>${e.nombre}</td><td>${e.cargo}</td></tr>`).join("");
  }

  async function cargarProductos() {
    const res = await fetch("http://localhost:9090/api/productos");
    const data = await res.json();
    const tbody = qs("#productosBody");
    tbody.innerHTML = data.map(p =>
      `<tr><td>${p.id}</td><td>${p.nombre}</td><td>$${formatMoney(p.precio)}</td><td>${p.stock}</td></tr>`
    ).join("");
  }

  // ====== INIT ======
  renderNavbar();
  if (role === "ADMIN") renderAdminDashboard();
  else renderEmployeeHome();
})();

