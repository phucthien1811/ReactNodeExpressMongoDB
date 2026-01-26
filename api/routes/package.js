import express from 'express';
import packageController from '../controllers/package.controller.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// Public routes (cho member)
router.get('/public', packageController.getPublicPackages);

// Test route (tạm thời không cần auth)
router.post('/test', packageController.createPackage);

// Protected routes (cần đăng nhập)
router.use(auth);

// Admin only routes
router.get('/', authorizeRoles(['admin']), packageController.getAllPackages);
router.post('/', authorizeRoles(['admin']), packageController.createPackage);
router.get('/:id', packageController.getPackageById);
router.put('/:id', authorizeRoles(['admin']), packageController.updatePackage);
router.delete('/:id', authorizeRoles(['admin']), packageController.deletePackage);
router.post('/:id/toggle-published', authorizeRoles(['admin']), packageController.togglePublished);
router.get('/:id/members/export', authorizeRoles(['admin']), packageController.exportPackageMembers);
router.get('/:id/members', authorizeRoles(['admin']), packageController.getPackageMembers);

export default router;