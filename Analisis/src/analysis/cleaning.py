import pandas as pd


def limpiar_textos(df):

    df = df.copy()

    columnas_texto = df.select_dtypes(
        include=["object", "string"]
    ).columns

    for columna in columnas_texto:

        df[columna] = (
            df[columna]
            .astype("string")
            .str.strip()
        )

    return df


def convertir_a_texto(df, columnas):

    df = df.copy()

    for columna in columnas:

        if columna in df.columns:

            df[columna] = (
                df[columna]
                .astype("string")
                .str.strip()
            )

    return df


def convertir_fechas(df, columnas):

    df = df.copy()

    for columna in columnas:

        if columna in df.columns:

            df[columna] = pd.to_datetime(
                df[columna],
                errors="coerce"
            )

    return df


def limpiar_tablas(tablas):

    tablas = {
        nombre: df.copy()
        for nombre, df in tablas.items()
    }

    if "categorias" in tablas:

        df = tablas["categorias"]

        df = limpiar_textos(df)

        df = convertir_fechas(
            df,
            ["fecha_creacion"]
        )

        tablas["categorias"] = df

    if "clientes" in tablas:

        df = tablas["clientes"]

        df = convertir_a_texto(
            df,
            [
                "numero_documento",
                "telefono"
            ]
        )

        df = limpiar_textos(df)

        df = convertir_fechas(
            df,
            ["fecha_registro"]
        )

        tablas["clientes"] = df


    if "empleados" in tablas:

        df = tablas["empleados"]

        df = convertir_a_texto(
            df,
            ["telefono"]
        )

        df = limpiar_textos(df)

        df = convertir_fechas(
            df,
            ["fecha_contratacion"]
        )

        if "password_hash" in df.columns:

            df = df.drop(
                columns=["password_hash"]
            )

        tablas["empleados"] = df


    if "proveedores" in tablas:

        df = tablas["proveedores"]

        df = convertir_a_texto(
            df,
            ["telefono"]
        )

        df = limpiar_textos(df)

        tablas["proveedores"] = df


    if "productos" in tablas:

        df = tablas["productos"]

        df = limpiar_textos(df)

        df = convertir_fechas(
            df,
            ["fecha_creacion"]
        )

        tablas["productos"] = df


    if "producto_proveedor" in tablas:

        df = tablas["producto_proveedor"]

        df = convertir_fechas(
            df,
            ["fecha_asociacion"]
        )

        tablas["producto_proveedor"] = df


    if "ventas" in tablas:

        df = tablas["ventas"]

        df = convertir_fechas(
            df,
            ["fecha_venta"]
        )

        tablas["ventas"] = df


    if "detalle_ventas" in tablas:

        df = tablas["detalle_ventas"]

        tablas["detalle_ventas"] = df


    if "pagos" in tablas:

        df = tablas["pagos"]

        df = limpiar_textos(df)

        df = convertir_fechas(
            df,
            ["fecha_pago"]
        )

        tablas["pagos"] = df


    if "compras" in tablas:

        df = tablas["compras"]

        df = convertir_fechas(
            df,
            ["fecha_compra"]
        )

        tablas["compras"] = df


    if "detalle_compras" in tablas:

        df = tablas["detalle_compras"]

        tablas["detalle_compras"] = df


    for tabla in [
        "estados_pago",
        "estados_venta",
        "metodos_pago"
    ]:

        if tabla in tablas:

            tablas[tabla] = limpiar_textos(
                tablas[tabla]
            )


    return tablas