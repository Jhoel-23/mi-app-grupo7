
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  registrarPedidoNeon,
  pagarDeliveryNeon,
  consultarPedidoPendienteNeon
} from "../config/neon";

export default function PagoDelivery() {
  const { usuario } = useAuth();

  const [direccion, setDireccion] = useState("");
  const [pedido, setPedido] = useState(null);
  const [pago, setPago] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [consultando, setConsultando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargarPedido = async () => {
      try {
        const datos = await consultarPedidoPendienteNeon(
          usuario.token
        );

        if (activo && datos.pedido) {
          setPedido(datos.pedido);
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setConsultando(false);
        }
      }
    };

    cargarPedido();

    return () => {
      activo = false;
    };
  }, [usuario.token]);

  const registrar = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setError("");
    setCargando(true);

    try {
      const resultado = await registrarPedidoNeon(
        usuario.token,
        direccion
      );

      setPedido(resultado.pedido);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const procesarPago = async () => {
    if (!pedido || pagando || pago || pedido.estado !== "pendiente") {
      return;
    }

    setError("");
    setPagando(true);

    try {
      const resultado = await pagarDeliveryNeon(
        usuario.token,
        pedido.id
      );

      setPago(resultado.pago);

      setPedido((anterior) => ({
        ...anterior,
        estado: "pagado",
        id_operacion: resultado.pago.id_operacion
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setPagando(false);
    }
  };

  const estiloCampo = {
    width: "100%",
    padding: 12,
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    marginTop: 8
  };

  const estiloBoton = {
    width: "100%",
    padding: 14,
    background: "#16a34a",
    color: "#ffffff",
    border: 0,
    borderRadius: 8,
    cursor: "pointer"
  };

  return (
    <main style={{
      maxWidth: 750,
      margin: "30px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        FarmaSalud Perú
      </h1>

      <h2>Delivery de medicamentos</h2>

      <p>
        Cliente: <strong>{usuario.nombre}</strong>
      </p>

      {consultando ? (
        <p>Consultando pedidos en Neon...</p>
      ) : pedido ? (
        <section style={{
          background: "#ecfdf5",
          border: "1px solid #16a34a",
          borderRadius: 12,
          padding: 25
        }}>
          <h2>Detalle del pedido</h2>

          <p>
            <strong>Código:</strong> {pedido.codigo}
          </p>

          <p>
            <strong>Producto:</strong> {pedido.producto}
          </p>

          <p>
            <strong>Dirección:</strong> {pedido.direccion}
          </p>

          <p>
            <strong>Total:</strong> S/ {Number(pedido.total).toFixed(2)}
          </p>

          <p>
            <strong>Estado:</strong> {pedido.estado}
          </p>

          {pago ? (
            <section>
              <h2 style={{ color: "#166534" }}>
                Pago aprobado por Banco Andino
              </h2>

              <p>
                <strong>Operación:</strong> OP-
                {String(pago.id_operacion).padStart(5, "0")}
              </p>

              <p>
                <strong>Monto pagado:</strong> S/ {Number(pago.monto).toFixed(2)}
              </p>

              <p>
                <strong>Saldo disponible:</strong> S/ {Number(pago.saldo_cliente).toFixed(2)}
              </p>

              <p>
                <strong>Saldo FarmaSalud:</strong> S/ {Number(pago.saldo_empresa).toFixed(2)}
              </p>

              <Link to="/banco/mis-cuentas">
                Consultar movimientos bancarios
              </Link>
            </section>
          ) : pedido.estado === "pendiente" ? (
            <section>
              <h3 style={{ color: "#92400e" }}>
                Pendiente de pago bancario
              </h3>

              {error && (
                <p style={{ color: "#dc2626" }} role="alert">
                  {error}
                </p>
              )}

              {error.toLowerCase().includes("saldo insuficiente") && (
                <Link to="/banco/mis-cuentas">
                  Consultar cuenta y opciones de depósito
                </Link>
              )}

              <button
                type="button"
                onClick={procesarPago}
                disabled={pagando}
                style={estiloBoton}
              >
                {pagando
                  ? "Procesando pago..."
                  : "Pagar con Banco Andino"}
              </button>
            </section>
          ) : (
            <p>Este pedido ya fue procesado.</p>
          )}
        </section>
      ) : (
        <form
          onSubmit={registrar}
          style={{
            background: "#ffffff",
            padding: 30,
            border: "1px solid #d1d5db",
            borderRadius: 12,
            display: "grid",
            gap: 16
          }}
        >
          <label>
            Cliente
            <input
              value={usuario.nombre}
              readOnly
              style={estiloCampo}
            />
          </label>

          <label>
            Producto
            <input
              value="Paracetamol 500 mg x 20"
              readOnly
              style={estiloCampo}
            />
          </label>

          <label>
            Dirección de entrega
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ingrese dirección"
              required
              minLength={5}
              maxLength={500}
              style={estiloCampo}
            />
          </label>

          <label>
            Total
            <input
              value="S/ 24.50"
              readOnly
              style={estiloCampo}
            />
          </label>

          {error && (
            <p style={{ color: "#dc2626" }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={estiloBoton}
          >
            {cargando ? "Guardando..." : "Registrar pedido"}
          </button>
        </form>
      )}
    </main>
  );
}
