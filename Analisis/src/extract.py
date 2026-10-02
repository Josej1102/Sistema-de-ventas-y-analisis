import pandas as pd

from config.database import get_connection


TABLAS = [
    "ventas",
    "clientes",
    "categorias",
    "productos",
    "proveedores",
    "empleados",
    "detalle_ventas",
    "compras",
    "detalle_compras",
    "pagos",
    "producto_proveedor",
    "estados_pago",
    "estados_venta",
    "metodos_pago"
]


def cargar_tabla(nombre_tabla):
    conexion = get_connection()

    try:

        if nombre_tabla == "empleados":

            consulta = """
                SELECT
                    id_empleado,
                    nombre,
                    apellido,
                    cargo,
                    telefono,
                    email,
                    fecha_contratacion,
                    estado
                FROM empleados
            """

        else:

            consulta = f"SELECT * FROM {nombre_tabla}"

        df = pd.read_sql_query(
            consulta,
            conexion
        )

        return df

    finally:
        conexion.close()


def cargar_todas_tablas():

    datos = {}

    for tabla in TABLAS:

        print(f"Cargando tabla: {tabla}")

        datos[tabla] = cargar_tabla(tabla)

    return datos


def cargar_datos_dashboard():

    tablas_dashboard = [
        "ventas",
        "detalle_ventas",
        "productos",
        "categorias",
        "clientes",
        "empleados",
        "pagos",
        "metodos_pago",
        "estados_venta",
        "estados_pago"
    ]

    datos = {}

    for tabla in tablas_dashboard:

        datos[tabla] = cargar_tabla(tabla)

    return datos


if __name__ == "__main__":

    datos = cargar_todas_tablas()

    for nombre, df in datos.items():

        print(f"\n--- {nombre} ---")
        print(f"Filas: {len(df)}")
        print(f"Columnas: {len(df.columns)}")

        ruta_archivo = f"data/raw/{nombre}_raw.csv"

        df.to_csv(
            ruta_archivo,
            index=False
        )

        print(f"Guardado: {ruta_archivo}")