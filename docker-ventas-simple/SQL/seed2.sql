-- ============================================================
-- SEED ADICIONAL MULTICIUDAD - VERSION CORREGIDA
-- Agrega datos SIN borrar los existentes.
-- Compatible con el modelo actual.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. PROVEEDORES DE OTRAS CIUDADES
-- No usamos ON CONFLICT porque email no tiene UNIQUE en tu modelo.
-- Se insertan solo si no existe el mismo nombre.
-- ============================================================

INSERT INTO proveedores (nombre, contacto, telefono, email, direccion, estado)
SELECT x.nombre, x.contacto, x.telefono, x.email, x.direccion, true
FROM (VALUES
    ('Andina Tech Solutions', 'Mariana Rojas', '6015551101', 'ventas@andinatech.com', 'Carrera 15 # 93-40', 'Bogota'),
    ('Medellin Digital Supply', 'Felipe Restrepo', '6045552202', 'contacto@medellindigital.com', 'Carrera 43A # 16-20', 'Medellin'),
    ('Pacifico Computacion', 'Valentina Torres', '6025553303', 'ventas@pacificocomputacion.com', 'Calle 10 # 34-18', 'Cali'),
    ('Caribe Tech Mayorista', 'Andres Pineda', '6055554404', 'comercial@caribetech.com', 'Carrera 53 # 72-15', 'Barranquilla'),
    ('Santander Tecnologia', 'Camilo Vargas', '6075555505', 'ventas@santandertech.com', 'Carrera 27 # 36-45', 'Bucaramanga'),
    ('Eje Digital Distribuciones', 'Natalia Mejia', '6065556606', 'contacto@ejedigital.com', 'Carrera 7 # 18-30', 'Pereira'),
    ('Cafetera Componentes', 'Sebastian Gomez', '6065557707', 'ventas@cafeteracomponentes.com', 'Calle 21 # 8-55', 'Manizales'),
    ('Sierra Tech Colombia', 'Laura Mendoza', '6055558808', 'comercial@sierratech.com', 'Carrera 5 # 18-22', 'Santa Marta')
) AS x(nombre, contacto, telefono, email, direccion, ciudad)
WHERE NOT EXISTS (
    SELECT 1 FROM proveedores p WHERE p.nombre = x.nombre
);

-- ============================================================
-- 2. 30 CLIENTES DE DIFERENTES CIUDADES
-- numero_documento SI es UNIQUE en tu modelo, pero tampoco
-- dependemos de ON CONFLICT: usamos NOT EXISTS.
-- ============================================================

INSERT INTO clientes
(tipo_documento, numero_documento, nombre, apellido, telefono, email, direccion, ciudad, estado)
SELECT x.tipo_documento, x.numero_documento, x.nombre, x.apellido,
       x.telefono, x.email, x.direccion, x.ciudad, true
