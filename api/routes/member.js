import { Router } from 'express';
import { auth } from '../middleware/auth.js';

const router = Router();

// Member routes here
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Member profile' });
});

export default router;
