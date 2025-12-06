import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import error404 from '@/assets/images/404error.svg';
import './404-error.scss';

const Error404: React.FC = () => {
  return (
    <div className="erro-page">
      <div className="error-box">
        <img src={error404} alt="404" />
        <div className="error-desc">啊哦~ 你所访问的页面不存在</div>
        <div className="error-handle">
          <Link to="/">
            <Button type="primary" size="large">返回首页</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error404;
