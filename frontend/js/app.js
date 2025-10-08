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
  async function renderAdminDashboard() {
    content.innerHTML = `
      <section>
        <h2>📊 Panel de Administración</h2>
        <div class="grid cols-3">
          <div class="card"><h3>Total Empleados</h3><p id="totalEmpleados">...</p></div>
          <div class="card"><h3>Total Productos</h3><p id="totalProductos">...</p></div>
          <div class="card"><h3>Ventas Hoy</h3><p id="ventasHoy">...</p></div>
        </div>
        <div class="dashboard-grid">
          <aside class="card filters-col">
            <h3>Filtros</h3>
            <div class="filters">
              <label>Sucursal: <select id="fSucursal"><option value="">Todas</option></select></label>
              <label>Empleado: <select id="fEmpleado"><option value="">Todos</option></select></label>
              <label>Cliente: <select id="fCliente"><option value="">Todos</option></select></label>
              <label>Desde: <input type="date" id="fDesde" /></label>
              <label>Hasta: <input type="date" id="fHasta" /></label>
              <div class="filter-actions"><button id="fAplicar" class="btn">Aplicar filtros</button> <button id="fReset" class="btn ghost">Reset</button></div>
            </div>
          </aside>
          <main class="charts-col">
            <div class="chart-row">
              <div class="card"><h3>Ventas (serie temporal)</h3><canvas id="chartVentas" height="180"></canvas></div>
              <div class="card"><h3>Top Empleados</h3><canvas id="chartEmpleados" height="180"></canvas></div>
            </div>
            <div class="chart-row">
              <div class="card"><h3>Top Clientes</h3><canvas id="chartClientes" height="180"></canvas></div>
              <div class="card"><h3>Ventas por Sucursal</h3><canvas id="chartSucursales" height="180"></canvas></div>
            </div>
          </main>
        </div>
      </section>`;
    // Aseguramos refresco de KPIs cada vez que se renderiza el dashboard
    cargarKPIs();
    // También forzamos un nuevo cálculo un poco después para evitar condiciones de carrera en navegadores
    setTimeout(() => {
      try { cargarKPIs(); } catch (e) { console.debug('Error segundo refresh KPIs', e); }
    }, 200);

    // Inicializar filtros y gráficos
    await cargarFiltrosYVentas();
  }

  // ====== DASHBOARD: filtros y gráficas ======
  let ventasCache = [];
  let chartVentas, chartEmpleados, chartClientes, chartSucursales;

  async function cargarFiltrosYVentas() {
    try {
      const [sRes, eRes, cRes, vRes] = await Promise.all([
        fetch('http://localhost:9090/api/sucursales'),
        fetch('http://localhost:9090/api/empleados'),
        fetch('http://localhost:9090/api/clientes'),
        fetch('http://localhost:9090/api/ventas')
      ]);

  const sucursales = await sRes.json();
  const empleados = await eRes.json();
  const clientes = await cRes.json();
  const ventas = await vRes.json();

      ventasCache = Array.isArray(ventas) ? ventas : [];

      const fSuc = qs('#fSucursal');
      const fEmp = qs('#fEmpleado');
      const fCli = qs('#fCliente');

      // Llenar selects
      fSuc.innerHTML = '<option value="">Todas</option>' + sucursales.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
      fEmp.innerHTML = '<option value="">Todos</option>' + empleados.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
      fCli.innerHTML = '<option value="">Todos</option>' + clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

      qs('#fAplicar').addEventListener('click', () => {
        const filtro = { sucursalId: qs('#fSucursal').value || null, empleadoId: qs('#fEmpleado').value || null, clienteId: qs('#fCliente').value || null, desde: qs('#fDesde').value || null, hasta: qs('#fHasta').value || null };
        renderChartsFiltro(filtro);
      });
      qs('#fReset').addEventListener('click', () => {
        qs('#fSucursal').value = '';
        qs('#fEmpleado').value = '';
        qs('#fCliente').value = '';
        qs('#fDesde').value = '';
        qs('#fHasta').value = '';
        qs('#fTopN').value = '10';
        renderChartsFiltro({});
      });

      // Render inicial (sin filtros)
      renderChartsFiltro({});
    } catch (err) {
      console.error('Error cargando datos para dashboard:', err);
    }
  }

  function filtrarVentas(ventas, filtro) {
    return ventas.filter(v => {
      if (filtro.sucursalId && String(v.sucursal?.id) !== String(filtro.sucursalId)) return false;
      if (filtro.empleadoId && String(v.empleado?.id) !== String(filtro.empleadoId)) return false;
      if (filtro.clienteId && String(v.cliente?.id) !== String(filtro.clienteId)) return false;
      if (filtro.desde) {
        const desde = new Date(filtro.desde);
        const fecha = v.fecha ? new Date(v.fecha) : null;
        if (!fecha || fecha < desde) return false;
      }
      if (filtro.hasta) {
        const hasta = new Date(filtro.hasta);
        const fecha = v.fecha ? new Date(v.fecha) : null;
        if (!fecha || fecha > hasta) return false;
      }
      return true;
    });
  }

  function sumByKey(arr, keyFn) {
    return arr.reduce((acc, item) => {
      const k = keyFn(item);
      acc[k] = (acc[k] || 0) + (Number(item.total) || 0);
      return acc;
    }, {});
  }

  function toSortedArray(obj, topN = 10) {
    return Object.entries(obj).map(([k,v]) => ({key:k, value:v})).sort((a,b)=>b.value-a.value).slice(0, topN);
  }

  function renderChartsFiltro(filtro) {
    const data = filtrarVentas(ventasCache, filtro);

    // Serie temporal (ventas por fecha)
    const ventasPorDia = data.reduce((acc, v) => {
      const d = v.fecha ? new Date(v.fecha).toISOString().slice(0,10) : 'sin_fecha';
      acc[d] = (acc[d] || 0) + (Number(v.total) || 0);
      return acc;
    }, {});
    const labels = Object.keys(ventasPorDia).sort();
    const values = labels.map(l => ventasPorDia[l]);

    // Top empleados
    const byEmp = sumByKey(data, v => v.empleado?.nombre || 'Desconocido');
    const topEmp = toSortedArray(byEmp);

    // Top clientes
    const byCli = sumByKey(data, v => v.cliente?.nombre || 'Desconocido');
    const topCli = toSortedArray(byCli);

    // Por sucursal
    const bySuc = sumByKey(data, v => v.sucursal?.nombre || 'Desconocido');
    const topSuc = toSortedArray(bySuc);

    // Crear/actualizar charts con mejor UX: tooltips, formateo, animaciones
  const topN = 10; // fijo: mostramos top 10 por defecto
    const labelsVentas = labels.map(l => new Date(l).toLocaleDateString());
    if (!chartVentas) {
      chartVentas = new Chart(qs('#chartVentas').getContext('2d'), {
        type: 'line',
        data: { labels: labelsVentas, datasets: [{ label: 'Ventas', data: values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', tension: 0.3, pointRadius: 3 }]},
        options: {
          responsive: true,
          plugins: { legend: { display: true }, tooltip: { callbacks: { label: ctx => '$' + formatMoney(ctx.parsed.y) } } },
          scales: { y: { ticks: { callback: v => '$' + formatMoney(v) } } }
        }
      });
    } else {
      chartVentas.data.labels = labelsVentas; chartVentas.data.datasets[0].data = values; chartVentas.update();
    }

    const topEmpN = toSortedArray(byEmp, topN);
    if (!chartEmpleados) {
      chartEmpleados = new Chart(qs('#chartEmpleados').getContext('2d'), {
        type: 'bar',
        data: {
          labels: topEmpN.map(x => x.key),
          datasets: [{ label: 'Ventas', data: topEmpN.map(x => x.value), backgroundColor: '#10b981' }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => '$' + formatMoney(ctx.parsed.x ?? ctx.parsed.y)
              }
            }
          },
          scales: {
            x: { ticks: { callback: v => '$' + formatMoney(v) } }
          }
        }
      });
    } else {
      chartEmpleados.data.labels = topEmpN.map(x => x.key);
      chartEmpleados.data.datasets[0].data = topEmpN.map(x => x.value);
      chartEmpleados.update();
    }

    const topCliN = toSortedArray(byCli, topN);
    if (!chartClientes) {
      chartClientes = new Chart(qs('#chartClientes').getContext('2d'), {
        type: 'bar',
        data: {
          labels: topCliN.map(x => x.key),
          datasets: [{ label: 'Ventas', data: topCliN.map(x => x.value), backgroundColor: '#f59e0b' }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            tooltip: { callbacks: { label: ctx => '$' + formatMoney(ctx.parsed.x ?? ctx.parsed.y) } }
          },
          scales: { x: { ticks: { callback: v => '$' + formatMoney(v) } } }
        }
      });
    } else {
      chartClientes.data.labels = topCliN.map(x => x.key);
      chartClientes.data.datasets[0].data = topCliN.map(x => x.value);
      chartClientes.update();
    }

    const topSucN = toSortedArray(bySuc, 10);
    if (!chartSucursales) {
      chartSucursales = new Chart(qs('#chartSucursales').getContext('2d'), {
        type: 'pie',
        data: {
          labels: topSucN.map(x => x.key),
          datasets: [{ label: 'Ventas', data: topSucN.map(x => x.value), backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'] }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: { callbacks: { label: ctx => ctx.label + ': $' + formatMoney(ctx.parsed) } }
          }
        }
      });
    } else {
      chartSucursales.data.labels = topSucN.map(x => x.key);
      chartSucursales.data.datasets[0].data = topSucN.map(x => x.value);
      chartSucursales.update();
    }
  }

  function renderEmpleados() {
    content.innerHTML = `
      <section>
        <h2>👥 Empleados</h2>
        <table class="table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Cargo</th><th>Sucursal</th></tr></thead>
          <tbody id="empleadosBody"></tbody>
        </table>
      </section>`;
    cargarEmpleados();
  }

  function renderProductos() {
    // Mostrar UI de productos solo para ADMIN; empleados deben ver la vista de inventario simple
    if (role !== 'ADMIN') {
      renderEmployeeHome();
      return;
    }

    content.innerHTML = `
      <section>
        <h2>📦 Productos</h2>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div></div>
          <div><button id="btnAgregarProducto" class="btn">Agregar producto</button></div>
        </div>
        <div id="productoFormContainer" style="display:none;margin-bottom:12px;"></div>
        <table class="table">
          <thead><tr><th>ID</th><th>Producto</th><th>Precio</th><th>Stock</th><th>Sucursal</th><th>Acciones</th></tr></thead>
          <tbody id="productosBody"></tbody>
        </table>
      </section>`;
    cargarProductos();

    // Agregar producto (abre form)
    qs('#btnAgregarProducto').addEventListener('click', () => {
      showProductoForm();
    });
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
          <label class="field"><span>Cliente</span>
            <div style="display:flex;gap:8px;align-items:center;">
              <select id="ventaCliente" required style="flex:1;"><option value="">-- Selecciona cliente --</option></select>
              <button id="btnNuevoCliente" type="button" class="btn ghost">Nuevo cliente</button>
            </div>
          </label>
          <div id="nuevoClienteForm" style="display:none; margin-bottom:10px;">
            <div class="card quick-client" style="padding:12px;">
              <div class="row"><label style="flex:1"><span>Nombre</span><input id="ncNombre" type="text" /></label></div>
              <div class="row"><label style="flex:1"><span>Email</span><input id="ncEmail" type="email" /></label><label style="flex:1"><span>Teléfono</span><input id="ncTelefono" type="tel" /></label></div>
              <div class="help" id="ncHelp">El nombre es obligatorio.</div>
              <div class="actions"><button id="ncCrear" type="button" class="btn" disabled>Crear cliente</button> <button id="ncCancelar" type="button" class="btn ghost">Cancelar</button></div>
            </div>
          </div>
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
      const [prodRes, cliRes] = await Promise.all([
        fetch("http://localhost:9090/api/productos"),
        fetch("http://localhost:9090/api/clientes")
      ]);

      const productos = await prodRes.json();
      const clientes = await cliRes.json();

      // Pedimos productos ya filtrados desde el backend cuando no somos admin
      const roleLocal = (localStorage.getItem("role") || "EMPLOYEE").toUpperCase();
      let productosSucursal = [];
      if (roleLocal === 'ADMIN') {
        productosSucursal = Array.isArray(productos) ? productos : [];
      } else {
        // pedimos al backend solo los de la sucursal del empleado
        try {
          const url = `http://localhost:9090/api/productos?sucursalId=${sucursalId}`;
          const pRes = await fetch(url);
          productosSucursal = await pRes.json();
        } catch (err) {
          // fallback: filtrar localmente
          productosSucursal = Array.isArray(productos) ? productos.filter(p => !p.sucursal || p.sucursal.id === sucursalId) : [];
        }
      }

      // poblar select de clientes
      const clienteSelect = qs('#ventaCliente');
      if (Array.isArray(clientes)) {
        clientes.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.nombre;
          clienteSelect.appendChild(opt);
        });
      }

      // Nuevo cliente: toggle y lógica (mejorada)
      qs('#btnNuevoCliente').addEventListener('click', () => {
        const f = qs('#nuevoClienteForm');
        f.style.display = (f.style.display === 'none' || f.style.display === '') ? 'block' : 'none';
      });
      const ncNombreEl = qs('#ncNombre');
      const ncEmailEl = qs('#ncEmail');
      const ncTelefonoEl = qs('#ncTelefono');
      const ncCrearBtn = qs('#ncCrear');
      const ncCancelarBtn = qs('#ncCancelar');
      const ncHelp = qs('#ncHelp');

      // Live validation: habilitar botón Crear solo si hay nombre
      function refreshNcState() {
        const name = ncNombreEl.value ? ncNombreEl.value.trim() : '';
        if (name.length > 0) {
          ncCrearBtn.disabled = false;
          ncHelp.style.display = 'none';
        } else {
          ncCrearBtn.disabled = true;
          ncHelp.style.display = 'block';
        }
      }
      ncNombreEl.addEventListener('input', refreshNcState);
      refreshNcState();

      ncCancelarBtn.addEventListener('click', () => { qs('#nuevoClienteForm').style.display = 'none'; });
      ncCrearBtn.addEventListener('click', async () => {
        const nombreNc = ncNombreEl.value && ncNombreEl.value.trim();
        const email = ncEmailEl.value && ncEmailEl.value.trim();
        const telefono = ncTelefonoEl.value && ncTelefonoEl.value.trim();
        if (!nombreNc) { ncHelp.style.display = 'block'; return; }
        try {
          const payload = { nombre: nombreNc };
          if (email) payload.email = email;
          if (telefono) payload.telefono = telefono;
          const res = await fetch('http://localhost:9090/api/clientes', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
          if (res.ok || res.status === 201) {
            const nuevo = await res.json();
            // agregar al select y seleccionarlo
            const o = document.createElement('option'); o.value = nuevo.id; o.textContent = nuevo.nombre; clienteSelect.appendChild(o);
            clienteSelect.value = nuevo.id;
            qs('#nuevoClienteForm').style.display = 'none';
            ncNombreEl.value = '';
            ncEmailEl.value = '';
            ncTelefonoEl.value = '';
            refreshNcState();
            // Mostrar confirmación inline simple
            ncHelp.textContent = 'Cliente creado y seleccionado.'; ncHelp.style.color = 'green'; ncHelp.style.display = 'block';
            setTimeout(() => { ncHelp.style.display = 'none'; ncHelp.style.color = '#b91c1c'; ncHelp.textContent = 'El nombre es obligatorio.'; }, 2000);
          } else {
            const txt = await res.text(); console.error('Error creando cliente', txt); alert('Error creando cliente');
          }
        } catch (err) { console.error(err); alert('Error creando cliente'); }
      });

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
        const clienteId = parseInt(qs('#ventaCliente').value);
        const cantidad = parseInt(qs("#ventaCantidad").value);
        const producto = productosSucursal.find(p => p.id === productoId);

        if (!clienteId) {
          alert('Seleccione o cree un cliente antes de registrar la venta.');
          return;
        }

        if (!producto || cantidad > producto.stock) {
          alert("❌ Producto inválido o sin stock suficiente.");
          return;
        }

        const venta = {
          clienteId: clienteId || 1,
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
    tbody.innerHTML = data.map(e => `<tr><td>${e.id}</td><td>${e.nombre}</td><td>${e.cargo}</td><td>${e.sucursalNombre || '-'}</td></tr>`).join("");
  }

  async function cargarProductos() {
    const res = await fetch("http://localhost:9090/api/productos");
    const data = await res.json();
    const tbody = qs("#productosBody");
    const roleLocal = (localStorage.getItem("role") || "EMPLOYEE").toUpperCase();
    const sucursalIdLocal = parseInt(localStorage.getItem("sucursalId"));

    const productos = Array.isArray(data)
      ? (roleLocal === 'ADMIN' ? data : data.filter(p => !p.sucursal || p.sucursal.id === sucursalIdLocal))
      : [];
    // Render rows según rol: ADMIN muestra sucursal y acciones; EMPLOYEE solo columnas básicas
    if (roleLocal === 'ADMIN') {
      tbody.innerHTML = productos.map(p =>
        `<tr>
           <td>${p.id}</td>
           <td>${p.nombre}</td>
           <td>$${formatMoney(p.precio)}</td>
           <td>${p.stock}</td>
           <td>${p.sucursal ? p.sucursal.nombre : '-'}</td>
           <td><button class="btn" data-id="${p.id}" data-action="edit">Editar</button></td>
         </tr>`
      ).join("");

      // Attach edit handlers solo para ADMIN
      qsa('button[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          // fetch product details
          try {
            const pRes = await fetch(`http://localhost:9090/api/productos/${id}`);
            if (pRes.ok) {
              const prod = await pRes.json();
              showProductoForm(prod);
            } else alert('No se pudo obtener producto');
          } catch (err) { console.error(err); alert('Error al obtener producto'); }
        });
      });
    } else {
      // Vistas para empleados: tabla simple con 4 columnas
      tbody.innerHTML = productos.map(p =>
        `<tr>
           <td>${p.id}</td>
           <td>${p.nombre}</td>
           <td>$${formatMoney(p.precio)}</td>
           <td>${p.stock}</td>
         </tr>`
      ).join("");
    }
  }

  // muestra el formulario para crear/editar producto
  async function showProductoForm(producto = null) {
    const cont = qs('#productoFormContainer');
    // cargar sucursales
    let sucursales = [];
    try {
      const sRes = await fetch('http://localhost:9090/api/sucursales');
      sucursales = await sRes.json();
    } catch (e) { console.error('No se pudieron cargar sucursales', e); }

    cont.style.display = 'block';
    cont.innerHTML = `
      <div class="card">
        <h3>${producto ? 'Editar producto' : 'Agregar producto'}</h3>
        <div class="grid">
          <input type="hidden" id="prodId" value="${producto ? producto.id : ''}" />
          <label class="field"><span>Nombre</span><input id="prodNombre" type="text" value="${producto ? producto.nombre : ''}" /></label>
          <label class="field"><span>Precio</span><input id="prodPrecio" type="number" step="0.01" value="${producto ? producto.precio : ''}" /></label>
          <label class="field"><span>Stock</span><input id="prodStock" type="number" value="${producto ? producto.stock : 0}" /></label>
          <label class="field"><span>Sucursal</span>
            <select id="prodSucursal"><option value="">-- Ninguna --</option>${sucursales.map(s=>`<option value="${s.id}" ${producto && producto.sucursal && producto.sucursal.id==s.id ? 'selected' : ''}>${s.nombre}</option>`).join('')}</select>
          </label>
          <div class="actions"><button id="prodSave" class="btn">Guardar</button> <button id="prodCancel" class="btn ghost">Cancelar</button></div>
        </div>
      </div>`;

    qs('#prodCancel').addEventListener('click', () => { cont.style.display = 'none'; cont.innerHTML = ''; });
    qs('#prodSave').addEventListener('click', async () => {
      const id = qs('#prodId').value;
      const nombre = qs('#prodNombre').value && qs('#prodNombre').value.trim();
      const precio = parseFloat(qs('#prodPrecio').value) || 0;
      const stock = parseInt(qs('#prodStock').value) || 0;
      const sucId = qs('#prodSucursal').value ? parseInt(qs('#prodSucursal').value) : null;
      if (!nombre) { alert('Nombre es requerido'); return; }
      const payload = { nombre, precio, stock, sucursalId: sucId };
      try {
        let res;
        if (id) {
          res = await fetch(`http://localhost:9090/api/productos/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        } else {
          res = await fetch('http://localhost:9090/api/productos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        }
        if (res.ok) {
          cont.style.display = 'none'; cont.innerHTML = '';
          await cargarProductos();
          alert('Producto guardado');
        } else {
          const txt = await res.text(); console.error(txt); alert('Error guardando producto');
        }
      } catch (err) { console.error(err); alert('Error guardando producto'); }
    });
  }

  // ====== INIT ======
  renderNavbar();
  if (role === "ADMIN") renderAdminDashboard();
  else renderEmployeeHome();
})();

