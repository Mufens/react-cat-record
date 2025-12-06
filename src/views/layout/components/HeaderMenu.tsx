import React, { useState, useMemo } from 'react';
import { Breadcrumb, Avatar, Dropdown, Modal } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, RightOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuData } from '@/components/menu';
import { generateBreadcrumbs } from '@/utils/breadcrumb';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import GetMessage from './GetMessage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToken } from '@/store/slices/userSlice';
import { clearAllTabs } from '@/store/slices/tabsSlice';
import avatar from '@/assets/images/avatar/avatar1.jpg';
import './HeaderMenu.scss';

interface HeaderMenuProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(location.pathname, menuData);
  }, [location.pathname]);

  const handleCommand = (key: string) => {
    if (key === 'logout') {
      Modal.confirm({
        title: '温馨提示',
        content: '确认退出吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          dispatch(clearAllTabs());
          localStorage.removeItem('cachedTabs');
          dispatch(removeToken());
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        },
      });
    } else {
      navigate('/user');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const menuItems = [
    {
      key: 'profile',
      label: (
        <span>
          <i className="iconfont icon-personalcenter"></i> 个人中心
        </span>
      ),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <div className="header">
      <div className="header-left">
        <div className="collapse-btn" onClick={onToggleCollapse}>
          {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <div className="bread-container">
          <Breadcrumb separator={<RightOutlined />}>
            {breadcrumbs.map((crumb, index) => (
              <Breadcrumb.Item key={index}>
                {crumb.icon && <i className={`iconfont ${crumb.icon}`}></i>}
                <span>{crumb.title}</span>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
      </div>
      <div className="header-right">
        <ThemeSwitch />
        <div className="btn-icon" onClick={toggleFullscreen}>
          <i className={`iconfont ${isFullscreen ? 'icon-tuichuquanping' : 'icon-quanping'}`}></i>
        </div>
        <GetMessage />
        <div className="user">
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => handleCommand(key),
            }}
            placement="bottomRight"
          >
            <div className="dropdown-box">
              <Avatar src={user?.avatar || avatar} />
              <div className="name">{user?.name}</div>
              <div className="arrow">
                <DownOutlined />
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default HeaderMenu;

