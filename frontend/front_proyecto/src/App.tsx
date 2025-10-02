import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Login from "./login/login";
import Administracion from "./components/views/administracion";
import Dashboard from "./components/Dashboard/Dashboard";
import MySales from "./components/MySales/MySales";
import SalesForm from "./components/SalesForm/SalesForm";

const App: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ evita renderizar antes de leer localStorage
  const location = useLocation();

  useEffect(() => {
    const savedRole = localStorage.getItem("cargo");
    if (savedRole) {
      setRole(savedRole.toLowerCase());
    } else {
      setRole(null);
    }
    setLoading(false); // ✅ ya leímos localStorage
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    window.location.href = "/";
  };

  // 🛑 Mientras estamos cargando el rol → no renderizar nada
  if (loading) return null;

  // 🔐 Si no hay rol y no estamos en login → redirigir
  const isLoginPage = location.pathname === "/";
  if (!role && !isLoginPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {!isLoginPage && role && <Sidebar role={role as "admin" | "empleado"} />}
      <div className="flex-grow-1 d-flex flex-column">
        {!isLoginPage && role && <Navbar onLogout={handleLogout} />}
        <main className="p-4 bg-light" style={{ flexGrow: 1,marginLeft: "280px", marginTop: "70px",minHeight: "100vh", }}>
          <Routes>
            <Route path="/" element={<Login />} />
            {role && (
              <>
                <Route path="/administracion" element={<Administracion />} />
                {role === "admin" && (
                  <Route path="/dashboard" element={<Dashboard />} />
                )}
                {role === "empleado" && (
                  <>
                    <Route path="/mis-ventas" element={<MySales />} />
                    <Route path="/registrar-venta" element={<SalesForm />} />
                  </>
                )}
                <Route path="*" element={<Navigate to="/administracion" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;




