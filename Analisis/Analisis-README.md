# Analisis --- Python, ETL y Streamlit

## Descripción

La carpeta `Analisis/` contiene el componente de análisis de datos del
proyecto.

Su objetivo es transformar los datos operacionales del sistema de ventas
en información útil para análisis y visualización.

Actualmente contiene:

-   Conexión a PostgreSQL.
-   Extracción de tablas.
-   Limpieza y transformación.
-   Exploración de datos.
-   Datos `raw` y `processed`.
-   Aplicación analítica con Streamlit.

``` text
PostgreSQL / Supabase
        ↓
    extracción
        ↓
     limpieza
        ↓
     Pandas
        ↓
   análisis
        ↓
   Streamlit
```

## Tecnologías

-   Python 3.11.
-   Pandas.
-   psycopg.
-   SQLAlchemy.
-   python-dotenv.
-   Streamlit.

## Estructura

``` text
Analisis/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── src/
│   ├── config/
│   │   └── database.py
│   │
│   ├── analysis/
│   │   ├── cleaning.py
│   │   ├── exploracion.py
│   │   └── limpieza.txt
│   │
│   └── extract.py
│
├── streamlit/
│   └── app.py
│
├── requirements.txt
├── .env
└── .gitignore
```

## Conexión a la base de datos

`src/config/database.py` utiliza `psycopg` para conectarse a PostgreSQL.

Las credenciales se obtienen desde `.env`.

Ejemplo:

``` env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

El archivo no debe publicarse con credenciales reales.

## Extracción

`src/extract.py` define las tablas que pueden extraerse:

``` text
ventas
clientes
categorias
productos
proveedores
empleados
detalle_ventas
compras
detalle_compras
pagos
producto_proveedor
estados_pago
estados_venta
metodos_pago
```

La función:

``` python
cargar_tabla(nombre_tabla)
```

consulta una tabla y devuelve un DataFrame.

Para empleados existe un tratamiento especial: la consulta no devuelve
`password_hash`, evitando llevar esa información sensible al proceso de
análisis.

`cargar_todas_tablas()` permite extraer todas las tablas definidas.

`cargar_datos_dashboard()` carga el subconjunto utilizado actualmente
por Streamlit.

## Datos raw

La carpeta:

``` text
data/raw/
```

contiene extracciones de las tablas originales.

Los archivos siguen una nomenclatura similar a:

``` text
ventas_raw.csv
productos_raw.csv
clientes_raw.csv
...
```

Estos archivos sirven como referencia del estado extraído de la base de
datos.

## Datos procesados

La carpeta:

``` text
data/processed/
```

contiene datos después de procesos de limpieza y transformación.

Incluye archivos como:

``` text
ventas.csv
detalle_ventas.csv
productos.csv
clientes.csv
...
```

También existe un:

``` text
reporte_calidad.csv
```

para registrar información relacionada con la calidad de los datos.

Para el dashboard actual, la aplicación Streamlit consulta directamente
la base de datos en lugar de depender exclusivamente de estos CSV.

## Limpieza

`src/analysis/cleaning.py` contiene funciones reutilizables:

### `limpiar_textos()`

Elimina espacios innecesarios de columnas de texto.

### `convertir_a_texto()`

Convierte columnas específicas a tipo texto.

Es útil para campos como:

-   Número de documento.
-   Teléfono.

Estos campos pueden ser identificadores aunque originalmente aparezcan
como números.

### `convertir_fechas()`

Convierte columnas a fechas utilizando:

``` python
pd.to_datetime(...)
```

con manejo de valores no convertibles mediante `errors="coerce"`.

### `limpiar_tablas()`

Aplica las transformaciones apropiadas a las tablas.

También elimina `password_hash` de empleados si la columna está
presente.

## Exploración

`src/analysis/exploracion.py` permite diagnosticar los CSV.

La exploración se utiliza para revisar aspectos como:

-   Dimensiones.
-   Columnas.
-   Tipos de datos.
-   Valores nulos.
-   Duplicados.
-   Valores únicos.
-   Rangos de fechas.
-   Muestras de datos.

Esta etapa permite detectar problemas antes de realizar análisis.

## Streamlit

La aplicación está en:

``` text
streamlit/app.py
```

Se ejecuta mediante:

``` bash
streamlit run streamlit/app.py
```

## Funcionamiento del dashboard

La aplicación:

1.  Carga datos desde la base de datos.
2.  Aplica limpieza.
3.  Prepara tipos numéricos y fechas.
4.  Realiza `merge` entre tablas relacionadas.
5.  Aplica filtros.
6.  Calcula KPIs.
7.  Genera visualizaciones.
8.  Presenta tablas operativas.

Los datos se almacenan en caché durante 60 segundos mediante:

``` python
@st.cache_data(ttl=60)
```

También existe un botón para actualizar los datos manualmente.

## Relaciones utilizadas en Streamlit

La aplicación crea relaciones con `merge()`.

### Productos y categorías

``` text
detalle_ventas
      ↓ id_producto
