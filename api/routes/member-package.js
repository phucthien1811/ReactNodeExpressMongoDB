import express from 'express';
import memberPackageController from '../controllers/member-package.controller.js';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Member package routes working!' });
});

// Test routes (tạm thời không cần auth để debug)
router.get('/member/:memberId', (req, res) => {
  console.log('GET member packages route hit');
  memberPackageController.getMemberPackages(req, res);
});

router.get('/member/:memberId/current', (req, res) => {
  console.log('GET current package route hit');
  memberPackageController.getCurrentPackage(req, res);
});

router.post('/register', (req, res) => {
  console.log('POST register route hit', req.body);
  memberPackageController.registerPackage(req, res);
});

// Protected routes (cần đăng nhập)
router.use(auth);

// Admin routes
router.get('/', authorizeRoles(['admin']), memberPackageController.getAllMemberPackages);
router.post('/update-expired', authorizeRoles(['admin']), memberPackageController.updateExpiredPackages);
router.get('/stats', authorizeRoles(['admin']), memberPackageController.getPackageStats);
router.post('/:id/extend', authorizeRoles(['admin']), memberPackageController.extendPackage);
router.post('/:id/cancel', authorizeRoles(['admin']), memberPackageController.cancelPackage);
router.delete('/:memberPackageId/remove', authorizeRoles(['admin']), memberPackageController.removeMemberFromPackage);
router.post('/add-free', authorizeRoles(['admin']), memberPackageController.addMemberToPackageFree);

export default router;