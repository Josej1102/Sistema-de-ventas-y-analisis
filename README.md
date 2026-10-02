# VentasPro --- Sistema de Ventas, Inventario y Análisis de Datos

## Descripción

VentasPro es un sistema integral de gestión de ventas e inventario
desarrollado como proyecto de portafolio de Ingeniería de Sistemas.

El proyecto reúne varias áreas del desarrollo de software y análisis de
datos en una misma solución:

-   Aplicación web para operación del negocio.
-   API REST para centralizar la lógica del sistema.
-   Base de datos relacional PostgreSQL.
-   Autenticación y autorización por roles.
-   Gestión de ventas, pagos, compras, productos, clientes, proveedores
    y empleados.
-   Análisis de datos con Python, Pandas y Streamlit.
-   Análisis y visualización de datos con Python, Pandas y Streamlit.
-   Uso de Docker y PostgreSQL para desarrollo y pruebas locales.
-   Uso de Supabase como base de datos PostgreSQL del sistema final.

La arquitectura general es:

``` text
                    ┌─────────────────────┐
                    │      FRONTEND       │
                    │ React + Vite        │
                    └──────────┬──────────┘
                               │ HTTP / REST
                               ▼
                    ┌─────────────────────┐
                    │       BACKEND       │
                    │ Node.js + Express   │
                    │ JWT + bcrypt         │
                    └──────────┬──────────┘
                               │ SQL
                               ▼
                    ┌─────────────────────┐
                    │      Supabase       │
                    │ PostgreSQL          │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
           ┌─────────────────┐   ┌─────────────────┐
           │    ANALISIS     │   │   OPERACIÓN     │
           │ Python/Pandas   │   │ React + API     │
           │ Streamlit       │   │ Node/Express    │
           └─────────────────┘   └─────────────────┘

Durante el desarrollo local, Docker Compose puede levantar una
instancia de PostgreSQL para pruebas y validación del modelo. Esta
instancia no forma parte de la infraestructura final del sistema.
```

## Componentes principales

  -------------------------------------------------------------------------
  Componente                Tecnología              Responsabilidad
  ------------------------- ----------------------- -----------------------
  `frontend/`               React, Vite, React      Interfaz web
                            Router                  

  `Backend/`                Node.js, Express        API REST y lógica de
                                                    negocio

  `docker-ventas-simple/`   Docker, PostgreSQL      Base de datos y scripts
                                                    SQL

  `Analisis/`               Python, Pandas,         Extracción, limpieza,
                            SQLAlchemy/psycopg,     exploración y
                            Streamlit               aplicación analítica

  Supabase                  PostgreSQL              Base de datos
                            administrado            del sistema final
  -------------------------------------------------------------------------

## Funcionalidades del sistema

### Gestión de productos

Permite trabajar con:

-   SKU.
-   Nombre y descripción.
-   Categoría.
-   Precio de compra.
-   Precio de venta.
-   Stock actual.
-   Stock mínimo.
-   Estado activo/inactivo.

### Gestión de clientes

Incluye:

-   Tipo de documento.
-   Número de documento.
-   Nombre y apellido.
-   Teléfono.
-   Correo.
-   Dirección.
-   Ciudad.
-   Estado.

Los clientes representan entidades comerciales del sistema y no son
usuarios de autenticación.

### Gestión de empleados

Los empleados cuentan con:

-   Datos personales.
-   Cargo.
-   Teléfono.
-   Correo.
-   Estado.
-   Contraseña almacenada como hash.
-   Rol `admin` o `empleado`.

### Ventas

El flujo principal es:

``` text
Empleado inicia sesión
        ↓
Selecciona cliente
        ↓
Selecciona productos
        ↓
Se valida stock
        ↓
Se calcula subtotal/impuesto/descuento/total
        ↓
Se registran pagos
        ↓
Se crea la venta
        ↓
Se descuenta stock
```

Una venta puede tener uno o varios pagos.

Los estados de venta utilizados por el modelo son:

-   `Pendiente`
-   `Pagada`
-   `Anulada`

### Pagos

El sistema contempla:

-   Método de pago.
-   Monto.
-   Estado del pago.
-   Fecha.
-   Referencia.
-   Reembolso.

Los estados definidos son:

-   `Aprobado`
-   `Rechazado`
-   `Reembolsado`

### Compras

Las compras permiten:

-   Registrar proveedor.
-   Registrar empleado responsable.
-   Agregar productos y cantidades.
-   Registrar costos de compra.
-   Actualizar stock.
-   Actualizar el precio de compra de referencia.
-   Mantener la relación producto-proveedor.

La creación de compras está protegida para administradores.

## Modelo de datos

El esquema principal está compuesto por:

``` text
categorias
    │
    └── productos
            │
            ├── detalle_ventas ── ventas ── clientes
            │                         │
            │                         └── empleados
            │
            ├── detalle_compras ── compras ── proveedores
            │
            └── producto_proveedor ── proveedores

ventas ── pagos ── metodos_pago
ventas ── estados_venta
pagos ── estados_pago
```

Tablas principales:

