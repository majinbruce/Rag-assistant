import fs from 'fs/promises';

export const errorHandler = (error, req, res, next) => {
    console.error('Error occurred:', error);

    // Clean up uploaded file on error
    if (req.file) {
        fs.unlink(req.file.path).catch(unlinkError => {
            console.error('Error cleaning up file:', unlinkError);
        });
    }

    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum size is 50MB.' });
    }

    if (error.message === 'Unsupported file type') {
        return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, TXT, CSV, MD, or JSON files.' });
    }

    // Handle database errors
    if (error.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(400).json({ error: 'Duplicate entry found' });
    }

    if (error.code === '23503') { // PostgreSQL foreign key constraint violation
        return res.status(400).json({ error: 'Referenced record not found' });
    }

    // Generic server error
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Route not found' });
};