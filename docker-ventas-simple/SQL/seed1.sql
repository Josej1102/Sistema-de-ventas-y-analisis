-- ================================================================
-- SEED DE DATOS HISTORICOS - SISTEMA DE VENTAS
-- Ejecutar DESPUES de Modelo.sql.
-- No modifica el modelo ni el backend.
-- Las fechas historicas solo sirven para poblar datos de prueba.
-- Las ventas nuevas hechas desde la API seguiran usando NOW().
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. DATOS MAESTROS
-- ----------------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
('Computadores','Computadores portatiles y de escritorio'),
('Perifericos','Mouse, teclados y otros perifericos'),
('Monitores','Monitores para oficina y gaming'),
('Almacenamiento','Unidades SSD y discos duros'),
('Componentes','Memoria RAM y procesadores'),
('Redes','Routers, switches y equipos de red'),
('Accesorios','Cables y accesorios tecnologicos'),
('Impresion','Impresoras y equipos de impresion');

INSERT INTO proveedores (nombre, contacto, telefono, email, direccion, estado) VALUES
('TecnoDistribuciones Caribe','Andres Herrera','3005551001','ventas@tecnodistribuciones.co','Barranquilla',TRUE),
('Computec Colombia','Mariana Lopez','3005551002','comercial@computec.co','Bogota',TRUE),
('Soluciones Digitales SAS','Felipe Gomez','3005551003','ventas@solucionesdigitales.co','Medellin',TRUE),
('Importadora TechPro','Camilo Rojas','3005551004','contacto@techpro.co','Bogota',TRUE),
('Global Components','Laura Mendoza','3005551005','ventas@globalcomponents.co','Cali',TRUE),
('RedCom Tecnologia','Santiago Torres','3005551006','comercial@redcom.co','Barranquilla',TRUE),
('Almacen Digital','Natalia Castro','3005551007','ventas@almacendigital.co','Cartagena',TRUE),
('OfficeTech','Daniel Perez','3005551008','ventas@officetech.co','Bogota',TRUE);

-- Los productos se crean con stock 0. El stock historico se construye
-- mediante las compras de este seed y luego se descuentan las ventas.
INSERT INTO productos (codigo_sku,nombre,descripcion,id_categoria,precio_compra,precio_venta,stock,stock_minimo,estado) VALUES
('LAP-001','Lenovo IdeaPad 3','Portatil Lenovo IdeaPad 3',4,1650000,2050000,0,3,TRUE),
('LAP-002','HP 15 Ryzen 5','Portatil HP con Ryzen 5',4,1800000,2250000,0,3,TRUE),
('LAP-003','Asus VivoBook 15','Portatil Asus VivoBook 15',4,1900000,2400000,0,2,TRUE),
('LAP-004','Acer Aspire 5','Portatil Acer Aspire 5',4,1750000,2200000,0,3,TRUE),
('PC-001','PC Oficina Ryzen 5','PC de escritorio para oficina',4,1450000,1850000,0,2,TRUE),
('MOU-001','Logitech M185','Mouse inalambrico Logitech',5,35000,55000,0,10,TRUE),
('MOU-002','Logitech M720','Mouse inalambrico avanzado',5,110000,155000,0,5,TRUE),
('MOU-003','Redragon M602','Mouse gaming Redragon',5,70000,105000,0,6,TRUE),
('TEC-001','Logitech K120','Teclado USB Logitech',5,45000,70000,0,8,TRUE),
('TEC-002','Redragon Kumara K552','Teclado mecanico gaming',5,150000,210000,0,4,TRUE),
('TEC-003','Logitech MX Keys','Teclado inalambrico Logitech',5,280000,360000,0,3,TRUE),
('MON-001','Samsung 24 Pulgadas','Monitor Samsung 24 pulgadas',6,480000,620000,0,3,TRUE),
('MON-002','LG 24MP400','Monitor LG 24 pulgadas',6,450000,590000,0,4,TRUE),
('MON-003','ASUS TUF 27 Pulgadas','Monitor gaming ASUS 27 pulgadas',6,850000,1100000,0,2,TRUE),
('SSD-001','Kingston SSD 480GB','SSD SATA Kingston 480GB',7,150000,210000,0,6,TRUE),
('SSD-002','Kingston NV2 1TB','SSD NVMe Kingston 1TB',7,280000,360000,0,5,TRUE),
('SSD-003','Samsung 980 1TB','SSD NVMe Samsung 980 1TB',7,320000,420000,0,3,TRUE),
('HDD-001','Seagate 1TB','Disco duro Seagate 1TB',7,190000,260000,0,3,TRUE),
('RAM-001','Kingston 8GB DDR4','Memoria RAM Kingston 8GB DDR4',8,90000,130000,0,8,TRUE),
('RAM-002','Kingston 16GB DDR4','Memoria RAM Kingston 16GB DDR4',8,165000,220000,0,6,TRUE),
('RAM-003','Corsair 16GB DDR4','Memoria RAM Corsair 16GB DDR4',8,180000,250000,0,4,TRUE),
('CPU-001','Ryzen 5 5600G','Procesador AMD Ryzen 5 5600G',8,480000,590000,0,3,TRUE),
('CPU-002','Intel Core i5 12400','Procesador Intel Core i5 12400',8,650000,790000,0,2,TRUE),
('NET-001','TP-Link Archer C6','Router TP-Link Archer C6',9,150000,210000,0,5,TRUE),
('NET-002','TP-Link Archer AX23','Router WiFi 6 TP-Link',9,250000,330000,0,3,TRUE),
('NET-003','Switch TP-Link 8 Puertos','Switch TP-Link 8 puertos',9,100000,145000,0,4,TRUE),
('CAB-001','Cable HDMI 2m','Cable HDMI de 2 metros',10,20000,35000,0,10,TRUE),
('CAB-002','Cable Ethernet 5m','Cable Ethernet de 5 metros',10,18000,30000,0,10,TRUE),
('IMP-001','HP LaserJet M111w','Impresora laser HP',11,650000,820000,0,2,TRUE);

