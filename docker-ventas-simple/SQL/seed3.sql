-- ============================================================
-- SEED ADICIONAL V5 - MAS DATOS Y MAS CIUDADES
-- ============================================================
-- Pensado para ejecutarse DESPUES de los seeds anteriores.
-- NO borra datos existentes.
--
-- Agrega:
--   * 10 categorias nuevas
--   * 40 productos nuevos
--   * 50 clientes nuevos de varias ciudades
--   * 10 proveedores nuevos de varias ciudades
--   * 20 compras nuevas
--   * hasta 100 ventas nuevas
--
-- NOTA:
-- La tabla PROVEEDORES de tu modelo no tiene una columna "ciudad".
-- Por eso la ciudad del proveedor queda indicada dentro de "direccion".
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CATEGORIAS NUEVAS
-- ============================================================

INSERT INTO categorias (nombre, descripcion, estado)
SELECT x.nombre, x.descripcion, true
FROM (VALUES
    ('Telefonia', 'Celulares y equipos de comunicacion'),
    ('Audio', 'Audifonos, parlantes y accesorios de audio'),
    ('Video', 'Camaras, webcams y accesorios de video'),
    ('Seguridad', 'Camaras de seguridad y sistemas de vigilancia'),
    ('Energia', 'UPS, reguladores y soluciones de energia'),
    ('Oficina', 'Equipos y accesorios para oficina'),
    ('Gaming', 'Perifericos y accesorios para videojuegos'),
    ('Movilidad', 'Accesorios tecnologicos para movilidad'),
    ('Cables y Adaptadores', 'Cables, adaptadores y conectores'),
    ('Almacenamiento Externo', 'Discos y unidades de almacenamiento externo')
) AS x(nombre, descripcion)
WHERE NOT EXISTS (
    SELECT 1
    FROM categorias c
    WHERE LOWER(c.nombre) = LOWER(x.nombre)
);

-- ============================================================
-- 2. PROVEEDORES NUEVOS - DIFERENTES CIUDADES
-- ============================================================
-- La ciudad se incluye en direccion porque PROVEEDORES no tiene
-- columna ciudad en el modelo actual.
-- ============================================================

INSERT INTO proveedores
(nombre, contacto, telefono, email, direccion, estado)
SELECT x.nombre, x.contacto, x.telefono, x.email, x.direccion, true
FROM (VALUES
    ('Capital Tech Importaciones', 'Ricardo Salazar', '6015559011', 'capitaltech@example.com', 'Bogota - Calle 72 # 18-40'),
    ('Valle Digital Mayorista', 'Carolina Perez', '6025559012', 'valledigital@example.com', 'Cali - Carrera 5 # 21-18'),
    ('Antioquia Computadores', 'Mauricio Restrepo', '6045559013', 'antioquiacomp@example.com', 'Medellin - Carrera 52 # 45-30'),
    ('Atlantico Electronica', 'Diana Martinez', '6055559014', 'atlanticoelectronica@example.com', 'Barranquilla - Calle 76 # 50-25'),
    ('Santander Tech Supply', 'Jorge Vargas', '6075559015', 'santandertech2@example.com', 'Bucaramanga - Carrera 33 # 48-16'),
    ('Risaralda Digital', 'Monica Arias', '6065559016', 'risaraldadigital@example.com', 'Pereira - Carrera 8 # 19-32'),
    ('Caldas Tecnologia', 'Esteban Giraldo', '6065559017', 'caldastech@example.com', 'Manizales - Calle 25 # 23-11'),
    ('Magdalena Tech', 'Paola Diaz', '6055559018', 'magdalenatech@example.com', 'Santa Marta - Carrera 4 # 26-18'),
    ('Norte Digital Solutions', 'Kevin Suarez', '6075559019', 'nortedigital@example.com', 'Cucuta - Avenida 6 # 10-35'),
    ('Llanos Informatica', 'Natalia Castro', '6085559020', 'llanosinformatica@example.com', 'Villavicencio - Carrera 31 # 40-20')
) AS x(nombre, contacto, telefono, email, direccion)
WHERE NOT EXISTS (
    SELECT 1
    FROM proveedores p
    WHERE LOWER(p.nombre) = LOWER(x.nombre)
);

