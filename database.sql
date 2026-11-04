-- Grupo 7 - Farmacia con pago bancario
BEGIN;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public, pg_catalog;

-- ESTRUCTURA

CREATE TABLE public.cuentas (
    id integer NOT NULL,
    id_usuario integer,
    numero character varying(20),
    tipo character varying(15),
    saldo numeric(12,2) DEFAULT 0,
    CONSTRAINT cuentas_saldo_check CHECK ((saldo >= (0)::numeric))
);

CREATE SEQUENCE public.cuentas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.operaciones (
    id integer NOT NULL,
    id_cuenta integer,
    tipo character varying(10),
    monto numeric(12,2),
    referencia character varying(40),
    fecha timestamp without time zone DEFAULT now(),
    CONSTRAINT operaciones_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['deposito'::character varying, 'retiro'::character varying, 'pago'::character varying, 'abono'::character varying])::text[])))
);

CREATE SEQUENCE public.operaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.pedidos_delivery_farmacia (
    id integer NOT NULL,
    id_usuario integer,
    codigo character varying(30) NOT NULL,
    producto character varying(150) NOT NULL,
    direccion text NOT NULL,
    total numeric(12,2) NOT NULL,
    estado character varying(30) DEFAULT 'pendiente'::character varying,
    fecha timestamp without time zone DEFAULT now(),
    id_operacion integer,
    CONSTRAINT pedidos_delivery_farmacia_total_check CHECK ((total > (0)::numeric))
);

CREATE SEQUENCE public.pedidos_delivery_farmacia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.usuario_rol (
    id_usuario integer NOT NULL,
    modulo character varying(30) NOT NULL,
    rol character varying(20),
    CONSTRAINT usuario_rol_rol_check CHECK (((rol)::text = ANY ((ARRAY['cliente'::character varying, 'administrador'::character varying, 'empleado'::character varying])::text[])))
);

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    dni character varying(8),
    correo character varying(150) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT now(),
    password character varying(100)
);

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ASOCIACIÓN DE SECUENCIAS

ALTER SEQUENCE public.cuentas_id_seq OWNED BY public.cuentas.id;

ALTER SEQUENCE public.operaciones_id_seq OWNED BY public.operaciones.id;

ALTER SEQUENCE public.pedidos_delivery_farmacia_id_seq OWNED BY public.pedidos_delivery_farmacia.id;

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;

-- VALORES POR DEFECTO

ALTER TABLE ONLY public.cuentas ALTER COLUMN id SET DEFAULT nextval('public.cuentas_id_seq'::regclass);

ALTER TABLE ONLY public.operaciones ALTER COLUMN id SET DEFAULT nextval('public.operaciones_id_seq'::regclass);

ALTER TABLE ONLY public.pedidos_delivery_farmacia ALTER COLUMN id SET DEFAULT nextval('public.pedidos_delivery_farmacia_id_seq'::regclass);

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);

-- REGISTROS DE DEMOSTRACIÓN

-- usuarios: 13 registros
INSERT INTO public.usuarios (id, nombre, apellido, dni, correo, fecha_registro, password) VALUES
    ('2', 'María Fernanda', 'González Castillo', '45871237', 'admin@farmasalud.pe', '2026-11-03 17:33:53.434807', '123456'),
    ('3', 'José Luis', 'Mendoza Vargas', '45871238', 'cajero@bancoandino.pe', '2026-11-03 17:33:53.434807', '123456'),
    ('4', 'Luis Fernando', 'Castro Medina', '45871239', 'empleado@farmasalud.pe', '2026-11-03 20:29:55.266182', '123456'),
    ('5', 'Ricardo Antonio', 'Salazar Mendoza', '45871240', 'admin@bancoandino.pe', '2026-11-03 20:55:46.274308', '123456'),
    ('1', 'Carlos Alberto', 'Ramírez Torres', '45871236', 'cliente1@correo.com', '2026-11-03 17:33:53.434807', '123456'),
    ('6', 'Andrea Lucía', 'Torres Mendoza', '45871301', 'andrea.grupo7@example.com', '2026-11-03 22:01:01.105714', '123456'),
    ('10', 'Lucía Fernanda', 'Morales Díaz', '45871303', 'lucia.grupo7@example.com', '2026-11-03 22:29:57.788907', '123456'),
    ('11', 'Juan Carlos', 'Herrera López', '45871304', 'juan.grupo7@example.com', '2026-11-03 22:30:21.687938', '123456'),
    ('12', 'Daniela Sofía', 'Rojas Pérez', '45871305', 'daniela.grupo7@example.com', '2026-11-03 22:30:47.578685', '123456'),
    ('13', 'Miguel Ángel', 'Flores Castillo', '45871306', 'miguel.grupo7@example.com', '2026-11-03 22:31:03.432073', '123456'),
    ('15', 'Valeria Isabel', 'Torres Ramos', '45871307', 'valeria.grupo7@example.com', '2026-11-03 22:31:22.360988', '123456'),
    ('16', 'Diego Fernando', 'Medina Salas', '45871308', 'diego.grupo7@example.com', '2026-11-03 22:31:34.873757', '123456'),
    ('9', 'Pedro Alejandro', 'Vargas Ruiz', '45871302', 'pedro.grupo7@example.com', '2026-11-03 22:29:25.230068', '123456');

