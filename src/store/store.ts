import { configureStore } from '@reduxjs/toolkit';
import platformsReducer from './slices/platformsSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import adminPlatformsReducer from './slices/adminPlatformsSlice';
import adminQuestionTypesReducer from './slices/adminQuestionTypesSlice';
import adminQuestionsReducer from './slices/adminQuestionsSlice';

export const store = configureStore({
  reducer: {
    // ── Main app ───────────────────────────────────────────────────────────────
    platforms: platformsReducer,

    // ── Admin ──────────────────────────────────────────────────────────────────
    adminAuth: adminAuthReducer,
    adminPlatforms: adminPlatformsReducer,
    adminQuestionTypes: adminQuestionTypesReducer,
    adminQuestions: adminQuestionsReducer,
  },
});

// Inferred types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
