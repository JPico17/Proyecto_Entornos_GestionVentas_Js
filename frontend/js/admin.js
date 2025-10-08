const API_URL = "http://localhost:9090/api";

// Cargar empleados y sucursales al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarEmpleados();
    cargarSucursales();
});

async function cargarEmpleados() {
    try {
        const res = await fetch(`${API_URL}/empleados`);
        const data = await res.json();

        const tbody = document.querySelector("#tabla-empleados tbody");
        tbody.innerHTML = "";

        data.forEach(emp => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${emp.id}</td>
                <td>${emp.nombre}</td>
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

async function cargarSucursales() {
    try {
        const res = await fetch(`${API_URL}/sucursales`);
        const data = await res.json();

        const select = document.getElementById("sucursalId");
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

document.getElementById("form-empleado").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoEmpleado = {
        nombre: document.getElementById("nombre").value,
        cargo: document.getElementById("cargo").value,
        salario: parseFloat(document.getElementById("salario").value),
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
        sucursalId: parseInt(document.getElementById("sucursalId").value)
    };

    try {
        const res = await fetch(`${API_URL}/empleados`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoEmpleado)
        });

        if (res.ok) {
            alert("Empleado registrado con éxito ✅");
            cargarEmpleados();
            e.target.reset();
        } else {
            alert("Error al registrar empleado ❌");
        }
    } catch (error) {
        console.error("Error al registrar empleado:", error);
    }
});

document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});
