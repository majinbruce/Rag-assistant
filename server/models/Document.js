import { query } from '../db.js';

export class DocumentModel {
    static async findAllByUserId(userId) {
        const result = await query(`
            SELECT d.*, dis.status as index_status, dis.indexed_at, dis.total_chunks
            FROM documents d
            LEFT JOIN document_index_status dis ON d.id = dis.document_id
            WHERE d.user_id = $1
            ORDER BY d.created_at DESC
        `, [userId]);
        
        return result.rows;
    }

    static async findById(id, userId = null) {
        let queryText = 'SELECT * FROM documents WHERE id = $1';
        let params = [id];
        
        if (userId) {
            queryText += ' AND user_id = $2';
            params.push(userId);
        }
        
        const result = await query(queryText, params);
        return result.rows[0];
    }

    static async findWithChunks(id, userId) {
        const result = await query(`
            SELECT d.*, array_agg(dc.qdrant_point_id) as point_ids
            FROM documents d
            LEFT JOIN document_chunks dc ON d.id = dc.document_id
            WHERE d.id = $1 AND d.user_id = $2
            GROUP BY d.id
        `, [id, userId]);
        
        return result.rows[0];
    }

    static async create(documentData) {
        const {
            title, content, contentType, fileType, fileSize, 
            filePath, url, userId, metadata
        } = documentData;

        const result = await query(`
            INSERT INTO documents (title, content, content_type, file_type, file_size, file_path, url, user_id, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [title, content, contentType, fileType, fileSize, filePath, url, userId, JSON.stringify(metadata || {})]);

        return result.rows[0];
    }

    static async delete(id, userId) {
        const result = await query(
            'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        return result.rows[0];
    }

    static async findIndexedByUserId(userId) {
        const result = await query(`
            SELECT d.*, dis.indexed_at, dis.total_chunks
            FROM documents d
            JOIN document_index_status dis ON d.id = dis.document_id
            WHERE d.user_id = $1 AND dis.status = 'completed'
            ORDER BY dis.indexed_at DESC
        `, [userId]);
        
        return result.rows;
    }

    static async getIndexedDocumentIds(userId) {
        const result = await query(`
            SELECT d.id
            FROM documents d
            JOIN document_index_status dis ON d.id = dis.document_id
            WHERE d.user_id = $1 AND dis.status = 'completed'
        `, [userId]);
        
        return result.rows.map(row => row.id);
    }
}