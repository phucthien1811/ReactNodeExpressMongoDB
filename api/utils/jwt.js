import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiresIn,
    });
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
    });
    return { accessToken, refreshToken };
};

const verifyToken = (token, isRefresh = false) => {
    const secret = isRefresh ? config.jwt.refreshSecret : config.jwt.accessSecret;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

export { generateTokens, verifyToken };
