import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import error403 from '@/assets/images/403.svg';
import './403-error.scss';

const Error403: React.FC = () => {
  return (
    <div className="erro-page">
      <div className="error-box">
        <img src={error403} alt="403" />
        <div className="error-desc">Oops!你没有权限访问该页面哦</div>
        <div className="error-handle">
          <Link to="/">
            <Button type="primary" size="large">返回首页</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error403;
