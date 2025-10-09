const API_URL = "http://localhost:9090/api";

// ✅ Verificar token al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        // No hay token → redirige a login
        window.location.href = "login.html";
        return;
    }

    // Cargar datos si el token existe
    cargarEmpleados();
    cargarSucursales();
});

// ✅ Función helper para usar el token en fetch
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  // 👈 Token en el header
        ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });

    // Si el token expiró o no es válido
    if (res.status === 401 || res.status === 403) {
        alert("⚠️ Sesión expirada. Por favor inicia sesión nuevamente.");
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    return res;
}

// ✅ Cargar empleados protegidos por JWT
async function cargarEmpleados() {
    try {
        const res = await apiFetch(`${API_URL}/empleados`);
        const data = await res.json();

        const tbody = document.querySelector("#tabla-empleados tbody");
        tbody.innerHTML = "";

        data.forEach(emp => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${emp.id}</td>
                <td>${emp.nombre}</td>
                <td>${emp.usuario}</td>
                <td>${emp.cargo}</td>
                <td>${emp.salario}</td>
                <td>${emp.email}</td>
                <td>${emp.sucursal ? emp.sucursal.nombre : "N/A"}</td>
                <td>${emp.role}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al cargar empleados:", error);
    }
}

// ✅ Cargar sucursales protegidas
async function cargarSucursales() {
    try {
        const res = await apiFetch(`${API_URL}/sucursales`);
        const data = await res.json();

        const select = document.getElementById("sucursalId");
        select.innerHTML = `<option value="">Seleccionar sucursal</option>`; // Reiniciar

        data.forEach(suc => {
            const option = document.createElement("option");
            option.value = suc.id;
            option.textContent = suc.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar sucursales:", error);
    }
}

// ✅ Registrar empleado con token
document.getElementById("form-empleado").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoEmpleado = {
        nombre: document.getElementById("nombre").value,
        usuario: document.getElementById("usuario").value,
        cargo: document.getElementById("cargo").value,
        salario: parseFloat(document.getElementById("salario").value),
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
        sucursalId: parseInt(document.getElementById("sucursalId").value)
    };

    try {
        const res = await apiFetch(`${API_URL}/empleados`, {
            method: "POST",
            body: JSON.stringify(nuevoEmpleado)
        });

        if (res.ok) {
            alert("Empleado registrado con éxito ✅");
            cargarEmpleados();
            e.target.reset();
        } else {
            const errorData = await res.json();
            alert(`Error al registrar empleado ❌\n${errorData.mensaje || res.statusText}`);
        }
    } catch (error) {
        console.error("Error al registrar empleado:", error);
    }
});

// ✅ Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});

