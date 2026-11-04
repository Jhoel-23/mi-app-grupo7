
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registrarDepositoNeon } from "../../config/neon";

export default function Ventanilla() {
  const { usuario } = useAuth();

  const [numero, setNumero] = useState("001-0000001");
  const [monto, setMonto] = useState("200.00");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  const registrar = async (e) => {
    e.preventDefault();

    setError("");
    setResultado(null);
    setCargando(true);

    try {
      const datos = await registrarDepositoNeon(
        usuario.token,
        numero,
        monto
      );

      setResultado(datos.operacion);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const estiloInput = {
    width: "100%",
    padding: 12,
    marginTop: 8,
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 8
  };

  return (
    <main style={{
      maxWidth: 650,
      margin: "40px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        Banco Andino Perú
      </h1>

      <h2>Ventanilla de depósitos</h2>

      <p>
        Cajero: <strong>{usuario?.nombre}</strong>
      </p>

      <form
        onSubmit={registrar}
        style={{
          background: "#ffffff",
          padding: 30,
          border: "1px solid #d1d5db",
          borderRadius: 12,
          display: "grid",
          gap: 18
        }}
      >
        <label>
          Número de cuenta
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
            style={estiloInput}
          />
        </label>

        <label>
          Monto del depósito (S/)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            style={estiloInput}
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
          style={{
            background: "#16a34a",
            color: "white",
            border: 0,
            borderRadius: 8,
            padding: 14,
            cursor: cargando ? "wait" : "pointer"
          }}
        >
          {cargando ? "Guardando..." : "Confirmar depósito"}
        </button>
      </form>

      {resultado && (
        <section style={{
          background: "#ecfdf5",
          border: "1px solid #16a34a",
          borderRadius: 12,
          marginTop: 25,
          padding: 25
        }}>
          <h2 style={{ color: "#166534" }}>
            Depósito registrado correctamente
          </h2>

          <p><strong>Operación:</strong> OP-{String(resultado.id).padStart(5, "0")}</p>
          <p><strong>Cuenta:</strong> {resultado.numero}</p>
          <p><strong>Monto:</strong> S/ {Number(resultado.monto).toFixed(2)}</p>
          <p><strong>Saldo actual:</strong> S/ {Number(resultado.saldo).toFixed(2)}</p>
        </section>
      )}
    </main>
  );
}
