import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionProps {
  /**
   * 权限标识，可以是字符串或字符串数组
   * 如果是数组，只要有一个权限匹配就显示（OR 关系）
   */
  permission?: string | string[];
  /**
   * 是否要求所有权限都匹配（AND 关系），仅在 permission 为数组时有效
   * @default false
   */
  requireAll?: boolean;
  /**
   * 没有权限时显示的内容
   */
  fallback?: React.ReactNode;
  /**
   * 子组件
   */
  children: React.ReactNode;
}

/**
 * 权限控制组件
 * 根据用户权限决定是否渲染子组件
 */
const Permission: React.FC<PermissionProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermission();

  // 如果没有指定权限，直接显示
  if (!permission) {
    return <>{children}</>;
  }

  // 检查权限
  let hasAccess = false;
  if (Array.isArray(permission)) {
    hasAccess = requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }

  // 有权限显示子组件，否则显示 fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default Permission;

