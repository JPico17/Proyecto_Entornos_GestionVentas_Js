const form = document.getElementById('loginForm');
const msg = document.getElementById('loginMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = form.user.value.trim();
  const password = form.pass.value.trim();

  if (!username || !password) {
    msg.textContent = 'Por favor ingresa usuario y contraseña';
    msg.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('http://localhost:9090/api/login', { // ✅ corregido
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      msg.textContent = errorText || 'Credenciales inválidas';
      msg.style.display = 'block';
      return;
    }

    const data = await response.json();

    localStorage.setItem('usuario', JSON.stringify(data));
    localStorage.setItem('loggedIn', 'true');

    const usuario = JSON.parse(usuarioGuardado);
    const rol = (data.rol || '').trim().toLowerCase();

    if (rol === 'administrador') {
      window.location.href = 'index.html';
    } else if (rol === 'empleado') {
      window.location.href = 'empleado.html';
    } else {
      msg.textContent = `Rol no reconocido: ${rol}`;
      msg.style.display = 'block';
    }


  } catch (error) {
    console.error('❌ Error al conectar con el servidor:', error);
    msg.textContent = 'Error de conexión con el servidor';
    msg.style.display = 'block';
  }
});

// Redirección automática si ya hay sesión
const usuarioGuardado = localStorage.getItem('usuario');
if (usuarioGuardado) {
  const usuario = JSON.parse(usuarioGuardado);
  if (usuario.cargo === 'Administrador') {
    window.location.href = 'admin.html';
  } else if (usuario.cargo === 'Empleado') {
    window.location.href = 'empleado.html';
  }
}


