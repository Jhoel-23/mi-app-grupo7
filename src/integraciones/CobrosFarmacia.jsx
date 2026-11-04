
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { consultarCobrosFarmaciaNeon } from "../config/neon";

export default function CobrosFarmacia() {
  const { usuario } = useAuth();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarCobros = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const resultado = await consultarCobrosFarmaciaNeon(
        usuario.token
      );

      setDatos(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [usuario.token]);

  useEffect(() => {
    cargarCobros();
  }, [cargarCobros]);

  const soles = (valor) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(Number(valor));

  const fecha = (valor) =>
    new Date(valor).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      dateStyle: "short",
      timeStyle: "short"
    });

  const formatoDia = (valor) => {
    const partes = String(valor).slice(0, 10).split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const tarjeta = {
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: 22
  };

  const celda = {
    padding: 12,
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0"
  };

  return (
    <main style={{
      maxWidth: 1150,
      margin: "30px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        FarmaSalud Perú
      </h1>

      <h2>Panel de cobros bancarios</h2>

      <p>
        Administrador: <strong>{usuario.nombre}</strong>
      </p>

      <button
        onClick={cargarCobros}
        disabled={cargando}
        style={{
          padding: "12px 20px",
          background: "#16a34a",
          color: "#ffffff",
          border: 0,
          borderRadius: 8,
          marginBottom: 25,
          cursor: "pointer"
        }}
      >
        {cargando ? "Actualizando..." : "Actualizar cobros"}
      </button>

      {error && (
        <p style={{ color: "#dc2626" }} role="alert">
          {error}
        </p>
      )}

      {cargando && !datos ? (
        <p>Consultando información de Neon...</p>
      ) : datos ? (
        <>
          <section style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 18,
            marginBottom: 30
          }}>
            <article style={tarjeta}>
              <h3>Saldo empresarial</h3>
              <h2 style={{ color: "#166534" }}>
                {soles(datos.resumen.saldoTotal)}
              </h2>
            </article>

            <article style={tarjeta}>
              <h3>Total de abonos</h3>
              <h2 style={{ color: "#166534" }}>
                {soles(datos.resumen.totalCobrado)}
              </h2>
            </article>

            <article style={tarjeta}>
              <h3>Cantidad de cobros</h3>
              <h2>{datos.resumen.cantidadCobros}</h2>
            </article>
          </section>

          <h2>Cuentas empresariales</h2>

          <div style={{ overflowX: "auto", marginBottom: 30 }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ background: "#d1fae5" }}>
                  <th style={celda}>Número de cuenta</th>
                  <th style={celda}>Tipo</th>
                  <th style={celda}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {datos.cuentas.map((cuenta) => (
                  <tr key={cuenta.id}>
                    <td style={celda}>{cuenta.numero}</td>
                    <td style={celda}>{cuenta.tipo}</td>
                    <td style={celda}>
                      {soles(cuenta.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Cobros recibidos</h2>

          <div style={{ overflowX: "auto", marginBottom: 30 }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ background: "#d1fae5" }}>
                  <th style={celda}>Operación</th>
                  <th style={celda}>Fecha</th>
                  <th style={celda}>Pedido</th>
                  <th style={celda}>Tipo</th>
                  <th style={celda}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {datos.movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td style={celda}>
                      OP-{String(movimiento.id).padStart(5, "0")}
                    </td>
                    <td style={celda}>
                      {fecha(movimiento.fecha)}
                    </td>
                    <td style={celda}>
                      {movimiento.referencia}
                    </td>
                    <td style={celda}>
                      {movimiento.tipo}
                    </td>
                    <td style={{
                      ...celda,
                      color: "#15803d",
                      fontWeight: "bold"
                    }}>
                      +{soles(movimiento.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {datos.movimientos.length === 0 && (
              <p>No existen cobros registrados.</p>
            )}
          </div>

          <h2>Totales de cobros por día</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ background: "#d1fae5" }}>
                  <th style={celda}>Fecha</th>
                  <th style={celda}>Cantidad de cobros</th>
                  <th style={celda}>Total cobrado</th>
                </tr>
              </thead>
              <tbody>
                {datos.totalesDiarios.map((dia) => (
                  <tr key={dia.fecha}>
                    <td style={celda}>
                      {formatoDia(dia.fecha)}
                    </td>
                    <td style={celda}>
                      {dia.cantidad}
                    </td>
                    <td style={celda}>
                      {soles(dia.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {datos.totalesDiarios.length === 0 && (
              <p>No existen totales diarios registrados.</p>
            )}
          </div>
        </>
      ) : null}
    </main>
  );
}
