import express from 'express';
const router = express.Router();

router.get('/health1', (req, res) => {
    res.json({ status: 'Portfolio1 service is running' });
});

export default router;