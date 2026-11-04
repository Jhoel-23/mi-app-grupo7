
import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

dotenv.config();

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error("Falta configurar DATABASE_URL o JWT_SECRET");
}

const app = express();
const sql = neon(process.env.DATABASE_URL);

app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const resultado = await sql`
      SELECT current_database() AS database, NOW() AS fecha
    `;

    res.json({
      estado: "conectado",
      database: resultado[0].database,
      fecha: resultado[0].fecha
    });
  } catch {
    res.status(500).json({
      error: "No se pudo conectar con Neon"
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (typeof correo !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Correo y contraseña requeridos"
      });
    }

    const usuarios = await sql`
      SELECT id, nombre, apellido, correo
      FROM usuarios
      WHERE LOWER(correo) = LOWER(${correo.trim()})
        AND password = ${password}
      LIMIT 1
    `;

    if (usuarios.length === 0) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos"
      });
    }

    const usuario = usuarios[0];

    const roles = await sql`
      SELECT modulo, rol
      FROM usuario_rol
      WHERE id_usuario = ${usuario.id}
      ORDER BY modulo
    `;

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      id: usuario.id,
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      correo: usuario.correo,
      roles,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al consultar la base de datos"
    });
  }
});

function autenticar(req, res, next) {
  const autorizacion = req.headers.authorization || "";
  const token = autorizacion.startsWith("Bearer ")
    ? autorizacion.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({
      error: "Debe iniciar sesión"
    });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = datos.id;
    next();
  } catch {
    res.status(401).json({
      error: "Sesión inválida o vencida"
    });
  }
}

app.post("/api/banco/abrir-cuenta", autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${usuarioId}
        AND modulo = 'banco'
        AND rol = 'cliente'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para abrir cuentas"
      });
    }

    const existentes = await sql`
      SELECT id
      FROM cuentas
      WHERE id_usuario = ${usuarioId}
        AND tipo = 'ahorros'
      LIMIT 1
    `;

    if (existentes.length > 0) {
      return res.status(409).json({
        error: "Ya tiene una cuenta de ahorros registrada"
      });
    }

    const cuentas = await sql`
      WITH siguiente AS (
        SELECT nextval(
          pg_get_serial_sequence('public.cuentas', 'id')
        ) AS nuevo_id
      )
      INSERT INTO cuentas (
        id,
        id_usuario,
        numero,
        tipo,
        saldo
      )
      SELECT
        nuevo_id,
        ${usuarioId},
        '001-' || LPAD(nuevo_id::text, 7, '0'),
        'ahorros',
        0
      FROM siguiente
      RETURNING id, id_usuario, numero, tipo, saldo
    `;

    res.status(201).json({
      mensaje: "Cuenta abierta correctamente",
      cuenta: cuentas[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "La cuenta ya está registrada"
      });
    }

    console.error(error);

    res.status(500).json({
      error: "No se pudo registrar la cuenta"
    });
  }
});



app.post("/api/banco/depositar", autenticar, async (req, res) => {
  try {
    const { numero, monto } = req.body;

    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'banco'
        AND rol = 'empleado'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para registrar depósitos"
      });
    }

    if (
      typeof numero !== "string" ||
      typeof monto !== "string" ||
      !/^\d{1,9}(\.\d{1,2})?$/.test(monto) ||
      Number(monto) <= 0
    ) {
      return res.status(400).json({
        error: "Ingrese una cuenta y un monto válido"
      });
    }

    const resultado = await sql`
      WITH cuenta_actualizada AS (
        UPDATE cuentas
        SET saldo = saldo + ${monto}::numeric
        WHERE numero = ${numero.trim()}
        RETURNING id, numero, saldo
      ),
      operacion_creada AS (
        INSERT INTO operaciones (
          id_cuenta,
          tipo,
          monto,
          referencia
        )
        SELECT
          id,
          'deposito',
          ${monto}::numeric,
          'VENTANILLA'
        FROM cuenta_actualizada
        RETURNING id, id_cuenta, tipo, monto, fecha
      )
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.fecha,
        c.numero,
        c.saldo
      FROM operacion_creada o
      INNER JOIN cuenta_actualizada c
        ON o.id_cuenta = c.id
    `;

    if (resultado.length === 0) {
      return res.status(404).json({
        error: "La cuenta bancaria no existe"
      });
    }

    res.status(201).json({
      mensaje: "Depósito registrado correctamente",
      operacion: resultado[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo registrar el depósito"
    });
  }
});



