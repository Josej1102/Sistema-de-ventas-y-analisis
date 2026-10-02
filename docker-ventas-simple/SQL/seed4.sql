-- ============================================================
-- SEED HISTÓRICO V7 - SISTEMA DE VENTAS
-- ============================================================
-- Objetivo:
--   Llevar la base a un volumen de datos útil para análisis.
--
-- Pensado para una BD que ya tiene datos y aproximadamente
-- 138 ventas existentes.
--
-- Agrega:
--   * 200 compras históricas
--   * 650 ventas históricas
--   * tendencia creciente durante 2026
--   * clientes recurrentes y ocasionales
--   * productos con distinta demanda
--   * diferentes empleados
--   * métodos de pago variados
--   * ventas pagadas, pendientes y anuladas
--   * pagos completos y parciales
--   * descuentos e IVA
--   * stock consistente
--
-- IMPORTANTE:
--   Ejecutar TODO el archivo.
--   Si ocurre un error: ROLLBACK; y volver a ejecutar completo.
--   No modifica la estructura de las tablas.
--   No utiliza triggers.
-- ============================================================

BEGIN;


-- ============================================================
-- 1. COMPRAS HISTÓRICAS
-- ============================================================

DO $$
DECLARE
    v_product_count INT;
    v_employee_count INT;
    v_supplier_count INT;

    v_product_ids INT[];
    v_employee_ids INT[];
    v_supplier_ids INT[];

    v_compra_id INT;
    v_producto_id INT;
    v_empleado_id INT;
    v_proveedor_id INT;

    v_qty INT;
    v_price NUMERIC(10,2);
    v_subtotal NUMERIC(10,2);
    v_impuesto NUMERIC(10,2);
    v_total NUMERIC(10,2);

    v_fecha TIMESTAMP;
    v_purchase_index INT;
    v_line_index INT;
    v_idx INT;