-- ============================================================
-- 3. 50 CLIENTES NUEVOS
-- ============================================================

INSERT INTO clientes
(tipo_documento, numero_documento, nombre, apellido, telefono,
 email, direccion, ciudad, estado)
SELECT x.tipo_documento, x.numero_documento, x.nombre, x.apellido,
       x.telefono, x.email, x.direccion, x.ciudad, true
FROM (VALUES
('CC','1102002001','Ricardo','Mendoza','3015006001','ricardo.mendoza@example.com','Calle 93 # 14-22','Bogota'),
('CC','1102002002','Daniela','Rios','3015006002','daniela.rios@example.com','Carrera 19 # 80-14','Bogota'),
('CC','1102002003','Andres','Castillo','3015006003','andres.castillo@example.com','Calle 116 # 18-30','Bogota'),
('CC','1102002004','Marcela','Vargas','3015006004','marcela.vargas@example.com','Carrera 11 # 72-40','Bogota'),
('CC','1102002005','Santiago','Moreno','3015006005','santiago.moreno@example.com','Calle 63 # 24-17','Bogota'),

('CC','1102002006','Luisa','Restrepo','3015006006','luisa.restrepo@example.com','Carrera 43 # 12-35','Medellin'),
('CC','1102002007','Mateo','Gonzalez','3015006007','mateo.gonzalez@example.com','Calle 10 # 38-22','Medellin'),
('CC','1102002008','Juliana','Cardona','3015006008','juliana.cardona@example.com','Carrera 70 # 45-18','Medellin'),
('CC','1102002009','Felipe','Ospina','3015006009','felipe.ospina@example.com','Calle 33 # 66-10','Medellin'),
('CC','1102002010','Sara','Mejia','3015006010','sara.mejia@example.com','Carrera 30 # 8-45','Medellin'),

('CC','1102002011','Cristian','Salazar','3015006011','cristian.salazar@example.com','Calle 15 # 40-22','Cali'),
('CC','1102002012','Valentina','Mora','3015006012','valentina.mora@example.com','Carrera 56 # 6-18','Cali'),
('CC','1102002013','Jhon','Murillo','3015006013','jhon.murillo@example.com','Calle 9 # 27-35','Cali'),
('CC','1102002014','Laura','Cabrera','3015006014','laura.cabrera@example.com','Carrera 44 # 12-40','Cali'),
('CC','1102002015','Sebastian','Valencia','3015006015','sebastian.valencia@example.com','Calle 25 # 5-19','Cali'),

('CC','1102002016','Oscar','Pineda','3015006016','oscar.pineda@example.com','Carrera 51 # 74-20','Barranquilla'),
('CC','1102002017','Maria','Bermudez','3015006017','maria.bermudez@example.com','Calle 82 # 43-15','Barranquilla'),
('CC','1102002018','Luis','Acosta','3015006018','luis.acosta@example.com','Carrera 46 # 80-25','Barranquilla'),
('CC','1102002019','Paola','Jimenez','3015006019','paola.jimenez@example.com','Calle 68 # 52-12','Barranquilla'),
('CC','1102002020','Diego','Rueda','3015006020','diego.rueda@example.com','Carrera 38 # 70-30','Barranquilla'),

('CC','1102002021','Camilo','Prada','3015006021','camilo.prada@example.com','Carrera 27 # 45-16','Bucaramanga'),
('CC','1102002022','Tatiana','Duarte','3015006022','tatiana.duarte@example.com','Calle 36 # 29-40','Bucaramanga'),
('CC','1102002023','Juan','Suarez','3015006023','juan.suarez2@example.com','Carrera 33 # 52-21','Bucaramanga'),
('CC','1102002024','Valeria','Serrano','3015006024','valeria.serrano@example.com','Calle 48 # 20-13','Bucaramanga'),
('CC','1102002025','Nicolas','Velez','3015006025','nicolas.velez@example.com','Carrera 35 # 41-28','Bucaramanga'),

('CC','1102002026','Manuel','Cortes','3015006026','manuel.cortes@example.com','Carrera 7 # 18-35','Pereira'),
('CC','1102002027','Ana','Hurtado','3015006027','ana.hurtado@example.com','Calle 14 # 9-20','Pereira'),
('CC','1102002028','Mauricio','Londono','3015006028','mauricio.londono@example.com','Carrera 12 # 25-17','Pereira'),
('CC','1102002029','Carolina','Velez','3015006029','carolina.velez@example.com','Calle 21 # 6-40','Pereira'),
('CC','1102002030','David','Gaviria','3015006030','david.gaviria@example.com','Carrera 10 # 30-15','Pereira'),

('CC','1102002031','Alejandra','Franco','3015006031','alejandra.franco@example.com','Carrera 23 # 51-12','Manizales'),
('CC','1102002032','Tomas','Giraldo','3015006032','tomas.giraldo@example.com','Calle 48 # 24-18','Manizales'),
('CC','1102002033','Daniel','Arango','3015006033','daniel.arango@example.com','Carrera 25 # 62-20','Manizales'),
('CC','1102002034','Natalia','Lopez','3015006034','natalia.lopez2@example.com','Calle 30 # 20-14','Manizales'),
('CC','1102002035','Martin','Zapata','3015006035','martin.zapata@example.com','Carrera 18 # 45-30','Manizales'),

('CC','1102002036','Adriana','Torres','3015006036','adriana.torres@example.com','Carrera 5 # 24-18','Santa Marta'),
('CC','1102002037','Jorge','Molina','3015006037','jorge.molina@example.com','Calle 22 # 3-45','Santa Marta'),
('CC','1102002038','Claudia','Diaz','3015006038','claudia.diaz@example.com','Carrera 1 # 17-20','Santa Marta'),
('CC','1102002039','Miguel','Pardo','3015006039','miguel.pardo@example.com','Calle 30 # 5-12','Santa Marta'),
('CC','1102002040','Laura','Rincon','3015006040','laura.rincon@example.com','Carrera 4 # 28-35','Santa Marta'),

('CC','1102002041','Kevin','Maldonado','3015006041','kevin.maldonado@example.com','Calle 11 # 7-30','Cucuta'),
('CC','1102002042','Viviana','Quintero','3015006042','viviana.quintero@example.com','Carrera 6 # 15-22','Cucuta'),
('CC','1102002043','Jonathan','Parra','3015006043','jonathan.parra@example.com','Calle 18 # 4-17','Cucuta'),
('CC','1102002044','Monica','Vargas','3015006044','monica.vargas2@example.com','Carrera 8 # 20-35','Cucuta'),
('CC','1102002045','Esteban','Duran','3015006045','esteban.duran@example.com','Calle 10 # 12-18','Cucuta'),

('CC','1102002046','Ricardo','Sanchez','3015006046','ricardo.sanchez2@example.com','Carrera 31 # 38-20','Villavicencio'),
('CC','1102002047','Patricia','Rojas','3015006047','patricia.rojas@example.com','Calle 35 # 29-15','Villavicencio'),
('CC','1102002048','Carlos','Leon','3015006048','carlos.leon@example.com','Carrera 33 # 41-18','Villavicencio'),
('CC','1102002049','Gabriela','Mora','3015006049','gabriela.mora@example.com','Calle 27 # 34-25','Villavicencio'),
('CC','1102002050','Samuel','Navarro','3015006050','samuel.navarro@example.com','Carrera 40 # 20-10','Villavicencio')
) AS x(tipo_documento, numero_documento, nombre, apellido, telefono,
       email, direccion, ciudad)
