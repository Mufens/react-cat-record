import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppRouter from './router';
import { initializeTheme } from './store/slices/themesSlice';
import { useAppDispatch } from './store/hooks';
import { KeepAliveWrapper } from './components/KeepAlive';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  return (
    <ConfigProvider locale={zhCN}>
      <KeepAliveWrapper>
        <AppRouter />
      </KeepAliveWrapper>
    </ConfigProvider>
  );
};

export default App;
