// productos.js
const BASE_URL = 'http://localhost:9090/api';
const token = localStorage.getItem('token');
// Proteger la vista: si no hay sesión, al login, pero con token
(function checkAuth() {
  if (!token) {
    window.location.href = 'login.html';
  }
})();

// Headers con token
function authHeaders(extra = {}) {
  return {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra
  };
}

// (Opcional) KPI ventas de hoy
async function loadKpi() {
  const el = document.getElementById('kpiVentas');
  if (!el) return;
  try {
    const res = await fetch(`${BASE_URL}/ventas/hoy`, { headers: authHeaders() });
    if (!res.ok) throw new Error('No disponible');
    const d = await res.json();
    const total = Number(d.total ?? 0).toLocaleString('es-CO');
    el.innerHTML = `<strong>$${total}</strong> en ${d.tickets ?? 0} ventas`;
  } catch {
    el.textContent = 'No disponible';
  }
}

// Normaliza la respuesta de /productos
function normalizeProductos(raw) {
  const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  return arr.map(p => ({
    id: p.id ?? p._id ?? p.codigo ?? '—',
    nombre: p.nombre ?? p.name ?? '—',
    precio: Number(p.precio ?? p.price ?? 0),
    stock: Number(p.stock ?? p.inventory ?? 0)
  }));
}

// Carga la tabla de productos
async function loadProductos({ page = 1, pageSize = 50 } = {}) {
  const tbody  = document.getElementById('productosBody');
  const loader = document.getElementById('productosLoader');
  if (loader) loader.style.display = 'block';
  if (tbody)  tbody.innerHTML = '';

  try {
    const url = new URL(`${BASE_URL}/productos`);
    // Si tu back pagina, descomenta:
    // url.searchParams.set('page', page);
    // url.searchParams.set('pageSize', pageSize);

    const res = await fetch(url.toString(), { headers: authHeaders() });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `Error ${res.status}`);
    }
    const data = await res.json();
    const productos = normalizeProductos(data);

    if (!tbody) return;
    if (productos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Sin productos</td></tr>`;
      return;
    }

    tbody.innerHTML = productos.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>$${p.precio.toLocaleString('es-CO')}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn ghost" data-id="${p.id}" data-action="ver">Ver</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error cargando productos:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">No fue posible cargar productos</td></tr>`;
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

// Delegación de clics en la tabla (Ver/Editar/Eliminar)
function wireTableActions() {
  const table = document.getElementById('productosTable');
  if (!table) return;
  table.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');

    if (action === 'ver') {
      alert(`Detalle producto #${id}`);
    }
    // Aquí puedes agregar editar/eliminar con tus endpoints:
    // if (action === 'editar') { ... }
    // if (action === 'eliminar') { ... }
  });
}

// (Opcional) Crear producto: POST /api/productos
function wireCreateForm() {
  const form = document.getElementById('newProductForm');
  const msg  = document.getElementById('newProductMsg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.precio = Number(payload.precio ?? 0);
    payload.stock  = Number(payload.stock ?? 0);

    try {
      const res = await fetch(`${BASE_URL}/productos`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Error ${res.status}`);
      }
      if (msg) { msg.textContent = 'Producto creado ✅'; msg.style.display = 'inline-block'; }
      form.reset();
      await loadProductos();
    } catch (err) {
      console.error('Crear producto error:', err);
      if (msg) { msg.textContent = 'No se pudo crear el producto'; msg.style.display = 'inline-block'; }
    }
  });
}

// Logout (opcional)
function wireLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('auth_token');
    window.location.href = 'login.html';
  });
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  wireTableActions();
  wireCreateForm();
  wireLogout();
  await loadKpi();       // si no tienes /ventas/hoy, borra esta línea
  await loadProductos(); // carga productos al entrar
});