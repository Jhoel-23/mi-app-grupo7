# 💊 Grupo 7 | Farmacia con pago bancario

**Proyecto académico de integración entre FarmaSalud Perú y Banco Andino Perú.**

![React](https://img.shields.io/badge/React-Frontend-149ECA) ![Vite](https://img.shields.io/badge/Vite-Build-646CFF) ![Node.js](https://img.shields.io/badge/Node.js-Backend-339933) ![Express](https://img.shields.io/badge/Express-API-444444) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Base_de_datos-4169E1) ![Neon](https://img.shields.io/badge/Neon-PostgreSQL_en_la_nube-00B894)

## 📌 Descripción

Sistema web académico que integra la gestión de pedidos de **FarmaSalud Perú** con cuentas y operaciones de **Banco Andino Perú**.

Los clientes pueden generar pedidos, realizar pagos mediante su cuenta bancaria y consultar el estado de sus operaciones.

El sistema cuenta con diferentes módulos y funcionalidades según el rol asignado a cada usuario.

## ✨ Funcionalidades

| 💊 FarmaSalud Perú | 🏦 Banco Andino Perú |
|---|---|
| Registro y consulta de pedidos | Apertura de cuentas de ahorro |
| Pago bancario de pedidos | Consulta de saldos y movimientos |
| Administración y despacho | Registro de depósitos en ventanilla |
| Seguimiento del estado del pedido | Panel administrativo y operaciones |

**Integración entre sistemas:** el pago verifica el saldo disponible, registra las operaciones bancarias y actualiza el estado del pedido mediante la función PostgreSQL `pagar_delivery`.

## 🛠️ Tecnologías utilizadas

- **Frontend:** React y Vite.
- **Backend:** Node.js y Express.
- **Base de datos:** PostgreSQL alojado en Neon.
- **Autenticación:** JWT y roles por módulo.
- **Control de versiones:** Git y GitHub.

## 📁 Estructura del proyecto

```text
mi-app-grupo7/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── integraciones/
│   └── modulos/
├── database.sql
├── server.js
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
└── README.md
```

## ⚙️ Instalación y configuración en Windows

### 1. Descargar el proyecto

Antes de comenzar, instalar:

- [Node.js](https://nodejs.org/) en su versión LTS.
- [Git](https://git-scm.com/downloads), para clonar el repositorio.
- Una cuenta en [Neon](https://console.neon.tech/).

Abrir PowerShell, CMD o la terminal de Visual Studio Code y ejecutar:

```powershell
git clone https://github.com/Jhoel-23/mi-app-grupo7.git
cd mi-app-grupo7
```

Instalar las dependencias:

```powershell
npm ci
```

Si PowerShell bloquea el comando `npm`, se puede utilizar:

```powershell
npm.cmd ci
```

También es posible abrir una terminal CMD.

### 2. Crear una base de datos en Neon

Cada usuario deberá crear su propia base de datos PostgreSQL para ejecutar el proyecto.

**Pasos:**

1. Ingresar a [Neon Console](https://console.neon.tech/).
2. Registrarse o iniciar sesión.
3. Seleccionar **New Project**.
4. Asignar el nombre `mi-app-grupo7`.
5. Seleccionar una región disponible.
6. Crear el proyecto.
7. Verificar que exista la base de datos `neondb`.
8. En el apartado **Connect**, seleccionar la rama y la base de datos correspondientes.
9. Copiar la cadena de conexión PostgreSQL para utilizarla posteriormente en el archivo `.env`.

La conexión tendrá un formato similar al siguiente:

```text
postgresql://USUARIO:CONTRASENA@SERVIDOR/neondb?sslmode=require
```

**Importante:** el usuario, la contraseña y el servidor serán diferentes para cada proyecto Neon.

### 3. Ejecutar el script SQL en Neon

Una vez creado el proyecto en Neon, se debe ejecutar el archivo **`database.sql`**, incluido en este repositorio.

Este script permite crear automáticamente la estructura y los datos necesarios para que el sistema funcione.

**El script contiene:**

- **5 tablas:** `usuarios`, `usuario_rol`, `cuentas`, `operaciones` y `pedidos_delivery_farmacia`.
- Claves primarias, claves foráneas, relaciones y restricciones.
- Secuencias e índices.
- Función PostgreSQL `pagar_delivery`, encargada de procesar los pagos bancarios.
- 13 usuarios de demostración.
- 23 asignaciones de roles.
- 4 cuentas bancarias.
- 6 operaciones bancarias.
- 4 pedidos de farmacia.

**Pasos para ejecutar el script:**

1. Ingresar a [Neon Console](https://console.neon.tech/).
2. Abrir el proyecto `mi-app-grupo7` creado anteriormente.
3. En el menú lateral, seleccionar **SQL Editor**.
4. Abrir el archivo [`database.sql`](database.sql) de este repositorio.
5. Copiar todo el contenido del archivo SQL.
6. Regresar a **SQL Editor** en Neon.
7. Pegar el código SQL completo.
8. Presionar **Run** para ejecutar las instrucciones.
9. Esperar a que termine la ejecución.
10. Ingresar a **Tables** y verificar que aparezcan las cinco tablas.

**Resultado esperado:** la base de datos `neondb` tendrá las tablas, los usuarios de demostración, los roles, las cuentas bancarias, las operaciones, los pedidos y la función de pago.

> **Importante:** ejecutar `database.sql` únicamente una vez sobre una base de datos nueva y vacía. No es necesario crear manualmente las tablas ni registrar los usuarios de prueba.

### 4. Generar la clave JWT_SECRET

La aplicación utiliza JWT para gestionar la autenticación de los usuarios.

Cada instalación debe generar su propia clave privada `JWT_SECRET`.

**Pasos:**

1. Abrir Visual Studio Code.
2. Ingresar a la carpeta del proyecto `mi-app-grupo7`.
3. Abrir una terminal PowerShell o CMD.
4. Ejecutar el siguiente comando:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

El comando generará una clave aleatoria de 64 caracteres hexadecimales.

**Ejemplo de resultado ficticio:**

```text
a3d7e9b2c4f60182d5a7e3f9b1c6d480e2f5a9c7b3d60184f2a6c8e1d5b9f703
```

Copiar la clave generada y guardarla para utilizarla en el archivo `.env`.

**Importante:** cada usuario debe generar su propia clave. No utilizar la clave del ejemplo ni publicar la clave real en GitHub.

### 5. Configurar el archivo .env

Después de crear la base de datos en Neon y generar la clave JWT, se debe configurar la conexión del proyecto.

**Pasos:**

1. Abrir Visual Studio Code.
2. Ingresar a la carpeta principal `mi-app-grupo7`.
3. Crear un archivo llamado `.env`.
4. Agregar el siguiente contenido:

```dotenv
DATABASE_URL=postgresql://USUARIO:CONTRASENA@SERVIDOR/neondb?sslmode=require
PORT=3001
JWT_SECRET=PEGA_AQUI_TU_CLAVE_GENERADA
```

5. Reemplazar `DATABASE_URL` por la cadena de conexión copiada desde Neon.
6. Reemplazar `JWT_SECRET` por la clave generada en el paso anterior.
7. Guardar el archivo.

**Ejemplo de configuración:**

```dotenv
DATABASE_URL=TU_CONEXION_PERSONAL_DE_NEON
PORT=3001
JWT_SECRET=TU_CLAVE_PERSONAL_GENERADA
```

**Importante:** el archivo `.env` está excluido mediante `.gitignore` y no debe subirse al repositorio, porque contiene credenciales privadas de conexión.

### 6. Ejecutar la aplicación

Una vez configurada la base de datos y el archivo `.env`, se puede iniciar el sistema.

**Iniciar el backend**

Abrir una terminal en la carpeta principal y ejecutar:

```powershell
node server.js
```

El servidor debe iniciarse en el puerto `3001`.

**Iniciar el frontend**

Abrir una segunda terminal y ejecutar:

```powershell
npm run dev
```

Vite mostrará una dirección local similar a:

```text
http://localhost:5173/
```

Abrir esa dirección en el navegador.

La aplicación estará conectada al backend Node.js y a la base de datos PostgreSQL creada en Neon.

## 👤 Usuarios de demostración

El archivo `database.sql` contiene usuarios precargados para comprobar las funcionalidades de FarmaSalud Perú y Banco Andino Perú.

| Aplicación | Rol | Correo |
|---|---|---|
| FarmaSalud Perú | Administrador | `admin@farmasalud.pe` |
| FarmaSalud Perú | Empleado | `empleado@farmasalud.pe` |
| Banco Andino Perú | Administrador | `admin@bancoandino.pe` |
| Banco Andino Perú | Cajero / empleado | `cajero@bancoandino.pe` |
| Ambas aplicaciones | Cliente | `cliente1@correo.com` |
| Ambas aplicaciones | Cliente | `andrea.grupo7@example.com` |
| Ambas aplicaciones | Cliente | `pedro.grupo7@example.com` |

**Contraseña académica de los usuarios precargados:** `123456`.

Los demás clientes están registrados en la tabla `usuarios` de la base de datos.

Las cuentas de demostración se utilizan exclusivamente para fines académicos y pruebas locales.

## 🔎 Verificar la base de datos en Neon

Después de ejecutar `database.sql`, ingresar al **SQL Editor** de Neon y ejecutar:

```sql
SELECT 'usuarios' AS tabla, COUNT(*) FROM public.usuarios
UNION ALL
SELECT 'usuario_rol', COUNT(*) FROM public.usuario_rol
UNION ALL
SELECT 'cuentas', COUNT(*) FROM public.cuentas
UNION ALL
SELECT 'operaciones', COUNT(*) FROM public.operaciones
UNION ALL
SELECT 'pedidos_delivery_farmacia', COUNT(*) FROM public.pedidos_delivery_farmacia;
```

**Resultados iniciales esperados:**

| Tabla | Registros |
|---|---:|
| `usuarios` | 13 |
| `usuario_rol` | 23 |
| `cuentas` | 4 |
| `operaciones` | 6 |
| `pedidos_delivery_farmacia` | 4 |

También se puede comprobar que la función de pago existe:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'pagar_delivery';
```

Si las tablas, los registros y la función aparecen correctamente, la instalación inicial de la base de datos está completa.

## 🚀 Publicación en Vercel

El proyecto está desarrollado con React, Vite, Node.js y Express.

Para publicar la aplicación en Vercel será necesario preparar:

- La compilación del frontend React.
- La ejecución de las rutas `/api` del backend Express.
- La configuración de navegación de React.
- Las variables de entorno `DATABASE_URL` y `JWT_SECRET`.
- La conexión entre el frontend, el backend y Neon PostgreSQL.

Las variables privadas se configuran desde los ajustes del proyecto en Vercel y no deben incluirse directamente en el código fuente.

La publicación requiere adaptar y comprobar el backend antes de utilizar la aplicación desde Internet.

## 🔒 Aviso académico y de seguridad

Este proyecto ha sido desarrollado exclusivamente con fines académicos.

Los usuarios, cuentas bancarias y operaciones incluidos en `database.sql` son datos ficticios de demostración.

La implementación actual de contraseñas corresponde al entorno de prácticas. Para un sistema de producción es necesario implementar almacenamiento seguro mediante hashes, revisar las autorizaciones de la API y proteger las credenciales y los datos.

No utilizar el sistema con información bancaria real sin realizar previamente las adecuaciones de seguridad correspondientes.

---

**Proyecto final — Grupo 7 · FarmaSalud Perú × Banco Andino Perú**