WHERE NOT EXISTS (
    SELECT 1
    FROM clientes c
    WHERE c.numero_documento = x.numero_documento
);


-- ============================================================
-- 4. PRODUCTOS NUEVOS
-- ============================================================
-- La V4 ya insertaba los productos; esta V5 corrige el overflow de NUMERIC(10,2).
-- Esta version los crea antes de compras y ventas.
-- ============================================================

INSERT INTO productos
(codigo_sku, nombre, descripcion, id_categoria,
 precio_compra, precio_venta, stock, stock_minimo, estado)
SELECT x.sku, x.nombre, x.descripcion, c.id_categoria,
       x.precio_compra, x.precio_venta, 0, 5, true
FROM (VALUES
('TEL-001','Samsung Galaxy A15','Smartphone Samsung Galaxy A15', 'Telefonia', 650000, 799900),
('TEL-002','Motorola Moto G54','Smartphone Motorola Moto G54', 'Telefonia', 720000, 899900),
('TEL-003','Xiaomi Redmi Note 13','Smartphone Xiaomi Redmi Note 13', 'Telefonia', 680000, 849900),
('TEL-004','Samsung Galaxy A25','Smartphone Samsung Galaxy A25', 'Telefonia', 900000, 1099900),
('TEL-005','Xiaomi Redmi Note 14','Smartphone Xiaomi Redmi Note 14', 'Telefonia', 760000, 949900),
('TEL-006','Motorola Edge 50 Fusion','Smartphone Motorola Edge 50 Fusion', 'Telefonia', 1250000, 1499900),

('AUD-001','JBL Tune 520BT','Audifonos Bluetooth JBL Tune 520BT', 'Audio', 150000, 199900),
('AUD-002','Logitech H390','Audifonos USB con microfono', 'Audio', 90000, 129900),
('AUD-003','Sony WH-CH520','Audifonos Bluetooth Sony WH-CH520', 'Audio', 170000, 219900),
('AUD-004','JBL Go 3','Parlante portatil Bluetooth JBL Go 3', 'Audio', 170000, 229900),
('AUD-005','Logitech Z120','Parlantes compactos USB', 'Audio', 65000, 89900),
('AUD-006','Sony SRS-XB100','Parlante Bluetooth portatil Sony', 'Audio', 180000, 239900),

('VID-001','Logitech C270','Webcam HD Logitech C270', 'Video', 95000, 139900),
('VID-002','Logitech C920','Webcam Full HD Logitech C920', 'Video', 260000, 329900),
('VID-003','Tapo C110','Camara WiFi TP-Link Tapo C110', 'Video', 120000, 169900),
('VID-004','Logitech Brio 300','Webcam Full HD Logitech Brio 300', 'Video', 220000, 289900),

('SEG-001','Tapo C200','Camara de seguridad WiFi TP-Link Tapo C200', 'Seguridad', 115000, 159900),
('SEG-002','Tapo C210','Camara de seguridad 3MP TP-Link Tapo C210', 'Seguridad', 145000, 199900),
('SEG-003','Kit Camara WiFi 2MP','Kit de camara WiFi para vigilancia', 'Seguridad', 210000, 289900),
('SEG-004','Tapo C320WS','Camara exterior WiFi TP-Link Tapo C320WS', 'Seguridad', 230000, 309900),

('ENE-001','APC Back-UPS 600VA','UPS APC de 600VA para equipos', 'Energia', 290000, 369900),
('ENE-002','Forza NT-1011','UPS Forza NT-1011', 'Energia', 250000, 329900),
('ENE-003','APC Regleta 6 Tomas','Regleta APC con proteccion de voltaje', 'Energia', 80000, 109900),

('OFI-001','HP DeskJet 2875','Impresora multifuncional HP DeskJet 2875', 'Oficina', 280000, 359900),
('OFI-002','Epson EcoTank L3250','Impresora multifuncional Epson EcoTank L3250', 'Oficina', 750000, 899900),
('OFI-003','Logitech MK220','Combo teclado y mouse inalambrico', 'Oficina', 75000, 99900),

('GAM-001','Logitech G203','Mouse gaming Logitech G203', 'Gaming', 90000, 129900),
('GAM-002','Redragon H510','Audifonos gaming Redragon H510', 'Gaming', 170000, 229900),
('GAM-003','Logitech G435','Audifonos gaming inalambricos Logitech G435', 'Gaming', 240000, 299900),
('GAM-004','Redragon M711','Mouse gaming Redragon M711', 'Gaming', 95000, 139900),
('GAM-005','Logitech G413','Teclado mecanico gaming Logitech G413', 'Gaming', 250000, 319900),

('MOV-001','Cargador USB-C 25W','Cargador rapido USB-C de 25W', 'Movilidad', 45000, 69900),
('MOV-002','Power Bank 10000mAh','Bateria portatil de 10000mAh', 'Movilidad', 70000, 99900),
('MOV-003','Soporte celular carro','Soporte universal para celular de carro', 'Movilidad', 30000, 49900),

('CAB-003','Adaptador USB-C HDMI','Adaptador USB-C a HDMI', 'Cables y Adaptadores', 45000, 69900),
('CAB-004','Cable USB-C 2m','Cable USB-C de 2 metros', 'Cables y Adaptadores', 25000, 39900),
('CAB-005','Cable DisplayPort 2m','Cable DisplayPort de 2 metros', 'Cables y Adaptadores', 40000, 59900),

('EXT-001','Kingston USB 128GB','Memoria USB Kingston de 128GB', 'Almacenamiento Externo', 35000, 49900),
('EXT-002','SanDisk USB 256GB','Memoria USB SanDisk de 256GB', 'Almacenamiento Externo', 65000, 89900),
('EXT-003','Seagate Expansion 1TB','Disco duro externo Seagate de 1TB', 'Almacenamiento Externo', 220000, 279900)
) AS x(sku, nombre, descripcion, categoria, precio_compra, precio_venta)
JOIN categorias c
  ON LOWER(c.nombre) = LOWER(x.categoria)
