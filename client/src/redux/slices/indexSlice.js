import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentAPI } from '../../services/api';

// Async thunks
export const fetchIndexedDocuments = createAsyncThunk(
  'index/fetchIndexedDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentAPI.getIndexedDocuments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const indexDocument = createAsyncThunk(
  'index/indexDocument',
  async (documentId, { rejectWithValue, dispatch }) => {
    try {
      const response = await documentAPI.indexDocument(documentId);
      // After successful indexing, fetch updated indexed documents
      dispatch(fetchIndexedDocuments());
      return { documentId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const indexMultipleDocuments = createAsyncThunk(
  'index/indexMultipleDocuments',
  async (documentIds, { dispatch, rejectWithValue }) => {
    try {
      const results = [];
      for (const documentId of documentIds) {
        const response = await documentAPI.indexDocument(documentId);
        results.push(response.data);
        // Dispatch individual success to update UI progressively
        dispatch(indexDocumentSuccess(response.data));
      }
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearIndex = createAsyncThunk(
  'index/clearIndex',
  async (_, { rejectWithValue }) => {
    try {
      await documentAPI.clearIndex();
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deindexDocument = createAsyncThunk(
  'index/deindexDocument',
  async (documentId, { rejectWithValue, dispatch }) => {
    try {
      const response = await documentAPI.deindexDocument(documentId);
      // After successful deindexing, fetch updated indexed documents
      dispatch(fetchIndexedDocuments());
      return { documentId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const indexSlice = createSlice({
  name: 'index',
  initialState: {
    indexedDocuments: [],
    isIndexing: false,
    indexingProgress: 0,
    indexingDocumentId: null,
    error: null,
    searchTerm: '',
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setIndexingProgress: (state, action) => {
      state.indexingProgress = action.payload;
    },
    indexDocumentSuccess: (state, action) => {
      // Add or update indexed document
      const existingIndex = state.indexedDocuments.findIndex(
        doc => doc.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.indexedDocuments[existingIndex] = action.payload;
      } else {
        state.indexedDocuments.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch indexed documents
      .addCase(fetchIndexedDocuments.pending, (state) => {
        state.isIndexing = false;
        state.error = null;
      })
      .addCase(fetchIndexedDocuments.fulfilled, (state, action) => {
        state.indexedDocuments = action.payload;
      })
      .addCase(fetchIndexedDocuments.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Index single document
      .addCase(indexDocument.pending, (state, action) => {
        state.isIndexing = true;
        state.indexingDocumentId = action.meta.arg;
        state.error = null;
        state.indexingProgress = 0;
      })
      .addCase(indexDocument.fulfilled, (state, action) => {
        state.isIndexing = false;
        state.indexingDocumentId = null;
        state.indexingProgress = 100;
        // Note: fetchIndexedDocuments is dispatched to update the list
      })
      .addCase(indexDocument.rejected, (state, action) => {
        state.isIndexing = false;
        state.indexingDocumentId = null;
        state.indexingProgress = 0;
        state.error = action.payload;
      })
      
      // Index multiple documents
      .addCase(indexMultipleDocuments.pending, (state) => {
        state.isIndexing = true;
        state.error = null;
        state.indexingProgress = 0;
      })
      .addCase(indexMultipleDocuments.fulfilled, (state) => {
        state.isIndexing = false;
        state.indexingProgress = 100;
      })
      .addCase(indexMultipleDocuments.rejected, (state, action) => {
        state.isIndexing = false;
        state.indexingProgress = 0;
        state.error = action.payload;
      })
      
      // Clear index
      .addCase(clearIndex.pending, (state) => {
        state.isIndexing = true;
        state.error = null;
      })
      .addCase(clearIndex.fulfilled, (state) => {
        state.isIndexing = false;
        state.indexedDocuments = [];
      })
      .addCase(clearIndex.rejected, (state, action) => {
        state.isIndexing = false;
        state.error = action.payload;
      })
      
      // Deindex single document
      .addCase(deindexDocument.pending, (state, action) => {
        state.isIndexing = true;
        state.indexingDocumentId = action.meta.arg;
        state.error = null;
      })
      .addCase(deindexDocument.fulfilled, (state, action) => {
        state.isIndexing = false;
        state.indexingDocumentId = null;
        // Note: fetchIndexedDocuments is dispatched to update the list
      })
      .addCase(deindexDocument.rejected, (state, action) => {
        state.isIndexing = false;
        state.indexingDocumentId = null;
        state.error = action.payload;
      });
  },
});

export const { 
  setSearchTerm, 
  clearError, 
  setIndexingProgress,
  indexDocumentSuccess 
} = indexSlice.actions;

export default indexSlice.reducer;