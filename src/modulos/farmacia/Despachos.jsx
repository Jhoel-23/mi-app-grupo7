
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  consultarDespachosNeon,
  despacharPedidoNeon
} from "../../config/neon";

export default function Despachos() {
  const { usuario } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarDespachosNeon(usuario.token);
      setPedidos(datos.pedidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [usuario.token]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const despachar = async (pedido) => {
    if (procesando !== null) return;

    const confirmado = window.confirm(
      `¿Confirmar despacho del pedido ${pedido.codigo}?`
    );

    if (!confirmado) return;

    setProcesando(pedido.id);
    setError("");
    setMensaje("");

    try {
      const resultado = await despacharPedidoNeon(
        usuario.token,
        pedido.id
      );

      setMensaje(resultado.mensaje);
      await cargarPedidos();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
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
        FarmaSalud Perú
      </h1>

      <h2>Despacho de pedidos delivery</h2>

      <p>
        Empleado: <strong>{usuario.nombre}</strong>
      </p>

      <button
        onClick={cargarPedidos}
        disabled={cargando}
        style={{
          background: "#16a34a",
          color: "white",
          padding: 12,
          border: 0,
          borderRadius: 8,
          marginBottom: 20
        }}
      >
        Actualizar pedidos
      </button>

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      {mensaje && (
        <p role="status" style={{ color: "#15803d" }}>
          {mensaje}
        </p>
      )}

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p>No existen pedidos pagados para despachar.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white"
          }}>
            <thead>
              <tr style={{ background: "#d1fae5" }}>
                {[
                  "Pedido",
                  "Cliente",
                  "Producto",
                  "Total",
                  "Estado",
                  "Acción"
                ].map((titulo) => (
                  <th
                    key={titulo}
                    style={{
                      padding: 12,
                      textAlign: "left"
                    }}
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td style={{ padding: 12 }}>
                    {pedido.codigo}
                  </td>

                  <td style={{ padding: 12 }}>
                    {pedido.nombre} {pedido.apellido}
                  </td>

                  <td style={{ padding: 12 }}>
                    {pedido.producto}
                  </td>

                  <td style={{ padding: 12 }}>
                    S/ {Number(pedido.total).toFixed(2)}
                  </td>

                  <td style={{ padding: 12 }}>
                    <span style={{
                      color: pedido.estado === "pagado"
                        ? "#15803d"
                        : "#475569",
                      fontWeight: "bold"
                    }}>
                      {pedido.estado}
                    </span>
                  </td>

                  <td style={{ padding: 12 }}>
                    <button
                      disabled={
                        pedido.estado !== "pagado" ||
                        procesando !== null
                      }
                      onClick={() => despachar(pedido)}
                      style={{
                        padding: "9px 13px",
                        background: pedido.estado === "pagado"
                          ? "#16a34a"
                          : "#94a3b8",
                        color: "white",
                        border: 0,
                        borderRadius: 7
                      }}
                    >
                      {procesando === pedido.id
                        ? "Procesando..."
                        : pedido.estado === "pagado"
                          ? "Despachar"
                          : "Despachado"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