WHERE NOT EXISTS (
    SELECT 1
    FROM productos p
    WHERE p.codigo_sku = x.sku
);

-- ============================================================
-- 4. COMPRAS NUEVAS
-- Se compran cantidades suficientes para generar stock para las ventas
-- para las ventas posteriores.
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
        'TEL-001', 'TEL-002', 'TEL-003', 'TEL-004', 'TEL-005', 'TEL-006', 'AUD-001', 'AUD-002', 'AUD-003', 'AUD-004', 'AUD-005', 'AUD-006', 'VID-001', 'VID-002', 'VID-003', 'VID-004', 'SEG-001', 'SEG-002', 'SEG-003', 'SEG-004', 'ENE-001', 'ENE-002', 'ENE-003', 'OFI-001', 'OFI-002', 'OFI-003', 'GAM-001', 'GAM-002', 'GAM-003', 'GAM-004', 'GAM-005', 'MOV-001', 'MOV-002', 'MOV-003', 'CAB-003', 'CAB-004', 'CAB-005', 'EXT-001', 'EXT-002', 'EXT-003'
    ];

    proveedores_nombres TEXT[] := ARRAY[
        'Capital Tech Importaciones',
        'Valle Digital Mayorista',
        'Antioquia Computadores',
        'Atlantico Electronica',
        'Santander Tech Supply',
        'Risaralda Digital',
        'Caldas Tecnologia',
        'Magdalena Tech',
        'Norte Digital Solutions',
        'Llanos Informatica'
    ];
