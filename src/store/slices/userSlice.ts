import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import { getUserInfoAPI } from '@/api/user';
import { getRolePermissionsAPI } from '@/api/role';

interface UserState {
  token: string;
  user: User | null;
  permissions: string[];
}

// 权限缓存工具函数
const getCachedPermissions = (): string[] => {
  try {
    const cached = localStorage.getItem('cached-permissions');
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const clearPermissionsCache = () => {
  localStorage.removeItem('cached-permissions');
};

const setPermissionsCache = (permissions: string[]) => {
  localStorage.setItem('cached-permissions', JSON.stringify(permissions));
};

const initialState: UserState = {
  token: localStorage.getItem('token') || '',
  user: null,
  permissions: getCachedPermissions(), // 初始化时从缓存恢复权限
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    removeToken: (state) => {
      state.token = '';
      state.user = null;
      state.permissions = [];
      localStorage.removeItem('token');
      clearPermissionsCache();
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
  },
});

export const { setToken, removeToken, setUser, setPermissions } = userSlice.actions;

// 异步 thunk - 获取用户信息和权限
export const getUser = () => async (dispatch: any, getState: () => any) => {
  const { token } = getState().user;
  if (!token) throw new Error('未登录');
  
  try {
    const userId = parseInt(token.split(' ')[1]);
    const user = await getUserInfoAPI(userId);
    dispatch(setUser(user));
    
    // 获取并绑定权限
    if (user?.role) {
      const { data } = await getRolePermissionsAPI(user.role);
      const permissions = data || [];
      dispatch(setPermissions(permissions));
      setPermissionsCache(permissions);
    } else {
      dispatch(setPermissions([]));
      clearPermissionsCache();
    }
  } catch (error) {
    // 获取权限失败时，尝试从缓存恢复
    const cachedPermissions = getCachedPermissions();
    if (cachedPermissions.length > 0) {
      dispatch(setPermissions(cachedPermissions));
    }
    throw error;
  }
};


export default userSlice.reducer;

