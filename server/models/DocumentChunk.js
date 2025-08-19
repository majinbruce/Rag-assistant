import { query } from '../db.js';

export class DocumentChunkModel {
    static async create(chunkData) {
        const { documentId, chunkIndex, chunkText, chunkMetadata, qdrantPointId } = chunkData;
        
        const result = await query(`
            INSERT INTO document_chunks (document_id, chunk_index, chunk_text, chunk_metadata, qdrant_point_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [documentId, chunkIndex, chunkText, JSON.stringify(chunkMetadata), qdrantPointId]);
        
        return result.rows[0];
    }

    static async findByDocumentId(documentId) {
        const result = await query(
            'SELECT * FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index',
            [documentId]
        );
        return result.rows;
    }

    static async deleteByDocumentId(documentId) {
        await query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
    }

    static async deleteForUser(userId) {
        await query(`
            DELETE FROM document_chunks 
            WHERE document_id IN (
                SELECT d.id FROM documents d WHERE d.user_id = $1
            )
        `, [userId]);
    }

    static async getPointIdsForUser(userId) {
        const result = await query(`
            SELECT dc.qdrant_point_id
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.user_id = $1 AND dc.qdrant_point_id IS NOT NULL
        `, [userId]);
        
        return result.rows.map(row => row.qdrant_point_id);
    }

    static async getPointIdsForDocument(documentId) {
        const result = await query(
            'SELECT qdrant_point_id FROM document_chunks WHERE document_id = $1 AND qdrant_point_id IS NOT NULL',
            [documentId]
        );
        
        return result.rows.map(row => row.qdrant_point_id);
    }
}