# Seguridad necesaria en el backend

El frontend implementa controles de UX y sesión, pero no puede garantizar seguridad contra un cliente manipulado. Para este proyecto recomiendo aplicar estos cambios en Express/PostgreSQL antes de considerarlo producción.

## 1. Referencias de pago
No confíes en `referencia` enviada por React. Si es una referencia interna, genera el valor en Node con `crypto.randomUUID()` dentro de `createPago`/`createVenta` y guarda ese valor. Si es una autorización bancaria, debe venir del proveedor de pagos.

La factura ya debe seguir siendo automática en PostgreSQL mediante `numero_factura ... IDENTITY`; React nunca debe enviar ese campo.

## 2. Stock concurrente
En `createVenta`, dentro de la transacción, usa un `SELECT ... FOR UPDATE` para bloquear cada producto antes de comprobar y descontar stock. De lo contrario dos ventas simultáneas podrían pasar el mismo chequeo.

## 3. Validación de pagos
Antes de insertar:
- validar que `monto` sea finito y > 0;
- validar que `id_metodo_pago` exista;
- validar que la venta esté en un estado permitido;
- calcular el saldo exclusivamente en backend;
- nunca aceptar un `id_estado_pago` desde React.

## 4. Roles
El backend ya usa `authMiddleware` + `roleMiddleware`. Mantén esos controles aunque el frontend oculte botones de admin. Un usuario puede llamar directamente a `/api/empleados`, `/api/compras`, etc.

## 5. CORS y cabeceras
En producción limita CORS al dominio real del frontend y agrega cabeceras de seguridad (por ejemplo con Helmet). Agrega rate limiting al login.

## 6. JWT
Mantén el secreto únicamente en el backend. El frontend no recibe `JWT_SECRET`. Si posteriormente despliegas la aplicación, considera cookies `HttpOnly`, `Secure` y `SameSite` para reducir exposición del token a XSS.

## 7. Eliminación
Para entidades históricas (`productos`, `clientes`, `proveedores`, `empleados`) es preferible desactivar mediante `estado=false` en vez de borrar filas relacionadas con ventas/compras.

## 8. Datos sensibles
No publiques `.env`, contraseñas, claves JWT ni credenciales de PostgreSQL. El `.env` del frontend solamente debe contener `VITE_API_URL`; cualquier variable `VITE_*` es visible para el navegador.
