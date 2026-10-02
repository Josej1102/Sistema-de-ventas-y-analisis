const express = require('express');
const router = express.Router();

const {createEmpleado,
    getEmpleados,
    getEmpleadoID,
    deleteEmpleado,
    updateEmpleado} = require('../controllers/empleados.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const requireRol = require('../middlewares/roleMiddleware')

router.get('/', authMiddleware, requireRol('admin'), getEmpleados);
router.get('/:id', authMiddleware, requireRol('admin'), getEmpleadoID);
router.post('/', authMiddleware, requireRol('admin'), createEmpleado);
router.put('/:id', authMiddleware, requireRol('admin'), updateEmpleado);
router.delete('/:id', authMiddleware, requireRol('admin'), deleteEmpleado);

module.exports = router;