import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // DEBUG: Log decoded token
    console.log('🔍 Decoded token:', decoded);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ JWT Error:', err.message);
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};
