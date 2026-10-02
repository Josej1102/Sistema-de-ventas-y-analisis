const express = require('express');
const router = express.Router();

const {createClients,
    getClients,
    getClientID,
    deleteClient,
    updateCliente} = require('../controllers/clients.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const requireRol = require('../middlewares/roleMiddleware')

router.get('/', authMiddleware, getClients);
router.get('/:id', authMiddleware, getClientID);
router.post('/', authMiddleware, createClients);
router.put('/:id', authMiddleware, updateCliente);
router.delete('/:id', authMiddleware, requireRol('admin'), deleteClient);

module.exports = router;