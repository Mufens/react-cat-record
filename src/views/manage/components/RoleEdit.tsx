import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Drawer, Form, Input, Radio, Tree, Button, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Role, PermissionNode } from '@/types/role';
import { getAllPermissionAPI, addRoleAPI, editRoleAPI } from '@/api/role';
import './RoleEdit.scss';

interface RoleEditProps {
  onSuccess?: (type: 'add' | 'edit') => void;
}

export interface RoleEditRef {
  open: (role?: Role) => void;
}

const RoleEdit = forwardRef<RoleEditRef, RoleEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [permissionsTree, setPermissionsTree] = useState<PermissionNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  useImperativeHandle(ref, () => ({
    open: async (role?: Role) => {
      await loadPermissions();
      setVisible(true);
      if (role?.id) {
        form.setFieldsValue(role);
        setCheckedKeys(role.permissions || []);
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: true,
        });
        setCheckedKeys([]);
      }
    },
  }));

  const loadPermissions = async () => {
    try {
      const res = await getAllPermissionAPI();
      // getAllPermissionAPI 返回 { code: 200, data: PermissionNode[] }
      if (res && typeof res === 'object' && 'data' in res) {
        setPermissionsTree((res as { data: PermissionNode[] }).data || []);
      }
    } catch (error) {
      console.error('加载权限数据失败:', error);
    }
  };

  const convertToTreeData = (nodes: PermissionNode[]): DataNode[] => {
    return nodes.map((node) => ({
      title: (
        <div className="tree-node-content">
          {node.icon && <i className={`iconfont ${node.icon}`} style={{ marginRight: 6 }} />}
          <span>{node.label}</span>
        </div>
      ),
      key: node.value,
      children: 'children' in node && node.children ? convertToTreeData(node.children) : undefined,
    }));
  };

  const customNodeClass = (data: PermissionNode) => {
    if ('children' in data) {
      return data.isPenultimate ? 'is-penultimate' : '';
    }
    return '';
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!values.name) {
        message.error('角色名称不能为空');
        return;
      }

      if (form.getFieldValue('id')) {
        await editRoleAPI(form.getFieldValue('id'), {
          ...values,
          permissions: checkedKeys as string[],
        });
        message.success('修改成功');
      } else {
        await addRoleAPI({
          name: values.name,
          remark: values.remark || '',
          status: values.status ?? true,
          permissions: checkedKeys as string[],
        });
        message.success('添加成功');
      }

      setVisible(false);
      onSuccess?.(form.getFieldValue('id') ? 'edit' : 'add');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <Drawer
      open={visible}
      onClose={() => setVisible(false)}
      title={form.getFieldValue('id') ? '编辑角色' : '新增角色'}
      width={460}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item label="角色状态" name="status">
          <Radio.Group>
            <Radio value={true}>启用</Radio>
            <Radio value={false}>禁用</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="角色备注" name="remark">
          <Input.TextArea placeholder="请输入备注信息" rows={2} />
        </Form.Item>

        <Form.Item label="权限分配" name="permissions">
          <Tree
            checkable
            treeData={convertToTreeData(permissionsTree)}
            checkedKeys={checkedKeys}
            onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
            defaultExpandAll
            className="permission-tree"
          />
        </Form.Item>
      </Form>

      <div className="form-action-buttons">
        <Button onClick={() => setVisible(false)}>取消</Button>
        <Button type="primary" onClick={handleSave}>
          确认
        </Button>
      </div>
    </Drawer>
  );
});

RoleEdit.displayName = 'RoleEdit';

export default RoleEdit;