app.get("/api/banco/mis-cuentas", autenticar, async (req, res) => {
  try {
    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'banco'
        AND rol = 'cliente'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para consultar cuentas"
      });
    }

    const cuentas = await sql`
      SELECT id, numero, tipo, saldo
      FROM cuentas
      WHERE id_usuario = ${req.usuarioId}
      ORDER BY id
    `;

    const movimientos = await sql`
      SELECT
        o.id,
        o.id_cuenta,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero
      FROM operaciones o
      INNER JOIN cuentas c ON o.id_cuenta = c.id
      WHERE c.id_usuario = ${req.usuarioId}
      ORDER BY o.fecha DESC, o.id DESC
    `;

    res.json({
      cuentas,
      movimientos
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudieron consultar las cuentas"
    });
  }
});


app.post("/api/farmacia/pedido", autenticar, async (req, res) => {
  try {
    const { direccion } = req.body;

    if (
      typeof direccion !== "string" ||
      direccion.trim().length < 5 ||
      direccion.trim().length > 500
    ) {
      return res.status(400).json({
        error: "Ingrese una dirección válida"
      });
    }

    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'cliente'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para registrar pedidos"
      });
    }

    const pedidos = await sql`
      WITH siguiente AS (
        SELECT nextval(
          pg_get_serial_sequence(
            'public.pedidos_delivery_farmacia',
            'id'
          )
        ) AS nuevo_id
      )
      INSERT INTO pedidos_delivery_farmacia (
        id,
        id_usuario,
        codigo,
        producto,
        direccion,
        total,
        estado
      )
      SELECT
        nuevo_id,
        ${req.usuarioId},
        'PDF-' || LPAD(nuevo_id::text, 5, '0'),
        'Paracetamol 500 mg x 20',
        ${direccion.trim()},
        24.50,
        'pendiente'
      FROM siguiente
      RETURNING
        id,
        codigo,
        producto,
        direccion,
        total,
        estado
    `;

    res.status(201).json({
      mensaje: "Pedido registrado correctamente",
      pedido: pedidos[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo registrar el pedido"
    });
  }
});


app.post("/api/farmacia/pagar-delivery", autenticar, async (req, res) => {
  try {
    const pedidoId = Number(req.body?.pedidoId);

    if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({
        error: "El identificador del pedido no es válido"
      });
    }

    const permisos = await sql`
      SELECT modulo, rol
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND (
          (modulo = 'farmacia' AND rol = 'cliente')
          OR
          (modulo = 'banco' AND rol = 'cliente')
        )
    `;

    const accesoFarmacia = permisos.some(
      p => p.modulo === "farmacia" && p.rol === "cliente"
    );

    const accesoBanco = permisos.some(
      p => p.modulo === "banco" && p.rol === "cliente"
    );

    if (!accesoFarmacia || !accesoBanco) {
      return res.status(403).json({
        error: "No tiene permisos para realizar el pago"
      });
    }

    const resultado = await sql`
      SELECT pagar_delivery(
        ${pedidoId},
        ${req.usuarioId}
      ) AS pago
    `;

    res.json({
      mensaje: "Pago realizado correctamente",
      pago: resultado[0].pago
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P0001") {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: "No se pudo procesar el pago bancario"
    });
  }
});


app.get("/api/farmacia/pedido-pendiente", autenticar, async (req, res) => {
  try {
    const pedidos = await sql`
      SELECT id, codigo, producto, direccion, total, estado
      FROM pedidos_delivery_farmacia
      WHERE id_usuario = ${req.usuarioId}
        AND estado = 'pendiente'
      ORDER BY id DESC
      LIMIT 1
    `;

    res.json({
      pedido: pedidos[0] || null
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo consultar el pedido"
    });
  }
});



