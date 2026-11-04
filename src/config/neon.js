
const API_URL = "/api";

export async function iniciarSesionNeon(correo, password) {
  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo,
        password
      })
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error al iniciar sesión");
  }

  return datos;
}

export async function verificarConexionNeon() {
  const respuesta = await fetch(`${API_URL}/health`);

  if (!respuesta.ok) {
    throw new Error("No se pudo conectar con Neon");
  }

  return await respuesta.json();
}


export async function abrirCuentaNeon(token) {
  const respuesta = await fetch("/api/banco/abrir-cuenta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudo abrir la cuenta");
  }

  return datos;
}


export async function registrarDepositoNeon(token, numero, monto) {
  const respuesta = await fetch("/api/banco/depositar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      numero,
      monto
    })
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudo registrar el depósito");
  }

  return datos;
}


export async function consultarCuentasNeon(token) {
  const respuesta = await fetch("/api/banco/mis-cuentas", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error al consultar cuentas");
  }

  return datos;
}


export async function registrarPedidoNeon(token, direccion) {
  const respuesta = await fetch("/api/farmacia/pedido", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      direccion
    })
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudo registrar el pedido");
  }

  return datos;
}

export async function pagarDeliveryNeon(token, pedidoId) {
  const respuesta = await fetch("/api/farmacia/pagar-delivery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      pedidoId
    })
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudo realizar el pago");
  }

  return datos;
}



export async function consultarPedidoPendienteNeon(token) {
  const respuesta = await fetch("/api/farmacia/pedido-pendiente", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar el pedido pendiente");
  }

  return await respuesta.json();
}


export async function consultarCobrosFarmaciaNeon(token) {
  const respuesta = await fetch("/api/farmacia/cobros", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error al consultar cobros");
  }

  return datos;
}


export async function consultarDespachosNeon(token) {
  const respuesta = await fetch("/api/farmacia/despachos", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error al consultar despachos");
  }

  return datos;
}

export async function despacharPedidoNeon(token, id) {
  const respuesta = await fetch(`/api/farmacia/despachos/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error al despachar pedido");
  }

  return datos;
}

export async function consultarPedidosAdminNeon(token) {
  const respuesta = await fetch("/api/farmacia/admin/pedidos", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error al consultar pedidos");
  }

  return datos;
}

export async function actualizarPedidoAdminNeon(token, id, direccion) {
  const respuesta = await fetch(`/api/farmacia/admin/pedidos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      direccion
    })
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "Error al actualizar pedido");
  }

  return datos;
}


export async function consultarOperacionesDiaNeon(token, fecha) {
  const respuesta = await fetch(
    `/api/banco/operaciones-dia?fecha=${encodeURIComponent(fecha)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudieron consultar las operaciones"
    );
  }

  return datos;
}


export async function consultarPanelBancoNeon(token) {
  const respuesta = await fetch("/api/banco/admin/panel", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo consultar el panel bancario"
    );
  }

  return datos;
}


export async function actualizarClienteBancoNeon(
  token,
  id,
  nombre,
  apellido
) {
  const respuesta = await fetch(`/api/banco/admin/clientes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre,
      apellido
    })
  });

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo actualizar el cliente"
    );
  }

  return datos;
}



export async function registrarClienteAdminNeon(
  token,
  modulo,
  cliente
) {
  if (!["farmacia", "banco"].includes(modulo)) {
    throw new Error("Módulo no válido");
  }

  const respuesta = await fetch(
    `/api/${modulo}/admin/clientes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(cliente)
    }
  );

  const contenido = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(contenido);
  } catch {
    throw new Error("El servidor no devolvió una respuesta válida");
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo registrar el cliente"
    );
  }

  return datos;
}