-   `categorias`
-   `proveedores`
-   `productos`
-   `producto_proveedor`
-   `clientes`
-   `empleados`
-   `metodos_pago`
-   `estados_venta`
-   `estados_pago`
-   `ventas`
-   `detalle_ventas`
-   `pagos`
-   `compras`
-   `detalle_compras`

## Regla importante de los datos de ventas

La tabla `ventas` representa la venta/factura completa:

``` text
ventas.total
```

Mientras `detalle_ventas` representa cada producto vendido:

``` text
detalle_ventas.subtotal
```

Por esta razón, no todos los análisis deben utilizar la misma métrica.

Para indicadores generales de facturación se utiliza `ventas.total`.

Para análisis por producto o categoría se utiliza normalmente
`detalle_ventas.subtotal`, porque una misma venta puede contener
productos de varias categorías.

## Seguridad

El backend implementa:

-   JWT para autenticación.
-   bcrypt para contraseñas.
-   Middleware de autenticación.
-   Middleware de autorización por rol.
-   Protección de rutas administrativas.
-   Manejo centralizado de errores.

El frontend también tiene rutas protegidas y controles visuales por rol,
pero la seguridad real se aplica en el backend.

## Análisis de datos

La carpeta `Analisis/` permite consultar los datos y realizar procesos
de:

1.  Extracción.
2.  Limpieza.
3.  Exploración.
4.  Preparación.
5.  Visualización.

La aplicación Streamlit consulta directamente los datos para mostrar
información actualizada y utiliza caché de 60 segundos.

## Evolución de la infraestructura

Durante el desarrollo se utilizó Docker Compose para ejecutar
PostgreSQL de forma local y probar el modelo relacional, los scripts SQL
y el funcionamiento del backend.

Una vez validado el sistema, la base de datos final se trasladó a
**Supabase**, que mantiene PostgreSQL como servicio administrado. Por
tanto, Docker queda como herramienta de desarrollo y pruebas, mientras
Supabase es la base de datos utilizada por el sistema final.

``` text
Desarrollo / pruebas locales
React → Node/Express → Docker → PostgreSQL
                         │
                         └→ pruebas y validación

Sistema final
React → Node/Express → Supabase PostgreSQL
                         │
                         └→ Python/Streamlit
```

## Requisitos

### Backend

-   Node.js.
-   npm.
-   PostgreSQL accesible.
-   Variables de entorno.

### Frontend

-   Node.js.
-   npm.
-   Backend ejecutándose.

### Análisis

-   Python 3.11.
-   Entorno virtual recomendado.
-   Dependencias de `Analisis/requirements.txt`.

### Base de datos

-   Supabase como PostgreSQL del sistema final.
-   Docker Desktop y Docker Compose únicamente si se desea reproducir
    el entorno PostgreSQL de desarrollo/pruebas locales.

## Ejecución

### 1. Base de datos

#### Sistema final

La aplicación utiliza **Supabase**, que proporciona la instancia
PostgreSQL utilizada por el backend y el análisis con Streamlit. Las
credenciales y datos de conexión se configuran mediante variables de
entorno.

#### Desarrollo y pruebas locales

La carpeta `docker-ventas-simple/` permite levantar PostgreSQL
localmente mediante Docker Compose y reproducir el modelo y los datos
de prueba. Esta configuración es útil para desarrollo, pruebas y
validación, pero no es necesaria para ejecutar el sistema final sobre
Supabase.

### 2. Backend

``` bash
cd Backend
npm install
npm run dev
```

La API utiliza por defecto el puerto:

``` text
http://localhost:4000
```

### 3. Frontend

``` bash
cd frontend
npm install
npm run dev
```

Vite utiliza normalmente:

``` text
http://localhost:5173
```

### 4. Streamlit

Desde `Analisis/`:

``` bash
streamlit run streamlit/app.py
```

## Variables de entorno

Las credenciales y secretos deben permanecer fuera del repositorio.

Ejemplos de variables utilizadas:

### Backend

``` env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
PORT=
```

### Análisis

``` env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

### Frontend

``` env
VITE_API_URL=http://localhost:4000/api
```

Nunca se deben publicar contraseñas, secretos JWT ni credenciales de
base de datos.

## Estructura general

``` text
Proyecto de ventas y analisis/
│
├── Backend/
│   ├── src/
│   ├── migrations/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env.example
│
├── Analisis/
│   ├── data/
│   │   ├── raw/
│   │   └── processed/
│   ├── src/
│   ├── streamlit/
│   ├── requirements.txt
│   └── .env
│
└── docker-ventas-simple/
    ├── SQL/
    ├── Docs/
    ├── docker-compose.yml
    └── .env
```

## Enfoque del proyecto

El proyecto busca demostrar un flujo completo:

``` text
Base de datos
     ↓
API REST
     ↓
Aplicación web
     ↓
Registro de operaciones
     ↓
Extracción de datos
     ↓
Limpieza y preparación
     ↓
Análisis de datos
```

Esto permite presentar el proyecto como una solución que integra
desarrollo backend, frontend, bases de datos, seguridad y análisis de
datos.
