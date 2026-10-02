const pool = require("../config/db");
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

//Obtener productos
const getProducts = asyncHandler(async (req, res) => {

    const result = await pool.query(`
    SELECT p.id_producto, p.codigo_sku, p.nombre, p.precio_venta,
           p.stock, p.stock_minimo, p.estado, c.nombre AS categoria
    FROM productos p
    JOIN categorias c ON p.id_categoria = c.id_categoria
    ORDER BY p.id_producto
  `);
  res.json(result.rows);
})

//Crear producto
const createProduct = asyncHandler(async (req, res) => {

    const {codigo_sku, nombre, descripcion, id_categoria, precio_compra, precio_venta, stock, stock_minimo } = req.body;

    if (!nombre || !id_categoria || precio_venta === undefined) {
    throw new AppError('nombre, id_categoria y precio_venta son obligatorios', 400);
  }

  const result = await pool.query(`
    INSERT INTO productos 
    (codigo_sku, nombre, descripcion, id_categoria, precio_compra, precio_venta, stock, stock_minimo )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [codigo_sku, nombre, descripcion, id_categoria, precio_compra ?? 0, precio_venta, stock ?? 0, stock_minimo ?? 5]
    );
    res.status(201).json(result.rows[0]);
})

//Obtener producto por ID
const getProductsId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM productos WHERE id_producto = $1', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Producto no encontrado', 404);
  }
  res.json(result.rows[0]);
});

//Actualizar producto por id
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio_venta, stock, estado } = req.body;

  const result = await pool.query(
    `UPDATE productos
     SET nombre = COALESCE($1, nombre),
         descripcion = COALESCE($2, descripcion),
         precio_venta = COALESCE($3, precio_venta),
         stock = COALESCE($4, stock),
         estado = COALESCE($5, estado)
     WHERE id_producto = $6
     RETURNING *`,
    [nombre, descripcion, precio_venta, stock, estado, id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Producto no encontrado', 404);
  }
  res.json(result.rows[0]);
});

// Eliminar Producto
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM productos WHERE id_producto = $1 AND estado = FALSE RETURNING id_producto ',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Producto no encontrado', 404);
  }
  res.status(204).send();
});

module.exports = {
  getProducts,
  getProductsId,
  createProduct,
  updateProduct,
  deleteProduct,
};