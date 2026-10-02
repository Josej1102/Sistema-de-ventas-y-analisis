import sys
from pathlib import Path

import pandas as pd
import streamlit as st

BASE_DIR = Path(__file__).resolve().parents[1]

SRC_DIR = BASE_DIR / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.append(str(SRC_DIR))
    
sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.extract import cargar_datos_dashboard
from src.analysis.cleaning import limpiar_tablas


##Configuración visual
st.set_page_config(
    page_title="Seguimiento ventas",
    layout="wide"
)

st.markdown(
    """
    <style>

    .main {
        background-color: #0e1117;
    }

    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    [data-testid="stMetricValue"] {
        font-size: 1.6rem;
    }

    [data-testid="stMetricValue"] > div {
        overflow: visible;
        text-overflow: clip;
        white-space: nowrap;
    }

    </style>
    """,
    unsafe_allow_html=True
)


@st.cache_data(ttl=60)
def obtener_datos():
    
    datos = cargar_datos_dashboard()
    
    datos = limpiar_tablas(datos)
    
    return datos

#Funciones auxiliares

def formatear_dinero(valor):

    if pd.isna(valor):
        valor = 0

    return f"${valor:,.0f}"


def preparar_datos(datos):
    
    ventas = datos["ventas"].copy()

    detalle_ventas = datos["detalle_ventas"].copy()

    productos = datos["productos"].copy()

    categorias = datos["categorias"].copy()

    clientes = datos["clientes"].copy()

    pagos = datos["pagos"].copy()

    empleados = datos["empleados"].copy()

    metodos_pago = datos["metodos_pago"].copy()

    estados_venta = datos["estados_venta"].copy()
    
    estados_pago = datos["estados_pago"].copy()
    
    
    
    #Ventas
    
    ventas["fecha_venta"] = pd.to_datetime(
        ventas["fecha_venta"],
        errors="coerce"
    )

    ventas["total"] = pd.to_numeric(
        ventas["total"],
        errors="coerce"
    ).fillna(0)
    
    #Detalle ventas
    
    detalle_ventas["cantidad"] = pd.to_numeric(
            detalle_ventas["cantidad"],
            errors="coerce"
        ).fillna(0)
    
    detalle_ventas["subtotal"] = pd.to_numeric(
            detalle_ventas["subtotal"],
            errors="coerce"
            ).fillna(0)
    
    # Productos

    productos["precio_venta"] = pd.to_numeric(
        productos["precio_venta"],
        errors="coerce"
    ).fillna(0)

    productos["stock"] = pd.to_numeric(
        productos["stock"],
        errors="coerce"
    ).fillna(0)

    productos["stock_minimo"] = pd.to_numeric(
        productos["stock_minimo"],
        errors="coerce"
    ).fillna(0)


    # Pagos

    pagos["monto"] = pd.to_numeric(
        pagos["monto"],
        errors="coerce"
    ).fillna(0)
    
    # Relaciones
    # 1. Productos -> Categorias
    
    detalle_productos = detalle_ventas.merge(
        productos[
            ["id_producto", "nombre", "id_categoria"]
        ],
        on="id_producto",
        how="left"
    )
    
    detalle_productos = detalle_productos.merge(
        categorias[
            ["id_categoria", "nombre"]
        ],
        on="id_categoria",
        how="left",
        suffixes=("", "_categoria")
    )
    
    # 2. Ventas -> Clientes
    
    ventas_clientes = ventas.merge(
        clientes[
            [
                "id_cliente",
                "nombre",
                "apellido",
                "ciudad"
            ]
        ],
        on="id_cliente",
        how="left",
        suffixes=("", "_cliente")
    )
    
    # 3. Ventas -> Empleados
    
    ventas_empleados = ventas_clientes.merge(
        empleados[
            ["id_empleado", "nombre", "apellido"]
        ],
        on="id_empleado",
        how="left",
        suffixes=("", "_empleado")
    )
    
    # 4. Ventas -> Estado venta
    
    ventas_completas = ventas_empleados.merge(
        estados_venta[
            ["id_estado_venta", "nombre"]
        ],
        on="id_estado_venta",
        how="left",
        suffixes=("", "_estado")
    )
    
    # 5. Pagos -> Metodos
    
    pagos_metodos = pagos.merge(
        metodos_pago[
            [
                "id_metodo_pago",
                "nombre"
            ]
        ],
        on="id_metodo_pago",
        how="left",
        suffixes=("", "_metodo")
    )
    
    return {
        "ventas": ventas_completas,
        "detalle": detalle_productos,
        "productos": productos,
        "categorias": categorias,
        "clientes": clientes,
        "pagos": pagos_metodos,
    }
    
try:
    
    datos = obtener_datos()
    
    datos = preparar_datos(datos)
    
except Exception as error:
    st.error(
        f"Error al cargar los datos desde Supabase: {error}"
    )

    st.stop()
    
