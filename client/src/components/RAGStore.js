import { useState, useEffect } from 'react';
import { Database, Search, Trash2, Play, CheckCircle, AlertCircle, RotateCcw, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import ConfirmationModal from './ConfirmationModal';
import { 
  fetchIndexedDocuments,
  indexDocument,
  indexMultipleDocuments,
  clearIndex,
  deindexDocument,
  setSearchTerm,
  clearError
} from '../redux/slices/indexSlice';
import { fetchDocuments } from '../redux/slices/documentsSlice';
import { clearChatHistory } from '../redux/slices/chatSlice';

function RAGStore() {
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });
  
  const dispatch = useAppDispatch();
  const { documents } = useAppSelector(state => state.documents);
  const { 
    indexedDocuments, 
    isIndexing, 
    indexingDocumentId,
    searchTerm, 
    error 
  } = useAppSelector(state => state.index);

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchIndexedDocuments());
  }, [dispatch]);

  // Refetch data when indexing operations complete
  useEffect(() => {
    if (!isIndexing && indexingDocumentId === null) {
      // Small delay to ensure backend operations are complete
      const timer = setTimeout(() => {
        dispatch(fetchDocuments());
        dispatch(fetchIndexedDocuments());
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isIndexing, indexingDocumentId, dispatch]);

  const unindexedDocuments = documents.filter(
    doc => !indexedDocuments.some(indexed => indexed.id === doc.id)
  );

  const filteredIndexedDocs = indexedDocuments.filter(doc =>
    (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIndexDocument = async (documentId) => {
    try {
      await dispatch(indexDocument(documentId)).unwrap();
      // Refresh the documents list to ensure proper filtering
      dispatch(fetchDocuments());
    } catch (err) {
      console.error('Failed to index document:', err);
    }
  };

  const handleIndexSelected = async () => {
    const selectedDocIds = Array.from(selectedDocs);
    try {
      await dispatch(indexMultipleDocuments(selectedDocIds)).unwrap();
      setSelectedDocs(new Set());
      // Refresh the documents list
      dispatch(fetchDocuments());
    } catch (err) {
      console.error('Failed to index selected documents:', err);
    }
  };

  const handleIndexAll = async () => {
    const allDocIds = unindexedDocuments.map(doc => doc.id);
    try {
      await dispatch(indexMultipleDocuments(allDocIds)).unwrap();
      // Refresh the documents list
      dispatch(fetchDocuments());
    } catch (err) {
      console.error('Failed to index all documents:', err);
    }
  };

  const handleClearIndex = () => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Clear Entire Index?',
      message: 'This will remove all documents from the index and clear your chat history. The documents will remain in your library but won\'t be searchable in chat until re-indexed.',
      confirmText: 'Clear Index',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          await dispatch(clearIndex()).unwrap();
          // Also clear chat history since indexed documents are no longer available
          await dispatch(clearChatHistory()).unwrap();
        } catch (err) {
          console.error('Failed to clear index:', err);
        }
      }
    });
  };

  const handleDeindexDocument = (documentId, documentTitle) => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Remove from Index?',
      message: `This will remove "${documentTitle}" from the searchable index. The document will remain in your library but won't be available in chat until re-indexed.`,
      confirmText: 'Remove',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          await dispatch(deindexDocument(documentId)).unwrap();
          // Refresh the documents list to ensure proper filtering
          dispatch(fetchDocuments());
        } catch (err) {
          console.error('Failed to deindex document:', err);
        }
      }
    });
  };

  const toggleDocSelection = (docId) => {
    const newSelection = new Set(selectedDocs);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocs(newSelection);
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem'
          }}>
            <Database style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <h2 style={{ margin: '0', fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              RAG Store
            </h2>
            <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
              Manage and search your indexed documents
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '10px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
              {indexedDocuments.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Indexed</div>
          </div>
          <div style={{ width: '1px', height: '30px', backgroundColor: '#d1d5db' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
              {unindexedDocuments.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pending</div>
          </div>
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

      {unindexedDocuments.length > 0 && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              <h3 style={{ margin: '0', fontWeight: '600', color: '#92400e', fontSize: '1rem' }}>
                Documents Ready for Indexing ({unindexedDocuments.length})
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedDocs.size > 0 && (
                <button
                  onClick={handleIndexSelected}
                  disabled={isIndexing}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isIndexing ? 'not-allowed' : 'pointer',
                    opacity: isIndexing ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  Index Selected ({selectedDocs.size})
                </button>
              )}
              <button
                onClick={handleIndexAll}
                disabled={isIndexing}
                style={{
                  padding: '0.5rem 1rem',
                  background: isIndexing ? '#d1d5db' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isIndexing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isIndexing ? (
                  <>
                    <RotateCcw style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                    Indexing...
                  </>
                ) : (
                  'Index All'
                )}
              </button>
            </div>
          </div>
          
          <div style={{ 
            maxHeight: '120px', 
            overflowY: 'auto',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            {unindexedDocuments.map((doc, index) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderBottom: index < unindexedDocuments.length - 1 ? '1px solid #fed7aa' : 'none',
                  backgroundColor: indexingDocumentId === doc.id ? '#f0f9ff' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedDocs.has(doc.id)}
                    onChange={() => toggleDocSelection(doc.id)}
                    style={{ accentColor: '#667eea' }}
                    disabled={isIndexing}
                  />
                  <div>
                    <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      {(doc.title || 'Untitled').length > 30 ? `${(doc.title || 'Untitled').substring(0, 30)}...` : (doc.title || 'Untitled')}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatFileSize(doc.file_size || doc.size || 0, doc)} • {doc.file_type || doc.type || 'Unknown'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleIndexDocument(doc.id)}
                  disabled={isIndexing}
                  style={{
                    padding: '4px 8px',
                    background: (isIndexing && indexingDocumentId === doc.id) 
                      ? '#d1d5db' 
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isIndexing ? 'not-allowed' : 'pointer',
                    opacity: isIndexing ? 0.6 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {(isIndexing && indexingDocumentId === doc.id) ? (
                    <RotateCcw style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Play style={{ width: '12px', height: '12px' }} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '16px', 
            height: '16px', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            placeholder="Search indexed documents..."
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        {indexedDocuments.length > 0 && (
          <button
            onClick={handleClearIndex}
            disabled={isIndexing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: isIndexing ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isIndexing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isIndexing ? 0.6 : 1
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            Clear Index
          </button>
        )}
      </div>

      {indexedDocuments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem',
          color: '#6b7280'
        }}>
          <Database style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0' }}>
            No Documents Indexed
          </h3>
          <p style={{ margin: '0', fontSize: '0.875rem' }}>
            Add some documents and index them to enable RAG functionality.
          </p>
        </div>
      ) : (
        <div>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✅ Indexed Documents ({filteredIndexedDocs.length})
          </h3>
          
          <div style={{ 
            maxHeight: '250px', 
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            backgroundColor: '#f9fafb'
          }}>
            {filteredIndexedDocs.map((doc, index) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: index < filteredIndexedDocs.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: 'white',
                  margin: index === 0 ? '0' : '0',
                  borderRadius: index === 0 ? '10px 10px 0 0' : index === filteredIndexedDocs.length - 1 ? '0 0 10px 10px' : '0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ margin: '0', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      {(doc.title || 'Untitled').length > 35 ? `${(doc.title || 'Untitled').substring(0, 35)}...` : (doc.title || 'Untitled')}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatFileSize(doc.file_size || doc.size || 0, doc)} • Indexed on {doc.indexed_at ? new Date(doc.indexed_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Ready
                  </div>
                  <button
                    onClick={() => handleDeindexDocument(doc.id, doc.title || 'Untitled')}
                    disabled={isIndexing && indexingDocumentId === doc.id}
                    style={{
                      padding: '4px 8px',
                      background: (isIndexing && indexingDocumentId === doc.id) 
                        ? '#d1d5db' 
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: (isIndexing && indexingDocumentId === doc.id) ? 'not-allowed' : 'pointer',
                      opacity: (isIndexing && indexingDocumentId === doc.id) ? 0.6 : 1,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                    title="Remove from index (document will remain but won't be searchable)"
                  >
                    {(isIndexing && indexingDocumentId === doc.id) ? (
                      <RotateCcw style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <X style={{ width: '10px', height: '10px' }} />
                    )}
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {filteredIndexedDocs.length === 0 && searchTerm && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <Search style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 1rem auto' }} />
                <p style={{ margin: '0', fontSize: '0.875rem' }}>
                  No documents found matching "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {indexedDocuments.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          border: '1px solid #93c5fd',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle style={{ width: '18px', height: '18px', color: '#2563eb' }} />
            <h4 style={{ margin: '0', fontWeight: '600', color: '#1e40af', fontSize: '1rem' }}>
              RAG Store Ready
            </h4>
          </div>
          <p style={{ margin: '0', fontSize: '0.875rem', color: '#1e40af' }}>
            Your documents are indexed and ready for querying. You can now use the chat interface to ask questions about your data.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
}

export default RAGStore;