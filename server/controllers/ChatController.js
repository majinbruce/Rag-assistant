import { ChatService } from '../services/ChatService.js';

export class ChatController {
    constructor() {
        this.chatService = new ChatService();
    }

    async sendMessage(req, res) {
        try {
            const { message, sessionId = 'default' } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            const userId = req.user.id;
            const result = await this.chatService.sendMessage(userId, message, sessionId);
            
            res.json(result);
        } catch (error) {
            console.error('Error in chat:', error);
            res.status(500).json({ error: 'Failed to process chat message' });
        }
    }

    async getChatHistory(req, res) {
        try {
            const sessionId = req.params.sessionId || 'default';
            const messages = await this.chatService.getChatHistory(sessionId);
            
            res.json(messages);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            res.status(500).json({ error: 'Failed to fetch chat history' });
        }
    }

    async clearChatHistory(req, res) {
        try {
            const sessionId = req.params.sessionId || 'default';
            const result = await this.chatService.clearChatHistory(sessionId);
            
            res.json(result);
        } catch (error) {
            console.error('Error clearing chat history:', error);
            res.status(500).json({ error: 'Failed to clear chat history' });
        }
    }

    async getUserSessions(req, res) {
        try {
            const userId = req.user.id;
            const sessions = await this.chatService.getUserSessions(userId);
            
            res.json(sessions);
        } catch (error) {
            console.error('Error fetching user sessions:', error);
            res.status(500).json({ error: 'Failed to fetch user sessions' });
        }
    }
}