BEGIN

    SELECT COUNT(*)
    INTO v_product_count
    FROM productos
    WHERE estado = TRUE;

    SELECT COUNT(*)
    INTO v_employee_count
    FROM empleados
    WHERE estado = TRUE;

    SELECT COUNT(*)
    INTO v_supplier_count
    FROM proveedores
    WHERE estado = TRUE;

    IF v_product_count < 4 THEN
        RAISE EXCEPTION 'Se necesitan al menos 4 productos activos.';
    END IF;

    IF v_employee_count < 1 THEN
        RAISE EXCEPTION 'Se necesita al menos 1 empleado activo.';
    END IF;

    IF v_supplier_count < 1 THEN
        RAISE EXCEPTION 'Se necesita al menos 1 proveedor activo.';
    END IF;


    SELECT ARRAY_AGG(id_producto ORDER BY id_producto)
    INTO v_product_ids
    FROM productos
    WHERE estado = TRUE;

    SELECT ARRAY_AGG(id_empleado ORDER BY id_empleado)
    INTO v_employee_ids
    FROM empleados
    WHERE estado = TRUE;

    SELECT ARRAY_AGG(id_proveedor ORDER BY id_proveedor)
    INTO v_supplier_ids
    FROM proveedores
    WHERE estado = TRUE;


    -- 200 compras distribuidas entre enero y septiembre.
    FOR v_purchase_index IN 1..200 LOOP

        v_fecha :=
            TIMESTAMP '2026-01-02 08:00:00'
            + (((v_purchase_index - 1) * 253) % 254)
              * INTERVAL '1 day'
            + ((v_purchase_index % 9) * INTERVAL '1 hour');


        v_proveedor_id :=
            v_supplier_ids[
                ((v_purchase_index - 1) % v_supplier_count) + 1
            ];


        v_empleado_id :=
            v_employee_ids[
                ((v_purchase_index - 1) % v_employee_count) + 1
            ];


        INSERT INTO compras (
            id_proveedor,
            id_empleado,
            fecha_compra,
            subtotal,
            impuesto,
            descuento,
            total
        )
        VALUES (
            v_proveedor_id,
            v_empleado_id,
            v_fecha,
            0,
            0,
            0,
            0
        )
        RETURNING id_compra INTO v_compra_id;


        v_subtotal := 0;


        -- 4 productos por compra.
        FOR v_line_index IN 0..3 LOOP

            v_idx :=
                ((v_purchase_index * 4 + v_line_index - 1)
                 % v_product_count) + 1;

            v_producto_id := v_product_ids[v_idx];


            SELECT COALESCE(precio_compra, 0)
            INTO v_price
            FROM productos
            WHERE id_producto = v_producto_id;


            -- 5 a 8 unidades.
            v_qty :=
                5 + ((v_purchase_index + v_line_index) % 4);


            INSERT INTO detalle_compras (
                id_compra,
                id_producto,
                cantidad,
                precio_unitario,
                descuento,
                subtotal
            )
            VALUES (
                v_compra_id,
                v_producto_id,
                v_qty,
                v_price,
                0,
                ROUND((v_price * v_qty)::NUMERIC, 2)
            );


            v_subtotal :=
                v_subtotal
                + ROUND((v_price * v_qty)::NUMERIC, 2);


            -- La compra aumenta el stock.
            UPDATE productos
            SET stock = stock + v_qty,
                precio_compra = v_price
            WHERE id_producto = v_producto_id;


            -- Actualizar relación producto-proveedor.
            INSERT INTO producto_proveedor (
                id_producto,
                id_proveedor,
                precio_compra,
                tiempo_entrega_dias,
                es_proveedor_principal,
                fecha_asociacion
            )
            VALUES (
                v_producto_id,
                v_proveedor_id,
                v_price,
                2 + ((v_purchase_index + v_line_index) % 10),
                (v_line_index = 0),
                v_fecha
            )
            ON CONFLICT (id_producto, id_proveedor)
            DO UPDATE SET
                precio_compra = EXCLUDED.precio_compra,
                tiempo_entrega_dias = EXCLUDED.tiempo_entrega_dias;

        END LOOP;


        v_impuesto :=
            ROUND((v_subtotal * 0.19)::NUMERIC, 2);

        v_total :=
            ROUND((v_subtotal + v_impuesto)::NUMERIC, 2);


        UPDATE compras
        SET subtotal = v_subtotal,
            impuesto = v_impuesto,
            descuento = 0,
            total = v_total
        WHERE id_compra = v_compra_id;

    END LOOP;

END $$;


-- ============================================================
-- 2. VENTAS HISTÓRICAS
-- ============================================================

DO $$
DECLARE
    v_product_count INT;
    v_client_count INT;
    v_employee_count INT;

    v_product_ids INT[];
    v_client_ids INT[];
    v_employee_ids INT[];

    v_venta_id INT;
    v_cliente_id INT;
    v_empleado_id INT;
    v_producto_id INT;

    v_sale_index INT;
    v_line_count INT;
    v_line_index INT;
    v_idx INT;

    v_qty INT;
    v_stock INT;
    v_price NUMERIC(10,2);

    v_subtotal NUMERIC(10,2);
    v_impuesto NUMERIC(10,2);
    v_descuento NUMERIC(10,2);
    v_total NUMERIC(10,2);
    v_line_subtotal NUMERIC(10,2);

    v_fecha TIMESTAMP;
    v_estado_venta INT;

    v_pago_monto NUMERIC(10,2);
    v_metodo_pago INT;

    v_rand NUMERIC;
    v_client_position INT;
    v_product_position INT;
