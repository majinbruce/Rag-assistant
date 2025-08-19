import express from 'express';
import { ChatController } from '../controllers/ChatController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const chatController = new ChatController();

// Apply authentication to all chat routes
router.use(authenticateToken);

// Send message
router.post('/', (req, res) => chatController.sendMessage(req, res));

// Get chat history
router.get('/:sessionId?', (req, res) => chatController.getChatHistory(req, res));

// Clear chat history
router.delete('/:sessionId?', (req, res) => chatController.clearChatHistory(req, res));

// Get user sessions
router.get('/sessions/list', (req, res) => chatController.getUserSessions(req, res));

export default router;