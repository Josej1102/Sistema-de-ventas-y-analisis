const express = require('express');
const router = express.Router();

const {createVenta, getVenta, getVentaID, anularVenta} = require('../controllers/ventas.controller');

const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getVenta);
router.get('/:id', authMiddleware, getVentaID);
router.post('/', authMiddleware, createVenta);
router.patch('/:id/anular', authMiddleware, anularVenta);

module.exports = router;