BEGIN

    SELECT COUNT(*)
    INTO v_product_count
    FROM productos
    WHERE estado = TRUE;

    SELECT COUNT(*)
    INTO v_client_count
    FROM clientes
    WHERE estado = TRUE;

    SELECT COUNT(*)
    INTO v_employee_count
    FROM empleados
    WHERE estado = TRUE;


    IF v_product_count < 1 THEN
        RAISE EXCEPTION 'No existen productos activos.';
    END IF;

    IF v_client_count < 1 THEN
        RAISE EXCEPTION 'No existen clientes activos.';
    END IF;

    IF v_employee_count < 1 THEN
        RAISE EXCEPTION 'No existen empleados activos.';
    END IF;


    SELECT ARRAY_AGG(id_producto ORDER BY id_producto)
    INTO v_product_ids
    FROM productos
    WHERE estado = TRUE;

    SELECT ARRAY_AGG(id_cliente ORDER BY id_cliente)
    INTO v_client_ids
    FROM clientes
    WHERE estado = TRUE;

    SELECT ARRAY_AGG(id_empleado ORDER BY id_empleado)
    INTO v_employee_ids
    FROM empleados
    WHERE estado = TRUE;


    -- ========================================================
    -- 650 VENTAS
    --
    -- Enero       45
    -- Febrero     50
    -- Marzo       55
    -- Abril       60
    -- Mayo        65
    -- Junio       75
    -- Julio       85
    -- Agosto      95
    -- Septiembre 120
    --
    -- Total = 650
    -- ========================================================

    FOR v_sale_index IN 1..650 LOOP


        -- ----------------------------------------------------
        -- FECHA
        -- ----------------------------------------------------

        IF v_sale_index <= 45 THEN

            v_fecha :=
                TIMESTAMP '2026-01-01 08:00:00'
                + ((v_sale_index * 2) % 31)
                  * INTERVAL '1 day'
                + ((v_sale_index * 47) % 10)
                  * INTERVAL '1 hour';


        ELSIF v_sale_index <= 95 THEN

            v_fecha :=
                TIMESTAMP '2026-02-01 08:00:00'
                + (((v_sale_index - 46) * 2) % 28)
                  * INTERVAL '1 day'
                + ((v_sale_index * 31) % 10)
                  * INTERVAL '1 hour';


        ELSIF v_sale_index <= 150 THEN

            v_fecha :=
                TIMESTAMP '2026-03-01 08:00:00'
                + (((v_sale_index - 96) * 2) % 31)
                  * INTERVAL '1 day'
                + ((v_sale_index * 37) % 10)
                  * INTERVAL '1 hour';


        ELSIF v_sale_index <= 210 THEN

            v_fecha :=
                TIMESTAMP '2026-04-01 08:00:00'
                + (((v_sale_index - 151) * 2) % 30)
                  * INTERVAL '1 day'
                + ((v_sale_index * 41) % 10)
                  * INTERVAL '1 hour';


        ELSIF v_sale_index <= 275 THEN

            v_fecha :=
                TIMESTAMP '2026-05-01 08:00:00'
                + (((v_sale_index - 211) * 2) % 31)
                  * INTERVAL '1 day'
                + ((v_sale_index * 43) % 10)
                  * INTERVAL '1 hour';


        ELSIF v_sale_index <= 350 THEN

            v_fecha :=
                TIMESTAMP '2026-06-01 08:00:00'
                + (((v_sale_index - 276) * 2) % 30)
                  * INTERVAL '1 day'
                + ((v_sale_index * 53) % 10)
                  * INTERVAL '1 hour';


        ELSIF v_sale_index <= 435 THEN

            v_fecha :=
                TIMESTAMP '2026-07-01 08:00:00'
                + (((v_sale_index - 351) * 2) % 31)
                  * INTERVAL '1 day'
                + ((v_sale_index * 59) % 10)
                  * INTERVAL '1 hour';


        ELSIF v_sale_index <= 530 THEN

            v_fecha :=
                TIMESTAMP '2026-08-01 08:00:00'
                + (((v_sale_index - 436) * 2) % 31)
                  * INTERVAL '1 day'
                + ((v_sale_index * 61) % 10)
                  * INTERVAL '1 hour';


        ELSE

            -- Septiembre solamente hasta el día 12.
            v_fecha :=
                TIMESTAMP '2026-09-01 08:00:00'
                + (((v_sale_index - 531) * 11) % 12)
                  * INTERVAL '1 day'
                + ((v_sale_index * 67) % 10)
                  * INTERVAL '1 hour';

        END IF;


        -- ----------------------------------------------------
        -- CLIENTE
        -- ----------------------------------------------------

        v_rand := random();


        IF v_rand < 0.35 THEN

            -- Clientes recurrentes.
            v_client_position :=
                1
                + ((v_sale_index * 7)
                   % LEAST(v_client_count, 10));

        ELSIF v_rand < 0.65 THEN

            -- Segundo grupo de clientes.
            v_client_position :=
                1
                + ((v_sale_index * 11)
                   % LEAST(v_client_count, 25));

        ELSE

            -- Cualquier cliente.
            v_client_position :=
                1
                + ((v_sale_index * 17)
                   % v_client_count);

        END IF;


        v_cliente_id := v_client_ids[v_client_position];


        -- ----------------------------------------------------
        -- EMPLEADO
        -- ----------------------------------------------------

        v_empleado_id :=
            v_employee_ids[
                1 + ((v_sale_index * 13)
                     % v_employee_count)
            ];


        -- ----------------------------------------------------
        -- ESTADO DE VENTA
        --
        -- 83% pagada
        -- 12% pendiente
        --  5% anulada
        -- ----------------------------------------------------

        v_rand := random();


        IF v_rand < 0.83 THEN
            v_estado_venta := 2;

        ELSIF v_rand < 0.95 THEN
            v_estado_venta := 1;

        ELSE
            v_estado_venta := 3;
        END IF;


        -- ----------------------------------------------------
        -- CANTIDAD DE LÍNEAS
        -- ----------------------------------------------------

        v_rand := random();

        IF v_rand < 0.50 THEN
            v_line_count := 1;

        ELSIF v_rand < 0.82 THEN
            v_line_count := 2;

        ELSE
            v_line_count := 3;
        END IF;


        v_subtotal := 0;
        v_descuento := 0;


        -- ----------------------------------------------------
        -- CABECERA
        -- ----------------------------------------------------

        INSERT INTO ventas (
            id_cliente,
            id_empleado,
            id_estado_venta,
            fecha_venta,
            subtotal,
            impuesto,
            descuento,
            total
        )
        VALUES (
            v_cliente_id,
            v_empleado_id,
            v_estado_venta,
            v_fecha,
            0,
            0,
            0,
            0
        )
        RETURNING id_venta INTO v_venta_id;


        -- ----------------------------------------------------
        -- DETALLES
        -- ----------------------------------------------------

        FOR v_line_index IN 0..(v_line_count - 1) LOOP


            -- 30%: productos de mayor demanda.
            -- 25%: segundo grupo.
            -- 45%: resto.
            v_rand := random();


            IF v_rand < 0.30 THEN

                v_product_position :=
                    1
                    + ((v_sale_index * 5 + v_line_index * 3)
                       % LEAST(v_product_count, 10));


            ELSIF v_rand < 0.55 THEN

                v_product_position :=
                    1
                    + ((v_sale_index * 7 + v_line_index * 5)
                       % LEAST(v_product_count, 20));


            ELSE

                v_product_position :=
                    1
                    + ((v_sale_index * 11 + v_line_index * 7)
                       % v_product_count);

            END IF;


            v_producto_id := v_product_ids[v_product_position];


            -- Evitar producto repetido dentro de la misma venta.
            IF v_line_index > 0 THEN

                SELECT COUNT(*)
                INTO v_idx
                FROM detalle_ventas
                WHERE id_venta = v_venta_id
                  AND id_producto = v_producto_id;


                IF v_idx > 0 THEN

                    v_producto_id :=
                        v_product_ids[
                            1
                            + ((v_product_position
                                + v_line_index + 3)
                               % v_product_count)
                        ];

                END IF;

            END IF;


            -- Buscar stock y precio.
            SELECT stock, precio_venta
            INTO v_stock, v_price
            FROM productos
            WHERE id_producto = v_producto_id
            FOR UPDATE;


            -- Si el producto elegido no tiene stock,
            -- buscar otro producto disponible.
            IF v_stock < 1 THEN

                SELECT
                    p.id_producto,
                    p.precio_venta,
                    p.stock
                INTO
                    v_producto_id,
                    v_price,
                    v_stock
                FROM productos p
                WHERE p.estado = TRUE
                  AND p.stock >= 1
                ORDER BY
                    CASE
                        WHEN p.id_producto =
                             v_product_ids[v_product_position]
                        THEN 0
                        ELSE 1
                    END,
                    p.id_producto
                LIMIT 1;

            END IF;


            IF v_stock IS NULL OR v_stock < 1 THEN
                RAISE EXCEPTION
                    'No hay stock suficiente para continuar. Venta %.',
                    v_sale_index;
            END IF;


            -- 1 a 3 unidades.
            v_qty :=
                1 + ((v_sale_index + v_line_index) % 3);


            -- Nunca vender más stock del disponible.
            IF v_qty > v_stock THEN
                v_qty := v_stock;
            END IF;


            v_line_subtotal :=
                ROUND((v_price * v_qty)::NUMERIC, 2);


            INSERT INTO detalle_ventas (
                id_venta,
                id_producto,
                cantidad,
                precio_unitario,
                descuento,
                subtotal
            )
            VALUES (
                v_venta_id,
                v_producto_id,
                v_qty,
                v_price,
                0,
                v_line_subtotal
            );


            v_subtotal :=
                v_subtotal + v_line_subtotal;


            -- Una venta anulada no afecta el stock.
            IF v_estado_venta <> 3 THEN

                UPDATE productos
                SET stock = stock - v_qty
                WHERE id_producto = v_producto_id;

            END IF;

        END LOOP;


        -- ----------------------------------------------------
        -- DESCUENTO
        -- ----------------------------------------------------

        v_rand := random();


        IF v_rand < 0.12 THEN

            v_descuento :=
                ROUND((v_subtotal * 0.05)::NUMERIC, 2);

        ELSIF v_rand < 0.17 THEN

            v_descuento :=
                ROUND((v_subtotal * 0.08)::NUMERIC, 2);

        ELSIF v_rand < 0.20 THEN

            v_descuento :=
                ROUND((v_subtotal * 0.10)::NUMERIC, 2);

        ELSE

            v_descuento := 0;

        END IF;


        -- ----------------------------------------------------
        -- IVA
        -- ----------------------------------------------------

        v_impuesto :=
            ROUND(
                ((v_subtotal - v_descuento) * 0.19)::NUMERIC,
                2
            );


        v_total :=
            ROUND(
                (v_subtotal + v_impuesto - v_descuento)::NUMERIC,
                2
            );


        -- ----------------------------------------------------
        -- ACTUALIZAR VENTA
        -- ----------------------------------------------------

        UPDATE ventas
        SET subtotal = v_subtotal,
            impuesto = v_impuesto,
            descuento = v_descuento,
            total = v_total
        WHERE id_venta = v_venta_id;


        -- ====================================================
        -- PAGOS
        -- ====================================================


        IF v_estado_venta = 2 THEN

            -- Venta pagada completamente.
            v_rand := random();

            IF v_rand < 0.40 THEN
                v_metodo_pago := 1;

            ELSIF v_rand < 0.65 THEN
                v_metodo_pago := 2;

            ELSIF v_rand < 0.85 THEN
                v_metodo_pago := 3;

            ELSE
                v_metodo_pago := 4;
            END IF;


            INSERT INTO pagos (
                id_venta,
                id_metodo_pago,
                id_estado_pago,
                monto,
                fecha_pago,
                referencia
            )
            VALUES (
                v_venta_id,
                v_metodo_pago,
                1,
                v_total,
                v_fecha + INTERVAL '5 minutes',
                'SEED-V7-PAGO-' || v_venta_id
            );


        ELSIF v_estado_venta = 1 THEN

            -- Pago parcial entre 35% y 80%.
            -- CAST a NUMERIC para evitar:
            -- function round(double precision, integer) does not exist.
            v_pago_monto :=
                ROUND(
                    (
                        v_total
                        * (0.35 + random() * 0.45)
                    )::NUMERIC,
                    2
                );


            IF v_pago_monto >= v_total THEN
                v_pago_monto :=
                    ROUND((v_total * 0.70)::NUMERIC, 2);
            END IF;


            v_rand := random();

            IF v_rand < 0.45 THEN
                v_metodo_pago := 1;

            ELSIF v_rand < 0.70 THEN
                v_metodo_pago := 2;

            ELSIF v_rand < 0.90 THEN
                v_metodo_pago := 3;

            ELSE
                v_metodo_pago := 4;
            END IF;


            INSERT INTO pagos (
                id_venta,
                id_metodo_pago,
                id_estado_pago,
                monto,
                fecha_pago,
                referencia
            )
            VALUES (
                v_venta_id,
                v_metodo_pago,
                1,
                v_pago_monto,
                v_fecha + INTERVAL '5 minutes',
                'SEED-V7-PAGO-PARCIAL-' || v_venta_id
            );


        ELSE

            -- Venta anulada:
            -- pagamento registrado como reembolsado.
            v_pago_monto := v_total;


            v_rand := random();

            IF v_rand < 0.40 THEN
                v_metodo_pago := 1;

            ELSIF v_rand < 0.65 THEN
                v_metodo_pago := 2;

            ELSIF v_rand < 0.85 THEN
                v_metodo_pago := 3;

            ELSE
                v_metodo_pago := 4;
            END IF;


            INSERT INTO pagos (
                id_venta,
                id_metodo_pago,
                id_estado_pago,
                monto,
                fecha_pago,
                referencia
            )
            VALUES (
                v_venta_id,
                v_metodo_pago,
                3,
                v_pago_monto,
                v_fecha + INTERVAL '5 minutes',
                'SEED-V7-REEMBOLSO-' || v_venta_id
            );

        END IF;

    END LOOP;

