import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from '../../services/api';

// Async thunks
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async (sessionId = 'default', { rejectWithValue }) => {
    try {
      const response = await chatAPI.getChatHistory(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, sessionId = 'default' }, { getState, dispatch, rejectWithValue }) => {
    try {
      // Add user message immediately
      const userMessage = {
        id: Date.now() + '_user',
        type: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessageLocal(userMessage));

      // Send message to API and get bot response
      const response = await chatAPI.sendMessage(message, sessionId);
      
      const botMessage = {
        id: Date.now() + '_bot',
        type: 'bot',
        content: response.data.content,
        sources: response.data.sources || [],
        timestamp: response.data.timestamp,
      };

      // Server handles chat history automatically
      return botMessage;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearChatHistory = createAsyncThunk(
  'chat/clearChatHistory',
  async (_, { rejectWithValue }) => {
    try {
      await chatAPI.clearChatHistory();
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isLoading: false,
    error: null,
    sessionId: 'default',
    isTyping: false,
  },
  reducers: {
    addMessageLocal: (state, action) => {
      state.messages.push(action.payload);
    },
    setIsTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat history
      .addCase(fetchChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        state.error = action.payload;
      })
      
      // Clear chat history
      .addCase(clearChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearChatHistory.fulfilled, (state) => {
        state.isLoading = false;
        state.messages = [];
      })
      .addCase(clearChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  addMessageLocal, 
  setIsTyping, 
  clearError, 
  setSessionId 
} = chatSlice.actions;

export default chatSlice.reducer;