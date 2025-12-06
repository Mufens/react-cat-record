import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store';
import { setToken, getUser } from '@/store/slices/userSlice';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 懒加载组件
const LoginPage = React.lazy(() => import('@/views/login/LoginPage'));
const LayoutContainer = React.lazy(() => import('@/views/layout/LayoutContainer'));
const Overview = React.lazy(() => import('@/views/overview/contain-all'));
const CatRecord = React.lazy(() => import('@/views/record/cat-record'));
const CatManage = React.lazy(() => import('@/views/manage/cat-manage'));
const UserManage = React.lazy(() => import('@/views/manage/user-manage'));
const RoleManage = React.lazy(() => import('@/views/manage/role-manage'));
const MenuManage = React.lazy(() => import('@/views/manage/menu-manage'));
const MessageBoard = React.lazy(() => import('@/views/board/message-board'));
const UserProfile = React.lazy(() => import('@/views/user/UserProfile'));
const Error403 = React.lazy(() => import('@/views/pages/403-error'));
const Error404 = React.lazy(() => import('@/views/pages/404-error'));

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode; permission?: string }> = ({ 
  children, 
  permission 
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, permissions } = useAppSelector((state) => state.user);
  const [isChecking, setIsChecking] = React.useState(true);
  const checkingRef = React.useRef(false);

  useEffect(() => {
    // 防止重复检查
    if (checkingRef.current) {
      return;
    }

    const checkAuth = async () => {
      checkingRef.current = true;
      NProgress.start();
      setIsChecking(true);
      
      try {
        // 检查 token
        let currentToken = token;
        if (!currentToken) {
          const localToken = localStorage.getItem('token');
          if (localToken) {
            dispatch(setToken(localToken));
            currentToken = localToken;
          }
        }

        // 未登录处理
        if (!currentToken) {
          NProgress.done();
          setIsChecking(false);
          checkingRef.current = false;
          navigate('/login', { replace: true });
          return;
        }

        // 确保用户信息已加载
        if (!user || permissions.length === 0) {
          await dispatch(getUser());
        }

        // 权限检查（统一处理）
        if (permission) {
          const state = store.getState();
          const currentPermissions = state.user.permissions;
          if (currentPermissions.length > 0 && !currentPermissions.includes(permission)) {
            NProgress.done();
            setIsChecking(false);
            checkingRef.current = false;
            navigate('/403', { replace: true });
            return;
          }
        }

        NProgress.done();
        setIsChecking(false);
        checkingRef.current = false;
      } catch (error) {
        dispatch(setToken(''));
        localStorage.removeItem('token');
        localStorage.removeItem('cached-permissions');
        NProgress.done();
        setIsChecking(false);
        checkingRef.current = false;
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [token, user?.id, permissions.length, permission, location.pathname, dispatch, navigate]);

  // 如果正在检查，返回一个空的 div 而不是 null，避免 KeepAlive 警告
  if (isChecking) {
    return <div style={{ display: 'none' }} />;
  }

  return <>{children}</>;
};

// 路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <React.Suspense fallback={null}>
        <LoginPage />
      </React.Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={null}>
          <LayoutContainer />
        </React.Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/overview" replace />,
      },
      {
        path: 'overview',
        element: (
          <ProtectedRoute permission="overview:view">
            <React.Suspense fallback={null}>
              <Overview />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'record',
        element: (
          <ProtectedRoute permission="record:view">
            <React.Suspense fallback={null}>
              <CatRecord />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'system/cat',
        element: (
          <ProtectedRoute permission="cat:view">
            <React.Suspense fallback={null}>
              <CatManage />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'system/user',
        element: (
          <ProtectedRoute permission="user:view">
            <React.Suspense fallback={null}>
              <UserManage />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'system/role',
        element: (
          <ProtectedRoute permission="role:view">
            <React.Suspense fallback={null}>
              <RoleManage />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'system/menu',
        element: (
          <ProtectedRoute permission="menu:view">
            <React.Suspense fallback={null}>
              <MenuManage />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'message-board',
        element: (
          <ProtectedRoute permission="message:view">
            <React.Suspense fallback={null}>
              <MessageBoard />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'user',
        element: (
          <ProtectedRoute permission="us:view">
            <React.Suspense fallback={null}>
              <UserProfile />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/403',
    element: (
      <React.Suspense fallback={null}>
        <Error403 />
      </React.Suspense>
    ),
  },
  {
    path: '/404',
    element: (
      <React.Suspense fallback={null}>
        <Error404 />
      </React.Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);

// 路由组件
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

