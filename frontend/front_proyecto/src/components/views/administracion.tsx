import React from "react";
import { Card } from "react-bootstrap";

const Administracion: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold text-primary">📊 Panel de Administración</h1>
          <p className="text-muted">
            Bienvenido al sistema de gestión de ventas. Aquí puedes ver un
            resumen general de la actividad de tu negocio.
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="row g-4">
        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title text-success">💰 Ventas totales</h5>
              <h2 className="fw-bold">$45,320</h2>
              <p className="text-muted">Últimos 30 días</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title text-primary">📦 Productos vendidos</h5>
              <h2 className="fw-bold">1,248</h2>
              <p className="text-muted">En todas las sucursales</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title text-warning">🏬 Sucursales activas</h5>
              <h2 className="fw-bold">2</h2>
              <p className="text-muted">Con registros de ventas</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Sección adicional */}
      <div className="row mt-5">
        <div className="col-lg-8">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title">📈 Gráfico de ventas</h5>
              <p className="text-muted">Aquí podrías poner un gráfico o tabla.</p>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="card-title">🧑‍💼 Últimas ventas registradas</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">📦 Venta #1234 – $320</li>
                <li className="list-group-item">📦 Venta #1235 – $210</li>
                <li className="list-group-item">📦 Venta #1236 – $540</li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Administracion;
