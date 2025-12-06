import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TabItem {
  name: string;
  path: string;
  title: string;
  icon: string;
}

interface TabsState {
  tabList: TabItem[];
}

const initialState: TabsState = {
  tabList: [],
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<TabItem>) => {
      const exists = state.tabList.some((t) => t.path === action.payload.path);
      if (!exists) {
        state.tabList.push(action.payload);
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      state.tabList = state.tabList.filter((t) => t.path !== action.payload);
    },
    clearAllTabs: (state) => {
      state.tabList = [];
    },
    keepSpecificTabs: (state, action: PayloadAction<string[]>) => {
      state.tabList = state.tabList.filter((t) => action.payload.includes(t.path));
    },
  },
});

export const { addTab, removeTab, clearAllTabs, keepSpecificTabs } = tabsSlice.actions;

// 工具函数：查找下一个标签页
export const findNextTab = (state: { tabs: TabsState }, currentPath: string) => {
  const index = state.tabs.tabList.findIndex((t) => t.path === currentPath);
  if (index === -1) return null;
  return state.tabs.tabList[index + 1] || state.tabs.tabList[index - 1] || null;
};

export default tabsSlice.reducer;