ventas = datos["ventas"]
detalle = datos["detalle"]
productos = datos["productos"]
categorias = datos["categorias"]
clientes = datos["clientes"]
pagos = datos["pagos"]

st.title("Seguimiento ventas")

st.caption(
    "Dashboard conectado directamente a Supabase"
)

with st.sidebar:
    
    st.header("Filtros")
    
    # FECHAS
    
    fecha_min = ventas["fecha_venta"].min()
    fecha_max = ventas["fecha_venta"].max()
    
    
    if pd.isna(fecha_min) or pd.isna(fecha_max):

        st.warning("No existen fechas de venta válidas.")

        st.stop()
        
    rango_fechas = st.date_input(
        "Periodo", 
        value=(fecha_min.date(),
               fecha_max.date()
        ),
        min_value=fecha_min.date(),
        max_value=fecha_max.date()
        )
    
    # CATEGORIAS
    
    categorias_disponibles = sorted(
        detalle["nombre_categoria"]
        .dropna()
        .unique()
        .tolist()
    )
    
    categorias_seleccionadas = st.multiselect(
        "Categorias",
        categorias_disponibles
    )
    
    # CIUDADES
    
    ciudades_disponibles = sorted(
        ventas["ciudad"]
        .dropna()
        .unique()
        .tolist()
    )
    
    ciudades_seleccionadas = st.multiselect(
        "Ciudades",
        ciudades_disponibles
    )
    
    # ESTADO VENTAS
    
    estados = sorted(
        ventas["nombre_estado"]
        .dropna()
        .unique()
        .tolist()
    )

    estados_seleccionados = st.multiselect(
        "Estado de venta",
        estados
    )


    st.divider()


    if st.button(
        "Actualizar datos",
        use_container_width=True
    ):

        obtener_datos.clear()

        st.rerun()
        
ventas_filtradas = ventas.copy()
detalles_filtrado = detalle.copy()


# Filtras ventas por fecha

if isinstance(rango_fechas, tuple) and len(rango_fechas) == 2:
    
    fecha_inicio = pd.Timestamp(
        rango_fechas[0]
    )
    
    fecha_fin = (
        pd.Timestamp(rango_fechas[1])
        + pd.Timedelta(days=1)
        - pd.Timedelta(seconds=1)
    )
    
    ventas_filtradas = ventas_filtradas[
        ventas_filtradas["fecha_venta"].between(
            fecha_inicio,
            fecha_fin
        )
    ]
    
# FILTRO DE VENTAS POR ESTADO

if estados_seleccionados:
    
    ventas_filtradas = ventas_filtradas[
        ventas_filtradas["nombre_estado"].isin(estados_seleccionados)
    ]
    
# FILTRO DE VENTAS POR CIUDAD

if ciudades_seleccionadas:
    
    ventas_filtradas = ventas_filtradas[
        ventas_filtradas["ciudad"].isin(ciudades_seleccionadas)
    ]
    
if categorias_seleccionadas:
    
    ids_ventas_categorias = detalles_filtrado[
        detalles_filtrado["nombre_categoria"].isin(categorias_seleccionadas)
    ]["id_venta"].unique()
    
    ventas_filtradas = ventas_filtradas[
        ventas_filtradas["id_venta"].isin(
            ids_ventas_categorias
        )
    ]

    detalle_filtrado = detalles_filtrado[
        detalles_filtrado["nombre_categoria"].isin(
            categorias_seleccionadas
        )
    ]
    
    
# SE EXCLUYEN VENTAS NULAS

ventas_activas = ventas_filtradas[
    ventas_filtradas["nombre_estado"] != "Anulada"
].copy()

# VALOR PENDIENTE EN LAS VENTAS

ventas_pendientes = ventas_filtradas[
    ventas_filtradas["nombre_estado"] == "Pendiente"
].copy()

# KPI´S

ventas_total = ventas_activas["total"].sum()

total_pendiente = ventas_pendientes["total"].sum()

cantidad_ventas = ventas_activas[
    "id_venta"
].nunique()

ticket_promedio = (
    ventas_total / cantidad_ventas
    if cantidad_ventas > 0
    else 0
)

clientes_activos = ventas_activas[
    "id_cliente"
].nunique()


col1, col2, col3, col4, col5 = st.columns(5)

with col1:

    st.metric(
        "Ventas totales",
        formatear_dinero(
            ventas_total
        )
    )


with col2:

    st.metric(
        "Cantidad de ventas",
        f"{cantidad_ventas:,}"
    )


with col3:

    st.metric(
        "Ticket promedio",
        formatear_dinero(
            ticket_promedio
        )
    )


with col4:

    st.metric(
        "Clientes",
        f"{clientes_activos:,}"
    )
    
with col5:
    
    st.metric(
        "Pendiente de pago",
        formatear_dinero(
            total_pendiente
        )
    )
    
# GRÁFICA DE VENTAS POR MES

