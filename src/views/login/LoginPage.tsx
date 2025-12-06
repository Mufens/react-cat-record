import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI, loginAPI } from '@/api/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setToken, getUser, setUser } from '@/store/slices/userSlice';
import './LoginPage.scss';

const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);

  // 如果已登录，重定向到首页
  useEffect(() => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (isRegister) {
      form.resetFields();
    }
  }, [isRegister, form]);

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      await registerAPI({
        name: values.username,
        password: values.password,
        email: values.email,
        role: '爱喵用户',
        avatar: '',
      });
      message.success('注册成功');
      setIsRegister(false);
      form.resetFields();
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.message || '注册失败');
    }
  };

  const handleLogin = async () => {
    try {
      const values = await form.validateFields(['username', 'password']);
      const user = await loginAPI({
        name: values.username,
        password: values.password,
      });
      const token = 'Bearer ' + user.id;
      dispatch(setToken(token));
      localStorage.setItem('token', token);
      dispatch(setUser(user));
      // 确保权限加载完成后再导航
      await dispatch(getUser());
      message.success('登录成功');
      // 使用 setTimeout 确保状态更新完成
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error: any) {
      message.error(error?.message || '登录失败');
    }
  };

  return (
    <div className="login-page">
      <svg
        className="background-svg"
        viewBox="0 0 100% 100%"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="0" width="100%" height="100%" fill="var(--bg-color)" />
        <g fill="var(--menu-active-text-color)">
          <circle r="14.7%" cx="82%" cy="83%" />
          <circle r="6.5%" cx="39%" cy="32%" />
          <circle r="8.5%" cx="79%" cy="16%" />
          <circle r="9.7%" cx="22%" cy="79.5%" />
          <circle r="9.9%" cx="2.9%" cy="7.8%" />
        </g>
      </svg>

      <div className="login-container">
        <div className="login-header">
          <div className="logo"></div>
          <div className="login-title">猫咪记录管理系统</div>
        </div>

        {isRegister ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRegister}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 1, max: 11, message: '用户名长度在 1 到 11个字符之间' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="邮箱"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { pattern: /^\S{6,15}$/, message: '密码必须是 6-15位 的非空字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item
              name="repassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入密码' },
                { pattern: /^\S{6,15}$/, message: '密码必须是 6-15位 的非空字符' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                注册
              </Button>
            </Form.Item>
            <p className="login-text">
              已有账号？
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(false);
                }}
                style={{ color: 'var(--menu-active-text-color)' }}
              >
                立即登录
              </Link>
            </p>
          </Form>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{ username: 'admin', password: '123456' }}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 1, max: 11, message: '用户名长度在 1 到 11个字符之间' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { pattern: /^\S{6,15}$/, message: '密码必须是 6-15位 的非空字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>
            <Form.Item className="flex">
              <div className="flex">
                <Checkbox>记住密码</Checkbox>
                <Link
                  to="#"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: 'var(--menu-active-text-color)' }}
                >
                  忘记密码？
                </Link>
              </div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
            <p className="login-text">
              没有账号？
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(true);
                }}
                style={{ color: 'var(--menu-active-text-color)' }}
              >
                立即注册
              </Link>
            </p>
          </Form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
