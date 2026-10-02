const express = require('express');
const router = express.Router();


const {createProveedor,
    getProveedores,
    getProveedorID,
    deleteProveedor,
    updateProveedor} = require('../controllers/proveedores.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const requireRol = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, getProveedores);
router.get('/:id', authMiddleware, getProveedorID);
router.post('/', authMiddleware, requireRol('admin'), createProveedor);
router.put('/:id', authMiddleware, requireRol('admin'), updateProveedor);
router.delete('/:id', authMiddleware, requireRol('admin'), deleteProveedor);

module.exports = router;