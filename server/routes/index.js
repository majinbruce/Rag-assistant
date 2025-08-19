import express from 'express';
import documentRoutes from './documentRoutes.js';
import chatRoutes from './chatRoutes.js';
import authRoutes from './authRoutes.js';
import { VectorService } from '../services/VectorService.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const vectorService = new VectorService();
        const vectorInfo = await vectorService.getCollectionInfo();
        
        res.json({
            status: 'healthy',
            database: 'connected',
            vectorStore: vectorInfo ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;