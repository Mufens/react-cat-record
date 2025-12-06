import { useAppSelector } from '@/store/hooks';

/**
 * 权限检查 Hook
 * @returns 权限检查函数和权限列表
 */
export const usePermission = () => {
  const permissions = useAppSelector((state) => state.user.permissions);

  /**
   * 检查是否有指定权限
   * @param permission 权限标识，可以是字符串或字符串数组
   * @returns 是否有权限
   */
  const hasPermission = (permission: string | string[]): boolean => {
    if (!permission) return true;
    const requiredPerms = Array.isArray(permission) ? permission : [permission];
    return requiredPerms.some((p) => permissions.includes(p));
  };

  /**
   * 检查是否有所有指定权限（AND 关系）
   * @param permissions 权限标识数组
   * @returns 是否有所有权限
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  /**
   * 检查是否有任意一个权限（OR 关系）
   * @param permissions 权限标识数组
   * @returns 是否有任意一个权限
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};

