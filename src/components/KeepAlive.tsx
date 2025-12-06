import React from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { AliveScope, KeepAlive } from 'react-activation';
import { useAppSelector } from '@/store/hooks';

interface KeepAliveWrapperProps {
  children: React.ReactNode;
}

// KeepAlive 包装器组件 - 必须在最外层使用
export const KeepAliveWrapper: React.FC<KeepAliveWrapperProps> = ({ children }) => {
  return <AliveScope>{children}</AliveScope>;
};

// 单个路由的 KeepAlive 组件
interface RouteKeepAliveProps {
  cacheKey: string;
  children: React.ReactNode;
}

export const RouteKeepAlive: React.FC<RouteKeepAliveProps> = ({ cacheKey, children }) => {
  if (!children) {
    return null;
  }
  
  return (
    <KeepAlive cacheKey={cacheKey} id={cacheKey}>
      {children}
    </KeepAlive>
  );
};

// 自动管理 KeepAlive 的 Outlet 包装器
// 根据标签页列表决定是否缓存组件
export const KeepAliveOutlet: React.FC = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const { tabList } = useAppSelector((state) => state.tabs);
  const { token } = useAppSelector((state) => state.user);

  // 使用路径作为缓存 key
  const cacheKey = location.pathname;

  // 检查当前路径是否在标签页列表中（只有打开的标签页才缓存）
  const shouldCache = token && 
    location.pathname !== '/login' && 
    tabList.some((tab) => tab.path === location.pathname);

  if (!outlet) {
    return null;
  }

  // 如果路径在标签页列表中，则缓存；否则不缓存
  if (shouldCache) {
    return (
      <RouteKeepAlive cacheKey={cacheKey}>
        {outlet}
      </RouteKeepAlive>
    );
  }

  // 不在标签页列表中的路由不缓存
  return <>{outlet}</>;
};
