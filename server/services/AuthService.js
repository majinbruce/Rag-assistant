import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../middlewares/auth.js';

export class AuthService {
  static async register(userData) {
    const { name, email, password } = userData;

    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create username from email (before @ symbol)
      const username = email.split('@')[0].toLowerCase();
      
      // Check if username is already taken, if so append numbers
      let finalUsername = username;
      let counter = 1;
      while (await UserModel.findByUsername(finalUsername)) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Create user
      const user = await UserModel.create({
        username: finalUsername,
        email: email.toLowerCase(),
        passwordHash
      });

      // Generate tokens
      const tokens = generateTokens(user.id);

      return {
        user: {
          id: user.id,
          name: name,
          username: user.username,
          email: user.email,
          createdAt: user.created_at
        },
        ...tokens
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
      
      // Check for database constraint violations
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('EMAIL_ALREADY_EXISTS');
        }
        if (error.constraint === 'users_username_key') {
          throw new Error('USERNAME_ALREADY_EXISTS');
        }
      }
      
      throw new Error('REGISTRATION_FAILED');
    }
  }

  static async login(email, password) {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(email.toLowerCase());
      if (!user) {
        throw new Error('INVALID_CREDENTIALS');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('INVALID_CREDENTIALS');
      }

      // Generate tokens
      const tokens = generateTokens(user.id);

      return {
        user: {
          id: user.id,
          name: user.username, // Using username as name for now
          username: user.username,
          email: user.email,
          createdAt: user.created_at
        },
        ...tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'INVALID_CREDENTIALS') {
        throw new Error('INVALID_CREDENTIALS');
      }
      
      throw new Error('LOGIN_FAILED');
    }
  }

  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Check if user still exists
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Generate new tokens
      const tokens = generateTokens(user.id);

      return {
        user: {
          id: user.id,
          name: user.username,
          username: user.username,
          email: user.email,
          createdAt: user.created_at
        },
        ...tokens
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_REFRESH_TOKEN');
      } else if (error.message === 'USER_NOT_FOUND') {
        throw new Error('USER_NOT_FOUND');
      }
      
      throw new Error('TOKEN_REFRESH_FAILED');
    }
  }

  static async getCurrentUser(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      return {
        id: user.id,
        name: user.username,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      };
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error('USER_FETCH_FAILED');
    }
  }

  static async updatePassword(userId, currentPassword, newPassword) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw new Error('INVALID_CURRENT_PASSWORD');
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      await UserModel.updatePassword(userId, passwordHash);

      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      
      if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_CURRENT_PASSWORD') {
        throw error;
      }
      
      throw new Error('PASSWORD_UPDATE_FAILED');
    }
  }
}