import { query } from '../db.js';

export class UserModel {
    static async findById(id) {
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByUsername(username) {
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async create(userData) {
        const { username, email, passwordHash } = userData;
        const result = await query(`
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
        `, [username, email, passwordHash]);
        
        return result.rows[0];
    }

    static async getDefaultUserId() {
        const result = await query('SELECT id FROM users WHERE username = $1', ['default']);
        return result.rows[0]?.id || 1;
    }

    static async updatePassword(id, passwordHash) {
        const result = await query(`
            UPDATE users 
            SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, username, email, updated_at
        `, [passwordHash, id]);
        
        return result.rows[0];
    }

    static async deleteById(id) {
        const result = await query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
}