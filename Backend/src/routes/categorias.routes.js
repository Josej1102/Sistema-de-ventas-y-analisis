const express = require('express');
const router = express.Router();

const {getCategorias, createCategorias, updateCategoria} = require('../controllers/categorias.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const requireRol = require('../middlewares/roleMiddleware')

router.get('/', authMiddleware, getCategorias);
router.post('/', authMiddleware, requireRol('admin'), createCategorias);
router.put('/:id', authMiddleware, requireRol('admin'), updateCategoria);

module.exports = router;