BEGIN

    SELECT id_empleado INTO empleado_id
    FROM empleados
    WHERE cargo ILIKE '%compra%'
    LIMIT 1;

    IF empleado_id IS NULL THEN
        SELECT id_empleado INTO empleado_id
        FROM empleados
        WHERE rol = 'admin'
        LIMIT 1;
    END IF;

    IF empleado_id IS NULL THEN
        RAISE EXCEPTION 'No se encontro empleado para registrar compras.';
    END IF;

    FOR i IN 1..20 LOOP

        SELECT id_proveedor INTO proveedor_id
        FROM proveedores
        WHERE nombre = proveedores_nombres[((i-1) % 10)+1]
        LIMIT 1;

        IF proveedor_id IS NULL THEN
            RAISE EXCEPTION 'No se encontro proveedor para la compra %.', i;
        END IF;

        INSERT INTO compras
        (id_proveedor, id_empleado, fecha_compra,
         subtotal, impuesto, descuento, total)
        VALUES
        (
            proveedor_id,
            empleado_id,
            TIMESTAMP '2026-05-01 08:00:00'
                + ((i * 12) || ' days')::interval,
            0, 0, 0, 0
        )
        RETURNING id_compra INTO compra_id;

        sub := 0;

        FOR j IN 1..4 LOOP

            SELECT id_producto, precio_compra
            INTO producto_id, precio
            FROM productos
            WHERE codigo_sku =
                skus[((i+j-2) % array_length(skus,1))+1]
            LIMIT 1;

            IF producto_id IS NULL THEN
                RAISE EXCEPTION
                    'No existe el producto SKU %.',
                    skus[((i+j-2) % array_length(skus,1))+1];
            END IF;

            qty := 5 + ((i+j) % 6);
            sub := sub + precio * qty;

            INSERT INTO detalle_compras
            (id_compra, id_producto, cantidad, precio_unitario,
             descuento, subtotal)
            VALUES
            (compra_id, producto_id, qty, precio, 0, precio * qty);

            UPDATE productos
            SET stock = stock + qty,
                precio_compra = precio
            WHERE id_producto = producto_id;

            INSERT INTO producto_proveedor
            (id_producto, id_proveedor, precio_compra,
             tiempo_entrega_dias, es_proveedor_principal)
            VALUES
            (producto_id, proveedor_id, precio, 3 + (i % 6), j = 1)
            ON CONFLICT (id_producto, id_proveedor)
            DO UPDATE SET
                precio_compra = EXCLUDED.precio_compra,
                tiempo_entrega_dias = EXCLUDED.tiempo_entrega_dias;

        END LOOP;

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
-- 5. 100 VENTAS NUEVAS
-- ============================================================