FROM (VALUES
('CC','1001001001','Miguel','Herrera','3004005001','miguel.herrera@example.com','Calle 80 # 12-30','Bogota'),
('CC','1001001002','Sofia','Ramirez','3004005002','sofia.ramirez@example.com','Carrera 45 # 20-15','Medellin'),
('CC','1001001003','Daniel','Castro','3004005003','daniel.castro@example.com','Calle 9 # 25-40','Cali'),
('CC','1001001004','Paula','Martinez','3004005004','paula.martinez@example.com','Carrera 52 # 75-10','Barranquilla'),
('CC','1001001005','Andres','Vega','3004005005','andres.vega@example.com','Calle 34 # 42-18','Bucaramanga'),
('CC','1001001006','Camila','Morales','3004005006','camila.morales@example.com','Carrera 6 # 22-14','Pereira'),
('CC','1001001007','Juan','Cardenas','3004005007','juan.cardenas@example.com','Calle 18 # 9-33','Manizales'),
('CC','1001001008','Laura','Suarez','3004005008','laura.suarez@example.com','Carrera 4 # 16-25','Santa Marta'),
('CC','1001001009','Mateo','Navarro','3004005009','mateo.navarro@example.com','Calle 100 # 15-20','Bogota'),
('CC','1001001010','Valeria','Gomez','3004005010','valeria.gomez@example.com','Carrera 33 # 10-50','Medellin'),
('CC','1001001011','Sebastian','Rojas','3004005011','sebastian.rojas@example.com','Calle 14 # 30-12','Cali'),
('CC','1001001012','Natalia','Pardo','3004005012','natalia.pardo@example.com','Carrera 58 # 80-21','Barranquilla'),
('CC','1001001013','Carlos','Duarte','3004005013','carlos.duarte@example.com','Calle 45 # 28-60','Bucaramanga'),
('CC','1001001014','Mariana','Leon','3004005014','mariana.leon@example.com','Carrera 9 # 24-10','Pereira'),
('CC','1001001015','Felipe','Molina','3004005015','felipe.molina@example.com','Calle 12 # 7-41','Manizales'),
('CC','1001001016','Juliana','Torres','3004005016','juliana.torres@example.com','Carrera 2 # 20-18','Santa Marta'),
('CC','1001001017','Nicolas','Gil','3004005017','nicolas.gil@example.com','Calle 72 # 10-25','Bogota'),
('CC','1001001018','Isabella','Vargas','3004005018','isabella.vargas@example.com','Carrera 48 # 18-12','Medellin'),
('CC','1001001019','Alejandro','Sanchez','3004005019','alejandro.sanchez@example.com','Calle 6 # 32-18','Cali'),
('CC','1001001020','Gabriela','Mendoza','3004005020','gabriela.mendoza@example.com','Carrera 50 # 70-15','Barranquilla'),
('CC','1001001021','Esteban','Ruiz','3004005021','esteban.ruiz@example.com','Calle 36 # 44-12','Bucaramanga'),
('CC','1001001022','Sara','Quintero','3004005022','sara.quintero@example.com','Carrera 8 # 21-40','Pereira'),
('CC','1001001023','David','Osorio','3004005023','david.osorio@example.com','Calle 25 # 6-30','Manizales'),
('CC','1001001024','Ana','Cortes','3004005024','ana.cortes@example.com','Carrera 7 # 19-50','Santa Marta'),
('CC','1001001025','Martin','Serrano','3004005025','martin.serrano@example.com','Calle 90 # 11-32','Bogota'),
('CC','1001001026','Luciana','Salazar','3004005026','luciana.salazar@example.com','Carrera 41 # 12-26','Medellin'),
('CC','1001001027','Tomas','Beltran','3004005027','tomas.beltran@example.com','Calle 22 # 28-11','Cali'),
('CC','1001001028','Maria','Fuentes','3004005028','maria.fuentes@example.com','Carrera 46 # 75-30','Barranquilla'),
('CC','1001001029','Samuel','Pena','3004005029','samuel.pena@example.com','Calle 39 # 31-18','Bucaramanga'),
('CC','1001001030','Antonella','Velez','3004005030','antonella.velez@example.com','Carrera 5 # 23-12','Pereira')
) AS x(tipo_documento, numero_documento, nombre, apellido, telefono, email, direccion, ciudad)
WHERE NOT EXISTS (
    SELECT 1 FROM clientes c
    WHERE c.numero_documento = x.numero_documento
);

-- ============================================================
-- 3. COMPRAS ADICIONALES
-- 12 compras, 3 productos por compra.
-- Se agregan existencias antes de las nuevas ventas.
-- ============================================================

DO $$
DECLARE
    proveedor_id INTEGER;
    empleado_id INTEGER;
    compra_id INTEGER;
    producto_id INTEGER;
    precio NUMERIC(12,2);
    qty INTEGER;
    sub NUMERIC(12,2);
    imp NUMERIC(12,2);
    total_compra NUMERIC(12,2);
    i INTEGER;
    j INTEGER;

    skus TEXT[] := ARRAY[
        'LAP-001','LAP-002','LAP-003','PC-001','MOU-001','MOU-002',
        'TEC-001','TEC-002','MON-001','MON-002','SSD-001','SSD-002',
        'RAM-001','RAM-002','CPU-001','NET-001','NET-003','CAB-001','CAB-002'
    ];

    proveedores_nombres TEXT[] := ARRAY[
        'Andina Tech Solutions','Medellin Digital Supply',
        'Pacifico Computacion','Caribe Tech Mayorista',
        'Santander Tecnologia','Eje Digital Distribuciones',
        'Cafetera Componentes','Sierra Tech Colombia'
    ];