END $$;


-- ============================================================
-- 3. VERIFICACIÓN FINAL
-- ============================================================

DO $$
DECLARE
    v_ventas INT;
    v_compras INT;
    v_detalle_ventas INT;
    v_detalle_compras INT;
    v_pagadas INT;
    v_pendientes INT;
    v_anuladas INT;
BEGIN

    SELECT COUNT(*)
    INTO v_ventas
    FROM ventas;

    SELECT COUNT(*)
    INTO v_compras
    FROM compras;

    SELECT COUNT(*)
    INTO v_detalle_ventas
    FROM detalle_ventas;

    SELECT COUNT(*)
    INTO v_detalle_compras
    FROM detalle_compras;

    SELECT COUNT(*)
    INTO v_pagadas
    FROM ventas
    WHERE id_estado_venta = 2;

    SELECT COUNT(*)
    INTO v_pendientes
    FROM ventas
    WHERE id_estado_venta = 1;

    SELECT COUNT(*)
    INTO v_anuladas
    FROM ventas
    WHERE id_estado_venta = 3;


    RAISE NOTICE '==============================================';
    RAISE NOTICE 'SEED V7 COMPLETADO CORRECTAMENTE';
    RAISE NOTICE 'Ventas totales: %', v_ventas;
    RAISE NOTICE 'Compras totales: %', v_compras;
    RAISE NOTICE 'Detalles de ventas: %', v_detalle_ventas;
    RAISE NOTICE 'Detalles de compras: %', v_detalle_compras;
    RAISE NOTICE 'Ventas pagadas: %', v_pagadas;
    RAISE NOTICE 'Ventas pendientes: %', v_pendientes;
    RAISE NOTICE 'Ventas anuladas: %', v_anuladas;
    RAISE NOTICE '==============================================';

END $$;


COMMIT;


BEGIN;

DELETE FROM pagos
WHERE id_venta IN (
    SELECT id_venta
    FROM ventas
    WHERE fecha_venta > CURRENT_TIMESTAMP
);

DELETE FROM detalle_ventas
WHERE id_venta IN (
    SELECT id_venta
    FROM ventas
    WHERE fecha_venta > CURRENT_TIMESTAMP
);

DELETE FROM ventas
WHERE fecha_venta > CURRENT_TIMESTAMP;

COMMIT;