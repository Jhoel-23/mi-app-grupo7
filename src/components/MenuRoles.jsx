
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MenuRoles() {
  const { usuario, tieneRol, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const obtenerRuta = (modulo) => {
    const rol = usuario?.roles?.find(
      (r) => r.modulo === modulo
    )?.rol;

    if (modulo === "farmacia") {
      if (rol === "administrador") {
        return "/farmacia/admin/pedidos";
      }

      if (rol === "empleado") {
        return "/farmacia/despachos";
      }

      if (rol === "cliente") {
        return "/farmacia/pedido";
      }
    }

    if (modulo === "banco") {
      if (rol === "administrador") {
        return "/banco/admin";
      }

      if (rol === "empleado") {
        return "/banco/operaciones-dia";
      }

      if (rol === "cliente") {
        return "/banco/mis-cuentas";
      }
    }

    return null;
  };

  const salir = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  const rutaFarmacia = obtenerRuta("farmacia");
  const rutaBanco = obtenerRuta("banco");

  return (
    <div className="home-screen">
      <div className="home-eyebrow">Proyecto final · Grupo 7</div>
      <h1>Farmacia con pago bancario</h1>
      <p className="home-welcome">Bienvenido, <strong>{usuario?.nombre}</strong></p>
      <p>Selecciona una aplicación para continuar con tus operaciones.</p>
      <div className="home-actions">
        {tieneRol("farmacia") && rutaFarmacia && <Link to={rutaFarmacia}><div className="home-app farmacia"><span>FarmaSalud Perú<small>Gestión de pedidos y pagos</small></span><span>↗</span></div></Link>}
        {tieneRol("banco") && rutaBanco && <Link to={rutaBanco}><div className="home-app banco"><span>Banco Andino Perú<small>Cuentas y operaciones</small></span><span>↗</span></div></Link>}
      </div>
      <section className="home-roles">
        <h3>Mis roles asignados</h3>
        {usuario?.roles?.map((r) => <span className="home-role" key={`${r.modulo}-${r.rol}`}><strong>{r.modulo}</strong> · {r.rol}</span>)}
      </section>
      <button className="home-signout" onClick={salir}>Cerrar sesión</button>
    </div>
  );
}
