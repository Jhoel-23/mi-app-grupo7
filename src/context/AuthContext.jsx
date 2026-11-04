
import { createContext, useContext, useState } from "react";
import { iniciarSesionNeon } from "../config/neon";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = sessionStorage.getItem("usuario");
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const iniciarSesion = async (correo, password) => {
    const datos = await iniciarSesionNeon(correo, password);

    setUsuario(datos);
    sessionStorage.setItem("usuario", JSON.stringify(datos));

    return datos;
  };

  const cerrarSesion = () => {
    setUsuario(null);
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("usuarioDemo");
  };

  const tieneRol = (modulo, rolesPermitidos = []) => {
    if (!usuario) {
      return false;
    }

    return usuario.roles.some(
      (r) =>
        r.modulo === modulo &&
        (rolesPermitidos.length === 0 ||
          rolesPermitidos.includes(r.rol))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        cerrarSesion,
        tieneRol
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
