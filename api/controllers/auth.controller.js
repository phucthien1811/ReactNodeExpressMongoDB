import { registerUser, loginUserWithEmailAndPassword, refreshAuthToken } from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validations/auth.js';

export const register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }
        
        const result = await registerUser(value);
        res.status(201).json(result);
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        
        const { email, password } = value;
        const result = await loginUserWithEmailAndPassword(email, password);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const result = await refreshAuthToken(refreshToken);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 401).json({ message: error.message });
    }
};

