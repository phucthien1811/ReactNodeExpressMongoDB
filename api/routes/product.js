import express from 'express';
import productController from '../controllers/product.controller.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// Public routes - Không cần auth
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Admin routes - Cần auth và role admin
router.get('/export/excel', auth, authorizeRoles(['admin']), productController.exportProductsToExcel);
router.post('/', auth, authorizeRoles(['admin']), productController.createProduct);
router.put('/:id', auth, authorizeRoles(['admin']), productController.updateProduct);
router.delete('/:id', auth, authorizeRoles(['admin']), productController.deleteProduct);
router.patch('/:id/visibility', auth, authorizeRoles(['admin']), productController.toggleVisibility);
router.patch('/:id/stock', auth, authorizeRoles(['admin']), productController.updateStock);

export default router;
