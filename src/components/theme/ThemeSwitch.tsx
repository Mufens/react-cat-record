import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { applyTheme, toggleDarkMode, initializeTheme } from '@/store/slices/themesSlice';
import { themes } from './themes';
import './ThemeSwitch.scss';

const ThemeSwitch: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentTheme, isDarkMode } = useAppSelector((state) => state.themes);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, []);

  const visibleThemes = themes.filter((t) => t.className !== 'dark');

  return (
    <div className="theme-container" ref={containerRef}>
      <div className="switch-group">
        <div className="darkchange" onClick={() => dispatch(toggleDarkMode())}>
          <i className={`iconfont ${isDarkMode ? 'icon-icon-heiyemoshi' : 'icon-taiyang'}`}></i>
        </div>
        {isDarkMode ? (
          <Tooltip title="浅色主题使用请切换为白天模式 ᖰ⌯'▾'⌯ᖳ" placement="bottom">
            <div className="theme-switch disabled">
              <i className="iconfont icon-zhuti_tiaosepan_o"></i>
            </div>
          </Tooltip>
        ) : (
          <div className="theme-switch" onClick={() => setVisible(!visible)}>
            <i className="iconfont icon-zhuti_tiaosepan_o"></i>
          </div>
        )}
      </div>
      {visible && (
        <div
          className="theme-panel"
          style={{
            background: isDarkMode ? '#232324' : '#fff',
            '--trangle-color': isDarkMode ? '#232324' : '#fff',
          } as React.CSSProperties}
        >
          <div className="trangle"></div>
          {visibleThemes.map((theme) => (
            <div
              key={theme.name}
              className={`theme-item ${currentTheme === theme.className ? 'active' : ''}`}
              onClick={() => {
                dispatch(applyTheme(theme.className));
                setVisible(false);
              }}
            >
              <div className="theme-content">
                <div className="block">
                  <div className="color-block" style={{ backgroundColor: theme.color }}></div>
                </div>
                <div className="theme-label">{theme.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitch;

