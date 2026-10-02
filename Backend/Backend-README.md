# Backend --- VentasPro

## Descripción

El backend de VentasPro es una API REST desarrollada con Node.js y
Express.

Su responsabilidad principal es centralizar:

-   Acceso a PostgreSQL.
-   Lógica de negocio.
-   Validación de operaciones.
-   Autenticación.
-   Autorización por roles.
-   Gestión de ventas.
-   Gestión de pagos.
-   Gestión de compras.
-   Gestión de productos y entidades administrativas.

El frontend no accede directamente a PostgreSQL. Las operaciones pasan
por esta API.

``` text
React
  │
  │ HTTP / JSON
  ▼
Express API
  │
  │ SQL
  ▼
PostgreSQL
```

## Tecnologías

-   Node.js
-   Express 4
-   PostgreSQL
-   `pg`
-   JWT (`jsonwebtoken`)
-   bcrypt
-   CORS
-   dotenv
-   Nodemon

## Instalación

Desde esta carpeta:

``` bash
npm install
```

## Ejecución

Desarrollo:

``` bash
npm run dev
```

Producción/local sin Nodemon:

``` bash
npm start
```

El servidor utiliza:

``` text
http://localhost:4000
```

El puerto puede modificarse mediante `PORT`.

## Estructura

``` text
Backend/
│
├── migrations/
│   └── 001_add_auth_a_empleados.sql
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── crearAdmin.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── categorias.controller.js
│   │   ├── clients.controller.js
│   │   ├── compras.controller.js
│   │   ├── empleados.controller.js
│   │   ├── metodosPago.controller.js
│   │   ├── pagos.controller.js
│   │   ├── products.controller.js
│   │   ├── proveedores.controller.js
│   │   └── ventas.controller.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── roleMiddleware.js
│   │
│   ├── routes/
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── AppError.js
│   │   └── asyncHandler.js
│   │
│   ├── app.js
│   └── server.js
│
├── package.json
└── .env
```

## Configuración de PostgreSQL

En el sistema final, PostgreSQL se encuentra administrado mediante
Supabase. Durante el desarrollo también se utilizó PostgreSQL local con
Docker para realizar pruebas. La conexión concreta se define mediante
variables de entorno, por lo que el backend no depende de Docker para su
ejecución final.


La conexión se encuentra en:

``` text
src/config/db.js
```

Utiliza `pg.Pool` y variables de entorno.

Ejemplo:

``` env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ventas
DB_USER=postgres
DB_PASSWORD=********
PORT=4000
JWT_SECRET=********
```

No se deben subir credenciales reales al repositorio.

## Arquitectura interna

El backend sigue una separación básica por responsabilidades:

``` text
Route
  ↓
Middleware
  ↓
Controller
  ↓
PostgreSQL
```

### Routes

Definen los endpoints HTTP.

### Middlewares

Procesan autenticación, roles y errores.

### Controllers

Contienen la lógica de las operaciones.

### Config

Centraliza la conexión a la base de datos y la creación inicial del
administrador.

### Utils

Contiene utilidades reutilizables para errores y funciones asíncronas.

## Autenticación

La autenticación se realiza mediante:

``` text
POST /api/auth/login
```

El usuario envía sus credenciales y el backend valida la contraseña
mediante bcrypt.

Si son correctas, genera un JWT.

El token incluye información del empleado autenticado, incluyendo:

-   `id_empleado`
-   `nombre`
-   `rol`

Las siguientes solicitudes autenticadas utilizan:

``` http
Authorization: Bearer <token>
```

## Autorización

Existe un middleware:

``` text
roleMiddleware.js
```

que permite restringir endpoints a determinados roles.

Roles utilizados:

-   `admin`
-   `empleado`

Por ejemplo, la creación de empleados y compras está restringida al
administrador.

La autorización se verifica en el backend y no depende únicamente de los
controles visuales del frontend.

## Endpoints principales

### Autenticación

``` http
POST /api/auth/login
GET  /api/auth/me
```

### Productos

``` http
GET    /api/productos
GET    /api/productos/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id
```

Las operaciones de modificación de productos requieren rol
administrativo.

