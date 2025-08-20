import React, { createContext, useContext, useReducer, useEffect } from 'react';

const RAGContext = createContext();

const initialState = {
  documents: [],
  indexedDocuments: [],
  chatHistory: [],
  isIndexing: false,
  error: null,
  isLoading: false,
};

function ragReducer(state, action) {
  switch (action.type) {
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload],
      };
    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        indexedDocuments: state.indexedDocuments.filter(doc => doc.id !== action.payload),
      };
    case 'SET_INDEXING':
      return {
        ...state,
        isIndexing: action.payload,
      };
    case 'ADD_INDEXED_DOCUMENT':
      return {
        ...state,
        indexedDocuments: [...state.indexedDocuments, action.payload],
      };
    case 'CLEAR_INDEXED_DOCUMENTS':
      return {
        ...state,
        indexedDocuments: [],
      };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload],
      };
    case 'CLEAR_CHAT_HISTORY':
      return {
        ...state,
        chatHistory: [],
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function RAGProvider({ children }) {
  const [state, dispatch] = useReducer(ragReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('ragAppState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        Object.keys(parsedState).forEach(key => {
          if (key === 'documents') {
            parsedState[key].forEach(doc => {
              dispatch({ type: 'ADD_DOCUMENT', payload: doc });
            });
          } else if (key === 'indexedDocuments') {
            parsedState[key].forEach(doc => {
              dispatch({ type: 'ADD_INDEXED_DOCUMENT', payload: doc });
            });
          } else if (key === 'chatHistory') {
            parsedState[key].forEach(message => {
              dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
            });
          }
        });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      documents: state.documents,
      indexedDocuments: state.indexedDocuments,
      chatHistory: state.chatHistory,
    };
    localStorage.setItem('ragAppState', JSON.stringify(stateToSave));
  }, [state.documents, state.indexedDocuments, state.chatHistory]);

  const addDocument = (document) => {
    dispatch({ type: 'ADD_DOCUMENT', payload: document });
  };

  const removeDocument = (documentId) => {
    dispatch({ type: 'REMOVE_DOCUMENT', payload: documentId });
  };

  const indexDocument = async (document) => {
    dispatch({ type: 'SET_INDEXING', payload: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const indexedDoc = {
        ...document,
        indexed: true,
        indexedAt: new Date().toISOString(),
      };
      
      dispatch({ type: 'ADD_INDEXED_DOCUMENT', payload: indexedDoc });
      dispatch({ type: 'SET_INDEXING', payload: false });
      
      return indexedDoc;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_INDEXING', payload: false });
      throw error;
    }
  };

  const clearIndex = () => {
    dispatch({ type: 'CLEAR_INDEXED_DOCUMENTS' });
  };

  const addChatMessage = (message) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
  };

  const clearChatHistory = () => {
    dispatch({ type: 'CLEAR_CHAT_HISTORY' });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const value = {
    ...state,
    addDocument,
    removeDocument,
    indexDocument,
    clearIndex,
    addChatMessage,
    clearChatHistory,
    setError,
    clearError,
    setLoading,
  };

  return <RAGContext.Provider value={value}>{children}</RAGContext.Provider>;
}

export function useRAG() {
  const context = useContext(RAGContext);
  if (context === undefined) {
    throw new Error('useRAG must be used within a RAGProvider');
  }
  return context;
}