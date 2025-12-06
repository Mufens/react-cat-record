/**
 * React 版本的权限指令工具
 * 在 Vue 中通过指令控制元素显示，在 React 中通过组件或 Hook 控制
 * 
 * 使用方式：
 * 1. 使用 Permission 组件包裹需要权限控制的内容
 * 2. 使用 usePermission Hook 在组件内部进行权限判断
 * 
 * @example
 * // 方式1: 使用 Permission 组件
 * <Permission permission="user:add">
 *   <Button>添加用户</Button>
 * </Permission>
 * 
 * @example
 * // 方式2: 使用 usePermission Hook
 * const { hasPermission } = usePermission();
 * {hasPermission('user:add') && <Button>添加用户</Button>}
 */
export { usePermission } from '@/hooks/usePermission';
export { default as Permission } from '@/components/Permission';
