import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { themes } from '@/components/theme/themes';
import type { ThemeConfig } from '@/types/themes';

type ThemeClassName = ThemeConfig['className'];

interface ThemesState {
  currentTheme: ThemeClassName;
  isDarkMode: boolean;
}

const initialState: ThemesState = {
  currentTheme: (localStorage.getItem('theme') as ThemeClassName) || 'default',
  isDarkMode: localStorage.getItem('darkMode') === 'true',
};

// 提取主题应用逻辑
const applyThemeToDOM = (themeName: ThemeClassName, isDark: boolean) => {
  const root = document.documentElement;
  themes.forEach((t) => {
    root.classList.remove(t.className);
  });
  const actualTheme = isDark ? 'dark' : themeName;
  root.classList.add(actualTheme);
};

const themesSlice = createSlice({
  name: 'themes',
  initialState,
  reducers: {
    applyTheme: (state, action: PayloadAction<ThemeClassName>) => {
      state.currentTheme = action.payload;
      localStorage.setItem('theme', action.payload);
      applyThemeToDOM(action.payload, state.isDarkMode);
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', state.isDarkMode.toString());
      applyThemeToDOM(state.currentTheme, state.isDarkMode);
    },
    initializeTheme: (state) => {
      const savedTheme = (localStorage.getItem('theme') as ThemeClassName) || 'default';
      const darkMode = localStorage.getItem('darkMode') === 'true';
      state.isDarkMode = darkMode;
      state.currentTheme = savedTheme;
      applyThemeToDOM(savedTheme, darkMode);
    },
  },
});

export const { applyTheme, toggleDarkMode, initializeTheme } = themesSlice.actions;
export default themesSlice.reducer;

