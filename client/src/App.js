import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import LandingPage from './components/LandingPage';
import DataSourcePanel from './components/DataSourcePanel';
import RAGStore from './components/RAGStore';
import ChatInterface from './components/ChatInterface';
import { authService } from './services/authApi';

function AppContent() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and validate token
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            // Verify token is still valid by fetching current user
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              // Token is invalid, clear auth data
              console.warn('Stored token is invalid:', error);
              await authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth failure events from API interceptors
    const handleAuthFailure = () => {
      setUser(null);
    };

    window.addEventListener('auth-failed', handleAuthFailure);

    return () => {
      window.removeEventListener('auth-failed', handleAuthFailure);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ margin: '0', fontSize: '1.1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          color: 'white'
        }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '800', 
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              🤖 RAG Assistant
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              opacity: '0.9',
              margin: '0',
              fontWeight: '300'
            }}>
              Upload documents, build your knowledge base, and chat with your data
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0', fontSize: '1rem', fontWeight: '500' }}>
                Welcome, {user.name}!
              </p>
              <p style={{ margin: '0', fontSize: '0.875rem', opacity: '0.8' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="main-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '2rem',
          minHeight: '70vh'
        }}>
          {/* Upload Section - Top Left */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <DataSourcePanel />
          </div>

          {/* RAG Store - Top Right */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <RAGStore />
          </div>

          {/* Chat Interface - Bottom Full Width */}
          <div className="chat-full-width" style={{
            gridColumn: 'span 2',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255,255,255,0.2)',
            minHeight: '500px'
          }}>
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