app.get("/api/farmacia/cobros", autenticar, async (req, res) => {
  try {
    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'administrador'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para consultar cobros"
      });
    }

    const cuentas = await sql`
      SELECT id, numero, tipo, saldo
      FROM cuentas
      WHERE id_usuario = ${req.usuarioId}
        AND tipo = 'empresa'
      ORDER BY id
    `;

    if (cuentas.length === 0) {
      return res.status(404).json({
        error: "No se encontró la cuenta empresarial"
      });
    }

    const movimientos = await sql`
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero
      FROM operaciones o
      INNER JOIN cuentas c ON c.id = o.id_cuenta
      WHERE c.id_usuario = ${req.usuarioId}
        AND c.tipo = 'empresa'
        AND o.tipo = 'abono'
      ORDER BY o.fecha DESC, o.id DESC
    `;

    const totalesDiarios = await sql`
      SELECT
        (o.fecha AT TIME ZONE 'America/Lima')::date
          AS fecha,
        COUNT(*)::integer AS cantidad,
        SUM(o.monto) AS total
      FROM operaciones o
      INNER JOIN cuentas c ON c.id = o.id_cuenta
      WHERE c.id_usuario = ${req.usuarioId}
        AND c.tipo = 'empresa'
        AND o.tipo = 'abono'
      GROUP BY (o.fecha AT TIME ZONE 'America/Lima')::date
      ORDER BY fecha DESC
    `;

    const totalCobrado = movimientos.reduce(
      (acumulado, movimiento) =>
        acumulado + Number(movimiento.monto),
      0
    );

    const saldoTotal = cuentas.reduce(
      (acumulado, cuenta) =>
        acumulado + Number(cuenta.saldo),
      0
    );

    res.json({
      cuentas,
      movimientos,
      totalesDiarios,
      resumen: {
        saldoTotal,
        totalCobrado,
        cantidadCobros: movimientos.length
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo consultar los cobros"
    });
  }
});


app.get("/api/farmacia/despachos", autenticar, async (req, res) => {
  try {
    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'empleado'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para consultar despachos"
      });
    }

    const pedidos = await sql`
      SELECT
        p.id,
        p.codigo,
        p.producto,
        p.direccion,
        p.total,
        p.estado,
        p.id_operacion,
        u.nombre,
        u.apellido
      FROM pedidos_delivery_farmacia p
      INNER JOIN usuarios u
        ON u.id = p.id_usuario
      WHERE p.estado IN ('pagado', 'despachado')
      ORDER BY p.id DESC
    `;

    res.json({ pedidos });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudieron consultar los pedidos"
    });
  }
});

app.patch("/api/farmacia/despachos/:id", autenticar, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Identificador de pedido inválido"
      });
    }

    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'empleado'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para despachar"
      });
    }

    const pedidos = await sql`
      UPDATE pedidos_delivery_farmacia
      SET estado = 'despachado'
      WHERE id = ${id}
        AND estado = 'pagado'
        AND id_operacion IS NOT NULL
      RETURNING
        id,
        codigo,
        producto,
        total,
        estado,
        id_operacion
    `;

    if (pedidos.length === 0) {
      return res.status(409).json({
        error: "Solo se pueden despachar pedidos pagados"
      });
    }

    res.json({
      mensaje: "Pedido despachado correctamente",
      pedido: pedidos[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo despachar el pedido"
    });
  }
});



app.get("/api/farmacia/admin/pedidos", autenticar, async (req, res) => {
  try {
    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'administrador'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para consultar pedidos"
      });
    }

    const pedidos = await sql`
      SELECT
        p.id,
        p.codigo,
        p.producto,
        p.direccion,
        p.total,
        p.estado,
        p.id_operacion,
        u.nombre,
        u.apellido,
        u.correo
      FROM pedidos_delivery_farmacia p
      INNER JOIN usuarios u
        ON p.id_usuario = u.id
      ORDER BY p.id DESC
    `;

    res.json({ pedidos });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudieron consultar los pedidos"
    });
  }
});


