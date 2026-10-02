const express = require('express');
const router = express.Router();

const {getMetodoPago} = require('../controllers/metodosPago.controller');

const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getMetodoPago);

module.exports = router;