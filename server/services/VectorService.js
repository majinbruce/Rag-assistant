import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from 'uuid';

export class VectorService {
    constructor() {
        this.embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });
        
        this.qdrantConfig = {
            url: process.env.QDRANT_URL,
            collectionName: process.env.QDRANT_COLLECTION_NAME,
            checkCompatibility: false, // Skip version check for Railway deployment
        };
        
        this.vectorStore = null;
        
        // Initialize text splitter with LangChain
        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
        });
    }

    async initialize() {
        try {
            // Try to connect to existing collection
            this.vectorStore = await QdrantVectorStore.fromExistingCollection(
                this.embeddings,
                this.qdrantConfig
            );
            console.log('Connected to existing Qdrant collection');
        } catch (error) {
            console.log('Creating new Qdrant collection...');
            // Create new collection if it doesn't exist
            this.vectorStore = new QdrantVectorStore(this.embeddings, this.qdrantConfig);
            console.log('Created new Qdrant collection');
        }
    }

    async addDocumentToVectorStore(content, documentId, metadata = {}) {
        if (!this.vectorStore) {
            await this.initialize();
        }

        try {
            // Create a Document object
            const document = new Document({
                pageContent: content,
                metadata: { ...metadata, documentId }
            });

            // Split the document into chunks using LangChain's text splitter
            const chunks = await this.textSplitter.splitDocuments([document]);
            
            const pointIds = [];
            const langchainDocuments = [];

            // Add point IDs and enhance metadata for each chunk
            for (let i = 0; i < chunks.length; i++) {
                const pointId = uuidv4();
                pointIds.push(pointId);
                
                chunks[i].metadata = {
                    ...chunks[i].metadata,
                    chunkIndex: i,
                    pointId,
                    totalChunks: chunks.length
                };
                
                langchainDocuments.push(chunks[i]);
            }

            // Add documents to vector store
            await this.vectorStore.addDocuments(langchainDocuments);
            
            return { pointIds, chunks: chunks.map(chunk => ({
                text: chunk.pageContent,
                metadata: chunk.metadata
            }))};
        } catch (error) {
            console.error('Error adding document to vector store:', error);
            throw new Error(`Failed to add document to vector store: ${error.message}`);
        }
    }

    async searchSimilarChunks(query, k = 3, documentIds = null) {
        if (!this.vectorStore) {
            await this.initialize();
        }

        try {
            let retriever;
            if (documentIds && documentIds.length > 0) {
                // Filter by specific documents
                retriever = this.vectorStore.asRetriever({
                    k,
                    filter: {
                        should: documentIds.map(id => ({
                            key: "metadata.documentId",
                            match: { value: id.toString() }
                        }))
                    }
                });
            } else {
                retriever = this.vectorStore.asRetriever({ k });
            }

            const results = await retriever.invoke(query);
            return results;
        } catch (error) {
            console.error('Error searching vector store:', error);
            throw new Error(`Failed to search vector store: ${error.message}`);
        }
    }

    async deleteDocumentChunks(pointIds) {
        if (!this.vectorStore) {
            await this.initialize();
        }

        try {
            // Qdrant client to delete specific points
            const { QdrantClient } = await import('@qdrant/qdrant-js');
            const client = new QdrantClient({ 
                url: process.env.QDRANT_URL,
                checkCompatibility: false 
            });
            
            await client.delete(this.qdrantConfig.collectionName, {
                points: pointIds
            });
            
            console.log(`Deleted ${pointIds.length} points from Qdrant`);
        } catch (error) {
            console.error('Error deleting from vector store:', error);
            throw new Error(`Failed to delete from vector store: ${error.message}`);
        }
    }

    async getCollectionInfo() {
        if (!this.vectorStore) {
            await this.initialize();
        }

        try {
            const { QdrantClient } = await import('@qdrant/qdrant-js');
            const client = new QdrantClient({ 
                url: process.env.QDRANT_URL,
                checkCompatibility: false 
            });
            
            const info = await client.getCollection(this.qdrantConfig.collectionName);
            return info;
        } catch (error) {
            console.error('Error getting collection info:', error);
            return null;
        }
    }
}