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
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const savedRole = localStorage.getItem("cargo");
    if (savedRole) {
      setRole(savedRole.toLowerCase());
    } else {
      setRole(null);
    }
    setLoading(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    window.location.href = "/";
  };

  // 🛑 Mientras se carga el rol → no renderizar nada
  if (loading) return null;

  const isLoginPage = location.pathname === "/";

  // 🔐 Redirigir a login si no hay rol y no estamos en login
  if (!role && !isLoginPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar solo después del login */}
      {!isLoginPage && role && <Sidebar role={role as "admin" | "empleado"} />}

      <div className="flex-grow-1 d-flex flex-column">
        {/* Navbar solo después del login */}
        {!isLoginPage && role && <Navbar onLogout={handleLogout} />}

        <main
          className="p-4 bg-light"
          style={{
            flexGrow: 1,
            marginLeft: !isLoginPage && role ? "280px" : "0",
            marginTop: !isLoginPage && role ? "70px" : "0",
            minHeight: "100vh",
            transition: "all 0.3s ease", // 👌 transición suave
          }}
        >
          <Routes>
            {/* Página de login */}
            <Route path="/" element={<Login />} />

            {/* Rutas protegidas */}
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
                {/* Redirección por defecto */}
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
