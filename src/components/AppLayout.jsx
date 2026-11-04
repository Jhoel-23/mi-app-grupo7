import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const enlaces = {
  banco: {
    cliente: [{ to: "/banco/mis-cuentas", label: "Mis cuentas" }, { to: "/banco/abrir-cuenta", label: "Abrir cuenta" }],
    empleado: [{ to: "/banco/ventanilla", label: "Ventanilla" }, { to: "/banco/operaciones-dia", label: "Operaciones del día" }],
    administrador: [{ to: "/banco/admin", label: "Panel bancario" }]
  },
  farmacia: {
    cliente: [{ to: "/farmacia/pedido", label: "Delivery y pagos" }],
    empleado: [{ to: "/farmacia/despachos", label: "Despacho de pedidos" }],
    administrador: [{ to: "/farmacia/admin/pedidos", label: "Administrar pedidos" }, { to: "/farmacia/cobros", label: "Cobros bancarios" }]
  }
};

export default function AppLayout({ children }) {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === "/login" || !usuario) return children;

  const roles = usuario.roles || [];
  const enlacesPorModulo = (modulo) => roles.filter(r => r.modulo === modulo).flatMap(r => enlaces[modulo]?.[r.rol] || []);
  const secciones = [
    { titulo: "FarmaSalud Perú", modulo: "farmacia", opciones: enlacesPorModulo("farmacia") },
    { titulo: "Banco Andino Perú", modulo: "banco", opciones: enlacesPorModulo("banco") }
  ].filter(s => s.opciones.length > 0);
  const salir = () => { cerrarSesion(); navigate("/login", { replace: true }); };

  return <div className="app-layout">
    <header className="app-topbar">
      <NavLink to="/inicio" className="app-brand"><span className="app-brand-mark">G7</span><span>Grupo 7 <small>Farmacia con pago bancario</small></span></NavLink>
      <div className="app-topbar-user"><span className="app-user-dot">{usuario.nombre?.trim()?.[0] || "U"}</span><span className="app-user-name">{usuario.nombre}</span><button className="app-logout" onClick={salir}>Salir</button></div>
    </header>
    <div className="app-body">
      <aside className="app-sidebar" aria-label="Menú principal">
        <NavLink to="/inicio" className={({isActive}) => `app-navlink ${isActive ? "active" : ""}`}>⌂ <span>Inicio</span></NavLink>
        {secciones.map(seccion => <section className="app-navgroup" key={seccion.modulo}>
          <div className="app-navtitle">{seccion.titulo}</div>
          {seccion.opciones.map(op => <NavLink key={op.to} to={op.to} className={({isActive}) => `app-navlink ${isActive ? "active" : ""}`}>{op.label}</NavLink>)}
        </section>)}
        <div className="app-sidebar-footer">Proyecto académico · Grupo 7</div>
      </aside>
      <div className="app-content"><div className="app-content-inner">{children}</div></div>
    </div>
  </div>;
}
