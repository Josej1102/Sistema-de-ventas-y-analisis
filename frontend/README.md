# VentasPro — Frontend React

Frontend del sistema de ventas e inventario construido con React + Vite.

## Tecnologías

- React
- React Router
- Vite
- Lucide React
- CSS propio, sin Tailwind

## Ejecutar

1. Instala Node.js.
2. Desde esta carpeta ejecuta:

```bash
npm install
npm run dev
```

3. El frontend queda disponible en `http://localhost:5173`.
4. El backend debe estar disponible en `http://localhost:4000`.

Puedes cambiar la URL mediante `.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

## Módulos

- Dashboard
- Nueva venta
- Historial de ventas y anulación
- Productos
- Clientes
- Proveedores
- Pagos y reembolsos
- Nueva compra
- Empleados
- Categorías
- Reportes

## Comportamiento cuando no hay datos

Las pantallas administrativas no quedan en blanco. Cada módulo muestra uno de tres estados:

- Cargando información.
- Error de conexión o API con botón para reintentar.
- Estado vacío con la acción correspondiente para crear el primer registro.

Además, un error de renderizado de una página no desmonta la barra lateral completa gracias al `PageErrorBoundary`.

## IDs y referencias

Los IDs de clientes, productos, ventas, pagos, etc. no se solicitan manualmente al usuario. Son generados por PostgreSQL y enviados por la API.

El número de factura también debe ser generado por PostgreSQL mediante `IDENTITY`.

Las referencias mostradas como internas se generan automáticamente en el cliente en esta versión. Para producción, si la referencia representa una operación bancaria real, debe generarse o recibirse desde el backend o la pasarela de pago.
