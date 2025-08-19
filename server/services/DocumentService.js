import { DocumentModel } from '../models/Document.js';
import { DocumentIndexStatusModel } from '../models/DocumentIndexStatus.js';
import { DocumentChunkModel } from '../models/DocumentChunk.js';
import { VectorService } from './VectorService.js';
import { query } from '../db.js';
import fs from 'fs/promises';

export class DocumentService {
    constructor() {
        this.vectorService = new VectorService();
    }

    async getAllDocuments(userId) {
        return await DocumentModel.findAllByUserId(userId);
    }

    async createTextDocument(userId, content, title) {
        const documentTitle = title || `Text Document - ${new Date().toISOString()}`;
        
        const document = await DocumentModel.create({
            title: documentTitle,
            content,
            contentType: 'text',
            fileType: 'text',
            fileSize: Buffer.byteLength(content, 'utf8'),
            userId,
            metadata: { manual: true }
        });

        await DocumentIndexStatusModel.create(document.id);
        return document;
    }

    async createFileDocument(userId, fileData, processedContent) {
        const { originalname, size, path: filePath } = fileData;
        const fileExtension = originalname.split('.').pop().toLowerCase();

        const document = await DocumentModel.create({
            title: originalname,
            content: processedContent.content,
            contentType: 'file',
            fileType: fileExtension,
            fileSize: size,
            filePath,
            userId,
            metadata: processedContent.metadata
        });

        await DocumentIndexStatusModel.create(document.id);
        return document;
    }

    async createUrlDocument(userId, url, processedContent) {
        const document = await DocumentModel.create({
            title: processedContent.metadata.title || url,
            content: processedContent.content,
            contentType: 'url',
            fileType: 'html',
            fileSize: Buffer.byteLength(processedContent.content, 'utf8'),
            url,
            userId,
            metadata: processedContent.metadata
        });

        await DocumentIndexStatusModel.create(document.id);
        return document;
    }

    async deleteDocument(documentId, userId) {
        const document = await DocumentModel.findWithChunks(documentId, userId);
        
        if (!document) {
            throw new Error('Document not found');
        }

        // Delete from vector store if indexed
        if (document.point_ids && document.point_ids[0]) {
            const pointIds = document.point_ids.filter(id => id);
            if (pointIds.length > 0) {
                try {
                    await this.vectorService.deleteDocumentChunks(pointIds);
                } catch (vectorError) {
                    console.error('Error deleting from vector store:', vectorError);
                }
            }
        }

        // Delete file if it exists
        if (document.file_path) {
            try {
                await fs.unlink(document.file_path);
            } catch (fileError) {
                console.error('Error deleting file:', fileError);
            }
        }

        // Delete from database
        await DocumentModel.delete(documentId, userId);
        
        return { success: true };
    }

    async indexDocument(documentId, userId) {
        const document = await DocumentModel.findById(documentId, userId);
        
        if (!document) {
            throw new Error('Document not found');
        }

        try {
            // Update status to processing
            await DocumentIndexStatusModel.updateStatus(documentId, 'processing');

            // Use LangChain to chunk and add to vector store
            const result = await this.vectorService.addDocumentToVectorStore(
                document.content, 
                documentId, 
                {
                    title: document.title,
                    fileType: document.file_type,
                    contentType: document.content_type
                }
            );

            // Store chunks in database
            for (let i = 0; i < result.chunks.length; i++) {
                await DocumentChunkModel.create({
                    documentId,
                    chunkIndex: i,
                    chunkText: result.chunks[i].text,
                    chunkMetadata: result.chunks[i].metadata,
                    qdrantPointId: result.pointIds[i]
                });
            }

            // Update index status to completed
            await DocumentIndexStatusModel.completeIndexing(documentId, result.chunks.length, result.chunks.length);

            return { success: true, chunks: result.chunks.length };
        } catch (error) {
            // Update status to failed
            await DocumentIndexStatusModel.updateStatus(documentId, 'failed', error.message);
            throw error;
        }
    }

    async getIndexedDocuments(userId) {
        return await DocumentModel.findIndexedByUserId(userId);
    }

    async clearIndex(userId) {
        // Get all point IDs for this user's indexed documents
        const pointIds = await DocumentChunkModel.getPointIdsForUser(userId);

        // Delete from vector store
        if (pointIds.length > 0) {
            await this.vectorService.deleteDocumentChunks(pointIds);
        }

        // Reset index status
        await DocumentIndexStatusModel.resetForUser(userId);

        // Delete chunks
        await DocumentChunkModel.deleteForUser(userId);

        // Clear all chat history for this user to prevent accessing deleted document context
        await query('DELETE FROM chat_messages WHERE session_id IN (SELECT session_id FROM chat_sessions WHERE user_id = $1)', [userId]);
        await query('DELETE FROM chat_sessions WHERE user_id = $1', [userId]);

        return { success: true };
    }

    async deindexDocument(documentId, userId) {
        const document = await DocumentModel.findById(documentId, userId);
        
        if (!document) {
            throw new Error('Document not found');
        }

        try {
            // Get point IDs for this document
            const pointIds = await DocumentChunkModel.getPointIdsForDocument(documentId);

            // Delete from vector store if indexed
            if (pointIds.length > 0) {
                await this.vectorService.deleteDocumentChunks(pointIds);
            }

            // Reset index status to pending
            await DocumentIndexStatusModel.updateStatus(documentId, 'pending');

            // Delete chunks for this document
            await DocumentChunkModel.deleteByDocumentId(documentId);

            return { success: true, message: 'Document removed from index successfully' };
        } catch (error) {
            console.error('Error deindexing document:', error);
            throw new Error('Failed to remove document from index');
        }
    }
}