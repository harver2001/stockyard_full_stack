import express from 'express';
const router = express.Router();
import Portfolio from './schema.js';
import jwt from 'jsonwebtoken';

router.get('/health1', (req, res) => {
    res.json({ status: 'Portfolio1 service is running' });
});

// MIDDLEWARE for JWT AUTH VALIDATION CHECK
const jwtTokenValidationMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

router.get('/portfolio', jwtTokenValidationMiddleware, (req, res) => {
    try {
        const userId = req.user.user_id || req.user.sub || req.user.id;
        Portfolio.findOne({ userId: userId }).then((portfolio) => {
            res.status(200).json(portfolio ? portfolio.stocks : []);
        }).catch((err) => {
            res.status(400).json({ message: err.message });
        })
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
})
export default router;