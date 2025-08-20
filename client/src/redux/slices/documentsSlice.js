import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentAPI, fileAPI } from '../../services/api';

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentAPI.getDocuments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTextDocument = createAsyncThunk(
  'documents/addTextDocument',
  async (textData, { rejectWithValue }) => {
    try {
      const document = {
        type: 'text',
        title: `Text Document ${Date.now()}`,
        content: textData.content,
        size: textData.content.length,
      };
      const response = await documentAPI.addDocument(document);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFileDocument = createAsyncThunk(
  'documents/addFileDocument',
  async (file, { rejectWithValue }) => {
    try {
      // Our new API directly creates and returns the document
      const response = await fileAPI.processFile(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addUrlDocument = createAsyncThunk(
  'documents/addUrlDocument',
  async (url, { rejectWithValue }) => {
    try {
      // Our new API directly creates and returns the document
      const response = await fileAPI.processUrl(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      await documentAPI.deleteDocument(documentId);
      return documentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    isLoading: false,
    error: null,
    uploadProgress: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add text document
      .addCase(addTextDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(addTextDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
        state.uploadProgress = 100;
      })
      .addCase(addTextDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      
      // Add file document
      .addCase(addFileDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(addFileDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
        state.uploadProgress = 100;
      })
      .addCase(addFileDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      
      // Add URL document
      .addCase(addUrlDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(addUrlDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload);
        state.uploadProgress = 100;
      })
      .addCase(addUrlDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      })
      
      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUploadProgress } = documentsSlice.actions;
export default documentsSlice.reducer;