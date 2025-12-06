import React, { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Tabs, Form, Input, Button, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/format';
import { updatePasswordAPI, updateUserInfoAPI } from '@/api/user';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getUser, setUser } from '@/store/slices/userSlice';
import avatarDefault from '@/assets/images/avatar/avatar1.jpg';
import bgImage from '@/assets/images/bg2.png';
import './UserProfile.scss';

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [dynamicTags, setDynamicTags] = useState(['撸猫重度患者', '拆弹专家', '₍^..^₎ 𐒡']);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.id) {
          await dispatch(getUser());
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    fetchUserData();
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.name || '',
        email: user.email || '',
      });
    }
  }, [user, form]);

  const handleClose = (tag: string) => {
    setDynamicTags((prev) => prev.filter((t) => t !== tag));
  };

  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputConfirm = () => {
    if (inputValue.trim()) {
      setDynamicTags((prev) => [...prev, inputValue.trim()]);
      setInputValue('');
    }
    setInputVisible(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && user) {
          const updatedUser = { ...user, avatar: event.target.result as string };
          dispatch(setUser(updatedUser));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      if (!user?.id) {
        throw new Error('用户未登录');
      }
      await updateUserInfoAPI(user.id, { name: values.username, email: values.email });
      const updatedUser = { ...user, name: values.username, email: values.email };
      dispatch(setUser(updatedUser));
      message.success('信息修改成功');
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.message || '操作失败');
    }
  };

  const changePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        throw new Error('新密码与确认密码不一致');
      }
      if (!user?.id) {
        throw new Error('用户未登录');
      }
      await updatePasswordAPI(user.id, values.oldPassword, values.newPassword);
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.message || '发生未知错误');
    }
  };

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 1, max: 20, message: '长度在1到20个字符' },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item label="个性标签">
            <div className="flex flex-wrap gap-2">
              {dynamicTags.map((tag) => (
                <Tag key={tag} closable onClose={() => handleClose(tag)}>
                  {tag}
                </Tag>
              ))}
              {inputVisible ? (
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{ width: 80 }}
                  size="small"
                  onPressEnter={handleInputConfirm}
                  onBlur={handleInputConfirm}
                />
              ) : (
                <Button size="small" icon={<PlusOutlined />} onClick={showInput}>
                  新标签
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入用户邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={submitForm}>
              保存
            </Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Form form={passwordForm} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="原密码" name="oldPassword">
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="确认密码" name="confirmPassword">
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={changePassword}>
              提交
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="user-profile-container">
      <Card
        className="profile-card"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="banner">
          <div className="avatar-wrapper" onClick={triggerFileInput}>
            <Avatar
              size={120}
              src={user?.avatar || avatarDefault}
              className="profile-avatar"
            />
            <div className="avatar-mask">
              <span className="mask-text">更换头像</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <div className="profile-info">
          <h1 className="username">{user?.name}</h1>
          <div className="tag-container">
            {dynamicTags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </div>
          <div className="email">
            邮箱: {user?.email}
            <p className="time">注册时间：{formatDate(user?.createdAt || '')}</p>
          </div>
        </div>
      </Card>

      <Card className="tabs-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default UserProfile;
