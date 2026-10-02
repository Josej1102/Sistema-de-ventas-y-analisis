# Frontend --- VentasPro

## Descripción

El frontend es la aplicación web utilizada por los empleados y
administradores para operar el sistema de ventas e inventario.

Está construido con:

-   React.
-   Vite.
-   React Router.
-   Lucide React.
-   CSS propio.

No utiliza Tailwind CSS.

El frontend consume exclusivamente la API REST del backend para trabajar
con los datos.

``` text
Usuario
  ↓
React
  ↓
HTTP / JSON
  ↓
Node.js + Express
  ↓
PostgreSQL
```

## Instalación

Desde `frontend/`:

``` bash
npm install
```

## Desarrollo

``` bash
npm run dev
```

La aplicación se ejecuta normalmente en:

``` text
http://localhost:5173
```

## Compilación

``` bash
npm run build
```

Vista previa del build:

``` bash
npm run preview
```

## Configuración

Crear un `.env`

``` env
VITE_API_URL=http://localhost:4000/api
```

Las variables `VITE_*` son visibles en el navegador. Por eso nunca deben
contener secretos.

## Estructura

``` text
frontend/
│
├── src/
│   ├── api/
│   │   └── http.js
│   │
│   ├── auth/
│   │   └── AuthContext.jsx
│   │
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Modal.jsx
│   │   ├── PageErrorBoundary.jsx
│   │   ├── PageState.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleGate.jsx
│   │   ├── StatCard.jsx
│   │   └── Toast.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── SalesPage.jsx
│   │   ├── SalesHistoryPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── ClientsPage.jsx
│   │   ├── SuppliersPage.jsx
│   │   ├── PaymentsPage.jsx
│   │   ├── PurchasesPage.jsx
│   │   ├── EmployeesPage.jsx
│   │   ├── CategoriesPage.jsx
│   │   └── ReportsPage.jsx
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
└── vite.config.js
```

## Navegación

Las rutas principales de la aplicación incluyen:

``` text
/login
/
 /ventas/nueva
 /ventas
 /productos
 /clientes
 /proveedores
 /pagos
 /reportes
 /compras/nueva
 /empleados
 /categorias
```

Las rutas protegidas requieren una sesión activa.

## Autenticación

`AuthContext.jsx` centraliza:

-   Usuario actual.
-   Token.
-   Inicio de sesión.
-   Cierre de sesión.
-   Consulta de sesión.
-   Comprobación del rol administrativo.

La sesión se conserva utilizando `sessionStorage`.

## Protección de rutas

`ProtectedRoute.jsx` evita que usuarios no autenticados accedan a las
páginas privadas.

`RoleGate.jsx` permite mostrar u ocultar componentes según el rol.

Es importante entender que estos controles son principalmente de
interfaz. La autorización real está implementada en el backend.

## Cliente HTTP

`src/api/http.js` centraliza las peticiones a la API.

Incluye funciones para:

-   GET.
-   POST.
-   PUT.
-   PATCH.
-   DELETE.

También agrega el token JWT a las solicitudes autenticadas.

Cuando recibe un `401`, la aplicación puede limpiar la sesión y
notificar la expiración de autenticación.

## Páginas

### Login

Permite autenticar empleados mediante el endpoint de login.

### Dashboard

Muestra información operativa como:

-   Ventas.
-   Ticket promedio.
-   Actividad reciente.
-   Información relacionada con la operación.

El dashboard considera la fecha de Colombia para mostrar correctamente
la actividad diaria.

### Nueva venta

Permite:

1.  Seleccionar cliente.
2.  Seleccionar productos.
3.  Definir cantidades.
4.  Registrar impuesto/descuento.
5.  Registrar uno o varios pagos.
6.  Crear la venta mediante la API.

El número de factura no se genera manualmente en el frontend.

### Historial de ventas

Permite consultar las ventas registradas y trabajar con la anulación
cuando corresponde.

### Productos

Permite gestionar:

-   SKU.
-   Nombre.
-   Descripción.
-   Categoría.
-   Precio.
-   Stock.
-   Estado.

### Clientes

Permite crear, editar, consultar y desactivar clientes según los
permisos correspondientes.

### Proveedores

Permite gestionar proveedores y su estado.

### Pagos

Permite consultar pagos, registrar pagos adicionales y gestionar
reembolsos mediante la API.

### Compras

Permite registrar compras de inventario.

El módulo está restringido a administradores.

### Empleados

Permite administrar empleados y sus roles.

Está restringido a administradores.

### Categorías

Permite gestionar categorías de productos.

### Reportes

Presenta información de ventas y permite exportar información en CSV en
la versión actual.

## Estados de interfaz

Los componentes administrativos utilizan estados para:

-   Cargando.
-   Error.
-   Sin datos.
-   Datos disponibles.

`PageState.jsx` ayuda a mantener una experiencia consistente.

`PageErrorBoundary.jsx` evita que un error de renderizado de una página
destruya toda la interfaz.

## Componentes reutilizables

### `Layout.jsx`

Contiene la estructura general de la aplicación y navegación.

### `Modal.jsx`

Componente reutilizable para formularios o diálogos.

### `StatCard.jsx`

Muestra indicadores numéricos.

### `Toast.jsx`

Muestra mensajes de retroalimentación.

### `PageState.jsx`

Centraliza estados de carga, error y vacío.

## Diseño

La interfaz utiliza CSS propio.

La estructura visual busca:

-   Interfaz oscura.
-   Navegación lateral.
-   Tarjetas de indicadores.
-   Formularios modales.
-   Tablas.
-   Estados visuales.
-   Iconografía mediante Lucide React.

## Manejo de IDs y referencias

El frontend no solicita al usuario IDs internos para entidades que son
generadas por PostgreSQL.

Ejemplos:

-   `id_venta`.
-   `id_producto`.
-   `id_cliente`.
-   `id_pago`.
-   `numero_factura`.

Estos valores son gestionados por el backend/base de datos.

Las referencias internas mostradas por el frontend pueden generarse en
el cliente en la versión actual; si una referencia representa una
operación financiera real, debe generarse o validarse desde backend o
proveedor de pagos.

## Seguridad

El frontend:

-   Protege rutas.
-   Mantiene sesión.
-   Envía JWT.
-   Oculta acciones administrativas para usuarios sin el rol
    correspondiente.

Pero nunca debe considerarse la interfaz como mecanismo de seguridad
suficiente. Un usuario puede intentar llamar directamente a la API, por
lo que el backend debe validar siempre autenticación, roles y datos
recibidos.