BEGIN

    -- Buscar empleado para registrar compras.
    SELECT id_empleado INTO empleado_id
    FROM empleados
    WHERE email = 'daniel.torres@empresa.com'
    LIMIT 1;

    IF empleado_id IS NULL THEN
        SELECT id_empleado INTO empleado_id
        FROM empleados
        WHERE cargo ILIKE '%compra%'
        LIMIT 1;
    END IF;

    IF empleado_id IS NULL THEN
        SELECT id_empleado INTO empleado_id
        FROM empleados
        WHERE rol = 'admin'
        LIMIT 1;
    END IF;

    IF empleado_id IS NULL THEN
        RAISE EXCEPTION 'No se encontro un empleado para registrar compras.';
    END IF;

    FOR i IN 1..12 LOOP

        SELECT id_proveedor INTO proveedor_id
        FROM proveedores
        WHERE nombre = proveedores_nombres[((i-1) % array_length(proveedores_nombres,1))+1]
        LIMIT 1;

        IF proveedor_id IS NULL THEN
            RAISE EXCEPTION 'No se encontro el proveedor de la compra %.', i;
        END IF;

        INSERT INTO compras
        (id_proveedor, id_empleado, fecha_compra, subtotal, impuesto, descuento, total)
        VALUES
        (
            proveedor_id,
            empleado_id,
            TIMESTAMP '2026-04-10 09:00:00' + ((i * 18) || ' days')::interval,
            0, 0, 0, 0
        )
        RETURNING id_compra INTO compra_id;

        sub := 0;

        FOR j IN 1..3 LOOP

            SELECT id_producto, precio_compra
            INTO producto_id, precio
            FROM productos
            WHERE codigo_sku = skus[((i+j-2) % array_length(skus,1))+1]
            LIMIT 1;

            IF producto_id IS NULL THEN
                RAISE EXCEPTION 'No se encontro el producto con SKU %.',
                    skus[((i+j-2) % array_length(skus,1))+1];
            END IF;

            qty := 5 + ((i+j) % 6);
            sub := sub + (precio * qty);

            INSERT INTO detalle_compras
            (id_compra, id_producto, cantidad, precio_unitario, descuento, subtotal)
            VALUES
            (compra_id, producto_id, qty, precio, 0, precio * qty);

            UPDATE productos
            SET stock = stock + qty,
                precio_compra = precio
            WHERE id_producto = producto_id;

            -- La PK compuesta de producto_proveedor sí permite este ON CONFLICT.
            INSERT INTO producto_proveedor
            (id_producto, id_proveedor, precio_compra,
             tiempo_entrega_dias, es_proveedor_principal)
            VALUES
            (producto_id, proveedor_id, precio, 3 + (i % 5), (j = 1))
            ON CONFLICT (id_producto, id_proveedor)
            DO UPDATE SET
                precio_compra = EXCLUDED.precio_compra,
                tiempo_entrega_dias = EXCLUDED.tiempo_entrega_dias;

        END LOOP;

        -- Calculamos los valores ANTES del UPDATE para evitar
        -- depender de la evaluación de otras columnas del mismo UPDATE.
        imp := ROUND(sub * 0.19, 2);
        total_compra := sub + imp;

        UPDATE compras
        SET subtotal = sub,
            impuesto = imp,
            descuento = 0,
            total = total_compra
        WHERE id_compra = compra_id;

    END LOOP;
END $$;

-- ============================================================
-- 4. 60 VENTAS ADICIONALES
-- Se usan los 30 clientes nuevos y productos existentes.
-- ============================================================

