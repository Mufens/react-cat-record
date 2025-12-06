import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, Dropdown } from 'antd';
import { ArrowDownOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addTab, removeTab, clearAllTabs, keepSpecificTabs, findNextTab } from '@/store/slices/tabsSlice';
import type { TabItem } from '@/store/slices/tabsSlice';
import { menuData } from '@/components/menu';
import './TabContainer.scss';

const TabContainer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { tabList } = useAppSelector((state) => state.tabs);
  const [activeKey, setActiveKey] = useState(location.pathname);

  // 从菜单数据中查找标题和图标，如果找不到返回 null
  const findMenuInfo = (path: string): { title: string; icon: string } | null => {
    // 跳过根路径和登录页
    if (path === '/' || path === '/login') {
      return null;
    }
    
    const findInMenu = (menus: typeof menuData): { title: string; icon: string } | null => {
      for (const menu of menus) {
        if (menu.index === path) {
          return { title: menu.title || '未命名', icon: menu.icon || 'icon-document' };
        }
        if (menu.children) {
          const found = findInMenu(menu.children as typeof menuData);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findInMenu(menuData);
  };

  useEffect(() => {
    const savedState = localStorage.getItem('cachedTabs');
    if (savedState) {
      try {
        const { tabs } = JSON.parse(savedState);
        // 过滤掉无效和"未命名"的标签
        const validTabs = tabs.filter(
          (t: TabItem) =>
            typeof t.path === 'string' &&
            typeof t.title === 'string' &&
            typeof t.icon === 'string' &&
            t.title !== '未命名' && // 过滤掉"未命名"的标签
            findMenuInfo(t.path) !== null // 确保路径在菜单中存在
        );
        const menuInfo = findMenuInfo(location.pathname);
        // 只有在找到菜单信息时才创建标签
        if (menuInfo) {
          const currentTab: TabItem = {
            name: location.pathname,
            path: location.pathname,
            title: menuInfo.title,
            icon: menuInfo.icon,
          };
          const exists = validTabs.some((t: TabItem) => t.path === currentTab.path);
          if (!exists) {
            validTabs.push(currentTab);
          }
        }
        validTabs.forEach((tab: TabItem) => dispatch(addTab(tab)));
        if (menuInfo) {
          setActiveKey(location.pathname);
        }
      } catch (error) {
        console.error('解析缓存标签失败:', error);
        localStorage.removeItem('cachedTabs');
      }
    } else {
      const menuInfo = findMenuInfo(location.pathname);
      // 只有在找到菜单信息时才创建标签
      if (menuInfo) {
        const currentTab: TabItem = {
          name: location.pathname,
          path: location.pathname,
          title: menuInfo.title,
          icon: menuInfo.icon,
        };
        if (!tabList.some((t) => t.path === location.pathname)) {
          dispatch(addTab(currentTab));
        }
        setActiveKey(location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    const menuInfo = findMenuInfo(location.pathname);
    // 只有在找到菜单信息时才创建或更新标签
    if (menuInfo) {
      const currentTab: TabItem = {
        name: location.pathname,
        path: location.pathname,
        title: menuInfo.title,
        icon: menuInfo.icon,
      };
      const exists = tabList.some((t) => t.path === location.pathname);
      if (!exists) {
        dispatch(addTab(currentTab));
      } else {
        // 更新已存在标签的标题和图标（如果菜单数据有变化）
        const existingTab = tabList.find((t) => t.path === location.pathname);
        if (existingTab && (existingTab.title !== menuInfo.title || existingTab.icon !== menuInfo.icon)) {
          dispatch(addTab(currentTab));
        }
      }
      setActiveKey(location.pathname);
      const updatedTabList = tabList.some((t) => t.path === location.pathname)
        ? tabList.map((t) => (t.path === location.pathname ? currentTab : t))
        : [...tabList, currentTab];
      localStorage.setItem(
        'cachedTabs',
        JSON.stringify({ tabs: updatedTabList, activePath: location.pathname })
      );
    }
  }, [location.pathname, dispatch, tabList]);

  const handleTabClick = (key: string) => {
    const targetTab = tabList.find((t) => t.path === key);
    if (targetTab && targetTab.path !== location.pathname) {
      setActiveKey(targetTab.path);
      navigate(targetTab.path);
    }
  };

  const handleTabClose = (path: string) => {
    if (tabList.length <= 1) return;
    const nextTab = findNextTab({ tabs: { tabList } }, path);
    dispatch(removeTab(path));
    if (path === location.pathname) {
      if (nextTab?.path) {
        navigate(nextTab.path);
      }
    }
  };

  const handleMenuCommand = (command: 'current' | 'all' | 'other') => {
    switch (command) {
      case 'current':
        handleTabClose(location.pathname);
        break;
      case 'all':
        if (tabList.length === 0) return;
        dispatch(clearAllTabs());
        break;
      case 'other':
        dispatch(keepSpecificTabs([location.pathname]));
        break;
    }
  };

  const menuItems = [
    {
      key: 'other',
      label: (
        <span>
          <DeleteOutlined /> 关闭其他标签页
        </span>
      ),
      disabled: tabList.length <= 1,
    },
    {
      key: 'current',
      label: (
        <span>
          <CloseOutlined /> 关闭当前标签页
        </span>
      ),
      disabled: tabList.length <= 1,
    },
    {
      key: 'all',
      label: (
        <span>
          <DeleteOutlined /> 关闭所有标签页
        </span>
      ),
      disabled: tabList.length === 0,
    },
  ];

  return (
    <div className="tab-container">
      <Tabs
        activeKey={activeKey}
        type="card"
        hideAdd
        onEdit={(targetKey, action) => {
          if (action === 'remove') {
            handleTabClose(targetKey as string);
          }
        }}
        onChange={handleTabClick}
        items={tabList.map((tab) => ({
          key: tab.path,
          label: (
            <span>
              <i className={`iconfont ${tab.icon}`}></i>
              {tab.title}
            </span>
          ),
          closable: tabList.length > 1,
        }))}
      />
      <div className="tab-actions">
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => handleMenuCommand(key as 'current' | 'all' | 'other'),
          }}
        >
          <ArrowDownOutlined />
        </Dropdown>
      </div>
    </div>
  );
};

export default TabContainer;

