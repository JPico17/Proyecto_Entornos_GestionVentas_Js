// Vinilo Front – Adaptado (solo front)
(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

  // Theme toggle
  const applyStoredTheme = () => {
    const t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  };
  applyStoredTheme();
  qs('#themeToggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  }, {threshold: .1});
  qsa('.reveal').forEach(el=>io.observe(el));

  // Mock API (front only). Reemplaza con tus endpoints.
  const API = {
    productos: async () => [
      { id: 1, nombre: 'Teclado Mecánico', precio: 120000, stock: 18 },
      { id: 2, nombre: 'Mouse Inalámbrico', precio: 85000, stock: 42 },
      { id: 3, nombre: 'Monitor 24"', precio: 690000, stock: 7 },
      { id: 4, nombre: 'Headset USB', precio: 130000, stock: 25 },
    ],
    ventasHoy: async () => ({ total: 3250000, tickets: 14 })
  };

  // KPIs demo
  (async () => {
    const kpis = await API.ventasHoy();
    const kEl = qs('#kpiVentas');
    if (kEl) kEl.innerHTML = `<strong>$${kpis.total.toLocaleString('es-CO')}</strong> en ${kpis.tickets} ventas`;
  })();

  // Tabla de productos
  (async () => {
    const data = await API.productos();
    const tbody = qs('#productosBody');
    if (!tbody) return;
    tbody.innerHTML = data.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>$${p.precio.toLocaleString('es-CO')}</td>
        <td>${p.stock}</td>
        <td><button class="btn ghost" data-id="${p.id}">Ver</button></td>
      </tr>
    `).join('');

    qsa('button[data-id]').forEach(b => b.addEventListener('click', () => {
      alert('Detalle producto #' + b.getAttribute('data-id'));
    }));
  })();

  // Form demo
  qs('#contactForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    console.log('Front-only, enviar a tu API REST:', Object.fromEntries(fd.entries()));
    const msg = qs('#formMsg');
    if (msg) { msg.textContent = 'Mensaje enviado (demo)'; msg.style.display = 'inline-block'; }
    e.target.reset();
  });

  // Año footer
  const yr = qs('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();