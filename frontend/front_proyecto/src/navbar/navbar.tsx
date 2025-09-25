import React from "react";
import "./navbar.css";

const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <div className="logo">MiEmpresa</div>
      <nav>
        <ul className="nav-links">
          <li><a href="#clientes">Clientes</a></li>
          <li><a href="#ayuda">Ayuda</a></li>
          <li><a href="#informacion">Información</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