-- Proveedor principal + algunos alternativos
INSERT INTO producto_proveedor (id_producto,id_proveedor,precio_compra,tiempo_entrega_dias,es_proveedor_principal)
SELECT p.id_producto, x.prov, x.precio, x.dias, TRUE
FROM (VALUES
('LAP-001',2,1650000,5),('LAP-002',2,1800000,5),('LAP-003',4,1900000,7),('LAP-004',1,1750000,5),('PC-001',3,1450000,6),
('MOU-001',1,35000,3),('MOU-002',2,110000,5),('MOU-003',4,70000,7),('TEC-001',1,45000,3),('TEC-002',4,150000,7),
('TEC-003',2,280000,5),('MON-001',2,480000,5),('MON-002',3,450000,6),('MON-003',4,850000,7),
('SSD-001',5,150000,5),('SSD-002',5,280000,5),('SSD-003',5,320000,6),('HDD-001',5,190000,6),
('RAM-001',5,90000,5),('RAM-002',5,165000,5),('RAM-003',5,180000,6),('CPU-001',5,480000,6),('CPU-002',5,650000,6),
('NET-001',6,150000,4),('NET-002',6,250000,5),('NET-003',6,100000,4),('CAB-001',7,20000,3),('CAB-002',7,18000,3),('IMP-001',8,650000,7)
) AS x(sku,prov,precio,dias)
JOIN productos p ON p.codigo_sku=x.sku;

INSERT INTO producto_proveedor (id_producto,id_proveedor,precio_compra,tiempo_entrega_dias,es_proveedor_principal)
SELECT p.id_producto,x.prov,x.precio,x.dias,FALSE
FROM (VALUES
('LAP-001',4,1680000,7),('LAP-002',3,1830000,6),('MON-001',3,490000,6),
('SSD-002',4,290000,7),('RAM-002',3,170000,6),('NET-001',7,155000,5),('CAB-001',6,22000,4)
) AS x(sku,prov,precio,dias)
JOIN productos p ON p.codigo_sku=x.sku;

