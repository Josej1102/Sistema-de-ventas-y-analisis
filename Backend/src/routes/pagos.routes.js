const express = require('express');
const router = express.Router();

const {createPago, getPagos, getPagosID, reembolsarPago} = require('../controllers/pagos.controller');

const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getPagos);
router.get('/:id', authMiddleware, getPagosID);
router.post('/', authMiddleware, createPago);
router.patch('/:id/reembolsar', authMiddleware, reembolsarPago);

module.exports = router;