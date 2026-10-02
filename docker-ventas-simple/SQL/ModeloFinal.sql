-- =====================================================================
-- MODELO DE BASE DE DATOS - SISTEMA DE VENTAS
-- PostgreSQL
-- =====================================================================

-- =====================================================================
-- TABLA: CATEGORIAS
-- =====================================================================
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- TABLA: PROVEEDORES
-- =====================================================================
CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(50),
    direccion VARCHAR(50),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================================================================
-- TABLA: PRODUCTOS
-- =====================================================================
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    codigo_sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200),
    id_categoria INT NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria),

    CONSTRAINT chk_precio_venta
        CHECK (precio_venta >= 0),

    CONSTRAINT chk_stock
        CHECK (stock >= 0)
);

-- =====================================================================
-- TABLA: PRODUCTO_PROVEEDOR
-- Relación muchos a muchos entre productos y proveedores.
-- =====================================================================
CREATE TABLE producto_proveedor (
    id_producto INT NOT NULL,
    id_proveedor INT NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    tiempo_entrega_dias INT DEFAULT 0,
    es_proveedor_principal BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_asociacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_producto, id_proveedor),

    CONSTRAINT fk_pp_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE,

    CONSTRAINT fk_pp_proveedor
        FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor)
        ON DELETE CASCADE
);

-- =====================================================================
-- TABLA: CLIENTES
-- =====================================================================
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50),
    telefono VARCHAR(50),
    email VARCHAR(50),
    direccion VARCHAR(255),
    ciudad VARCHAR(50),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================================================================
-- TABLA: EMPLEADOS
-- =====================================================================
CREATE TABLE empleados (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50),
    cargo VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_contratacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    password_hash VARCHAR(255),
    rol VARCHAR(20) NOT NULL DEFAULT 'empleado',

    CONSTRAINT chk_rol
        CHECK (rol IN ('empleado', 'admin'))
);

-- =====================================================================
-- TABLA: METODOS_PAGO
-- =====================================================================
CREATE TABLE metodos_pago (
    id_metodo_pago SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(150)
);

-- =====================================================================
-- TABLA: ESTADOS_VENTA
-- =====================================================================
CREATE TABLE estados_venta (
    id_estado_venta SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

-- =====================================================================
-- TABLA: ESTADOS_PAGO
-- =====================================================================
CREATE TABLE estados_pago (
    id_estado_pago SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

-- =====================================================================
-- TABLA: VENTAS
-- =====================================================================
CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    numero_factura INTEGER GENERATED BY DEFAULT AS IDENTITY UNIQUE NOT NULL,
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    id_estado_venta INT NOT NULL DEFAULT 1,
    fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuesto DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente),

    CONSTRAINT fk_venta_empleado
        FOREIGN KEY (id_empleado)
        REFERENCES empleados(id_empleado),

    CONSTRAINT fk_venta_estado
        FOREIGN KEY (id_estado_venta)
        REFERENCES estados_venta(id_estado_venta),

    CONSTRAINT chk_venta_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT chk_venta_impuesto
        CHECK (impuesto >= 0),

    CONSTRAINT chk_venta_descuento
        CHECK (descuento >= 0),

    CONSTRAINT chk_venta_total
        CHECK (total >= 0)
);

-- =====================================================================
-- TABLA: DETALLE_VENTAS
-- =====================================================================
CREATE TABLE detalle_ventas (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),

    CONSTRAINT chk_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_detalle_venta_precio
        CHECK (precio_unitario >= 0),

    CONSTRAINT chk_detalle_venta_descuento
        CHECK (descuento >= 0),

    CONSTRAINT chk_detalle_venta_subtotal
        CHECK (subtotal >= 0)
);

-- =====================================================================
-- TABLA: PAGOS
-- =====================================================================
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_metodo_pago INT NOT NULL,
    id_estado_pago INT NOT NULL DEFAULT 1,
    monto DECIMAL(12,2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referencia VARCHAR(100),

    CONSTRAINT fk_pago_venta
        FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE,

    CONSTRAINT fk_pago_metodo
        FOREIGN KEY (id_metodo_pago)
        REFERENCES metodos_pago(id_metodo_pago),

    CONSTRAINT fk_pago_estado
        FOREIGN KEY (id_estado_pago)
        REFERENCES estados_pago(id_estado_pago),

    CONSTRAINT chk_monto_pago
        CHECK (monto > 0)
);

-- =====================================================================
-- TABLA: COMPRAS
-- =====================================================================
CREATE TABLE compras (
    id_compra SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_empleado INT NOT NULL,
    fecha_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    impuesto DECIMAL(10,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_compras_proveedor
        FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor),

    CONSTRAINT fk_compras_empleado
        FOREIGN KEY (id_empleado)
        REFERENCES empleados(id_empleado),

    CONSTRAINT chk_compras_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT chk_compras_impuesto
        CHECK (impuesto >= 0),

    CONSTRAINT chk_compras_descuento
        CHECK (descuento >= 0),

    CONSTRAINT chk_compras_total
        CHECK (total >= 0)
);

