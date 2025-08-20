import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from './slices/documentsSlice';
import indexReducer from './slices/indexSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    index: indexReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;