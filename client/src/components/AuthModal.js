import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authApi';

function AuthModal({ mode, onClose, onSuccess, onToggleMode }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const isLogin = mode === 'login';

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
      score += 1;
      feedback.splice(feedback.indexOf('One special character'), 1);
    } else if (password.length > 0) {
      feedback.push('One special character (optional but recommended)');
    }

    return { score: Math.min(score, 4), feedback };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    setError('');
    setFieldErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    // Real-time password strength checking
    if (name === 'password' && !isLogin) {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Real-time validation for specific fields
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
      }
    }

    if (name === 'name' && value && !isLogin) {
      if (value.length < 2) {
        setFieldErrors(prev => ({
          ...prev,
          name: 'Name must be at least 2 characters'
        }));
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        setFieldErrors(prev => ({
          ...prev,
          name: 'Name can only contain letters, spaces, hyphens, and apostrophes'
        }));
      }
    }

    if (name === 'confirmPassword' && !isLogin) {
      if (value !== formData.password) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Please enter your name');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        // Login
        result = await authService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Register
        result = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
      }
      
      onSuccess(result.user);
    } catch (err) {
      console.error('Authentication error:', err);
      
      // Handle different types of errors
      if (err.details && Object.keys(err.details).length > 0) {
        // Validation errors from server
        const fieldErrors = Object.values(err.details).join('. ');
        setError(fieldErrors);
      } else {
        // General error messages
        switch (err.code) {
          case 'EMAIL_ALREADY_EXISTS':
            setError('An account with this email already exists. Please try logging in instead.');
            break;
          case 'INVALID_CREDENTIALS':
            setError('Invalid email or password. Please try again.');
            break;
          case 'RATE_LIMIT_EXCEEDED':
            setError('Too many attempts. Please try again later.');
            break;
          default:
            setError(err.message || 'Authentication failed. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
          </div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0.5rem 0'
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{
            color: '#6b7280',
            margin: '0'
          }}>
            {isLogin 
              ? 'Sign in to your RAG Assistant account' 
              : 'Join thousands of users building knowledge bases'
            }
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            color: '#b91c1c',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  style={{
                    width: 'calc(100% - 1rem)',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: `2px solid ${fieldErrors.name ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = fieldErrors.name ? '#ef4444' : '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = fieldErrors.name ? '#ef4444' : '#e5e7eb'}
                />
              </div>
              {fieldErrors.name && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  ⚠️ {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af'
              }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                style={{
                  width: 'calc(100% - 1rem)',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `2px solid ${fieldErrors.email ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = fieldErrors.email ? '#ef4444' : '#667eea'}
                onBlur={(e) => e.target.style.borderColor = fieldErrors.email ? '#ef4444' : '#e5e7eb'}
              />
            </div>
            {fieldErrors.email && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                margin: '0.25rem 0 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                ⚠️ {fieldErrors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: isLogin ? '1.5rem' : '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                style={{
                  width: 'calc(100% - 1rem)',
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
                ) : (
                  <Eye style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {!isLogin && formData.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Password strength:</span>
                  <div style={{ flex: 1, display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          height: '4px',
                          flex: 1,
                          borderRadius: '2px',
                          backgroundColor: passwordStrength.score >= level 
                            ? passwordStrength.score <= 2 ? '#ef4444' 
                            : passwordStrength.score === 3 ? '#f59e0b' 
                            : '#10b981'
                            : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500',
                    color: passwordStrength.score <= 2 ? '#ef4444' 
                      : passwordStrength.score === 3 ? '#f59e0b' 
                      : '#10b981'
                  }}>
                    {passwordStrength.score <= 1 ? 'Weak' 
                      : passwordStrength.score <= 2 ? 'Fair' 
                      : passwordStrength.score === 3 ? 'Good' 
                      : 'Strong'}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Missing: {passwordStrength.feedback.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: '#9ca3af'
                }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  style={{
                    width: 'calc(100% - 1rem)',
                    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
                  ) : (
                    <Eye style={{ width: '18px', height: '18px', color: '#9ca3af' }} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  ⚠️ {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              background: isLoading 
                ? '#d1d5db' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              marginBottom: '1.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={onToggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default AuthModal;