DO $$
DECLARE
    venta_id INTEGER;
    cliente_id INTEGER;
    empleado_id INTEGER;
    producto1 INTEGER;
    producto2 INTEGER;
    producto3 INTEGER;
    precio1 NUMERIC(12,2);
    precio2 NUMERIC(12,2);
    precio3 NUMERIC(12,2);
    cantidad1 INTEGER;
    cantidad2 INTEGER;
    cantidad3 INTEGER;
    sub NUMERIC(12,2);
    impuesto NUMERIC(12,2);
    descuento NUMERIC(12,2);
    total NUMERIC(12,2);
    pago NUMERIC(12,2);
    estado_venta INTEGER;
    fecha_base TIMESTAMP;
    i INTEGER;

    clientes_docs TEXT[] := ARRAY[
        '1102002001','1102002002','1102002003','1102002004','1102002005',
        '1102002006','1102002007','1102002008','1102002009','1102002010',
        '1102002011','1102002012','1102002013','1102002014','1102002015',
        '1102002016','1102002017','1102002018','1102002019','1102002020',
        '1102002021','1102002022','1102002023','1102002024','1102002025',
        '1102002026','1102002027','1102002028','1102002029','1102002030',
        '1102002031','1102002032','1102002033','1102002034','1102002035',
        '1102002036','1102002037','1102002038','1102002039','1102002040',
        '1102002041','1102002042','1102002043','1102002044','1102002045',
        '1102002046','1102002047','1102002048','1102002049','1102002050'
    ];

    skus TEXT[] := ARRAY[
        'TEL-001', 'TEL-002', 'TEL-003', 'TEL-004', 'TEL-005', 'TEL-006', 'AUD-001', 'AUD-002', 'AUD-003', 'AUD-004', 'AUD-005', 'AUD-006', 'VID-001', 'VID-002', 'VID-003', 'VID-004', 'SEG-001', 'SEG-002', 'SEG-003', 'SEG-004', 'ENE-001', 'ENE-002', 'ENE-003', 'OFI-001', 'OFI-002', 'OFI-003', 'GAM-001', 'GAM-002', 'GAM-003', 'GAM-004', 'GAM-005', 'MOV-001', 'MOV-002', 'MOV-003', 'CAB-003', 'CAB-004', 'CAB-005', 'EXT-001', 'EXT-002', 'EXT-003'
    ];
