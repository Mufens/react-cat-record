import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import sidebarReducer from './slices/sidebarSlice';
import tabsReducer from './slices/tabsSlice';
import themesReducer from './slices/themesSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    sidebar: sidebarReducer,
    tabs: tabsReducer,
    themes: themesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