-- =====================================================================
-- TABLA: DETALLE_COMPRAS
-- =====================================================================
CREATE TABLE detalle_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_detalle_compras_compra
        FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_compras_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),

    CONSTRAINT chk_detalle_compras_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_detalle_compras_precio
        CHECK (precio_unitario >= 0),

    CONSTRAINT chk_detalle_compras_descuento
        CHECK (descuento >= 0),

    CONSTRAINT chk_detalle_compras_subtotal
        CHECK (subtotal >= 0)
);

-- =====================================================================
-- INDICES
-- =====================================================================
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_pp_proveedor ON producto_proveedor(id_proveedor);
CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX idx_ventas_empleado ON ventas(id_empleado);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_detalle_venta ON detalle_ventas(id_venta);
CREATE INDEX idx_detalle_producto ON detalle_ventas(id_producto);
CREATE INDEX idx_pagos_venta ON pagos(id_venta);
CREATE INDEX idx_pagos_metodo ON pagos(id_metodo_pago);
CREATE INDEX idx_ventas_estado ON ventas(id_estado_venta);
CREATE INDEX idx_pagos_estado ON pagos(id_estado_pago);
CREATE INDEX idx_compras_proveedor ON compras(id_proveedor);
CREATE INDEX idx_compras_empleado ON compras(id_empleado);
CREATE INDEX idx_compras_fecha ON compras(fecha_compra);
CREATE INDEX idx_detalle_compras_compra ON detalle_compras(id_compra);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(id_producto);

-- =====================================================================
-- DATOS INICIALES
-- =====================================================================

INSERT INTO metodos_pago (nombre, descripcion) VALUES
('Efectivo', 'Pago en efectivo'),
('Tarjeta de crédito', 'Pago con tarjeta de crédito'),
('Tarjeta de débito', 'Pago con tarjeta de débito'),
('Transferencia', 'Transferencia bancaria');

INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica', 'Productos electrónicos y tecnología'),
('Ropa', 'Prendas de vestir'),
('Hogar', 'Artículos para el hogar');

-- El orden de inserción define los IDs:
-- estados_venta: 1 = Pendiente, 2 = Pagada, 3 = Anulada
INSERT INTO estados_venta (nombre) VALUES
('Pendiente'),
('Pagada'),
('Anulada');

-- El orden de inserción define los IDs:
-- estados_pago: 1 = Aprobado, 2 = Rechazado, 3 = Reembolsado
INSERT INTO estados_pago (nombre) VALUES
('Aprobado'),
('Rechazado'),
('Reembolsado');

-- =====================================================================
-- VISTA: RESUMEN DE VENTAS
-- =====================================================================
CREATE VIEW vista_ventas_resumen AS
SELECT
    v.id_venta,
    v.numero_factura,
    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
    CONCAT(e.nombre, ' ', e.apellido) AS vendedor,
    v.fecha_venta,
    v.total,
    COALESCE(SUM(p.monto), 0) AS total_pagado,
    v.total - COALESCE(SUM(p.monto), 0) AS saldo_pendiente,
    ev.nombre AS estado
FROM ventas v
JOIN clientes c
    ON v.id_cliente = c.id_cliente
JOIN empleados e
    ON v.id_empleado = e.id_empleado
JOIN estados_venta ev
    ON v.id_estado_venta = ev.id_estado_venta
LEFT JOIN pagos p
    ON p.id_venta = v.id_venta
    AND p.id_estado_pago = (
        SELECT id_estado_pago
        FROM estados_pago
        WHERE nombre = 'Aprobado'
    )
GROUP BY
    v.id_venta,
    v.numero_factura,
    cliente,
    vendedor,
    v.fecha_venta,
    v.total,
    ev.nombre;

-- =====================================================================
-- VISTA: PROVEEDORES POR PRODUCTO
-- =====================================================================
CREATE VIEW vista_producto_proveedores AS
SELECT
    pr.id_producto,
    pr.nombre AS producto,
    pv.id_proveedor,
    pv.nombre AS proveedor,
    pp.precio_compra,
    pp.tiempo_entrega_dias,
    pp.es_proveedor_principal
FROM producto_proveedor pp
JOIN productos pr
    ON pp.id_producto = pr.id_producto
JOIN proveedores pv
    ON pp.id_proveedor = pv.id_proveedor;

-- =====================================================================
-- FIN DEL MODELO
-- =====================================================================
-- NOTA:
-- No se utilizan triggers para modificar stock ni recalcular totales.
-- Estas operaciones son responsabilidad de los controladores del backend.
-- =====================================================================