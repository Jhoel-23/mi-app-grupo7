
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { abrirCuentaNeon } from "../config/neon";

export default function AbrirCuenta() {
  const { usuario } = useAuth();

  const [tipo, setTipo] = useState("ahorros");
  const [moneda, setMoneda] = useState("PEN");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [cuenta, setCuenta] = useState(null);

  const registrarCuenta = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const resultado = await abrirCuentaNeon(usuario.token);
      setCuenta(resultado.cuenta);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const estiloCampo = {
    display: "block",
    width: "100%",
    padding: 10,
    marginTop: 8,
    boxSizing: "border-box",
    borderRadius: 6,
    border: "1px solid #cbd5e1"
  };

  return (
    <main style={{
      maxWidth: 850,
      margin: "40px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        Banco Andino Perú
      </h1>

      <h2>Abrir cuenta de ahorros</h2>

      {cuenta ? (
        <section style={{
          background: "#ecfdf5",
          padding: 30,
          borderRadius: 12,
          border: "1px solid #16a34a"
        }}>
          <h2 style={{ color: "#166534" }}>
            Cuenta abierta correctamente
          </h2>

          <p><strong>Titular:</strong> {usuario.nombre}</p>
          <p><strong>Número:</strong> {cuenta.numero}</p>
          <p><strong>Tipo:</strong> {cuenta.tipo}</p>
          <p>
            <strong>Saldo:</strong> S/ {Number(cuenta.saldo).toFixed(2)}
          </p>
        </section>
      ) : (
        <form
          onSubmit={registrarCuenta}
          style={{
            background: "#ffffff",
            padding: 30,
            borderRadius: 12,
            border: "1px solid #d1d5db",
            display: "grid",
            gap: 15
          }}
        >
          <label>
            Titular
            <input
              type="text"
              value={usuario?.nombre || ""}
              readOnly
              style={estiloCampo}
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              value={usuario?.correo || ""}
              readOnly
              style={estiloCampo}
            />
          </label>

          <label>
            Tipo de cuenta
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={estiloCampo}
            >
              <option value="ahorros">Cuenta de ahorros</option>
            </select>
          </label>

          <label>
            Moneda
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              style={estiloCampo}
            >
              <option value="PEN">Soles</option>
            </select>
          </label>

          {error && (
            <p style={{ color: "#dc2626" }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              padding: 13,
              background: "#16a34a",
              color: "white",
              border: 0,
              borderRadius: 8,
              cursor: cargando ? "wait" : "pointer"
            }}
          >
            {cargando ? "Guardando..." : "Abrir cuenta"}
          </button>
        </form>
      )}
    </main>
  );
}
