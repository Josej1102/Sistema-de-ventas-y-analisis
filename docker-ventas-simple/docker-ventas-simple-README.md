# docker-ventas-simple --- PostgreSQL y modelo de datos

## Descripción

La carpeta `docker-ventas-simple/` contiene la infraestructura local de
PostgreSQL y los archivos SQL del sistema de ventas.

Aunque el nombre de la carpeta incluye `simple`, este componente
contiene el modelo relacional principal, datos iniciales, scripts de
carga y documentación del modelo.

La carpeta representa el entorno de **desarrollo y pruebas locales** del
proyecto. Docker Compose se utilizó para levantar PostgreSQL 16 en el
equipo local, validar el modelo, ejecutar scripts SQL y probar el backend.

El sistema final ya no depende de este contenedor: la base de datos final
se encuentra en **Supabase**, que proporciona PostgreSQL como servicio
administrado.

``` text
DESARROLLO LOCAL
Docker Compose → PostgreSQL 16
        ↑             ↑
        └── pruebas del sistema

SISTEMA FINAL
React → Node/Express → Supabase PostgreSQL
                         ↑
                         └── Python/Streamlit
```

## Tecnologías

-   Docker.
-   Docker Compose.
-   PostgreSQL 16.
-   SQL.

## Estructura

``` text
docker-ventas-simple/
│
├── SQL/
│   ├── ModeloFinal.sql
│   ├── Modelo_Trazabilidad.sql
│   ├── seed1.sql
│   ├── seed2.sql
│   ├── seed3.sql
│   └── seed4.sql
│
├── Docs/
│   └── modelo_bd_sistema_ventas.html
│
├── docker-compose.yml
├── .env
└── .gitignore
```

## Docker Compose

El archivo `docker-compose.yml` define un servicio:

``` text
postgres
```

Utiliza:

``` text
postgres:16
```

Nombre del contenedor:

``` text
ventas_postgres
```

El puerto local:

``` text
5432
```

se conecta con el puerto 5432 del contenedor.

El volumen:

``` text
postgres_data
```

permite conservar los datos aunque el contenedor se detenga.

## Configuración

El Compose utiliza variables:

``` env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

Estas variables deben mantenerse en `.env` y no deben publicarse con
valores reales.

## Iniciar PostgreSQL

Desde esta carpeta:

``` bash
docker compose up -d
```

Comprobar contenedores:

``` bash
docker ps
```

Detener:

``` bash
docker compose down
```

Importante: `docker compose down` no elimina por defecto el volumen de
PostgreSQL.

Para eliminar también el volumen, la operación debe realizarse
explícitamente y provoca pérdida de los datos almacenados en él.

## ModeloFinal.sql

`SQL/ModeloFinal.sql` contiene el modelo relacional principal.

### Tablas

#### `categorias`

Clasifica los productos.

Campos principales:

-   `id_categoria`
-   `nombre`
-   `descripcion`
-   `estado`
-   `fecha_creacion`

#### `proveedores`

Almacena proveedores.

#### `productos`

Representa el inventario.

Incluye:

-   SKU.
-   Categoría.
-   Precio de compra.
-   Precio de venta.
-   Stock.
-   Stock mínimo.
-   Estado.

#### `producto_proveedor`

Implementa la relación muchos a muchos entre productos y proveedores.

También permite almacenar:

-   Precio de compra del proveedor.
-   Tiempo de entrega.
-   Proveedor principal.
-   Fecha de asociación.

#### `clientes`

Almacena los clientes del negocio.

#### `empleados`

Almacena los usuarios internos del sistema.

Incluye:

-   Información personal.
-   Correo.
-   Estado.
-   Hash de contraseña.
-   Rol.

Los roles permitidos en el modelo son:

``` text
empleado
admin
```

#### `metodos_pago`

Catálogo de métodos de pago.

#### `estados_venta`

Catálogo de estados de las ventas.

Actualmente se inicializa con:

``` text
Pendiente
Pagada
Anulada
```

#### `estados_pago`

Catálogo de estados de los pagos.

Actualmente se inicializa con:

``` text
Aprobado
Rechazado
Reembolsado
```

#### `ventas`

Cabecera de cada operación de venta.

Incluye:

-   Número de factura.
-   Cliente.
-   Empleado.
-   Estado.
-   Fecha.
-   Subtotal.
-   Impuesto.
-   Descuento.
-   Total.

El número de factura es generado por PostgreSQL mediante `IDENTITY`.

#### `detalle_ventas`

Representa los productos incluidos en cada venta.

Incluye:

-   Venta.
-   Producto.
-   Cantidad.
-   Precio unitario.
-   Descuento.
-   Subtotal.

#### `pagos`

Representa los pagos asociados a una venta.

Una venta puede tener múltiples pagos.

#### `compras`

Cabecera de las compras realizadas a proveedores.

#### `detalle_compras`

Representa los productos incluidos en cada compra.

## Relaciones

Las relaciones principales son:

``` text
CATEGORIAS 1 ─── N PRODUCTOS