INSERT INTO clientes (tipo_documento,numero_documento,nombre,apellido,telefono,email,direccion,ciudad,estado) VALUES
('CC','1001001001','Juan','Perez','3006001001','juan.perez@email.com','Centro','Cartagena',TRUE),
('CC','1001001002','Maria','Gomez','3006001002','maria.gomez@email.com','Manga','Cartagena',TRUE),
('CC','1001001003','Carlos','Martinez','3006001003','carlos.martinez@email.com','Crespo','Cartagena',TRUE),
('CC','1001001004','Laura','Rodriguez','3006001004','laura.rodriguez@email.com','Pie de la Popa','Cartagena',TRUE),
('CC','1001001005','Andres','Torres','3006001005','andres.torres@email.com','Olaya','Cartagena',TRUE),
('CC','1001001006','Sofia','Herrera','3006001006','sofia.herrera@email.com','Manga','Cartagena',TRUE),
('CC','1001001007','Daniel','Castro','3006001007','daniel.castro@email.com','San Fernando','Cartagena',TRUE),
('CC','1001001008','Valentina','Moreno','3006001008','valentina.moreno@email.com','El Bosque','Cartagena',TRUE),
('CC','1001001009','Sebastian','Rojas','3006001009','sebastian.rojas@email.com','Manga','Cartagena',TRUE),
('CC','1001001010','Natalia','Vargas','3006001010','natalia.vargas@email.com','Bocagrande','Cartagena',TRUE),
('CC','1001001011','Miguel','Jimenez','3006001011','miguel.jimenez@email.com','Los Alpes','Cartagena',TRUE),
('CC','1001001012','Camila','Navarro','3006001012','camila.navarro@email.com','Manga','Cartagena',TRUE),
('CC','1001001013','David','Mendoza','3006001013','david.mendoza@email.com','Crespo','Cartagena',TRUE),
('CC','1001001014','Paula','Diaz','3006001014','paula.diaz@email.com','Pie de la Popa','Cartagena',TRUE),
('CC','1001001015','Jorge','Suarez','3006001015','jorge.suarez@email.com','Manga','Cartagena',TRUE),
('CC','1001001016','Alejandra','Ruiz','3006001016','alejandra.ruiz@email.com','El Recreo','Cartagena',TRUE),
('CC','1001001017','Felipe','Ramirez','3006001017','felipe.ramirez@email.com','La Castellana','Cartagena',TRUE),
('CC','1001001018','Isabella','Mora','3006001018','isabella.mora@email.com','Manga','Cartagena',TRUE),
('CC','1001001019','Ricardo','Pineda','3006001019','ricardo.pineda@email.com','Crespo','Cartagena',TRUE),
('CC','1001001020','Gabriela','Santos','3006001020','gabriela.santos@email.com','Bocagrande','Cartagena',TRUE);

-- Empleados de prueba. Se asume que el admin real ya fue creado con crearAdmin.js.
INSERT INTO empleados (nombre,apellido,cargo,telefono,email,estado,password_hash,rol) VALUES
('Laura','Perez','Vendedor','3007001001','laura.perez@ventaspro.co',TRUE,NULL,'empleado'),
('Carlos','Martinez','Vendedor','3007001002','carlos.martinez@ventaspro.co',TRUE,NULL,'empleado'),
('Andrea','Gomez','Vendedor','3007001003','andrea.gomez@ventaspro.co',TRUE,NULL,'empleado'),
('Daniel','Torres','Encargado de compras','3007001004','daniel.torres@ventaspro.co',TRUE,NULL,'empleado');

-- ----------------------------------------------------------------
-- 2. COMPRAS HISTORICAS
-- Usamos empleado id = (el empleado de compras creado arriba), no un
-- numero fijo. Cada compra tiene fecha historica y detalle coherente.
-- ----------------------------------------------------------------
DO $$
DECLARE
    emp_id INT;
    c_id INT;
