import { useState, useEffect } from 'react';
import { Upload, FileText, Link, Plus, X, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  fetchDocuments,
  addTextDocument,
  addFileDocument,
  addUrlDocument,
  deleteDocument,
  clearError
} from '../redux/slices/documentsSlice';

function DataSourcePanel() {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  
  const dispatch = useAppDispatch();
  const { documents, isLoading, error, uploadProgress } = useAppSelector(state => state.documents);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      return;
    }

    try {
      await dispatch(addTextDocument({ content: textInput })).unwrap();
      setTextInput('');
    } catch (err) {
      console.error('Failed to add text document:', err);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      return;
    }

    if (!isValidUrl(urlInput)) {
      return;
    }

    try {
      await dispatch(addUrlDocument(urlInput)).unwrap();
      setUrlInput('');
    } catch (err) {
      console.error('Failed to add URL document:', err);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const onDrop = async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      try {
        await dispatch(addFileDocument(file)).unwrap();
      } catch (err) {
        console.error('Failed to add file document:', err);
      }
    }
  };

  const handleRemoveDocument = async (documentId) => {
    try {
      await dispatch(deleteDocument(documentId)).unwrap();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.csv'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
    },
  });

  const formatFileSize = (bytes, doc = null) => {
    // If no bytes provided, try to calculate from content for URL/text docs
    if ((!bytes || bytes === 0) && doc && (doc.content_type === 'url' || doc.content_type === 'text') && doc.content) {
      bytes = new Blob([doc.content]).size;
    }
    
    if (bytes === 0) return '0 Bytes';
    if (typeof bytes === 'string') return bytes;
    if (!bytes || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '1rem'
        }}>
          <Plus style={{ width: '20px', height: '20px', color: 'white' }} />
        </div>
        <div>
          <h2 style={{ margin: '0', fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            Add Data Sources
          </h2>
          <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
            Upload files, add text, or import from URLs
          </p>
        </div>
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

      {isLoading && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#1e40af', fontSize: '0.875rem' }}>
            {uploadProgress > 0 ? `Processing... ${uploadProgress}%` : 'Processing...'}
          </span>
        </div>
      )}

      <div style={{
        display: 'flex',
        backgroundColor: '#f3f4f6',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '1.5rem'
      }}>
        {[
          { key: 'text', icon: FileText, label: 'Text' },
          { key: 'file', icon: Upload, label: 'Files' },
          { key: 'url', icon: Link, label: 'URL' }
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === key ? 'white' : 'transparent',
              color: activeTab === key ? '#667eea' : '#6b7280',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === key ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Icon style={{ width: '16px', height: '16px' }} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'text' && (
        <div>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter your text here..."
            style={{
              width: '100%',
              height: '120px',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.875rem',
              resize: 'none',
              fontFamily: 'inherit',
              marginBottom: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: (textInput.trim() && !isLoading) ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '500',
              cursor: (textInput.trim() && !isLoading) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              fontSize: '0.875rem'
            }}
          >
            Add Text Document
          </button>
        </div>
      )}

      {activeTab === 'file' && (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? '#667eea' : '#d1d5db'}`,
            borderRadius: '10px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: isDragActive ? '#f0f4ff' : '#fafafa'
          }}
        >
          <input {...getInputProps()} />
          <Upload style={{ 
            width: '48px', 
            height: '48px', 
            color: isDragActive ? '#667eea' : '#9ca3af', 
            marginBottom: '1rem' 
          }} />
          {isDragActive ? (
            <p style={{ margin: '0', color: '#667eea', fontWeight: '500' }}>Drop files here...</p>
          ) : (
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#374151', fontWeight: '500' }}>
                Drag & drop files or click to browse
              </p>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                Supports TXT, MD, CSV, PDF, JSON
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'url' && (
        <div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              marginBottom: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim() || isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: (urlInput.trim() && !isLoading) ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '500',
              cursor: (urlInput.trim() && !isLoading) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              fontSize: '0.875rem'
            }}
          >
            {isLoading ? 'Processing...' : 'Add Website'}
          </button>
        </div>
      )}

      {documents.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📁 Documents ({documents.length})
          </h3>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            backgroundColor: '#f9fafb'
          }}>
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: index < documents.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {(doc.content_type || doc.type) === 'text' && <FileText style={{ width: '16px', height: '16px', color: '#6b7280' }} />}
                  {(doc.content_type || doc.type) === 'file' && <Upload style={{ width: '16px', height: '16px', color: '#6b7280' }} />}
                  {(doc.content_type || doc.type) === 'url' && <Link style={{ width: '16px', height: '16px', color: '#6b7280' }} />}
                  <div>
                    <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      {(doc.title || 'Untitled').length > 25 ? `${(doc.title || 'Untitled').substring(0, 25)}...` : (doc.title || 'Untitled')}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatFileSize(doc.file_size || doc.size || 0, doc)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDocument(doc.id)}
                  style={{
                    padding: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <X style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DataSourcePanel;