BEGIN

    FOR i IN 1..100 LOOP

        SELECT id_cliente INTO cliente_id
        FROM clientes
        WHERE numero_documento =
            clientes_docs[((i-1) % array_length(clientes_docs,1))+1]
        LIMIT 1;

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

        IF cliente_id IS NULL OR empleado_id IS NULL THEN
            RAISE EXCEPTION
                'No se encontro cliente o empleado para venta %.', i;
        END IF;

        SELECT id_producto, precio_venta
        INTO producto1, precio1
        FROM productos
        WHERE codigo_sku =
            skus[((i-1) % array_length(skus,1))+1]
        LIMIT 1;

        SELECT id_producto, precio_venta
        INTO producto2, precio2
        FROM productos
        WHERE codigo_sku =
            skus[((i+5) % array_length(skus,1))+1]
        LIMIT 1;

        SELECT id_producto, precio_venta
        INTO producto3, precio3
        FROM productos
        WHERE codigo_sku =
            skus[((i+11) % array_length(skus,1))+1]
        LIMIT 1;

        cantidad1 := 1 + (i % 3);
        cantidad2 := 1 + ((i+1) % 2);
        cantidad3 := CASE WHEN i % 4 = 0 THEN 2 ELSE 1 END;

        -- Si no hay stock, esta venta no se crea.
        IF (SELECT stock FROM productos WHERE id_producto = producto1) < cantidad1
           OR (SELECT stock FROM productos WHERE id_producto = producto2) < cantidad2
           OR (SELECT stock FROM productos WHERE id_producto = producto3) < cantidad3 THEN
            CONTINUE;
        END IF;

        sub := (precio1 * cantidad1)
             + (precio2 * cantidad2)
             + (precio3 * cantidad3);

        impuesto := ROUND(sub * 0.19, 2);

        descuento := CASE
            WHEN i % 7 = 0 THEN ROUND(sub * 0.08, 2)
            WHEN i % 5 = 0 THEN ROUND(sub * 0.05, 2)
            ELSE 0
        END;

        total := sub + impuesto - descuento;

        -- Distribucion:
        -- 85 aproximadamente pagadas
        -- 10 aproximadamente pendientes
        -- 5 anuladas
        IF i % 20 = 0 THEN
            estado_venta := 3;
        ELSIF i % 10 = 0 OR i % 17 = 0 THEN
            estado_venta := 1;
        ELSE
            estado_venta := 2;
        END IF;

        fecha_base :=
            TIMESTAMP '2026-05-05 09:00:00'
            + ((i * 2) || ' days')::interval
            + ((i % 9) || ' hours')::interval;

        INSERT INTO ventas
        (id_cliente, id_empleado, id_estado_venta, fecha_venta,
         subtotal, impuesto, descuento, total)
        VALUES
        (cliente_id, empleado_id, estado_venta, fecha_base,
         sub, impuesto, descuento, total)
        RETURNING id_venta INTO venta_id;

        INSERT INTO detalle_ventas
        (id_venta, id_producto, cantidad, precio_unitario,
         descuento, subtotal)
        VALUES
        (venta_id, producto1, cantidad1, precio1, 0, precio1 * cantidad1),
        (venta_id, producto2, cantidad2, precio2, 0, precio2 * cantidad2),
        (venta_id, producto3, cantidad3, precio3, 0, precio3 * cantidad3);

        UPDATE productos
        SET stock = stock - cantidad1
        WHERE id_producto = producto1;

        UPDATE productos
        SET stock = stock - cantidad2
        WHERE id_producto = producto2;

        UPDATE productos
        SET stock = stock - cantidad3
        WHERE id_producto = producto3;

        IF estado_venta = 2 THEN

            INSERT INTO pagos
            (id_venta, id_metodo_pago, id_estado_pago,
             monto, fecha_pago, referencia)
            VALUES
            (venta_id, 1 + (i % 4), 1, total, fecha_base,
             'PAGO-V5-' || LPAD(i::TEXT, 4, '0'));

        ELSIF estado_venta = 1 THEN

            pago := ROUND(
                total *
                CASE
                    WHEN i % 2 = 0 THEN 0.40
                    ELSE 0.65
                END,
                2
            );

            INSERT INTO pagos
            (id_venta, id_metodo_pago, id_estado_pago,
             monto, fecha_pago, referencia)
            VALUES
            (venta_id, 1 + (i % 4), 1, pago, fecha_base,
             'ABONO-V5-' || LPAD(i::TEXT, 4, '0'));

        ELSE

            INSERT INTO pagos
            (id_venta, id_metodo_pago, id_estado_pago,
             monto, fecha_pago, referencia)
            VALUES
            (venta_id, 1 + (i % 4), 3, total, fecha_base,
             'REEMBOLSO-V5-' || LPAD(i::TEXT, 4, '0'));

        END IF;

    END LOOP;
