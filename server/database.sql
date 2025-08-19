-- Create database schema for RAG application

-- Users table (for future multi-user support)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'file', 'url'
    file_type VARCHAR(100), -- 'pdf', 'csv', 'txt', 'html', etc.
    file_size BIGINT,
    file_path VARCHAR(1000), -- local storage path for files
    url VARCHAR(1000), -- original URL if type is 'url'
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}', -- additional metadata like page count, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document chunks table (for storing text chunks that will be embedded)
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB DEFAULT '{}', -- page number, section, etc.
    qdrant_point_id VARCHAR(100), -- reference to vector in Qdrant
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index status table
CREATE TABLE IF NOT EXISTS document_index_status (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    indexed_at TIMESTAMP,
    error_message TEXT,
    total_chunks INTEGER DEFAULT 0,
    processed_chunks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id)
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]', -- array of source document references
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_content_type ON documents(content_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_qdrant_point_id ON document_chunks(qdrant_point_id);

CREATE INDEX IF NOT EXISTS idx_document_index_status_document_id ON document_index_status(document_id);
CREATE INDEX IF NOT EXISTS idx_document_index_status_status ON document_index_status(status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create a default user for development
INSERT INTO users (username, email, password_hash) 
VALUES ('default', 'default@example.com', '$2b$10$defaulthash') 
ON CONFLICT (username) DO NOTHING;