import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
  salario: number;
  sucursal: Sucursal;
  contraseña: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9090/api/empleados");
      if (!response.ok) throw new Error("Error al conectar con la API");

      const users: Empleado[] = await response.json();
      console.log("👥 Usuarios devueltos:", users);

      // ✅ Comparación robusta (ignora mayúsculas, espacios accidentales)
      const user = users.find(
        (u) =>
          u.nombre.trim().toLowerCase() === username.trim().toLowerCase() &&
          u.contraseña.trim() === password.trim()
      );

      console.log("🧍 Usuario encontrado:", user);

      if (user) {
        // ✅ Normalizar el cargo para evitar problemas al navegar
        const cargoNormalizado = user.cargo.trim().toLowerCase();

        localStorage.setItem("token", "tokenDePrueba123");
        localStorage.setItem("cargo", cargoNormalizado);
        localStorage.setItem("nombre", user.nombre);
        localStorage.setItem("sucursal", user.sucursal.nombre);

        // ✅ Redirige según el cargo
        navigate(cargoNormalizado === "admin" ? "/dashboard" : "/mis-ventas");
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "85vh" }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: "100%", maxWidth: "420px", borderRadius: "12px" }}
      >
        <div className="card-body p-4">
          <h2 className="text-center mb-4 text-primary">Inicio de Sesión</h2>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Usuario</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2">
              Iniciar Sesión
            </button>
          </form>

          <div
            className="text-center mt-3 text-muted"
            style={{ fontSize: "0.9rem" }}
          >
            © {new Date().getFullYear()} Sistema de Gestión de Ventas
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


