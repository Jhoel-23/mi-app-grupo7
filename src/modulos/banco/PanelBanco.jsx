
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  consultarPanelBancoNeon,
  actualizarClienteBancoNeon
} from "../../config/neon";
import RegistroCliente from "../../components/RegistroCliente";

export default function PanelBanco() {
    const { usuario } = useAuth();

    const [datos, setDatos] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [editando, setEditando] = useState(null);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");




    const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const resultado = await consultarPanelBancoNeon(
        usuario.token
      );

      setDatos(resultado);
    } catch (err) {
      setError(err.message);
      setDatos(null);
    } finally {
      setCargando(false);
    }
  }, [usuario.token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const soles = (valor) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN"
    }).format(Number(valor));

  const celda = {
    padding: 12,
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0"
  };

  const formatoTabla = {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff"
  };

  const cuentasFiltradas = (datos?.cuentas || []).filter(
    (cuenta) =>
      [
        cuenta.numero,
        cuenta.tipo,
        cuenta.nombre,
        cuenta.apellido,
        cuenta.correo
      ]
        .join(" ")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  const tarjetas = datos
    ? [
        ["Clientes", datos.resumen.totalClientes],
        ["Cuentas", datos.resumen.totalCuentas],
        ["Saldo total", soles(datos.resumen.saldoTotal)],
        ["Operaciones", datos.resumen.cantidadOperaciones]
      ]
    : [];

      
    const editarCliente = (cliente) => {
    setEditando(cliente.id);
    setNombre(cliente.nombre);
    setApellido(cliente.apellido);
    setError("");
    setMensaje("");
    };

    const cancelarEdicion = () => {
    setEditando(null);
    setNombre("");
    setApellido("");
    };

    const guardarCliente = async (id) => {
    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
        const resultado = await actualizarClienteBancoNeon(
        usuario.token,
        id,
        nombre,
        apellido
        );

        setDatos((anterior) => ({
        ...anterior,
        clientes: anterior.clientes.map((cliente) =>
            cliente.id === id ? resultado.cliente : cliente
        ),
        cuentas: anterior.cuentas.map((cuenta) =>
            cuenta.id_usuario === id
            ? {
                ...cuenta,
                nombre: resultado.cliente.nombre,
                apellido: resultado.cliente.apellido
                }
            : cuenta
        )
        }));

        setMensaje(resultado.mensaje);
        cancelarEdicion();
    } catch (err) {
        setError(err.message);
    } finally {
        setGuardando(false);
    }
    };


    
  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "30px auto",
        padding: 25,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        Banco Andino Perú
      </h1>

      <h2>Panel administrativo bancario</h2>

      <p>
        Administrador: <strong>{usuario.nombre}</strong>
      </p>

      <button
        onClick={cargar}
        disabled={cargando}
        style={{
          padding: "12px 20px",
          background: "#16a34a",
          color: "#ffffff",
          border: 0,
          borderRadius: 8,
          marginBottom: 25
        }}
      >
        {cargando ? "Actualizando..." : "Actualizar datos"}
      </button>

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      {cargando && !datos && (
        <p>Consultando información bancaria...</p>
      )}

      {datos && (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 18,
              marginBottom: 30
            }}
          >
            {tarjetas.map(([titulo, valor]) => (
              <article
                key={titulo}
                style={{
                  padding: 22,
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 12
                }}
              >
                <h3>{titulo}</h3>
                <h2 style={{ color: "#166534" }}>
                  {valor}
                </h2>
              </article>
            ))}
          </section>

          <h2>Resumen de movimientos</h2>

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 18,
              marginBottom: 30
            }}
          >
            {[
              ["Depósitos", datos.resumen.depositos],
              ["Pagos", datos.resumen.pagos],
              ["Abonos", datos.resumen.abonos]
            ].map(([titulo, valor]) => (
              <article
                key={titulo}
                style={{
                  padding: 20,
                  border: "1px solid #d1d5db",
                  borderRadius: 10
                }}
              >
                <h3>{titulo}</h3>
                <h2>{soles(valor)}</h2>
              </article>
            ))}
          </section>

            <RegistroCliente
            modulo="banco"
            onRegistrado={cargar}
            />

          <h2>Clientes registrados</h2>

          
            <div style={{ overflowX: "auto", marginBottom: 30 }}>
            <table style={formatoTabla}>
                <thead>
                <tr style={{ background: "#d1fae5" }}>
                    <th style={celda}>Nombres</th>
                    <th style={celda}>Apellidos</th>
                    <th style={celda}>DNI</th>
                    <th style={celda}>Correo</th>
                    <th style={celda}>Acciones</th>
                </tr>
                </thead>

                <tbody>
                {datos.clientes.map((cliente) => (
                    <tr key={cliente.id}>
                    <td style={celda}>
                        {editando === cliente.id ? (
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            maxLength={100}
                            aria-label="Nombres"
                            style={{ padding: 9, width: 160 }}
                        />
                        ) : (
                        cliente.nombre
                        )}
                    </td>

                    <td style={celda}>
                        {editando === cliente.id ? (
                        <input
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            maxLength={100}
                            aria-label="Apellidos"
                            style={{ padding: 9, width: 160 }}
                        />
                        ) : (
                        cliente.apellido
                        )}
                    </td>

                    <td style={celda}>{cliente.dni}</td>

                    <td style={celda}>{cliente.correo}</td>

                    <td style={celda}>
                        {editando === cliente.id ? (
                        <div style={{
                            display: "flex",
                            gap: 8
                        }}>
                            <button
                            disabled={guardando}
                            onClick={() => guardarCliente(cliente.id)}
                            style={{
                                padding: "9px 12px",
                                background: "#16a34a",
                                color: "white",
                                border: 0,
                                borderRadius: 7
                            }}
                            >
                            {guardando ? "Guardando..." : "Guardar"}
                            </button>

                            <button
                            onClick={cancelarEdicion}
                            disabled={guardando}
                            >
                            Cancelar
                            </button>
                        </div>
                        ) : (
                        <button
                            disabled={editando !== null}
                            onClick={() => editarCliente(cliente)}
                            style={{
                            padding: "9px 12px",
                            background: "#16a34a",
                            color: "white",
                            border: 0,
                            borderRadius: 7
                            }}
                        >
                            Editar
                        </button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {datos.clientes.length === 0 && (
                <p>No existen clientes bancarios registrados.</p>
            )}
            </div>

                {mensaje && (
                <p role="status" style={{ color: "#15803d" }}>
                    {mensaje}
                </p>
                )}


          <h2>Cuentas bancarias</h2>

          <label htmlFor="buscar-cuenta">
            Buscar cuenta o titular
          </label>

          <input
            id="buscar-cuenta"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Número, cliente, correo o tipo"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              margin: "10px 0 20px",
              border: "1px solid #cbd5e1",
              borderRadius: 8
            }}
          />

          <div style={{ overflowX: "auto", marginBottom: 30 }}>
            <table style={formatoTabla}>
              <thead>
                <tr style={{ background: "#d1fae5" }}>
                  {[
                    "Cuenta",
                    "Titular",
                    "Tipo",
                    "Saldo"
                  ].map((titulo) => (
                    <th key={titulo} style={celda}>
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {cuentasFiltradas.map((cuenta) => (
                  <tr key={cuenta.id}>
                    <td style={celda}>{cuenta.numero}</td>
                    <td style={celda}>
                      {cuenta.nombre} {cuenta.apellido}
                    </td>
                    <td style={celda}>{cuenta.tipo}</td>
                    <td style={celda}>
                      {soles(cuenta.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cuentasFiltradas.length === 0 && (
              <p>No se encontraron cuentas.</p>
            )}
          </div>

          <h2>Últimas operaciones</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={formatoTabla}>
              <thead>
                <tr style={{ background: "#d1fae5" }}>
                  {[
                    "Operación",
                    "Cuenta",
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
                    <td style={celda}>{operacion.numero}</td>
                    <td style={celda}>{operacion.tipo}</td>
                    <td style={celda}>{operacion.referencia}</td>
                    <td
                      style={{
                        ...celda,
                        fontWeight: "bold",
                        color: operacion.tipo === "pago"
                          ? "#dc2626"
                          : "#15803d"
                      }}
                    >
                      {operacion.tipo === "pago" ? "-" : "+"}
                      {soles(operacion.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
