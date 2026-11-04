
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Login from "./Login";
import AppLayout from "./components/AppLayout";
import MenuRoles from "./components/MenuRoles";
import RutaProtegida from "./components/RutaProtegida";
import AbrirCuenta from "./integraciones/AbrirCuenta";
import Ventanilla from "./modulos/banco/Ventanilla";
import MisCuentas from "./modulos/banco/MisCuentas";
import PagoDelivery from "./integraciones/PagoDelivery";
import CobrosFarmacia from "./integraciones/CobrosFarmacia";
import Despachos from "./modulos/farmacia/Despachos";
import PanelFarmacia from "./modulos/farmacia/PanelFarmacia";
import OperacionesDia from "./modulos/banco/OperacionesDia";
import PanelBanco from "./modulos/banco/PanelBanco";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />


            <Route
              path="/farmacia/despachos"
              element={
                <RutaProtegida
                  modulo="farmacia"
                  rolesPermitidos={["empleado"]}
                >
                  <Despachos />
                </RutaProtegida>
              }
            />


          <Route
            path="/farmacia/admin/pedidos"
            element={
              <RutaProtegida
                modulo="farmacia"
                rolesPermitidos={["administrador"]}
              >
                <PanelFarmacia />
              </RutaProtegida>
            }
          />


          <Route
            path="/banco/admin"
            element={
              <RutaProtegida
                modulo="banco"
                rolesPermitidos={["administrador"]}
              >
                <PanelBanco />
              </RutaProtegida>
            }
          />

          <Route
            path="/banco/operaciones-dia"
            element={
              <RutaProtegida
                modulo="banco"
                rolesPermitidos={["empleado"]}
              >
                <OperacionesDia />
              </RutaProtegida>
            }
          />


          <Route
            path="/banco/abrir-cuenta"
            element={
              <RutaProtegida
                modulo="banco"
                rolesPermitidos={["cliente"]}
              >
                <AbrirCuenta />
              </RutaProtegida>
            }
          />


        <Route
          path="/farmacia/cobros"
          element={
            <RutaProtegida
              modulo="farmacia"
              rolesPermitidos={["administrador"]}
            >
              <CobrosFarmacia />
            </RutaProtegida>
          }
        />

          <Route
            path="/banco/ventanilla"
            element={
              <RutaProtegida
                modulo="banco"
                rolesPermitidos={["empleado"]}
              >
                <Ventanilla />
              </RutaProtegida>
            }
          />


          <Route
            path="/farmacia/pedido"
            element={
              <RutaProtegida
                modulo="farmacia"
                rolesPermitidos={["cliente"]}
              >
                <PagoDelivery />
              </RutaProtegida>
            }
          />


          <Route
            path="/inicio"
            element={
              <RutaProtegida>
                <MenuRoles />
              </RutaProtegida>
            }
          />

          <Route
            path="/farmacia/panel"
            element={
              <RutaProtegida modulo="farmacia">
                <h1>Panel de FarmaSalud Perú</h1>
              </RutaProtegida>
            }
          />

         
            <Route
              path="/banco/mis-cuentas"
              element={
                <RutaProtegida
                  modulo="banco"
                  rolesPermitidos={["cliente"]}
                >
                  <MisCuentas />
                </RutaProtegida>
              }
            />

        </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
