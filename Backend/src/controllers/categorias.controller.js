const pool = require("../config/db");
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');



//Obtener categorías 
const getCategorias = asyncHandler(async (req, res) => {

    const result = await pool.query(`
        SELECT id_categoria, nombre, descripcion, estado 
        FROM categorias
        ORDER BY id_categoria DESC 
        `);
        res.json(result.rows);
})

//Crear categoría

const createCategorias = asyncHandler(async (req, res) => {

    const {nombre, descripcion} = req.body;

    if (!nombre) {
    throw new AppError('El nombre es obligatorio', 400);
    }

    const result = await pool.query(`
        INSERT INTO categorias (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING *
        `, [nombre, descripcion]);
        res.status(201).json(result.rows[0]);
})

// Actualizar categoria
const updateCategoria = asyncHandler( async (req,res) => {
    const { id } = req.params;
    const { nombre, descripcion} = req.body;

    const result = await pool.query(`
        UPDATE categorias
        SET nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion)
        WHERE id_categoria = $3
        RETURNING *`,
        [nombre, descripcion, id]
        );

    if (result.rows.length === 0) {
        throw new AppError('Categoria no encontrado', 404);
    }
    res.json(result.rows[0]);
});

module.exports = {getCategorias, createCategorias, updateCategoria}