st.subheader("Evolución de ventas")

ventas_mes = (
    ventas_activas
    .assign(
        mes=lambda x:
        x["fecha_venta"].dt.to_period("M").astype(str)
    )
    .groupby("mes", as_index=False)["total"]
    .sum()
)

ventas_mes = ventas_mes.rename(
    columns={
        "total": "Ventas"
    }
)

ventas_mes = ventas_mes.set_index("mes")

st.line_chart(
    ventas_mes
)


# Barra de ventas por categoria y barra de ventas por ciudad

col1, col2 = st.columns(2)

with col1: 
    
    st.subheader("Ventas por categoría")
    
    ventas_categoria = (
        detalles_filtrado
        .groupby(
            "nombre_categoria",
            as_index = False
        )["subtotal"].sum()
        .sort_values("subtotal", ascending= False)
    )

    ventas_categoria = ventas_categoria.rename(
        columns={
            "nombre_categoria": "Categoría",
            "subtotal": "Ingresos"
        }
    )

    ventas_categoria = ventas_categoria.set_index(
        "Categoría"
    )

    st.bar_chart(
        ventas_categoria
    )
    
with col2: 
    
    st.subheader("Ventas por ciudad")
    
    ventas_ciudad = (
        ventas_filtradas.groupby("ciudad", as_index=False)
        ["total"].sum().sort_values("total", ascending=True)
    )
    
    ventas_ciudad = ventas_ciudad.rename(
        columns={
            "ciudad": "Ciudad",
            "total": "Ventas"
        }
    )
    
    ventas_ciudad = ventas_ciudad.set_index(
        "Ciudad"
    )
    
    st.bar_chart(
        ventas_ciudad
    )
    
    
#  productos más vendidos

st.subheader(
    "Productos más vendidos"
)


productos_vendidos = (
    detalles_filtrado
    .groupby(
        "nombre",
        as_index=False
    )["cantidad"]
    .sum()
    .sort_values(
        "cantidad",
        ascending=False
    )
    .head(10)
)

productos_vendidos = productos_vendidos.rename(
    columns={
        "nombre": "Producto",
        "cantidad": "Unidades"
    }
)

productos_vendidos = productos_vendidos.set_index(
    "Producto"
)

st.bar_chart(
    productos_vendidos
)

# Entradas por metodos de pago

col1, col2 = st.columns(2)


with col1:

    st.subheader(
        "Métodos de pago"
    )

    pagos_aprobados = pagos[
        pagos["id_estado_pago"] == 1
    ].copy()

    metodos = (
        pagos_aprobados
        .groupby(
            "nombre",
            as_index=False
        )["monto"]
        .sum()
        .sort_values(
            "monto",
            ascending=False
        )
    )

    metodos = metodos.rename(
        columns={
            "nombre": "Método",
            "monto": "Monto"
        }
    )

    metodos = metodos.set_index(
        "Método"
    )

    st.bar_chart(
        metodos
    )
    
# TABLA DE ALERTA DE STOCK BAJO

with col2:

    st.subheader(
        "Productos con stock bajo"
    )

    stock_bajo = productos[
        productos["stock"] <= productos["stock_minimo"]
    ][
        [
            "nombre",
            "stock",
            "stock_minimo"
        ]
    ].sort_values(
        "stock"
    )

    stock_bajo = stock_bajo.rename(
        columns={
            "nombre": "Producto",
            "stock": "Stock",
            "stock_minimo": "Mínimo"
        }
    )

    st.dataframe(
        stock_bajo,
        use_container_width=True,
        hide_index=True
    )


# VENTAS RECIENTES

st.subheader(
    "Ventas recientes"
)

ventas_recientes = (
    ventas_filtradas
    [
        [
            "id_venta",
            "numero_factura",
            "fecha_venta",
            "nombre",
            "apellido",
            "total",
            "nombre_estado"
        ]
    ]
    .sort_values(
        "fecha_venta",
        ascending=False
    )
    .head(15)
    .copy()
)


ventas_recientes["fecha_venta"] = (
    ventas_recientes["fecha_venta"]
    .dt.strftime("%d/%m/%Y %H:%M")
)


ventas_recientes["cliente"] = (
    ventas_recientes["nombre"].fillna("")
    + " "
    + ventas_recientes["apellido"].fillna("")
)


ventas_recientes["total"] = (
    ventas_recientes["total"]
    .map(formatear_dinero)
)


ventas_recientes = ventas_recientes[
    [
        "id_venta",
        "numero_factura",
        "fecha_venta",
        "cliente",
        "total",
        "nombre_estado"
    ]
]


st.dataframe(
    ventas_recientes,
    use_container_width=True,
    hide_index=True
)


# INFORMACIÓN DE ACTUALIZACIÓN

st.divider()

st.caption(
    "Los datos se consultan directamente desde Supabase. "
    "El dashboard actualiza la información almacenada en caché "
    "cada 60 segundos."
)