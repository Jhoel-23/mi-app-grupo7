# 🏥 Grupo 7 | Farmacia con pago bancario

**Sistema web de integración entre FarmaSalud Perú y Banco Andino Perú**

![React](https://img.shields.io/badge/React-Frontend-149eca)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1)
![Neon](https://img.shields.io/badge/Neon-Cloud-00E599)

## 📋 Descripción del proyecto

Sistema web académico que integra los servicios de **FarmaSalud Perú** y **Banco Andino Perú**, permitiendo gestionar clientes, cuentas bancarias, pedidos de farmacia y pagos electrónicos.

Desarrollado como proyecto final del **Grupo 7**.

## 🚀 Funcionalidades principales

### 💊 FarmaSalud Perú

- Registro de clientes.
- Creación y consulta de pedidos.
- Pago mediante cuenta bancaria.
- Gestión y despacho de pedidos.
- Panel administrativo de farmacia.

### 🏦 Banco Andino Perú

- Apertura de cuentas de ahorro.
- Consulta de saldos y movimientos.
- Registro de depósitos.
- Gestión de clientes y cuentas.
- Panel administrativo bancario.

### 🔗 Integración entre sistemas

- Autenticación mediante roles.
- Pago de pedidos desde cuentas bancarias.
- Validación de saldo disponible.
- Registro de operaciones bancarias.
- Actualización del estado del pedido.

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React | Interfaz de usuario |
| Vite | Desarrollo y compilación |
| Node.js | Ejecución del servidor |
| Express | API REST |
| PostgreSQL | Base de datos |
| Neon | Alojamiento PostgreSQL |
| GitHub | Control de versiones |
| Vercel | Plataforma prevista de despliegue |

## 👥 Usuarios de demostración

| Aplicación | Rol | Correo |
|---|---|---|
| FarmaSalud | Administrador | admin@farmasalud.pe |
| FarmaSalud | Empleado | empleado@farmasalud.pe |
| FarmaSalud | Cliente | cliente1@correo.com |
| Banco Andino | Administrador | admin@bancoandino.pe |
| Banco Andino | Cajero | cajero@bancoandino.pe |
| Banco Andino | Cliente | cliente1@correo.com |

Las credenciales de demostración se proporcionarán exclusivamente para un entorno de pruebas.

## ⚙️ Instalación local

**1. Clonar el repositorio**

```bash
git clone https://github.com/Jhoel-23/mi-app-grupo7.git
cd mi-app-grupo7
```

**2. Instalar las dependencias**

```bash
npm ci
```

**3. Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=TU_CONEXION_POSTGRESQL
PORT=3001
JWT_SECRET=TU_CLAVE_SECRETA
```

**4. Iniciar el backend**

```bash
node server.js
```

**5. Iniciar el frontend en otra terminal**

```bash
npm run dev
```

Acceder desde el navegador a:

`http://localhost:5173`

## 📂 Estructura del proyecto

```text
mi-app-grupo7/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── integraciones/
│   └── modulos/
├── server.js
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
└── README.md
```

## 🔒 Seguridad

Las credenciales de Neon y los secretos de autenticación se configuran mediante variables de entorno y no deben publicarse en el repositorio.

Este proyecto está destinado a fines académicos y de demostración.

---

**Proyecto final – Grupo 7**

*FarmaSalud Perú × Banco Andino Perú*