### Clientes

``` http
GET    /api/clientes
GET    /api/clientes/:id
POST   /api/clientes
PUT    /api/clientes/:id
DELETE /api/clientes/:id
```

La eliminación requiere rol administrativo.

### Empleados

``` http
GET    /api/empleados
GET    /api/empleados/:id
POST   /api/empleados
PUT    /api/empleados/:id
DELETE /api/empleados/:id
```

Las operaciones están restringidas a administradores.

### Proveedores

``` http
GET    /api/proveedores
GET    /api/proveedores/:id
POST   /api/proveedores
PUT    /api/proveedores/:id
DELETE /api/proveedores/:id
```

### Categorías

``` http
GET /api/categorias
POST /api/categorias
PUT /api/categorias/:id
```

Las modificaciones requieren administrador.

### Métodos de pago

``` http
GET /api/Metodos_de_Pago
```

### Pagos

``` http
GET   /api/pagos
GET   /api/pagos/:id
POST  /api/pagos
PATCH /api/pagos/:id/reembolsar
```

### Ventas

``` http
GET   /api/ventas
GET   /api/ventas/:id
POST  /api/ventas
PATCH /api/ventas/:id/anular
```

### Compras

``` http
POST /api/compras
```

La creación de compras requiere administrador.

## Flujo de creación de una venta

El controlador de ventas trabaja con una transacción.

El flujo general es:

``` text
BEGIN
  ↓
Validar cliente
  ↓
Validar productos
  ↓
Comprobar stock
  ↓
Obtener precios actuales
  ↓
Calcular subtotales
  ↓
Calcular total
  ↓
Validar pagos
  ↓
Crear venta
  ↓
Crear detalles
  ↓
Descontar stock
  ↓
Crear pagos
  ↓
COMMIT
```

Si ocurre un error durante la operación, la transacción puede revertirse
mediante `ROLLBACK`.

## Estados de venta

El modelo utiliza:

``` text
1 → Pendiente
2 → Pagada
3 → Anulada
```

## Estados de pago

``` text
1 → Aprobado
2 → Rechazado
3 → Reembolsado
```

## Pagos parciales

Una venta puede quedar pendiente cuando el valor aprobado de los pagos
es menor que el total.

Si posteriormente se registra un pago suficiente para cubrir el saldo,
la venta puede pasar a `Pagada`.

Los reembolsos afectan el estado financiero de la venta de acuerdo con
los pagos aprobados restantes.

## Inventario

El stock se actualiza desde la lógica de negocio:

-   Las ventas disminuyen stock.
-   Las compras aumentan stock.
-   La anulación de una venta restaura las unidades correspondientes.

El campo `stock` representa el stock actual.

## Compras

El controlador de compras:

1.  Valida proveedor y empleado.
2.  Registra la compra.
3.  Registra los detalles.
4.  Incrementa stock.
5.  Actualiza el precio de compra de referencia.
6.  Actualiza la relación producto-proveedor mediante
    `producto_proveedor`.

## Creación de administrador

El proyecto incluye:

``` text
src/config/crearAdmin.js
```

El script permite crear el primer usuario administrador utilizando
bcrypt para almacenar la contraseña como hash.

Ejemplo de ejecución:

``` bash
node src/config/crearAdmin.js "Nombre" "Apellido" "correo@example.com" "Contraseña"
```

No se deben almacenar credenciales reales en documentación, código o
repositorios públicos.

## Manejo de errores

`AppError.js` permite crear errores controlados y `errorHandler.js`
centraliza su respuesta HTTP.

`asyncHandler.js` evita repetir bloques `try/catch` alrededor de cada
controlador asíncrono.

## Consideraciones de seguridad

El proyecto ya incorpora autenticación y roles, pero para producción
conviene reforzar:

-   CORS restringido al dominio real.
-   Helmet.
-   Rate limiting para login.
-   Validación estricta de entradas.
-   Protección de operaciones concurrentes sobre stock mediante
    `SELECT ... FOR UPDATE`.
-   Generación de referencias internas desde backend.
-   Gestión segura de JWT.
-   No publicar `.env`.
