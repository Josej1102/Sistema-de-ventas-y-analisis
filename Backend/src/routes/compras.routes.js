const express = require('express');

const router = express.Router();

const {crearCompra} = require('../controllers/compras.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

router.post('/', authMiddleware, requireRole('admin'), crearCompra);

module.exports = router;