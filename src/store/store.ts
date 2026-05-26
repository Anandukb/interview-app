import { configureStore } from '@reduxjs/toolkit';
import platformsReducer from './slices/platformsSlice';

export const store = configureStore({
  reducer: {
    platforms: platformsReducer,
  },
});

// Inferred types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