BEGIN
    SELECT id_empleado INTO emp_id FROM empleados WHERE email='daniel.torres@ventaspro.co';

    -- Compra 1
    INSERT INTO compras(id_proveedor,id_empleado,fecha_compra,subtotal,impuesto,descuento,total)
    VALUES(1,emp_id,'2026-03-02 09:00',9000000,1710000,0,10710000) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('LAP-001',3),('LAP-004',3),('MOU-001',20),('TEC-001',15),('CAB-001',20),('CAB-002',20)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;

    -- Compra 2
    INSERT INTO compras VALUES(DEFAULT,2,emp_id,'2026-03-18 10:00',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('LAP-002',3),('MON-001',4),('SSD-001',10),('RAM-001',15),('RAM-002',10)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto-descuento WHERE id_compra=c_id;

    -- Compra 3
    INSERT INTO compras VALUES(DEFAULT,4,emp_id,'2026-04-03 09:30',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('LAP-003',3),('MOU-003',15),('TEC-002',8),('MON-003',3),('SSD-002',10)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 4
    INSERT INTO compras VALUES(DEFAULT,3,emp_id,'2026-04-21 11:00',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('PC-001',4),('MOU-002',10),('TEC-003',5),('MON-002',5),('CPU-001',5),('NET-001',10)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 5
    INSERT INTO compras VALUES(DEFAULT,5,emp_id,'2026-05-06 08:45',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('SSD-003',8),('HDD-001',8),('RAM-003',8),('CPU-002',4),('NET-002',6),('IMP-001',3)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 6
    INSERT INTO compras VALUES(DEFAULT,6,emp_id,'2026-05-20 14:00',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('MOU-001',25),('TEC-001',20),('CAB-001',30),('CAB-002',30),('NET-003',10)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 7
    INSERT INTO compras VALUES(DEFAULT,7,emp_id,'2026-06-04 09:15',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('LAP-001',3),('LAP-002',2),('MON-001',4),('SSD-001',12),('RAM-001',15)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 8
    INSERT INTO compras VALUES(DEFAULT,8,emp_id,'2026-06-19 13:30',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('LAP-003',2),('LAP-004',3),('MOU-003',15),('TEC-002',8),('SSD-002',10),('NET-001',8)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 9
    INSERT INTO compras VALUES(DEFAULT,1,emp_id,'2026-07-03 10:00',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('PC-001',3),('MON-002',5),('MON-003',2),('MOU-002',10),('TEC-003',5),('CPU-001',5)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 10
    INSERT INTO compras VALUES(DEFAULT,2,emp_id,'2026-07-18 09:20',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('LAP-001',3),('LAP-002',3),('SSD-003',8),('RAM-002',12),('RAM-003',8)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 11
    INSERT INTO compras VALUES(DEFAULT,5,emp_id,'2026-08-02 08:50',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('HDD-001',8),('CPU-002',4),('NET-002',6),('NET-003',10),('IMP-001',3)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;

    -- Compra 12
    INSERT INTO compras VALUES(DEFAULT,6,emp_id,'2026-08-17 14:10',0,0,0,0) RETURNING id_compra INTO c_id;
    INSERT INTO detalle_compras(id_compra,id_producto,cantidad,precio_unitario,descuento,subtotal)
    SELECT c_id,p.id_producto,x.qty,p.precio_compra,0,x.qty*p.precio_compra FROM (VALUES
      ('MOU-001',30),('MOU-002',10),('TEC-001',20),('CAB-001',40),('CAB-002',40),('SSD-001',10)) x(sku,qty)
    JOIN productos p ON p.codigo_sku=x.sku;
    UPDATE compras SET subtotal=(SELECT SUM(subtotal) FROM detalle_compras WHERE id_compra=c_id), impuesto=subtotal*0.19, total=subtotal+impuesto WHERE id_compra=c_id;
END $$;

-- Construimos el stock a partir de todas las compras historicas.
UPDATE productos p
SET stock = COALESCE((SELECT SUM(dc.cantidad) FROM detalle_compras dc WHERE dc.id_producto=p.id_producto),0);

-- ----------------------------------------------------------------
-- 3. VENTAS HISTORICAS
-- Se generan 50 ventas con fechas entre marzo y agosto de 2026.
-- Se calculan los totales desde los detalles, para evitar inconsistencias.
-- 42 pagadas, 5 pendientes y 3 anuladas.
-- ----------------------------------------------------------------
DO $$
DECLARE
    emp_id INT;
    cli_id INT;
    v_id INT;
    i INT;
    sale_date TIMESTAMP;
    state_id INT;
    subtotal NUMERIC(12,2);
    impuesto NUMERIC(12,2);
    descuento NUMERIC(12,2);
    total NUMERIC(12,2);
    paid NUMERIC(12,2);
    sku1 TEXT;
    sku2 TEXT;
    qty1 INT;
    qty2 INT;
    prod1 INT;
    prod2 INT;
    price1 NUMERIC(10,2);
    price2 NUMERIC(10,2);
    method_id INT;
BEGIN
    FOR i IN 1..50 LOOP
        -- Clientes repetidos para que el analisis de frecuencia tenga sentido.
        cli_id := CASE
            WHEN i % 5 = 0 THEN 1
            WHEN i % 4 = 0 THEN 2
            WHEN i % 3 = 0 THEN 3
            ELSE ((i - 1) % 17) + 4
        END;

        -- Tres vendedores repartidos.
        emp_id := CASE (i % 3) WHEN 1 THEN
            (SELECT id_empleado FROM empleados WHERE email='laura.perez@ventaspro.co')
          WHEN 2 THEN
            (SELECT id_empleado FROM empleados WHERE email='carlos.martinez@ventaspro.co')
          ELSE
            (SELECT id_empleado FROM empleados WHERE email='andrea.gomez@ventaspro.co') END;

        sale_date := TIMESTAMP '2026-03-05 09:00:00' + ((i * 5 + (i % 3) * 7) || ' days')::interval
                     + ((i % 8) || ' hours')::interval + ((i * 11 % 60) || ' minutes')::interval;
        IF sale_date > TIMESTAMP '2026-08-31 18:00:00' THEN
            sale_date := TIMESTAMP '2026-08-31 10:00:00' - ((50-i) || ' hours')::interval;
        END IF;

        -- Tres anuladas y cinco pendientes.
        state_id := CASE
            WHEN i IN (16,40,50) THEN 3
            WHEN i IN (5,12,20,32,45) THEN 1
            ELSE 2
        END;

        -- Producto principal segun la venta. Se repiten productos de alto movimiento.
        sku1 := CASE (i % 10)
          WHEN 0 THEN 'LAP-001' WHEN 1 THEN 'MOU-001' WHEN 2 THEN 'TEC-001'
          WHEN 3 THEN 'MON-001' WHEN 4 THEN 'SSD-002' WHEN 5 THEN 'RAM-002'
          WHEN 6 THEN 'NET-001' WHEN 7 THEN 'LAP-002' WHEN 8 THEN 'MOU-003'
          ELSE 'IMP-001' END;
        sku2 := CASE (i % 7)
          WHEN 0 THEN 'CAB-001' WHEN 1 THEN 'CAB-002' WHEN 2 THEN 'MOU-001'
          WHEN 3 THEN 'RAM-001' WHEN 4 THEN 'SSD-001' WHEN 5 THEN 'TEC-002'
          ELSE 'MON-002' END;

        SELECT id_producto, precio_venta INTO prod1, price1 FROM productos WHERE codigo_sku=sku1;
        SELECT id_producto, precio_venta INTO prod2, price2 FROM productos WHERE codigo_sku=sku2;

        qty1 := CASE WHEN sku1 LIKE 'LAP-%' OR sku1='IMP-001' OR sku1 LIKE 'MON-%' THEN 1 ELSE (i % 3)+1 END;
        qty2 := CASE WHEN sku2 LIKE 'CAB-%' OR sku2='MOU-001' OR sku2='RAM-001' THEN (i % 4)+1 ELSE 1 END;

        subtotal := qty1*price1 + qty2*price2;
        impuesto := ROUND(subtotal * CASE WHEN i % 4 = 0 THEN 0.19 ELSE 0.00 END,2);
        descuento := CASE WHEN i % 6 = 0 THEN ROUND(subtotal*0.05,2) ELSE 0 END;
        total := subtotal + impuesto - descuento;

        INSERT INTO ventas(id_cliente,id_empleado,id_estado_venta,fecha_venta,subtotal,impuesto,descuento,total)
        VALUES(cli_id,emp_id,state_id,sale_date,subtotal,impuesto,descuento,total)
        RETURNING id_venta INTO v_id;

        INSERT INTO detalle_ventas(id_venta,id_producto,cantidad,precio_unitario,descuento,subtotal)
        VALUES(v_id,prod1,qty1,price1,0,qty1*price1);
        INSERT INTO detalle_ventas(id_venta,id_producto,cantidad,precio_unitario,descuento,subtotal)
        VALUES(v_id,prod2,qty2,price2,0,qty2*price2);

        -- Pagos: las pagadas quedan completas; las pendientes quedan parciales;
        -- las anuladas quedan reembolsadas.
        method_id := ((i-1) % 4) + 1;
        IF state_id = 2 THEN
            paid := total;
            INSERT INTO pagos(id_venta,id_metodo_pago,id_estado_pago,monto,fecha_pago,referencia)
            VALUES(v_id,method_id,1,paid,sale_date + interval '5 minutes',
                   'HIST-' || LPAD(i::text,3,'0'));
        ELSIF state_id = 1 THEN
            paid := ROUND(total * CASE WHEN i % 2 = 0 THEN 0.50 ELSE 0.65 END,2);
            INSERT INTO pagos(id_venta,id_metodo_pago,id_estado_pago,monto,fecha_pago,referencia)
            VALUES(v_id,method_id,1,paid,sale_date + interval '10 minutes',
                   'HIST-P-' || LPAD(i::text,3,'0'));
        ELSE
            paid := total;
            INSERT INTO pagos(id_venta,id_metodo_pago,id_estado_pago,monto,fecha_pago,referencia)
            VALUES(v_id,method_id,3,paid,sale_date + interval '8 minutes',
                   'HIST-R-' || LPAD(i::text,3,'0'));
        END IF;
    END LOOP;
END $$;

-- ----------------------------------------------------------------
-- 4. DESCONTAR STOCK DE LAS VENTAS NO ANULADAS.
-- ----------------------------------------------------------------
UPDATE productos p
SET stock = p.stock - COALESCE(x.cantidad,0)
FROM (
    SELECT dv.id_producto, SUM(dv.cantidad) AS cantidad
    FROM detalle_ventas dv
    JOIN ventas v ON v.id_venta=dv.id_venta
    WHERE v.id_estado_venta IN (1,2)
    GROUP BY dv.id_producto
) x
WHERE p.id_producto=x.id_producto;

-- ----------------------------------------------------------------
-- 5. VALIDACIONES
-- ----------------------------------------------------------------
DO $$
DECLARE
    c_ventas INT;
    c_detalles INT;
    c_pagos INT;
    c_compras INT;
    c_stock_neg INT;
    c_bad_totals INT;
BEGIN
    SELECT COUNT(*) INTO c_ventas FROM ventas;
    SELECT COUNT(*) INTO c_detalles FROM detalle_ventas;
    SELECT COUNT(*) INTO c_pagos FROM pagos;
    SELECT COUNT(*) INTO c_compras FROM compras;
    SELECT COUNT(*) INTO c_stock_neg FROM productos WHERE stock < 0;

    SELECT COUNT(*) INTO c_bad_totals
    FROM ventas v
    WHERE v.total <> (
        SELECT COALESCE(SUM(dv.subtotal),0) FROM detalle_ventas dv WHERE dv.id_venta=v.id_venta
    ) + v.impuesto - v.descuento;

    RAISE NOTICE 'Ventas cargadas: %', c_ventas;
    RAISE NOTICE 'Detalles de ventas: %', c_detalles;
    RAISE NOTICE 'Pagos cargados: %', c_pagos;
    RAISE NOTICE 'Compras cargadas: %', c_compras;
    RAISE NOTICE 'Productos con stock negativo: %', c_stock_neg;
    RAISE NOTICE 'Ventas con total inconsistente: %', c_bad_totals;

    IF c_stock_neg > 0 THEN
        RAISE EXCEPTION 'El seed produjo stock negativo.';
    END IF;
    IF c_bad_totals > 0 THEN
        RAISE EXCEPTION 'El seed produjo ventas con totales inconsistentes.';
    END IF;
END $$;

COMMIT;

-- ================================================================
-- FIN DEL SEED
-- ================================================================