import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, User, Bot, Trash2, AlertCircle, FileText, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  fetchChatHistory,
  sendMessage,
  clearChatHistory,
  clearError
} from '../redux/slices/chatSlice';
import { fetchIndexedDocuments } from '../redux/slices/indexSlice';

function ChatInterface() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const dispatch = useAppDispatch();
  const { indexedDocuments } = useAppSelector(state => state.index);
  const { messages, isLoading, isTyping, error } = useAppSelector(state => state.chat);

  useEffect(() => {
    dispatch(fetchChatHistory());
    dispatch(fetchIndexedDocuments());
  }, [dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      return;
    }

    if (indexedDocuments.length === 0) {
      return;
    }

    try {
      await dispatch(sendMessage({ message })).unwrap();
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await dispatch(clearChatHistory()).unwrap();
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What are the main topics covered in my documents?",
    "Can you summarize the key points?",
    "What specific information is available about...?",
    "Help me find information related to..."
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem'
          }}>
            <MessageSquare style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <h2 style={{ margin: '0', fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              RAG Chat
            </h2>
            <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
              Ask questions about your indexed documents ({indexedDocuments.length} available)
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: isLoading ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Clear Chat
          </button>
        )}
      </div>

      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
          <span style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{error}</span>
          <button 
            onClick={() => dispatch(clearError())}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ width: '16px', height: '16px', color: '#ef4444' }} />
          </button>
        </div>
      )}

      {/* Chat Messages Area */}
      <div style={{
        flex: 1,
        border: '1px solid #e5e7eb',
        borderRadius: '15px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          minHeight: '300px'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem auto'
              }}>
                <Bot style={{ width: '40px', height: '40px', color: 'white' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#374151', 
                margin: '0 0 0.5rem 0' 
              }}>
                Start a conversation with your documents
              </h3>
              <p style={{ 
                color: '#6b7280', 
                margin: '0 0 2rem 0',
                fontSize: '0.875rem'
              }}>
                Ask questions and get answers from your indexed knowledge base
              </p>
              
              {indexedDocuments.length === 0 ? (
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: '10px',
                  display: 'inline-block'
                }}>
                  <p style={{ margin: '0', color: '#92400e', fontWeight: '500' }}>
                    📋 Please add and index some documents first to enable chat functionality.
                  </p>
                </div>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    marginBottom: '1rem',
                    fontWeight: '500' 
                  }}>
                    💡 Try asking:
                  </p>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(question)}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '10px',
                          fontSize: '0.875rem',
                          color: '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#8b5cf6';
                          e.target.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.backgroundColor = 'white';
                        }}
                      >
                        "{question}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {msg.type === 'bot' && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bot style={{ width: '18px', height: '18px', color: 'white' }} />
                    </div>
                  )}
                  
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '1rem 1.25rem',
                      borderRadius: '18px',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      backgroundColor: msg.type === 'user' ? '#8b5cf6' : 'white',
                      color: msg.type === 'user' ? 'white' : '#374151',
                      border: msg.type === 'bot' ? '1px solid #e5e7eb' : 'none',
                      boxShadow: msg.type === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : '0 4px 6px rgba(139, 92, 246, 0.25)'
                    }}
                  >
                    <p style={{ margin: '0' }}>{msg.content}</p>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      opacity: 0.7
                    }}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <p style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          📚 Sources:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {msg.sources.map((source) => (
                            <div
                              key={source.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '6px'
                              }}
                            >
                              <FileText style={{ width: '12px', height: '12px' }} />
                              <span style={{ fontWeight: '500' }}>
                                {source.title.length > 25 ? `${source.title.substring(0, 25)}...` : source.title}
                              </span>
                              <span style={{ opacity: 0.7 }}>({source.type})</span>
                              {source.relevanceScore && (
                                <span style={{ opacity: 0.7 }}>
                                  {Math.round(source.relevanceScore * 100)}%
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {msg.type === 'user' && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <User style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bot style={{ width: '18px', height: '18px', color: 'white' }} />
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '18px',
                    padding: '1rem 1.25rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s ease-in-out 0s infinite both'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s ease-in-out 0.16s infinite both'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'bounce 1.4s ease-in-out 0.32s infinite both'
                      }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
          borderRadius: '0 0 15px 15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  indexedDocuments.length === 0
                    ? "Index some documents first..."
                    : "Ask a question about your documents..."
                }
                disabled={indexedDocuments.length === 0 || isLoading}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  maxHeight: '120px',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: indexedDocuments.length === 0 ? '#f9fafb' : 'white',
                  cursor: indexedDocuments.length === 0 ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => indexedDocuments.length > 0 && (e.target.style.borderColor = '#8b5cf6')}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                rows={1}
              />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>{message.length}/500</span>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || indexedDocuments.length === 0 || isLoading}
              style={{
                width: '44px',
                height: '44px',
                background: (!message.trim() || indexedDocuments.length === 0 || isLoading) 
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: (!message.trim() || indexedDocuments.length === 0 || isLoading) 
                  ? 'not-allowed' 
                  : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <Send style={{ width: '18px', height: '18px' }} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;