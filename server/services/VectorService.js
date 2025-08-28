import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from 'uuid';

export class VectorService {
    constructor() {
        console.log('🚀 VectorService constructor called');
        console.log('Initial QDRANT_URL:', process.env.QDRANT_URL);
        
        this.embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });
        
        this.qdrantConfig = {
            url: process.env.QDRANT_URL || 'http://qdrant.railway.internal:6333',
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

    async testQdrantConnection(url, name) {
        try {
            console.log(`Testing ${name}: ${url}`);
            const { QdrantClient } = await import('@qdrant/qdrant-js');
            const testClient = new QdrantClient({
                url: url,
                apiKey: process.env.QDRANT_API_KEY,
            });
            
            // Test with 5 second timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`${name} timeout`)), 5000);
            });
            
            await Promise.race([
                testClient.getCollections(),
                timeoutPromise
            ]);
            console.log(`✅ ${name} SUCCESS`);
            return url;
        } catch (error) {
            console.log(`❌ ${name} FAILED: ${error.message}`);
            return null;
        }
    }

    async initialize() {
        try {
            console.log('=== Qdrant Initialization Starting ===');
            console.log('QDRANT_URL:', process.env.QDRANT_URL);
            console.log('QDRANT_COLLECTION_NAME:', process.env.QDRANT_COLLECTION_NAME);
            
            // Skip URL testing in development - use configured URL directly
            console.log('Using configured Qdrant URL:', this.qdrantConfig.url);
            
            // Try to connect to existing collection
            console.log('Attempting to connect to existing collection...');
            this.vectorStore = await QdrantVectorStore.fromExistingCollection(
                this.embeddings,
                this.qdrantConfig
            );
            console.log('Connected to existing Qdrant collection');
        } catch (error) {
            console.log('Error connecting to existing collection:', error.message);
            
            // Check if error indicates connection failure vs collection not existing
            if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
                console.error('❌ QDRANT CONNECTION FAILED - Cannot reach Qdrant server');
                console.error('URL:', this.qdrantConfig.url);
                console.error('This means documents cannot be indexed!');
                throw new Error(`Qdrant server unreachable at ${this.qdrantConfig.url}: ${error.message}`);
            }
            
            console.log('Creating new Qdrant collection...');
            try {
                // Create new collection if it doesn't exist
                this.vectorStore = new QdrantVectorStore(this.embeddings, this.qdrantConfig);
                console.log('Created new Qdrant collection');
            } catch (createError) {
                console.error('Failed to create Qdrant collection:', createError);
                throw new Error(`Qdrant initialization failed: ${createError.message}`);
            }
        }
        console.log('=== Qdrant Initialization Complete ===');
    }

    async addDocumentToVectorStore(content, documentId, metadata = {}) {
        console.log('📝 addDocumentToVectorStore called - ENTRY POINT');
        console.log('Document ID:', documentId);
        try {
            console.log('Starting addDocumentToVectorStore for document:', documentId);
            
            if (!this.vectorStore) {
                console.log('Vector store not initialized, initializing...');
                await this.initialize();
                console.log('Vector store initialization completed');
            }

            if (!this.vectorStore) {
                throw new Error('Vector store failed to initialize');
            }

            console.log('Creating document object...');
            // Create a Document object
            const document = new Document({
                pageContent: content,
                metadata: { ...metadata, documentId }
            });

            console.log('Splitting document into chunks...');
            // Split the document into chunks using LangChain's text splitter
            const chunks = await this.textSplitter.splitDocuments([document]);
            console.log(`Document split into ${chunks.length} chunks`);
            
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

            console.log('Adding documents to vector store...');
            console.log('Vector store config:', {
                url: this.qdrantConfig.url,
                collectionName: this.qdrantConfig.collectionName
            });
            
            // Add documents to vector store
            await this.vectorStore.addDocuments(langchainDocuments);
            console.log('Documents successfully added to vector store');
            
            return { pointIds, chunks: chunks.map(chunk => ({
                text: chunk.pageContent,
                metadata: chunk.metadata
            }))};
        } catch (error) {
            console.error('Error adding document to vector store:', error);
            console.error('Error stack:', error.stack);
            console.error('Vector store state:', !!this.vectorStore);
            console.error('Qdrant config:', this.qdrantConfig);
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