import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isCollapsed: boolean;
}

const initialState: SidebarState = {
  isCollapsed: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
    },
  },
});

export const { setCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer;