-- cuentas: 4 registros
INSERT INTO public.cuentas (id, id_usuario, numero, tipo, saldo) VALUES
    ('1', '1', '001-0000001', 'ahorros', '175.50'),
    ('3', '6', '001-0000003', 'ahorros', '175.50'),
    ('2', '2', '002-0000123', 'empresa', '49.00'),
    ('4', '9', '001-0000004', 'ahorros', '0.00');

-- operaciones: 6 registros
INSERT INTO public.operaciones (id, id_cuenta, tipo, monto, referencia, fecha) VALUES
    ('1', '1', 'deposito', '200.00', 'VENTANILLA', '2026-11-03 19:42:39.99944'),
    ('2', '1', 'pago', '24.50', 'PDF-00001', '2026-11-03 20:19:25.212215'),
    ('3', '2', 'abono', '24.50', 'PDF-00001', '2026-11-03 20:19:25.212215'),
    ('4', '3', 'deposito', '200.00', 'VENTANILLA', '2026-11-03 22:19:40.151793'),
    ('5', '3', 'pago', '24.50', 'PDF-00003', '2026-11-03 22:20:58.447964'),
    ('6', '2', 'abono', '24.50', 'PDF-00003', '2026-11-03 22:20:58.447964');

-- pedidos_delivery_farmacia: 4 registros
INSERT INTO public.pedidos_delivery_farmacia (id, id_usuario, codigo, producto, direccion, total, estado, fecha, id_operacion) VALUES
    ('1', '1', 'PDF-00001', 'Paracetamol 500 mg x 20', 'Jr. Lima 320, El Tambo', '24.50', 'despachado', '2026-11-03 19:56:15.856164', '2'),
    ('2', '1', 'PDF-00002', 'Paracetamol 500 mg x 20', 'Av. Los Pinos 500, Chimbote', '24.50', 'pendiente', '2026-11-03 20:47:26.04468', NULL),
    ('3', '6', 'PDF-00003', 'Paracetamol 500 mg x 20', 'Av. José Pardo 450, Chimbote', '24.50', 'despachado', '2026-11-03 22:20:43.472785', '5'),
    ('4', '9', 'PDF-00004', 'Paracetamol 500 mg x 20', 'Av. Los Olivos 250, Lima', '24.50', 'pendiente', '2026-11-04 01:21:29.155082', NULL);

-- usuario_rol: 23 registros
INSERT INTO public.usuario_rol (id_usuario, modulo, rol) VALUES
    ('1', 'banco', 'cliente'),
    ('1', 'farmacia', 'cliente'),
    ('2', 'banco', 'cliente'),
    ('2', 'farmacia', 'administrador'),
    ('3', 'banco', 'empleado'),
    ('4', 'farmacia', 'empleado'),
    ('5', 'banco', 'administrador'),
    ('6', 'banco', 'cliente'),
    ('6', 'farmacia', 'cliente'),
    ('9', 'banco', 'cliente'),
    ('10', 'banco', 'cliente'),
    ('11', 'banco', 'cliente'),
    ('12', 'banco', 'cliente'),
    ('13', 'banco', 'cliente'),
    ('15', 'banco', 'cliente'),
    ('16', 'banco', 'cliente'),
    ('9', 'farmacia', 'cliente'),
    ('10', 'farmacia', 'cliente'),
    ('11', 'farmacia', 'cliente'),
    ('12', 'farmacia', 'cliente'),
    ('13', 'farmacia', 'cliente'),
    ('15', 'farmacia', 'cliente'),
    ('16', 'farmacia', 'cliente');

-- SECUENCIAS

