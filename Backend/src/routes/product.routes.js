const express = require('express');
const router = express.Router();

const {getProducts, 
    createProduct, 
    getProductsId,
    updateProduct,
    deleteProduct} = require('../controllers/products.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const requireRol = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, getProducts);
router.get('/:id', authMiddleware, getProductsId);
router.post('/', authMiddleware, requireRol('admin'), createProduct);
router.put('/:id', authMiddleware, requireRol('admin'), updateProduct);
router.delete('/:id', authMiddleware, requireRol('admin'), deleteProduct);

module.exports = router;