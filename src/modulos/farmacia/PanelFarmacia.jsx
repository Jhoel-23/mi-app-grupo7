
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  consultarPedidosAdminNeon,
  actualizarPedidoAdminNeon
} from "../../config/neon";
import RegistroCliente from "../../components/RegistroCliente";


export default function PanelFarmacia() {
  const { usuario } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarPedidosAdminNeon(usuario.token);
      setPedidos(datos.pedidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [usuario.token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const editar = (pedido) => {
    setEditando(pedido.id);
    setDireccion(pedido.direccion);
    setError("");
    setMensaje("");
  };

  const guardar = async (id) => {
    setGuardando(true);
    setError("");

    try {
      const resultado = await actualizarPedidoAdminNeon(
        usuario.token,
        id,
        direccion
      );

      setMensaje(resultado.mensaje);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = pedidos.filter((p) =>
    [
      p.codigo,
      p.nombre,
      p.apellido,
      p.producto,
      p.estado
    ].join(" ").toLowerCase().includes(busqueda.toLowerCase())
  );

  const colorEstado = (estado) => {
    if (estado === "pagado") return "#15803d";
    if (estado === "despachado") return "#2563eb";
    if (estado === "pendiente") return "#b45309";
    return "#475569";
  };

  const celda = {
    padding: 12,
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left"
  };

  const boton = {
    padding: "9px 14px",
    background: "#16a34a",
    color: "white",
    border: 0,
    borderRadius: 7,
    cursor: "pointer"
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
        FarmaSalud Perú
      </h1>

      <h2>Panel de administración de pedidos</h2>

        <RegistroCliente modulo="farmacia" />

      <p>
        Administrador: <strong>{usuario.nombre}</strong>
      </p>

      <section style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 25
      }}>
        <Link to="/farmacia/cobros">
          <button style={boton}>Consultar cobros</button>
        </Link>

        <button
          style={boton}
          onClick={cargar}
          disabled={cargando}
        >
          Actualizar listado
        </button>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 15,
        marginBottom: 25
      }}>
        {[
          ["Total de pedidos", pedidos.length],
          ["Pendientes", pedidos.filter(p => p.estado === "pendiente").length],
          ["Pagados", pedidos.filter(p => p.estado === "pagado").length],
          ["Despachados", pedidos.filter(p => p.estado === "despachado").length]
        ].map(([titulo, valor]) => (
          <article
            key={titulo}
            style={{
              padding: 20,
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              background: "white"
            }}
          >
            <h3>{titulo}</h3>
            <h2>{valor}</h2>
          </article>
        ))}
      </section>

      <label htmlFor="buscar-pedido">
        Buscar pedidos
      </label>

      <input
        id="buscar-pedido"
        type="search"
        placeholder="Código, cliente, producto o estado"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          margin: "10px 0 20px",
          boxSizing: "border-box",
          border: "1px solid #cbd5e1",
          borderRadius: 8
        }}
      />

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
                  "Código",
                  "Cliente",
                  "Producto",
                  "Dirección",
                  "Total",
                  "Estado",
                  "Acciones"
                ].map(t => (
                  <th key={t} style={celda}>{t}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td style={celda}>{p.codigo}</td>
                  <td style={celda}>
                    {p.nombre} {p.apellido}
                  </td>
                  <td style={celda}>{p.producto}</td>

                  <td style={celda}>
                    {editando === p.id ? (
                      <input
                        aria-label="Dirección de entrega"
                        value={direccion}
                        onChange={e => setDireccion(e.target.value)}
                        minLength={5}
                        maxLength={500}
                      />
                    ) : p.direccion}
                  </td>

                  <td style={celda}>
                    S/ {Number(p.total).toFixed(2)}
                  </td>

                  <td style={{
                    ...celda,
                    color: colorEstado(p.estado),
                    fontWeight: "bold"
                  }}>
                    {p.estado}
                  </td>

                  <td style={celda}>
                    {editando === p.id ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={boton}
                          disabled={guardando}
                          onClick={() => guardar(p.id)}
                        >
                          Guardar
                        </button>
                        <button onClick={() => setEditando(null)}>
                          Cancelar
                        </button>
                      </div>
                    ) : (

                        <button
                        style={{
                            ...boton,
                            background: p.estado === "pendiente"
                            ? "#16a34a"
                            : "#94a3b8",
                            cursor: p.estado === "pendiente"
                            ? "pointer"
                            : "not-allowed"
                        }}
                        disabled={p.estado !== "pendiente"}
                        onClick={() => editar(p)}
                        >
                        {p.estado === "pendiente" ? "Editar" : "Bloqueado"}
                        </button>

                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <p>No se encontraron pedidos.</p>
          )}
        </div>
      )}
    </main>
  );
}
