
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const ingresar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await iniciarSesion(correo, password);
      navigate("/inicio", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={ingresar} className="login-card">
        <div className="login-logo">G7</div>
        <h2>Bienvenido al Grupo 7</h2>
        <p className="login-subtitle">FarmaSalud Perú · Banco Andino Perú</p>
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" type="email" autoComplete="username" placeholder="usuario@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={cargando}>{cargando ? "Verificando..." : "Iniciar sesión"}</button>
      </form>
    </div>
  );
}
