import express from 'express';
import { DocumentController } from '../controllers/DocumentController.js';
import { upload } from '../middlewares/upload.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const documentController = new DocumentController();

// Apply authentication to all document routes
router.use(authenticateToken);

// Get all documents
router.get('/', (req, res) => documentController.getAllDocuments(req, res));

// Add text document
router.post('/', (req, res) => documentController.createTextDocument(req, res));

// Upload file document
router.post('/file', upload.single('file'), (req, res) => documentController.uploadFileDocument(req, res));

// Add URL document
router.post('/url', (req, res) => documentController.createUrlDocument(req, res));

// Get indexed documents
router.get('/indexed', (req, res) => documentController.getIndexedDocuments(req, res));

// Clear index
router.delete('/indexed', (req, res) => documentController.clearIndex(req, res));

// Index document
router.post('/:id/index', (req, res) => documentController.indexDocument(req, res));

// Deindex document (remove from vector index)
router.delete('/:id/index', (req, res) => documentController.deindexDocument(req, res));

// Delete document
router.delete('/:id', (req, res) => documentController.deleteDocument(req, res));

export default router;