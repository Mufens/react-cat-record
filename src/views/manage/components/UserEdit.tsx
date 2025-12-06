import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { addUserData, editUserData } from '@/api/user';
import { getRoleListAPI } from '@/api/role';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getUser } from '@/store/slices/userSlice';

interface UserEditProps {
  onSuccess?: () => void;
}

export interface UserEditRef {
  open: (row?: User) => void;
}

const UserEdit = forwardRef<UserEditRef, UserEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [roleList, setRoleList] = useState<Role[]>([]);
  const { user: currentUser } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  useImperativeHandle(ref, () => ({
    open: (row?: User) => {
      setVisible(true);
      if (row?.id) {
        form.setFieldsValue({ ...row, password: '' });
      } else {
        form.resetFields();
        form.setFieldsValue({
          role: '爱喵用户',
          status: true,
        });
      }
    },
  }));

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRoleListAPI({
          pagenum: 1,
          pagesize: 100,
          status: true,
        });
        setRoleList(res.data.list);
      } catch {
        message.error('获取角色列表失败');
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = { ...values };
      
      if (!form.getFieldValue('id') && !submitData.password) {
        message.error('新增用户必须设置密码');
        return;
      }
      
      if (form.getFieldValue('id')) {
        delete submitData.password;
        await editUserData(form.getFieldValue('id'), submitData);
        message.success('修改成功');
      } else {
        await addUserData(submitData as Required<typeof submitData>);
        message.success('新增成功');
      }

      setVisible(false);
      onSuccess?.();

      // 如果修改的是当前登录用户
      if (currentUser?.id === form.getFieldValue('id')) {
        await dispatch(getUser());
        window.location.reload();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={() => setVisible(false)}
      title={form.getFieldValue('id') ? '编辑用户' : '新增用户'}
      width={400}
      onOk={onSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ padding: '0 20px' }}
      >
        <Form.Item
          label="用户名"
          name="name"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 1, max: 11, message: '用户名长度在1-11个字符之间' },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        {!form.getFieldValue('id') && (
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { pattern: /^\S{6,15}$/, message: '密码必须为6-15位非空字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}

        <Form.Item label="角色" name="role">
          <Select style={{ width: '100%' }}>
            {roleList.map((role) => (
              <Select.Option key={role.id} value={role.name}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
      </Form>
    </Modal>
  );
});

UserEdit.displayName = 'UserEdit';

export default UserEdit;

