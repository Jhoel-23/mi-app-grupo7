
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registrarClienteAdminNeon } from "../config/neon";

const datosIniciales = {
  nombre: "",
  apellido: "",
  dni: "",
  correo: "",
  password: ""
};

export default function RegistroCliente({ modulo, onRegistrado }) {
  const { usuario } = useAuth();

  const [datos, setDatos] = useState(datosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cambiar = (e) => {
    const { name, value } = e.target;

    setDatos((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  const registrar = async (e) => {
    e.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const resultado = await registrarClienteAdminNeon(
        usuario.token,
        modulo,
        datos
      );

      setMensaje(resultado.mensaje);
      setDatos({ ...datosIniciales });

      if (onRegistrado) {
        await onRegistrado();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const estiloInput = {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    marginTop: 7
  };

  return (
    <section style={{
      background: "#ffffff",
      border: "1px solid #cbd5e1",
      borderRadius: 12,
      padding: 25,
      marginBottom: 30
    }}>
      <h2>Registrar nuevo cliente</h2>

      <p>
        Aplicación:{" "}
        <strong>
          {modulo === "farmacia"
            ? "FarmaSalud Perú"
            : "Banco Andino Perú"}
        </strong>
      </p>

      <form
        onSubmit={registrar}
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18
        }}
      >
        <label>
          Nombres
          <input
            name="nombre"
            value={datos.nombre}
            onChange={cambiar}
            required
            minLength={2}
            maxLength={100}
            style={estiloInput}
            placeholder="Nombres completos"
          />
        </label>

        <label>
          Apellidos
          <input
            name="apellido"
            value={datos.apellido}
            onChange={cambiar}
            required
            minLength={2}
            maxLength={100}
            style={estiloInput}
            placeholder="Apellidos completos"
          />
        </label>

        <label>
          DNI
          <input
            name="dni"
            value={datos.dni}
            onChange={cambiar}
            required
            minLength={8}
            maxLength={8}
            pattern="[0-9]{8}"
            inputMode="numeric"
            style={estiloInput}
            placeholder="8 dígitos"
          />
        </label>

        <label>
          Correo electrónico
          <input
            name="correo"
            type="email"
            value={datos.correo}
            onChange={cambiar}
            required
            maxLength={150}
            style={estiloInput}
            placeholder="cliente@correo.com"
          />
        </label>

        <label>
          Contraseña
          <input
            name="password"
            type="password"
            value={datos.password}
            onChange={cambiar}
            required
            minLength={6}
            style={estiloInput}
            autoComplete="new-password"
            placeholder="Contraseña del cliente"
          />
        </label>

        <div style={{
          display: "flex",
          alignItems: "end"
        }}>
          <button
            type="submit"
            disabled={guardando}
            style={{
              width: "100%",
              background: "#16a34a",
              color: "#ffffff",
              padding: 13,
              border: 0,
              borderRadius: 8,
              cursor: guardando ? "wait" : "pointer"
            }}
          >
            {guardando
              ? "Registrando..."
              : "Registrar cliente"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" style={{
          color: "#dc2626",
          marginTop: 15
        }}>
          {error}
        </p>
      )}

      {mensaje && (
        <p role="status" style={{
          color: "#15803d",
          marginTop: 15
        }}>
          {mensaje}
        </p>
      )}
    </section>
  );
}
