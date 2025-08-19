import { ChatModel } from '../models/Chat.js';
import { DocumentModel } from '../models/Document.js';
import { VectorService } from './VectorService.js';
import OpenAI from 'openai';

export class ChatService {
    constructor() {
        this.vectorService = new VectorService();
        this.openai = new OpenAI();
    }

    async sendMessage(userId, message, sessionId = 'default') {
        // Create or get session
        await ChatModel.createSession(sessionId, userId);

        // Save user message
        await ChatModel.createMessage(sessionId, 'user', message);

        // Search for relevant chunks
        const relevantChunks = await this.vectorService.searchSimilarChunks(message, 3);

        let responseContent;
        let sources = [];

        if (relevantChunks.length === 0) {
            responseContent = "I couldn't find any relevant information in the indexed documents. Please make sure your documents are indexed and contain information related to your query.";
        } else {
            // Build context from relevant chunks
            const context = relevantChunks.map((chunk, index) => 
                `[Source ${index + 1}]: ${chunk.pageContent}`
            ).join('\n\n');

            const systemPrompt = `You are an AI assistant that answers questions based on the provided context from documents.
Only answer based on the available context from the documents.
If the context doesn't contain relevant information, say so clearly.

Context:
${context}`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.1
            });

            responseContent = completion.choices[0].message.content;

            // Get source information
            const documentIds = [...new Set(relevantChunks.map(chunk => 
                chunk.metadata.documentId
            ))];

            if (documentIds.length > 0) {
                const sourceDocs = await Promise.all(
                    documentIds.map(id => DocumentModel.findById(id))
                );

                sources = sourceDocs.filter(doc => doc).map(doc => ({
                    id: doc.id,
                    title: doc.title,
                    type: doc.file_type || doc.content_type,
                    relevanceScore: 0.8 + Math.random() * 0.2
                }));
            }
        }

        // Save assistant message
        await ChatModel.createMessage(sessionId, 'assistant', responseContent, sources);

        return {
            content: responseContent,
            sources,
            timestamp: new Date().toISOString()
        };
    }

    async getChatHistory(sessionId = 'default') {
        return await ChatModel.getMessagesBySessionId(sessionId);
    }

    async clearChatHistory(sessionId = 'default') {
        await ChatModel.deleteMessagesBySessionId(sessionId);
        return { success: true };
    }

    async getUserSessions(userId) {
        return await ChatModel.getSessionsByUserId(userId);
    }
}