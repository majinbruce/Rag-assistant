import { useState } from 'react';
import { 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  Search, 
  Zap, 
  Shield, 
  Users, 
  ChevronRight,
  Check,
  Star,
  Quote
} from 'lucide-react';
import AuthModal from './AuthModal';

function LandingPage({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleAuthSuccess = (user) => {
    setShowAuth(false);
    onLogin(user);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Navigation */}
      <nav style={{ 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
          </div>
          <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
            RAG Assistant
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleSignIn}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '25px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            Sign In
          </button>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'white',
              border: 'none',
              borderRadius: '25px',
              color: '#667eea',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 4.5rem)',
          fontWeight: '800',
          color: 'white',
          margin: '0 0 1.5rem 0',
          textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          lineHeight: '1.1'
        }}>
          Chat with Your Documents
          <br />
          <span style={{ 
            background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Like Never Before
          </span>
        </h1>
        
        <p style={{
          fontSize: '1.4rem',
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 3rem 0',
          maxWidth: '800px',
          margin: '0 auto 3rem auto',
          fontWeight: '300',
          lineHeight: '1.6'
        }}>
          Upload your documents, build a powerful knowledge base, and get instant answers through our AI-powered RAG system. Transform how you interact with your data.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
            }}
          >
            Start Free Trial
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>
          
          <button
            style={{
              padding: '1rem 2.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
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
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '4rem 2rem', 
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'white',
            textAlign: 'center',
            margin: '0 0 3rem 0'
          }}>
            Powerful Features
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: <FileText style={{ width: '32px', height: '32px' }} />,
                title: 'Document Upload',
                description: 'Upload PDFs, text files, URLs, and more. We support multiple formats for your convenience.'
              },
              {
                icon: <Search style={{ width: '32px', height: '32px' }} />,
                title: 'Smart Search',
                description: 'Advanced vector search finds the most relevant information from your documents instantly.'
              },
              {
                icon: <MessageSquare style={{ width: '32px', height: '32px' }} />,
                title: 'AI Chat Interface',
                description: 'Natural language conversations with your data. Ask questions and get precise answers.'
              },
              {
                icon: <Zap style={{ width: '32px', height: '32px' }} />,
                title: 'Lightning Fast',
                description: 'Optimized vector database ensures quick responses and seamless user experience.'
              },
              {
                icon: <Shield style={{ width: '32px', height: '32px' }} />,
                title: 'Secure & Private',
                description: 'Your documents are encrypted and secure. Privacy-first approach to data handling.'
              },
              {
                icon: <Users style={{ width: '32px', height: '32px' }} />,
                title: 'Team Collaboration',
                description: 'Share knowledge bases with your team and collaborate on document insights.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '15px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: 'white'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  margin: '0 0 1rem 0'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 3rem 0'
          }}>
            Simple Pricing
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/month',
                features: ['5 Documents', '100 Queries/month', 'Basic Support', '1GB Storage'],
                popular: false
              },
              {
                name: 'Pro',
                price: '$19',
                period: '/month',
                features: ['Unlimited Documents', 'Unlimited Queries', 'Priority Support', '10GB Storage', 'Team Collaboration'],
                popular: true
              },
              {
                name: 'Enterprise',
                price: '$99',
                period: '/month',
                features: ['Everything in Pro', 'Custom Integrations', 'Dedicated Support', '100GB Storage', 'Advanced Analytics'],
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                style={{
                  background: plan.popular ? 'white' : 'rgba(255,255,255,0.1)',
                  padding: '2.5rem 2rem',
                  borderRadius: '20px',
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    Most Popular
                  </div>
                )}
                
                <h3 style={{
                  color: plan.popular ? '#1f2937' : 'white',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 1rem 0'
                }}>
                  {plan.name}
                </h3>
                
                <div style={{ margin: '0 0 2rem 0' }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: plan.popular ? '#1f2937' : 'white'
                  }}>
                    {plan.price}
                  </span>
                  <span style={{
                    color: plan.popular ? '#6b7280' : 'rgba(255,255,255,0.7)',
                    fontSize: '1.1rem'
                  }}>
                    {plan.period}
                  </span>
                </div>
                
                <ul style={{ listStyle: 'none', padding: '0', margin: '0 0 2rem 0' }}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0',
                      color: plan.popular ? '#374151' : 'rgba(255,255,255,0.9)'
                    }}>
                      <Check style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: '#10b981' 
                      }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={handleGetStarted}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: plan.popular 
                      ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                      : 'rgba(255,255,255,0.1)',
                    border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(255,255,255,0.1)' 
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0' }}>
          © 2024 RAG Assistant. All rights reserved.
        </p>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      )}
    </div>
  );
}

export default LandingPage;