SELECT pg_catalog.setval('public.cuentas_id_seq', 4, true);
SELECT pg_catalog.setval('public.operaciones_id_seq', 6, true);
SELECT pg_catalog.setval('public.pedidos_delivery_farmacia_id_seq', 4, true);
SELECT pg_catalog.setval('public.usuarios_id_seq', 23, true);

-- CLAVES PRIMARIAS Y RESTRICCIONES ÚNICAS

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_numero_key UNIQUE (numero);

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.operaciones
    ADD CONSTRAINT operaciones_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.pedidos_delivery_farmacia
    ADD CONSTRAINT pedidos_delivery_farmacia_codigo_key UNIQUE (codigo);

ALTER TABLE ONLY public.pedidos_delivery_farmacia
    ADD CONSTRAINT pedidos_delivery_farmacia_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (id_usuario, modulo);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_dni_key UNIQUE (dni);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);

-- ÍNDICES

CREATE UNIQUE INDEX ux_cuenta_ahorros_usuario ON public.cuentas USING btree (id_usuario, tipo) WHERE ((tipo)::text = 'ahorros'::text);

-- CLAVES FORÁNEAS

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

ALTER TABLE ONLY public.operaciones
    ADD CONSTRAINT operaciones_id_cuenta_fkey FOREIGN KEY (id_cuenta) REFERENCES public.cuentas(id);

ALTER TABLE ONLY public.pedidos_delivery_farmacia
    ADD CONSTRAINT pedidos_delivery_farmacia_id_operacion_fkey FOREIGN KEY (id_operacion) REFERENCES public.operaciones(id);

ALTER TABLE ONLY public.pedidos_delivery_farmacia
    ADD CONSTRAINT pedidos_delivery_farmacia_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

-- FUNCIÓN DE PAGO BANCARIO

CREATE FUNCTION public.pagar_delivery(p_pedido_id integer, p_usuario_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_pedido RECORD;
    v_cliente RECORD;
    v_empresa RECORD;
    v_operacion_id INTEGER;
    v_abono_id INTEGER;
BEGIN
    SELECT p.id, p.codigo, p.total, p.estado
    INTO v_pedido
    FROM pedidos_delivery_farmacia p
    WHERE p.id = p_pedido_id
      AND p.id_usuario = p_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado';
    END IF;

    IF v_pedido.estado <> 'pendiente' THEN
        RAISE EXCEPTION 'Este pedido ya fue procesado';
    END IF;

    SELECT c.id, c.numero, c.saldo
    INTO v_cliente
    FROM cuentas c
    WHERE c.id_usuario = p_usuario_id
      AND c.tipo = 'ahorros'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Debe abrir una cuenta de ahorros';
    END IF;

    SELECT c.id, c.numero, c.saldo
    INTO v_empresa
    FROM cuentas c
    WHERE c.numero = '002-0000123'
      AND c.tipo = 'empresa'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cuenta empresarial no existe';
    END IF;

    IF v_cliente.saldo < v_pedido.total THEN
        RAISE EXCEPTION 'Saldo insuficiente. Debe depositar dinero';
    END IF;

    UPDATE cuentas
    SET saldo = saldo - v_pedido.total
    WHERE id = v_cliente.id;

    UPDATE cuentas
    SET saldo = saldo + v_pedido.total
    WHERE id = v_empresa.id;

    INSERT INTO operaciones (
        id_cuenta,
        tipo,
        monto,
        referencia
    )
    VALUES (
        v_cliente.id,
        'pago',
        v_pedido.total,
        v_pedido.codigo
    )
    RETURNING id INTO v_operacion_id;

    INSERT INTO operaciones (
        id_cuenta,
        tipo,
        monto,
        referencia
    )
    VALUES (
        v_empresa.id,
        'abono',
        v_pedido.total,
        v_pedido.codigo
    )
    RETURNING id INTO v_abono_id;

    UPDATE pedidos_delivery_farmacia
    SET estado = 'pagado',
        id_operacion = v_operacion_id
    WHERE id = v_pedido.id;

    RETURN jsonb_build_object(
        'codigo', v_pedido.codigo,
        'estado', 'pagado',
        'monto', v_pedido.total,
        'id_operacion', v_operacion_id,
        'id_abono', v_abono_id,
        'cuenta_cliente', v_cliente.numero,
        'cuenta_empresa', v_empresa.numero,
        'saldo_cliente', v_cliente.saldo - v_pedido.total,
        'saldo_empresa', v_empresa.saldo + v_pedido.total
    );
END;
$$;

COMMIT;
