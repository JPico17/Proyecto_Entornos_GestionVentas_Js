// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identificador = document.getElementById("identificador").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("http://localhost:9090/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, password })  // 👈 cambio clave aquí
      });

      if (!res.ok) {
        const msg = await res.text();
        alert("❌ Error al iniciar sesión: " + (msg || res.status));
        return;
      }

      const user = await res.json();
      console.log("🔹 Login exitoso:", user);

      if ((user.sucursalId === null || user.sucursalId === undefined) && user.role.toUpperCase() !== "ADMIN") {
        alert("⚠️ El empleado no tiene sucursal asignada en la base de datos.");
        return;
      }

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("empleadoId", user.id);
      localStorage.setItem("sucursalId", user.sucursalId);
      localStorage.setItem("role", user.role.toUpperCase());
      localStorage.setItem("nombre", user.nombre);
      localStorage.setItem("email", user.email);

      alert("✅ Bienvenido " + user.nombre);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("⚠️ No se pudo conectar con el servidor.");
    }
  });
});








