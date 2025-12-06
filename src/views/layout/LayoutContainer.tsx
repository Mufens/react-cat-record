import React, { useState, useEffect } from 'react';
import AsideMenu from './components/AsideMenu';
import HeaderMenu from './components/HeaderMenu';
import TabContainer from '@/components/TabContainer';
import { useAppDispatch } from '@/store/hooks';
import { setCollapsed } from '@/store/slices/sidebarSlice';
import { KeepAliveOutlet } from '@/components/KeepAlive';
import './LayoutContainer.scss';

const LayoutContainer: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const dispatch = useAppDispatch();

  const checkCollapse = () => {
    const mobile = window.innerWidth < 800;
    setIsMobile(mobile);
    if (mobile) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
    setShowMask(false);
    setIsMobileMenuActive(false);
  };

  const closeMenu = () => {
    if (isMobile && !isCollapsed) {
      setIsCollapsed(true);
      setShowMask(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    const asideMenu = document.querySelector('.aside') as HTMLElement;
    const mask = document.querySelector('.mask') as HTMLElement;
    if (
      asideMenu &&
      !asideMenu.contains(event.target as Node) &&
      mask &&
      mask.contains(event.target as Node)
    ) {
      closeMenu();
    }
  };

  useEffect(() => {
    window.addEventListener('resize', checkCollapse);
    checkCollapse();
    return () => {
      window.removeEventListener('resize', checkCollapse);
    };
  }, []);

  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    dispatch(setCollapsed(newCollapsed));
  };

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setShowMask(!isCollapsed);
      setIsMobileMenuActive(!isCollapsed);
      if (!isCollapsed) {
        document.addEventListener('click', handleClickOutside);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isCollapsed, isMobile]);

  return (
    <div className="layout-container">
      <AsideMenu isCollapsed={isCollapsed} />
      {showMask && (
        <div
          className={`mask ${showMask ? 'mask-visible' : ''}`}
          onClick={closeMenu}
        ></div>
      )}

      <div
        className="container"
        style={{
          marginLeft: isMobile ? '0' : isCollapsed ? '0px' : '180px',
          width: isMobile ? '100%' : isCollapsed ? '100%' : 'calc(100% - 180px)',
        }}
      >
        <div
          className="fixed-header"
          style={{
            width: isMobile ? '100%' : isCollapsed ? '100%' : 'calc(100% - 180px)',
            left: isMobile ? '0' : isCollapsed ? '0' : '180px',
          }}
        >
          <HeaderMenu isCollapsed={isCollapsed} onToggleCollapse={handleCollapseToggle} />
          <TabContainer />
        </div>
        <div className="main">
          <KeepAliveOutlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutContainer;
