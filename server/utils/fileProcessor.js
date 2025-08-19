import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export class FileProcessor {
    static async processTextFile(filePath) {
        try {
            const loader = new TextLoader(filePath);
            const docs = await loader.load();
            
            return {
                content: docs.map(doc => doc.pageContent).join('\n'),
                metadata: {
                    type: 'text',
                    encoding: 'utf-8',
                    pages: docs.length
                }
            };
        } catch (error) {
            throw new Error(`Failed to process text file: ${error.message}`);
        }
    }

    static async processPDFFile(filePath) {
        try {
            const loader = new PDFLoader(filePath, {
                splitPages: false, // We'll handle chunking in VectorService
            });
            const docs = await loader.load();
            
            return {
                content: docs.map(doc => doc.pageContent).join('\n'),
                metadata: {
                    type: 'pdf',
                    pages: docs.length,
                    ...docs[0]?.metadata
                }
            };
        } catch (error) {
            throw new Error(`Failed to process PDF file: ${error.message}`);
        }
    }

    static async processCSVFile(filePath) {
        try {
            const loader = new CSVLoader(filePath);
            const docs = await loader.load();
            
            return {
                content: docs.map(doc => doc.pageContent).join('\n'),
                metadata: {
                    type: 'csv',
                    rowCount: docs.length,
                    source: filePath
                }
            };
        } catch (error) {
            throw new Error(`Failed to process CSV file: ${error.message}`);
        }
    }

    static async processWebURL(url) {
        try {
            const loader = new CheerioWebBaseLoader(url, {
                selector: "body",
            });
            const docs = await loader.load();
            
            return {
                content: docs.map(doc => doc.pageContent).join('\n'),
                metadata: {
                    type: 'website',
                    url,
                    title: docs[0]?.metadata?.title || url,
                    fetchedAt: new Date().toISOString(),
                    ...docs[0]?.metadata
                }
            };
        } catch (error) {
            throw new Error(`Failed to process URL: ${error.message}`);
        }
    }

    static async processFile(filePath, originalName) {
        if (!originalName) {
            throw new Error('Original filename is required for file processing');
        }
        const extension = originalName.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return await this.processPDFFile(filePath);
            case 'csv':
                return await this.processCSVFile(filePath);
            case 'txt':
            case 'md':
            case 'json':
            default:
                return await this.processTextFile(filePath);
        }
    }

    // Legacy method for simple text chunking (kept for compatibility)
    static chunkText(text, chunkSize = 1000, overlap = 200) {
        const chunks = [];
        let start = 0;
        
        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            const chunk = text.slice(start, end);
            
            chunks.push({
                text: chunk,
                start,
                end,
                length: chunk.length
            });
            
            if (end === text.length) break;
            start = end - overlap;
        }
        
        return chunks;
    }
}