productos
      ↓ id_categoria
categorias
```

Esto permite analizar ingresos y unidades por categoría.

### Ventas y clientes

``` text
ventas
  ↓ id_cliente
clientes
```

Esto permite incorporar:

-   Nombre.
-   Apellido.
-   Ciudad.

### Ventas y empleados

``` text
ventas
  ↓ id_empleado
empleados
```

### Ventas y estados

``` text
ventas
  ↓ id_estado_venta
estados_venta
```

### Pagos y métodos

``` text
pagos
  ↓ id_metodo_pago
metodos_pago
```

## Filtros actuales

La aplicación permite filtrar por:

-   Periodo.
-   Categoría.
-   Ciudad.
-   Estado de venta.

Los filtros se encuentran en la barra lateral.

## Indicadores actuales

El dashboard muestra:

-   Ventas totales.
-   Cantidad de ventas.
-   Ticket promedio.
-   Clientes.
-   Pendiente de pago.

Las ventas anuladas se excluyen de los indicadores principales.

## Visualizaciones actuales

La aplicación incluye:

### Evolución de ventas

Ventas agrupadas por mes.

### Ventas por categoría

Utiliza el subtotal de `detalle_ventas`.

Esto es importante porque una venta puede contener productos de
diferentes categorías.

### Ventas por ciudad

Agrupa el total de las ventas según la ciudad del cliente.

### Productos más vendidos

Muestra los 10 productos con mayor cantidad de unidades vendidas.

### Métodos de pago

Suma los montos de pagos aprobados agrupados por método.

### Stock bajo

Muestra productos cuyo stock es menor o igual al stock mínimo.

### Ventas recientes

Presenta las ventas más recientes con:

-   ID.
-   Factura.
-   Fecha.
-   Cliente.
-   Total.
-   Estado.

## Enfoque del análisis

El análisis final del proyecto está implementado en **Python y Streamlit**.
Streamlit funciona como la aplicación analítica del proyecto y permite:

-   Consultar directamente la base de datos.
-   Transformar datos con Pandas.
-   Aplicar lógica de análisis personalizada.
-   Crear filtros interactivos.
-   Calcular indicadores.
-   Generar visualizaciones.
-   Presentar tablas operativas.
-   Incorporar nuevos análisis conforme evolucione el proyecto.

La aplicación consulta los datos actuales de la base de datos utilizada por
el sistema y concentra en un mismo lugar la preparación, análisis y
visualización de la información.

## Regla de granularidad

Para análisis generales de facturación:

``` python
ventas["total"]
```

es la métrica principal.

Para análisis por producto o categoría:

``` python
detalle_ventas["subtotal"]
```

es más apropiado.

La razón es que una venta puede contener varios productos y categorías.

## Dependencias

Las dependencias se encuentran en:

``` text
requirements.txt
```

El archivo actual contiene un entorno bastante amplio, incluyendo
herramientas de Jupyter, Streamlit, Pandas, NumPy, Plotly, Polars,
SQLAlchemy y PostgreSQL.

Para reproducir el entorno:

``` bash
python -m venv .venv
```

Activación en PowerShell:

``` powershell
.venv\Scripts\Activate.ps1
```

Instalación:

``` bash
python -m pip install -r requirements.txt
```

Los CSV `raw` y `processed` deben evaluarse según el objetivo del
repositorio, especialmente si contienen datos reales.
