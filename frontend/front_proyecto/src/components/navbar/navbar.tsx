import React, { useState } from "react";
import { Search, User, LogOut } from "lucide-react";

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const sucursal = localStorage.getItem("sucursal") || "";
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav
      className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-4 d-flex align-items-center justify-content-between"
      style={{
        position: "fixed",
        top: 0,
        left: "280px",
        width: "calc(100% - 280px)",
        zIndex: 1000,
        height: "70px",
      }}
    >
      {/* 🧭 Nombre del sistema */}
      <h4 className="fw-bold text-primary mb-0">
        Sistema de Gestión de Ventas
      </h4>

      {/* 🔍 Buscador */}
      <form className="d-flex" style={{ maxWidth: "300px" }}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Buscar..."
        />
        <button className="btn btn-outline-primary" type="submit">
          <Search size={18} />
        </button>
      </form>

      {/* 👤 Perfil */}
      <div className="position-relative">
        <button
          className="btn btn-light d-flex align-items-center gap-2 border rounded-pill px-3"
          onClick={() => setShowMenu(!showMenu)}
        >
          <User size={20} /> {nombre}
        </button>

        {showMenu && (
          <div
            className="position-absolute bg-white shadow-sm rounded py-2"
            style={{
              right: 0,
              top: "110%",
              width: "220px",
              zIndex: 50,
            }}
          >
            <div className="px-3 py-2 text-muted small border-bottom">
              📍 {sucursal || "Sin sucursal"}
            </div>
            <button
              className="dropdown-item d-flex align-items-center gap-2 text-danger"
              onClick={onLogout}
            >
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


