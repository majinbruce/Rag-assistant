import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database tables...');
        
        // Read the SQL file
        const sqlPath = join(__dirname, '..', 'database.sql');
        const sqlScript = readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL script
        await pool.query(sqlScript);
        
        console.log('✅ Database tables initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize database tables:', error);
        return false;
    }
}

export async function checkDatabaseConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connection verified at:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}