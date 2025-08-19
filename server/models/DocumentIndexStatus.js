import { query } from '../db.js';

export class DocumentIndexStatusModel {
    static async create(documentId, status = 'pending') {
        const result = await query(`
            INSERT INTO document_index_status (document_id, status)
            VALUES ($1, $2)
            RETURNING *
        `, [documentId, status]);
        
        return result.rows[0];
    }

    static async updateStatus(documentId, status, errorMessage = null) {
        const result = await query(`
            UPDATE document_index_status 
            SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE document_id = $3
            RETURNING *
        `, [status, errorMessage, documentId]);
        
        return result.rows[0];
    }

    static async completeIndexing(documentId, totalChunks, processedChunks) {
        const result = await query(`
            UPDATE document_index_status 
            SET status = $1, indexed_at = CURRENT_TIMESTAMP, 
                total_chunks = $2, processed_chunks = $3, 
                updated_at = CURRENT_TIMESTAMP
            WHERE document_id = $4
            RETURNING *
        `, ['completed', totalChunks, processedChunks, documentId]);
        
        return result.rows[0];
    }

    static async resetForUser(userId) {
        await query(`
            UPDATE document_index_status 
            SET status = 'pending', indexed_at = NULL, total_chunks = 0, processed_chunks = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE document_id IN (
                SELECT d.id FROM documents d WHERE d.user_id = $1
            )
        `, [userId]);
    }

    static async findByDocumentId(documentId) {
        const result = await query(
            'SELECT * FROM document_index_status WHERE document_id = $1',
            [documentId]
        );
        return result.rows[0];
    }
}