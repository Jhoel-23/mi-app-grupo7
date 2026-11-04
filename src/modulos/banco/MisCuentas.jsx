
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { consultarCuentasNeon } from "../../config/neon";

export default function MisCuentas() {
  const { usuario } = useAuth();

  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarCuentasNeon(usuario.token);

      setCuentas(datos.cuentas);
      setMovimientos(datos.movimientos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuario.token]);

  const soles = (valor) => {
    return `S/ ${Number(valor).toFixed(2)}`;
  };

  const estiloTabla = {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff"
  };

  const estiloCelda = {
    padding: 12,
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left"
  };

  return (
    <main style={{
      maxWidth: 1100,
      margin: "30px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        Banco Andino Perú
      </h1>

      <h2>Mis cuentas</h2>

      <p>
        Titular: <strong>{usuario.nombre}</strong>
      </p>

      <button
        onClick={cargarDatos}
        disabled={cargando}
        style={{
          padding: "10px 18px",
          background: "#16a34a",
          color: "#ffffff",
          border: 0,
          borderRadius: 8,
          marginBottom: 20,
          cursor: "pointer"
        }}
      >
        {cargando ? "Actualizando..." : "Actualizar datos"}
      </button>

      {error && (
        <p style={{ color: "#dc2626" }} role="alert">
          {error}
        </p>
      )}

      {cargando ? (
        <p>Cargando información bancaria...</p>
      ) : (
        <>
          {cuentas.length === 0 ? (
            <section>
              <p>No tienes cuentas registradas.</p>
              <Link to="/banco/abrir-cuenta">
                Abrir cuenta de ahorros
              </Link>
            </section>
          ) : (
            <section style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
              marginBottom: 30
            }}>
              {cuentas.map((cuenta) => (
                <article
                  key={cuenta.id}
                  style={{
                    background: "#ecfdf5",
                    padding: 25,
                    border: "1px solid #16a34a",
                    borderRadius: 12
                  }}
                >
                  <h3>Cuenta de {cuenta.tipo}</h3>

                  <p>
                    <strong>Número:</strong> {cuenta.numero}
                  </p>

                  <p>Saldo disponible</p>

                  <h2 style={{ color: "#166534" }}>
                    {soles(cuenta.saldo)}
                  </h2>

                  <p style={{ color: "#15803d" }}>
                    Cuenta activa
                  </p>
                </article>
              ))}
            </section>
          )}

          <h2>Historial de movimientos</h2>

          {movimientos.length === 0 ? (
            <p>No existen movimientos registrados.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={estiloTabla}>
                <thead>
                  <tr style={{ background: "#e2e8f0" }}>
                    <th style={estiloCelda}>Operación</th>
                    <th style={estiloCelda}>Fecha</th>
                    <th style={estiloCelda}>Cuenta</th>
                    <th style={estiloCelda}>Tipo</th>
                    <th style={estiloCelda}>Monto</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td style={estiloCelda}>
                        OP-{String(movimiento.id).padStart(5, "0")}
                      </td>

                      <td style={estiloCelda}>
                        {new Date(movimiento.fecha).toLocaleString("es-PE")}
                      </td>

                      <td style={estiloCelda}>
                        {movimiento.numero}
                      </td>

                      <td style={estiloCelda}>
                        {movimiento.tipo}
                      </td>

                      <td style={{
                        ...estiloCelda,
                        color: movimiento.tipo === "deposito" ||
                          movimiento.tipo === "abono"
                          ? "#15803d"
                          : "#dc2626",
                        fontWeight: "bold"
                      }}>
                        {movimiento.tipo === "deposito" ||
                        movimiento.tipo === "abono" ? "+" : "-"}
                        {soles(movimiento.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
