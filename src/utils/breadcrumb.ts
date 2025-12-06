import type { Menus } from '@/types/menu'

export interface BreadcrumbItem {
  title: string
  icon?: string
}

export const generateBreadcrumbs = (path: string, menuData: Menus[]): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = []

  const findMenu = (menus: Menus[], targetPath: string): boolean => {
    for (const menu of menus) {
      const currentPath = menu.index || ''
      
      // 精确匹配
      if (currentPath === targetPath) {
        breadcrumbs.unshift({ 
          title: menu.title ?? '未命名', 
          icon: menu.icon 
        })
        return true
      }
      
      // 检查子菜单
      if (menu.children && menu.children.length > 0) {
        if (findMenu(menu.children as Menus[], targetPath)) {
          // 如果子菜单匹配，添加父菜单
          breadcrumbs.unshift({ 
            title: menu.title ?? '未命名', 
            icon: menu.icon 
          })
          return true
        }
      }
    }
    return false
  }

  // 标准化路径（移除尾部斜杠，处理 /overview 和 /overview/ 的情况）
  const normalizedPath = path.replace(/\/$/, '') || '/'
  
  findMenu(menuData, normalizedPath)
  
  // 如果没有找到匹配的面包屑，至少显示首页
  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ title: '首页', icon: 'icon-shouye' })
  }
  
  return breadcrumbs
}