DO $$
DECLARE
    venta_id INTEGER;
    cliente_id INTEGER;
    empleado_id INTEGER;
    producto1 INTEGER;
    producto2 INTEGER;
    precio1 NUMERIC(12,2);
    precio2 NUMERIC(12,2);
    cantidad1 INTEGER;
    cantidad2 INTEGER;
    sub NUMERIC(12,2);
    impuesto NUMERIC(12,2);
    descuento NUMERIC(12,2);
    total NUMERIC(12,2);
    pago NUMERIC(12,2);
    estado_venta INTEGER;
    fecha_base TIMESTAMP;
    i INTEGER;

    clientes_docs TEXT[] := ARRAY[
        '1001001001','1001001002','1001001003','1001001004','1001001005',
        '1001001006','1001001007','1001001008','1001001009','1001001010',
        '1001001011','1001001012','1001001013','1001001014','1001001015',
        '1001001016','1001001017','1001001018','1001001019','1001001020',
        '1001001021','1001001022','1001001023','1001001024','1001001025',
        '1001001026','1001001027','1001001028','1001001029','1001001030'
    ];

    skus TEXT[] := ARRAY[
        'LAP-001','LAP-002','LAP-003','LAP-004','PC-001','MOU-001','MOU-002',
        'MOU-003','TEC-001','TEC-002','TEC-003','MON-001','MON-002','MON-003',
        'SSD-001','SSD-002','SSD-003','HDD-001','RAM-001','RAM-002','RAM-003',
        'CPU-001','CPU-002','NET-001','NET-002','NET-003','CAB-001','CAB-002','IMP-001'
    ];
BEGIN

    FOR i IN 1..60 LOOP

        SELECT id_cliente INTO cliente_id
        FROM clientes
        WHERE numero_documento = clientes_docs[((i-1) % array_length(clientes_docs,1))+1]
        LIMIT 1;

        IF cliente_id IS NULL THEN
            RAISE EXCEPTION 'No se encontro cliente para la venta %.', i;
        END IF;

        -- Busca vendedores existentes; si no hay, usa admin.
        SELECT id_empleado INTO empleado_id
        FROM empleados
        WHERE rol = 'empleado'
        ORDER BY id_empleado
        OFFSET ((i-1) % 3)
        LIMIT 1;

        IF empleado_id IS NULL THEN
            SELECT id_empleado INTO empleado_id
            FROM empleados
            WHERE rol = 'admin'
            LIMIT 1;
        END IF;

        IF empleado_id IS NULL THEN
            RAISE EXCEPTION 'No se encontro empleado para la venta %.', i;
        END IF;

        SELECT id_producto, precio_venta
        INTO producto1, precio1
        FROM productos
        WHERE codigo_sku = skus[((i-1) % array_length(skus,1))+1]
        LIMIT 1;

        SELECT id_producto, precio_venta
        INTO producto2, precio2
        FROM productos
        WHERE codigo_sku = skus[((i+7) % array_length(skus,1))+1]
        LIMIT 1;

        IF producto1 IS NULL OR producto2 IS NULL THEN
            RAISE EXCEPTION 'No se encontraron productos para la venta %.', i;
        END IF;

        cantidad1 := 1 + (i % 3);
        cantidad2 := 1 + ((i+1) % 2);

        -- No crea una venta si no hay stock suficiente.
        IF (SELECT stock FROM productos WHERE id_producto = producto1) < cantidad1
           OR (SELECT stock FROM productos WHERE id_producto = producto2) < cantidad2 THEN
            CONTINUE;
        END IF;

        sub := (precio1 * cantidad1) + (precio2 * cantidad2);
        impuesto := ROUND(sub * 0.19, 2);
        descuento := CASE
            WHEN i % 5 = 0 THEN ROUND(sub * 0.05, 2)
            ELSE 0
        END;
        total := sub + impuesto - descuento;

        -- 2 anuladas, varias pendientes y el resto pagadas.
        IF i % 30 = 0 THEN
            estado_venta := 3;
        ELSIF i % 15 = 0 OR i % 17 = 0 THEN
            estado_venta := 1;
        ELSE
            estado_venta := 2;
        END IF;

        fecha_base :=
            TIMESTAMP '2026-04-15 10:00:00'
            + ((i * 3) || ' days')::interval
            + ((i % 8) || ' hours')::interval;

        INSERT INTO ventas
        (id_cliente, id_empleado, id_estado_venta, fecha_venta,
         subtotal, impuesto, descuento, total)
        VALUES
        (cliente_id, empleado_id, estado_venta, fecha_base,
         sub, impuesto, descuento, total)
        RETURNING id_venta INTO venta_id;

        INSERT INTO detalle_ventas
        (id_venta, id_producto, cantidad, precio_unitario, descuento, subtotal)
        VALUES
        (venta_id, producto1, cantidad1, precio1, 0, precio1 * cantidad1),
        (venta_id, producto2, cantidad2, precio2, 0, precio2 * cantidad2);

        UPDATE productos
        SET stock = stock - cantidad1
        WHERE id_producto = producto1;

        UPDATE productos
        SET stock = stock - cantidad2
        WHERE id_producto = producto2;

        IF estado_venta = 2 THEN

            INSERT INTO pagos
            (id_venta, id_metodo_pago, id_estado_pago, monto, fecha_pago, referencia)
            VALUES
            (venta_id, 1 + (i % 4), 1, total, fecha_base,
             'PAGO-MC-' || LPAD(i::TEXT, 4, '0'));

        ELSIF estado_venta = 1 THEN

            pago := ROUND(
                total * CASE
                    WHEN i % 2 = 0 THEN 0.50
                    ELSE 0.70
                END, 2
            );

            INSERT INTO pagos
            (id_venta, id_metodo_pago, id_estado_pago, monto, fecha_pago, referencia)
            VALUES
            (venta_id, 1 + (i % 4), 1, pago, fecha_base,
             'ABONO-MC-' || LPAD(i::TEXT, 4, '0'));

        ELSE

            INSERT INTO pagos
            (id_venta, id_metodo_pago, id_estado_pago, monto, fecha_pago, referencia)
            VALUES
            (venta_id, 1 + (i % 4), 3, total, fecha_base,
             'REEMBOLSO-MC-' || LPAD(i::TEXT, 4, '0'));

        END IF;

    END LOOP;
