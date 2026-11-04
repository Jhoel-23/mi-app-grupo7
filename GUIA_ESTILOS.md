# Grupo 7 — Actualización visual

Se renovó solamente la interfaz y la navegación de presentación. Se mantuvieron las rutas, formularios, API, control de roles, consultas y operaciones con Neon.

## Cambios visuales
- Cabecera institucional y menú lateral según los módulos y roles del usuario.
- Página de inicio con tarjetas separadas para FarmaSalud y Banco Andino.
- Acceso unificado y renovado.
- Formularios, tablas, paneles, botones, tipografía, espaciado y colores verdes consistentes.
- Diseño adaptable a escritorio y celular.

## Archivos editados
- `src/index.css`
- `src/App.css`
- `src/main.jsx`
- `src/App.jsx`
- `src/Login.jsx`
- `src/components/MenuRoles.jsx`
- Nuevo `src/components/AppLayout.jsx`
- `.gitignore` para evitar subir `.env` a GitHub

## Cómo usarlo
1. Guarda una copia de tu proyecto actual.
2. Descomprime este archivo en una nueva carpeta o reemplaza los archivos en tu proyecto; **no borres tu `.env` original**.
3. Si partes del ZIP limpio, copia tu `.env` de tu proyecto anterior a la nueva carpeta.
4. En PowerShell, dentro de `mi-app-grupo7`: `npm install`.
5. En una terminal: `node server.js`.
6. En otra terminal: `npm run dev`.
7. Entra a `http://localhost:5173` y recorre las pantallas con los distintos roles.

## Seguridad
La copia entregada no incluye el archivo `.env` ni `node_modules`. No compartas credenciales de Neon ni claves JWT. El almacenamiento de contraseñas en texto plano del proyecto original no fue alterado por este cambio estético, pero debe corregirse antes de publicar el sistema en Internet.

## Nota de validación
No se pudo ejecutar una compilación completa en este entorno porque las dependencias incluidas originalmente fueron instaladas en Windows y su herramienta de compilación nativa no es compatible con Linux. Realiza `npm install` y `npm run build` en Windows para validar la versión final.
