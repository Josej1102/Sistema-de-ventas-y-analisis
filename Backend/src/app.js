const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/product.routes');
const clientesRoutes = require('./routes/clients.routes');
const empleadosRoutes = require('./routes/empleados.routes');
const proveedorRoutes = require('./routes/proveedor.routes');
const authRoutes = require('./routes/auth.routes');
const categoriaRoutes = require('./routes/categorias.routes');
const metodosPagoRoutes = require('./routes/metodosPago.routes');
const errorHandler = require('./middlewares/errorHandler');
const pagosRoutes = require('./routes/pagos.routes');
const ventasRoutes = require('./routes/ventas.routes');
const comprasRoutes = require('./routes/compras.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({mensaje: "Api en funcionamiento" });
});

app.use('/api/auth', authRoutes);

app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/Metodos_de_Pago', metodosPagoRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/compras', comprasRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

module.exports = app;