END $$;

-- ============================================================
-- 5. VALIDACIONES
-- ============================================================

DO $$
DECLARE
    negativos INTEGER;
    clientes_multiciudad INTEGER;
    proveedores_nuevos INTEGER;
BEGIN

    SELECT COUNT(*)
    INTO negativos
    FROM productos
    WHERE stock < 0;

    IF negativos > 0 THEN
        RAISE EXCEPTION 'Hay % productos con stock negativo.', negativos;
    END IF;

    SELECT COUNT(*)
    INTO clientes_multiciudad
    FROM clientes
    WHERE ciudad IN (
        'Bogota','Medellin','Cali','Barranquilla',
        'Bucaramanga','Pereira','Manizales','Santa Marta'
    );

    SELECT COUNT(*)
    INTO proveedores_nuevos
    FROM proveedores
    WHERE nombre IN (
        'Andina Tech Solutions','Medellin Digital Supply',
        'Pacifico Computacion','Caribe Tech Mayorista',
        'Santander Tecnologia','Eje Digital Distribuciones',
        'Cafetera Componentes','Sierra Tech Colombia'
    );

    RAISE NOTICE 'Clientes de otras ciudades: %', clientes_multiciudad;
    RAISE NOTICE 'Proveedores multiciudad: %', proveedores_nuevos;
END $$;

COMMIT;

-- ============================================================
-- CONSULTAS PARA COMPROBAR
-- ============================================================

-- Clientes por ciudad:
-- SELECT ciudad, COUNT(*) AS clientes
-- FROM clientes
-- GROUP BY ciudad
-- ORDER BY clientes DESC;

-- Proveedores:
-- SELECT nombre, email, direccion
-- FROM proveedores
-- WHERE nombre IN (
--   'Andina Tech Solutions','Medellin Digital Supply',
--   'Pacifico Computacion','Caribe Tech Mayorista',
--   'Santander Tecnologia','Eje Digital Distribuciones',
--   'Cafetera Componentes','Sierra Tech Colombia'
-- )
-- ORDER BY nombre;

-- Ventas por ciudad:
-- SELECT c.ciudad,
--        COUNT(v.id_venta) AS ventas,
--        SUM(v.total) AS ingresos
-- FROM clientes c
-- JOIN ventas v ON v.id_cliente = c.id_cliente
-- WHERE v.id_estado_venta <> 3
-- GROUP BY c.ciudad
-- ORDER BY ingresos DESC;

-- Ventas por mes:
-- SELECT DATE_TRUNC('month', fecha_venta) AS mes,
--        COUNT(*) AS ventas,
--        SUM(total) AS ingresos
-- FROM ventas
-- GROUP BY mes
-- ORDER BY mes;