app.patch("/api/farmacia/admin/pedidos/:id", autenticar, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { direccion } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Identificador de pedido inválido"
      });
    }

    if (
      typeof direccion !== "string" ||
      direccion.trim().length < 5 ||
      direccion.trim().length > 500
    ) {
      return res.status(400).json({
        error: "Ingrese una dirección válida"
      });
    }

    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'farmacia'
        AND rol = 'administrador'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para actualizar pedidos"
      });
    }

    const pedidos = await sql`
      UPDATE pedidos_delivery_farmacia
      SET direccion = ${direccion.trim()}
      WHERE id = ${id}
        AND estado = 'pendiente'
      RETURNING
        id,
        codigo,
        producto,
        direccion,
        total,
        estado
    `;

    if (pedidos.length === 0) {
      return res.status(409).json({
        error: "Solo se pueden modificar pedidos pendientes"
      });
    }

    res.json({
      mensaje: "Pedido actualizado correctamente",
      pedido: pedidos[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo actualizar el pedido"
    });
  }
});


app.get("/api/banco/operaciones-dia", autenticar, async (req, res) => {
  try {
    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'banco'
        AND rol = 'empleado'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para consultar operaciones"
      });
    }

    const fecha = req.query.fecha;

    if (
      typeof fecha !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
      Number.isNaN(Date.parse(`${fecha}T00:00:00Z`)) ||
      new Date(`${fecha}T00:00:00Z`)
        .toISOString().slice(0, 10) !== fecha
    ) {
      return res.status(400).json({
        error: "Ingrese una fecha válida"
      });
    }

    const operaciones = await sql`
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero,
        u.nombre,
        u.apellido
      FROM operaciones o
      INNER JOIN cuentas c
        ON c.id = o.id_cuenta
      INNER JOIN usuarios u
        ON u.id = c.id_usuario
      WHERE (o.fecha AT TIME ZONE 'America/Lima')::date
        = ${fecha}::date
      ORDER BY o.fecha DESC, o.id DESC
    `;

    const resumen = await sql`
      SELECT
        COUNT(*)::integer AS cantidad,
        COALESCE(SUM(monto) FILTER (
          WHERE tipo = 'deposito'
        ), 0) AS depositos,
        COALESCE(SUM(monto) FILTER (
          WHERE tipo = 'pago'
        ), 0) AS pagos,
        COALESCE(SUM(monto) FILTER (
          WHERE tipo = 'abono'
        ), 0) AS abonos
      FROM operaciones
      WHERE (fecha AT TIME ZONE 'America/Lima')::date
        = ${fecha}::date
    `;

    res.json({
      fecha,
      operaciones,
      resumen: resumen[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudieron consultar las operaciones"
    });
  }
});


app.get("/api/banco/admin/panel", autenticar, async (req, res) => {
  try {
    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'banco'
        AND rol = 'administrador'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para administrar el banco"
      });
    }

    const clientes = await sql`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.dni,
        u.correo
      FROM usuarios u
      INNER JOIN usuario_rol r
        ON r.id_usuario = u.id
      WHERE r.modulo = 'banco'
        AND r.rol = 'cliente'
      ORDER BY u.id
    `;

    const cuentas = await sql`
      SELECT
        c.id,
        c.id_usuario,
        c.numero,
        c.tipo,
        c.saldo,
        u.nombre,
        u.apellido,
        u.correo
      FROM cuentas c
      INNER JOIN usuarios u
        ON u.id = c.id_usuario
      ORDER BY c.id
    `;

    const operaciones = await sql`
      SELECT
        o.id,
        o.tipo,
        o.monto,
        o.referencia,
        o.fecha,
        c.numero,
        u.nombre,
        u.apellido
      FROM operaciones o
      INNER JOIN cuentas c
        ON c.id = o.id_cuenta
      INNER JOIN usuarios u
        ON u.id = c.id_usuario
      ORDER BY o.fecha DESC, o.id DESC
    `;

    const resumen = await sql`
      SELECT
        COUNT(*)::integer AS cantidad_operaciones,
        COALESCE(
          SUM(monto) FILTER (WHERE tipo = 'deposito'),
          0
        ) AS depositos,
        COALESCE(
          SUM(monto) FILTER (WHERE tipo = 'pago'),
          0
        ) AS pagos,
        COALESCE(
          SUM(monto) FILTER (WHERE tipo = 'abono'),
          0
        ) AS abonos
      FROM operaciones
    `;

    res.json({
      clientes,
      cuentas,
      operaciones,
      resumen: {
        totalClientes: clientes.length,
        totalCuentas: cuentas.length,
        saldoTotal: cuentas.reduce(
          (total, cuenta) => total + Number(cuenta.saldo),
          0
        ),
        cantidadOperaciones: resumen[0].cantidad_operaciones,
        depositos: resumen[0].depositos,
        pagos: resumen[0].pagos,
        abonos: resumen[0].abonos
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo cargar el panel bancario"
    });
  }
});


