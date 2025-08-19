import { DocumentService } from '../services/DocumentService.js';
import { FileProcessor } from '../utils/fileProcessor.js';

export class DocumentController {
    constructor() {
        this.documentService = new DocumentService();
    }

    async getAllDocuments(req, res) {
        try {
            const userId = req.user.id;
            const documents = await this.documentService.getAllDocuments(userId);
            res.json(documents);
        } catch (error) {
            console.error('Error fetching documents:', error);
            res.status(500).json({ error: 'Failed to fetch documents' });
        }
    }

    async createTextDocument(req, res) {
        try {
            const { content, title } = req.body;
            
            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const userId = req.user.id;
            const document = await this.documentService.createTextDocument(userId, content, title);
            
            res.status(201).json(document);
        } catch (error) {
            console.error('Error adding text document:', error);
            res.status(500).json({ error: 'Failed to add document' });
        }
    }

    async uploadFileDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const userId = req.user.id;
            
            // Process file content using LangChain loaders
            const processedContent = await FileProcessor.processFile(
                req.file.path, 
                req.file.originalname
            );

            const document = await this.documentService.createFileDocument(
                userId,
                req.file,
                processedContent
            );

            res.status(201).json(document);
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }

    async createUrlDocument(req, res) {
        try {
            const { url } = req.body;
            
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            const userId = req.user.id;
            
            // Process URL content using LangChain
            const processedContent = await FileProcessor.processWebURL(url);

            const document = await this.documentService.createUrlDocument(
                userId,
                url,
                processedContent
            );

            res.status(201).json(document);
        } catch (error) {
            console.error('Error adding URL document:', error);
            res.status(500).json({ error: 'Failed to add URL document' });
        }
    }

    async deleteDocument(req, res) {
        try {
            const documentId = req.params.id;
            const userId = req.user.id;

            const result = await this.documentService.deleteDocument(documentId, userId);
            res.json(result);
        } catch (error) {
            console.error('Error deleting document:', error);
            if (error.message === 'Document not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to delete document' });
        }
    }

    async indexDocument(req, res) {
        try {
            const documentId = req.params.id;
            const userId = req.user.id;

            const result = await this.documentService.indexDocument(documentId, userId);
            res.json(result);
        } catch (error) {
            console.error('Error indexing document:', error);
            if (error.message === 'Document not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to index document' });
        }
    }

    async getIndexedDocuments(req, res) {
        try {
            const userId = req.user.id;
            const documents = await this.documentService.getIndexedDocuments(userId);
            res.json(documents);
        } catch (error) {
            console.error('Error fetching indexed documents:', error);
            res.status(500).json({ error: 'Failed to fetch indexed documents' });
        }
    }

    async clearIndex(req, res) {
        try {
            const userId = req.user.id;
            const result = await this.documentService.clearIndex(userId);
            res.json(result);
        } catch (error) {
            console.error('Error clearing index:', error);
            res.status(500).json({ error: 'Failed to clear index' });
        }
    }

    async deindexDocument(req, res) {
        try {
            const documentId = req.params.id;
            const userId = req.user.id;

            const result = await this.documentService.deindexDocument(documentId, userId);
            res.json(result);
        } catch (error) {
            console.error('Error deindexing document:', error);
            if (error.message === 'Document not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to remove document from index' });
        }
    }
}