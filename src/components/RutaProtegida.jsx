
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({
  children,
  modulo,
  rolesPermitidos = []
}) {
  const { usuario, tieneRol } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (modulo && !tieneRol(modulo, rolesPermitidos)) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}