app.patch("/api/banco/admin/clientes/:id", autenticar, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, apellido } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Identificador de cliente inválido"
      });
    }

    if (
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      nombre.trim().length < 2 ||
      apellido.trim().length < 2 ||
      nombre.trim().length > 100 ||
      apellido.trim().length > 100
    ) {
      return res.status(400).json({
        error: "Ingrese nombres y apellidos válidos"
      });
    }

    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = 'banco'
        AND rol = 'administrador'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permiso para actualizar clientes"
      });
    }

    const clientes = await sql`
      UPDATE usuarios
      SET
        nombre = ${nombre.trim()},
        apellido = ${apellido.trim()}
      WHERE id = ${id}
        AND EXISTS (
          SELECT 1
          FROM usuario_rol
          WHERE id_usuario = ${id}
            AND modulo = 'banco'
            AND rol = 'cliente'
        )
      RETURNING
        id,
        nombre,
        apellido,
        dni,
        correo
    `;

    if (clientes.length === 0) {
      return res.status(404).json({
        error: "Cliente bancario no encontrado"
      });
    }

    res.json({
      mensaje: "Cliente actualizado correctamente",
      cliente: clientes[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo actualizar el cliente"
    });
  }
});


app.post("/api/:modulo/admin/clientes", autenticar, async (req, res) => {
  try {
    const { modulo } = req.params;
    const { nombre, apellido, dni, correo, password } = req.body;

    if (!["farmacia", "banco"].includes(modulo)) {
      return res.status(400).json({
        error: "Módulo no válido"
      });
    }

    const permisos = await sql`
      SELECT 1
      FROM usuario_rol
      WHERE id_usuario = ${req.usuarioId}
        AND modulo = ${modulo}
        AND rol = 'administrador'
      LIMIT 1
    `;

    if (permisos.length === 0) {
      return res.status(403).json({
        error: "No tiene permisos para registrar clientes"
      });
    }

    if (
      typeof nombre !== "string" ||
      typeof apellido !== "string" ||
      typeof dni !== "string" ||
      typeof correo !== "string" ||
      typeof password !== "string" ||
      nombre.trim().length < 2 ||
      apellido.trim().length < 2 ||
      nombre.trim().length > 100 ||
      apellido.trim().length > 100 ||
      !/^\d{8}$/.test(dni) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      password.length < 6
    ) {
      return res.status(400).json({
        error: "Verifique los datos del cliente"
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const resultado = await sql`
      WITH nuevo AS (
        INSERT INTO usuarios (
          nombre,
          apellido,
          dni,
          correo,
          password
        )
        VALUES (
          ${nombre.trim()},
          ${apellido.trim()},
          ${dni},
          ${correoNormalizado},
          ${password}
        )
        ON CONFLICT (correo) DO NOTHING
        RETURNING id
      ),
      seleccionado AS (
        SELECT id FROM nuevo
        UNION ALL
        SELECT id
        FROM usuarios
        WHERE correo = ${correoNormalizado}
          AND dni = ${dni}
        LIMIT 1
      ),
      nuevo_rol AS (
        INSERT INTO usuario_rol (
          id_usuario,
          modulo,
          rol
        )
        SELECT id, ${modulo}, 'cliente'
        FROM seleccionado
        ON CONFLICT (id_usuario, modulo) DO NOTHING
        RETURNING id_usuario
      )
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.dni,
        u.correo
      FROM usuarios u
      INNER JOIN nuevo_rol nr ON nr.id_usuario = u.id
    `;

    if (resultado.length === 0) {
      return res.status(409).json({
        error: "El usuario ya existe, tiene datos distintos o posee un rol en este módulo"
      });
    }

    res.status(201).json({
      mensaje: "Cliente registrado correctamente",
      cliente: {
        ...resultado[0],
        modulo,
        rol: "cliente"
      }
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "El DNI o correo ya pertenece a otro usuario"
      });
    }

    res.status(500).json({
      error: "No se pudo registrar el cliente"
    });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Servidor conectado en el puerto 3001");
});
