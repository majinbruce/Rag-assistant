import { AuthService } from '../services/AuthService.js';

export class AuthController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      const result = await AuthService.register({ name, email, password });
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      let statusCode = 500;
      let message = 'Registration failed. Please try again.';
      let code = 'REGISTRATION_FAILED';

      switch (error.message) {
        case 'EMAIL_ALREADY_EXISTS':
          statusCode = 409;
          message = 'An account with this email address already exists.';
          code = 'EMAIL_ALREADY_EXISTS';
          break;
        case 'USERNAME_ALREADY_EXISTS':
          statusCode = 409;
          message = 'This username is already taken.';
          code = 'USERNAME_ALREADY_EXISTS';
          break;
      }

      res.status(statusCode).json({
        error: message,
        code: code
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      
      let statusCode = 500;
      let message = 'Login failed. Please try again.';
      let code = 'LOGIN_FAILED';

      switch (error.message) {
        case 'INVALID_CREDENTIALS':
          statusCode = 401;
          message = 'Invalid email or password.';
          code = 'INVALID_CREDENTIALS';
          break;
      }

      res.status(statusCode).json({
        error: message,
        code: code
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          error: 'Refresh token not provided.',
          code: 'NO_REFRESH_TOKEN'
        });
      }

      const result = await AuthService.refreshToken(refreshToken);
      
      // Set new refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        message: 'Token refreshed successfully',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      
      let statusCode = 401;
      let message = 'Token refresh failed. Please login again.';
      let code = 'TOKEN_REFRESH_FAILED';

      switch (error.message) {
        case 'REFRESH_TOKEN_EXPIRED':
          message = 'Refresh token has expired. Please login again.';
          code = 'REFRESH_TOKEN_EXPIRED';
          break;
        case 'INVALID_REFRESH_TOKEN':
          message = 'Invalid refresh token. Please login again.';
          code = 'INVALID_REFRESH_TOKEN';
          break;
        case 'USER_NOT_FOUND':
          message = 'User not found. Please login again.';
          code = 'USER_NOT_FOUND';
          break;
      }

      // Clear refresh token cookie on error
      res.clearCookie('refreshToken');
      
      res.status(statusCode).json({
        error: message,
        code: code
      });
    }
  }

  async logout(req, res) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      
      res.json({
        user: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      
      res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await AuthService.updatePassword(req.user.id, currentPassword, newPassword);
      
      res.json({
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Password update error:', error);
      
      let statusCode = 500;
      let message = 'Password update failed. Please try again.';
      let code = 'PASSWORD_UPDATE_FAILED';

      switch (error.message) {
        case 'USER_NOT_FOUND':
          statusCode = 404;
          message = 'User not found.';
          code = 'USER_NOT_FOUND';
          break;
        case 'INVALID_CURRENT_PASSWORD':
          statusCode = 400;
          message = 'Current password is incorrect.';
          code = 'INVALID_CURRENT_PASSWORD';
          break;
      }

      res.status(statusCode).json({
        error: message,
        code: code
      });
    }
  }
}