PRODUCTOS N ─── M PROVEEDORES
       mediante PRODUCTO_PROVEEDOR

CLIENTES 1 ─── N VENTAS

EMPLEADOS 1 ─── N VENTAS

ESTADOS_VENTA 1 ─── N VENTAS

VENTAS 1 ─── N DETALLE_VENTAS

PRODUCTOS 1 ─── N DETALLE_VENTAS

VENTAS 1 ─── N PAGOS

METODOS_PAGO 1 ─── N PAGOS

ESTADOS_PAGO 1 ─── N PAGOS

PROVEEDORES 1 ─── N COMPRAS

EMPLEADOS 1 ─── N COMPRAS

COMPRAS 1 ─── N DETALLE_COMPRAS

PRODUCTOS 1 ─── N DETALLE_COMPRAS
```

## Reglas importantes del modelo

### Precios

`productos.precio_compra` representa el costo de referencia actual del
producto.

`producto_proveedor.precio_compra` permite almacenar el costo específico
asociado a un proveedor.

`productos.precio_venta` representa el precio actual de venta.

`detalle_ventas.precio_unitario` conserva el precio aplicado
históricamente a una venta.

`detalle_compras.precio_unitario` conserva el costo aplicado
históricamente a una compra.

### Stock

El stock actual se mantiene en:

``` text
productos.stock
```

Las operaciones de negocio modifican este valor desde el backend.

### Total de venta

Conceptualmente:

``` text
total = subtotal + impuesto - descuento
```

El total se calcula en la lógica del backend al crear la venta.

El modelo actual no depende de triggers para realizar este cálculo.

## Vistas

`ModeloFinal.sql` incluye vistas para facilitar consultas.

Entre ellas:

``` text
vista_ventas_resumen
vista_producto_proveedores
```

Estas vistas permiten consultar información combinada sin tener que
repetir los JOIN manualmente.

## Modelo_Trazabilidad.sql

Este archivo contiene una versión/historial más orientado a trazabilidad
de cambios del modelo.

Incluye:

-   Definición de tablas.
-   Datos iniciales.
-   Vistas.
-   Alteraciones del esquema.
-   Incorporación de compras y detalles de compras.

Para una instalación limpia, `ModeloFinal.sql` debe considerarse el
modelo final principal incluido en la carpeta.

## Seeds

Los archivos:

``` text
seed1.sql
seed2.sql
seed3.sql
seed4.sql
```

sirven para cargar datos de prueba.

Se utilizan para poblar diferentes entidades y permitir probar:

-   Productos.
-   Proveedores.
-   Clientes.
-   Empleados.
-   Relaciones producto-proveedor.
-   Inventario.

Para cargas históricas o análisis extensos también existen datos
generados en el flujo de trabajo del proyecto.

## Documentación del modelo

`Docs/modelo_bd_sistema_ventas.html` contiene documentación visual del
modelo de base de datos.

Puede abrirse directamente en un navegador.

## Conexión con el resto del proyecto

### Backend

Durante las pruebas locales, Node.js podía conectarse al PostgreSQL
levantado por Docker mediante el puerto 5432. En el sistema final, el
backend se conecta al PostgreSQL administrado por Supabase mediante sus
variables de entorno de conexión.

### Análisis

Python y Streamlit utilizan la base de datos del sistema para realizar el
análisis. En el sistema final, la fuente es Supabase PostgreSQL.

``` text
Backend ────────┐
                ├──→ Supabase PostgreSQL
Analisis/Streamlit ─┘
```

## Papel de Docker en el proyecto

Docker no representa la infraestructura final del sistema. Su función es
proporcionar un entorno PostgreSQL reproducible para desarrollo, pruebas
locales y validación del modelo. Esto permite probar el esquema sin
depender inicialmente de la instancia de Supabase.

Una vez migrado el sistema a Supabase, esta carpeta conserva su utilidad
como referencia del modelo SQL y como entorno opcional para pruebas
locales.

## Persistencia

El volumen:

``` text
postgres_data
```

es fundamental para la persistencia local.

Por eso recrear el contenedor no necesariamente significa empezar con
una base vacía.

Si se elimina el volumen, los datos almacenados en él se pierden.

## Buenas prácticas

No publicar:

``` text
.env
```

con credenciales reales.

No ejecutar scripts de seed repetidamente sobre una base con datos
reales sin verificar previamente si utilizan restricciones,
`ON CONFLICT` o mecanismos para evitar duplicados.

Antes de modificar el modelo:

1.  Revisar claves foráneas.
2.  Revisar vistas.
3.  Revisar dependencias.
4.  Respaldar la base si contiene datos importantes.
