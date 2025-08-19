import { query } from '../db.js';

export class ChatModel {
    static async createSession(sessionId, userId, title = 'Chat Session') {
        await query(`
            INSERT INTO chat_sessions (session_id, user_id, title)
            VALUES ($1, $2, $3)
            ON CONFLICT (session_id) DO NOTHING
        `, [sessionId, userId, title]);
    }

    static async createMessage(sessionId, messageType, content, sources = []) {
        const result = await query(`
            INSERT INTO chat_messages (session_id, message_type, content, sources)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [sessionId, messageType, content, JSON.stringify(sources)]);
        
        return result.rows[0];
    }

    static async getMessagesBySessionId(sessionId) {
        const result = await query(`
            SELECT message_type, content, sources, created_at
            FROM chat_messages 
            WHERE session_id = $1
            ORDER BY created_at ASC
        `, [sessionId]);

        return result.rows.map((row, index) => ({
            id: index + 1,
            type: row.message_type,
            content: row.content,
            sources: row.sources || [],
            timestamp: row.created_at
        }));
    }

    static async deleteMessagesBySessionId(sessionId) {
        await query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId]);
    }

    static async getSessionsByUserId(userId) {
        const result = await query(`
            SELECT session_id, title, created_at, updated_at
            FROM chat_sessions 
            WHERE user_id = $1
            ORDER BY updated_at DESC
        `, [userId]);
        
        return result.rows;
    }
}