END $$;

-- ============================================================
-- 6. VALIDACIONES
-- ============================================================

DO $$
DECLARE
    negativos INTEGER;
    nuevas_categorias INTEGER;
    nuevos_clientes INTEGER;
    nuevos_proveedores INTEGER;
    ventas_multiciudad INTEGER;
BEGIN

    SELECT COUNT(*)
    INTO negativos
    FROM productos
    WHERE stock < 0;

    IF negativos > 0 THEN
        RAISE EXCEPTION
            'Hay % productos con stock negativo.', negativos;
    END IF;

    SELECT COUNT(*)
    INTO nuevas_categorias
    FROM categorias
    WHERE nombre IN (
        'Telefonia','Audio','Video','Seguridad','Energia',
        'Oficina','Gaming','Movilidad','Cables y Adaptadores',
        'Almacenamiento Externo'
    );

    SELECT COUNT(*)
    INTO nuevos_clientes
    FROM clientes
    WHERE numero_documento BETWEEN '1102002001' AND '1102002050';

    SELECT COUNT(*)
    INTO nuevos_proveedores
    FROM proveedores
    WHERE nombre IN (
        'Capital Tech Importaciones',
        'Valle Digital Mayorista',
        'Antioquia Computadores',
        'Atlantico Electronica',
        'Santander Tech Supply',
        'Risaralda Digital',
        'Caldas Tecnologia',
        'Magdalena Tech',
        'Norte Digital Solutions',
        'Llanos Informatica'
    );

    SELECT COUNT(*)
    INTO ventas_multiciudad
    FROM ventas v
    JOIN clientes c ON c.id_cliente = v.id_cliente
    WHERE c.numero_documento BETWEEN '1102002001' AND '1102002050';

    RAISE NOTICE 'Categorias nuevas disponibles: %', nuevas_categorias;
    RAISE NOTICE 'Clientes nuevos disponibles: %', nuevos_clientes;
    RAISE NOTICE 'Proveedores nuevos disponibles: %', nuevos_proveedores;
    RAISE NOTICE 'Ventas asociadas a clientes nuevos: %', ventas_multiciudad;

END $$;

COMMIT;

-- ============================================================
-- CONSULTAS PARA VERIFICAR
-- ============================================================

-- Clientes por ciudad:
-- SELECT ciudad, COUNT(*) AS clientes
-- FROM clientes
-- GROUP BY ciudad
-- ORDER BY clientes DESC;

-- Ventas por ciudad:
-- SELECT
--     c.ciudad,
--     COUNT(v.id_venta) AS ventas,
--     SUM(v.total) AS ingresos
-- FROM clientes c
-- JOIN ventas v ON v.id_cliente = c.id_cliente
-- WHERE v.id_estado_venta <> 3
-- GROUP BY c.ciudad
-- ORDER BY ingresos DESC;

-- Productos por categoria:
-- SELECT
--     c.nombre AS categoria,
--     COUNT(p.id_producto) AS productos
-- FROM categorias c
-- LEFT JOIN productos p ON p.id_categoria = c.id_categoria
-- GROUP BY c.id_categoria, c.nombre
-- ORDER BY productos DESC;

-- Compras por proveedor:
-- SELECT
--     p.nombre AS proveedor,
--     COUNT(c.id_compra) AS compras,
--     SUM(c.total) AS total_comprado
-- FROM proveedores p
-- JOIN compras c ON c.id_proveedor = p.id_proveedor
-- GROUP BY p.id_proveedor, p.nombre
-- ORDER BY total_comprado DESC;

-- Ventas por mes:
-- SELECT
--     DATE_TRUNC('month', fecha_venta) AS mes,
--     COUNT(*) AS ventas,
--     SUM(total) AS ingresos
-- FROM ventas
-- WHERE id_estado_venta <> 3
-- GROUP BY mes
-- ORDER BY mes;
