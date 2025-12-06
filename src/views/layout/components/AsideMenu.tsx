import React, { useMemo } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuData } from '@/components/menu';
import { useAppSelector } from '@/store/hooks';
import type { Menus } from '@/types/menu';
import './AsideMenu.scss';

interface AsideMenuProps {
  isCollapsed: boolean;
}

const AsideMenu: React.FC<AsideMenuProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { permissions } = useAppSelector((state) => state.user);
  const { isDarkMode, currentTheme } = useAppSelector((state) => state.themes);

  const filteredMenu = useMemo(() => {
    return menuData.filter((item) => {
      if (item.permiss && !permissions.includes(item.permiss)) return false;
      if (item.children) {
        item.children = item.children.filter(
          (sub) => !sub.permiss || permissions.includes(sub.permiss)
        );
      }
      return true;
    });
  }, [permissions]);

  const renderMenuItems = (items: Menus[]): any[] => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          key: item.index,
          icon: <i className={`iconfont ${item.icon}`}></i>,
          label: item.title,
          children: renderMenuItems(item.children),
        };
      }
      return {
        key: item.index,
        icon: <i className={`iconfont ${item.icon}`}></i>,
        label: item.title,
      };
    });
  };

  const menuItems = renderMenuItems(filteredMenu);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <div className="aside" style={{ width: isCollapsed ? '0px' : '180px' }}>
      <div className="aside_logo"></div>
      <Menu
        className="aside-menu"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        inlineCollapsed={isCollapsed}
        // 不设置 theme 属性，完全由 CSS 变量和自定义样式控制
        // 这样菜单会跟随 various.scss 中定义的主题样式
      />
    </div>
  );
};

export default AsideMenu;

