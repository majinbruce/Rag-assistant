import { app, initializeServices } from './app.js';
import { pool } from './db.js';

const port = process.env.PORT || 8000;

async function startServer() {
    try {
        // Test database connection
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database');
        client.release();

        // Initialize services
        const servicesInitialized = await initializeServices();
        
        if (!servicesInitialized) {
            console.warn('Some services failed to initialize, but starting server anyway');
        }

        // Start server
        app.listen(port, () => {
            console.log(`🚀 RAG Server running on http://localhost:${port}`);
            console.log(`📊 Health check: http://localhost:${port}/api/health`);
            console.log(`📚 Documents API: http://localhost:${port}/api/documents`);
            console.log(`💬 Chat API: http://localhost:${port}/api/chat`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await pool.end();
    process.exit(0);
});

startServer();