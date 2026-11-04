
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { consultarOperacionesDiaNeon } from "../../config/neon";

function obtenerFechaLima() {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const valor = (tipo) =>
    partes.find((p) => p.type === tipo)?.value;

  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

export default function OperacionesDia() {
  const { usuario } = useAuth();

  const [fecha, setFecha] = useState(obtenerFechaLima);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const consultar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const resultado = await consultarOperacionesDiaNeon(
        usuario.token,
        fecha
      );

      setDatos(resultado);
    } catch (err) {
      setError(err.message);
      setDatos(null);
    } finally {
      setCargando(false);
    }
  }, [usuario.token, fecha]);

  useEffect(() => {
    consultar();
  }, [consultar]);

  const soles = (valor) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(Number(valor));

  const tarjetas = datos ? [
    ["Total de operaciones", datos.resumen.cantidad],
    ["Depósitos", soles(datos.resumen.depositos)],
    ["Pagos", soles(datos.resumen.pagos)],
    ["Abonos", soles(datos.resumen.abonos)]
  ] : [];

  const celda = {
    padding: 12,
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0"
  };

  return (
    <main style={{
      maxWidth: 1200,
      margin: "30px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        Banco Andino Perú
      </h1>

      <h2>Operaciones del día</h2>

      <p>
        Cajero: <strong>{usuario.nombre}</strong>
      </p>

      <section style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "end",
        marginBottom: 25
      }}>
        <label>
          Fecha de operaciones
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{
              display: "block",
              padding: 10,
              marginTop: 8,
              border: "1px solid #cbd5e1",
              borderRadius: 8
            }}
          />
        </label>

        <button
          onClick={consultar}
          disabled={cargando}
          style={{
            background: "#16a34a",
            color: "white",
            padding: "12px 20px",
            border: 0,
            borderRadius: 8
          }}
        >
          {cargando ? "Consultando..." : "Actualizar"}
        </button>

        <Link to="/banco/ventanilla">
          Ir a ventanilla
        </Link>
      </section>

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      {datos && (
        <>
          <section style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
            marginBottom: 30
          }}>
            {tarjetas.map(([titulo, valor]) => (
              <article key={titulo} style={{
                background: "white",
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: 22
              }}>
                <h3>{titulo}</h3>
                <h2 style={{ color: "#166534" }}>
                  {valor}
                </h2>
              </article>
            ))}
          </section>

          <h2>Historial de operaciones</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white"
            }}>
              <thead>
                <tr style={{ background: "#d1fae5" }}>
                  {[
                    "Operación",
                    "Cuenta",
                    "Titular",
                    "Tipo",
                    "Referencia",
                    "Monto"
                  ].map((titulo) => (
                    <th key={titulo} style={celda}>
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {datos.operaciones.map((operacion) => (
                  <tr key={operacion.id}>
                    <td style={celda}>
                      OP-{String(operacion.id).padStart(5, "0")}
                    </td>

                    <td style={celda}>
                      {operacion.numero}
                    </td>

                    <td style={celda}>
                      {operacion.nombre} {operacion.apellido}
                    </td>

                    <td style={celda}>
                      {operacion.tipo}
                    </td>

                    <td style={celda}>
                      {operacion.referencia}
                    </td>

                    <td style={{
                      ...celda,
                      color: operacion.tipo === "pago"
                        ? "#dc2626"
                        : "#15803d",
                      fontWeight: "bold"
                    }}>
                      {operacion.tipo === "pago" ? "-" : "+"}
                      {soles(operacion.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {datos.operaciones.length === 0 && (
              <p>No existen operaciones para la fecha seleccionada.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
