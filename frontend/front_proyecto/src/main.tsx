import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./login/login";
import Navbar from "./navbar/navbar";
import Administracion from "./views/administracion.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      {/* Navbar visible en todas las páginas */}
      <Navbar />

      {/* Definición de rutas */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/administracion" element={<Administracion />} />
        {/* puedes agregar más rutas aquí */}
      </Routes>
    </Router>
  </StrictMode>
);
