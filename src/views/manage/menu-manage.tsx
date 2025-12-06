import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Cascader, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import type { Menus } from '@/types/menu';
import TableActions from '@/components/table/TableActions';
import { menuData } from '@/components/menu';
import './menu-manage.scss';

interface ColumnItem {
  label: string;
  prop: string;
  visible: boolean;
  width?: string | number;
  align?: 'center' | 'left' | 'right';
  headerAlign?: 'center' | 'left' | 'right';
}

interface MenuNode {
  id: string;
  title: string;
  children: MenuNode[] | null;
}

const MenuManage: React.FC = () => {
  const [tableData, setTableData] = useState<Menus[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);

  const [columns, setColumns] = useState<ColumnItem[]>([
    { label: '菜单ID', prop: 'id', width: 120, visible: true },
    { label: '菜单名称', prop: 'title', visible: true, align: 'center' },
    { label: '图标', prop: 'icon', width: 80, visible: true, align: 'center' },
    { label: '路由地址', prop: 'index', visible: true },
    { label: '权限标识', prop: 'permiss', visible: true },
    { label: '操作', prop: 'actions', visible: true, width: 200, headerAlign: 'center', align: 'center' },
  ]);

  const initTableData = () => {
    setTableData(menuData.map((item) => ({ ...item, children: item.children || [] })));
  };

  useEffect(() => {
    initTableData();
  }, []);

  const cascaderMenuOptions = useMemo(() => {
    const formatMenu = (menus: Menus[]): MenuNode[] => {
      return menus.map((menu) => {
        const node: MenuNode = {
          id: menu.id,
          title: menu.title,
          children: menu.children ? formatMenu(menu.children) : null,
        };
        return node;
      });
    };
    const formatted = formatMenu(tableData);
    // 转换 null 为 undefined 以符合 Cascader 的类型要求
    const convertChildren = (nodes: MenuNode[]): any[] => {
      return nodes.map((node) => ({
        id: node.id,
        title: node.title,
        children: node.children ? convertChildren(node.children) : undefined,
      }));
    };
    return convertChildren(formatted);
  }, [tableData]);

  const findMenuById = (menus: Menus[], id: string): Menus | undefined => {
    for (const menu of menus) {
      if (menu.id === id) return menu;
      if (menu.children) {
        const found = findMenuById(menu.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const updateMenuInTree = (menus: Menus[], updatedMenu: Menus): boolean => {
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].id === updatedMenu.id) {
        menus.splice(i, 1, updatedMenu);
        return true;
      }
      if (menus[i].children) {
        const found = updateMenuInTree(menus[i].children!, updatedMenu);
        if (found) return true;
      }
    }
    return false;
  };

  const openAddDialog = () => {
    setIsEdit(false);
    form.resetFields();
    form.setFieldsValue({ id: '', title: '', index: '', icon: '', permiss: '', pid: undefined });
    setDialogVisible(true);
  };

  const openEditDialog = (row: Menus) => {
    setIsEdit(true);
    form.setFieldsValue({ ...row, pid: row.pid });
    setDialogVisible(true);
  };

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      const formValues = form.getFieldsValue();

      if (isEdit) {
        const original = findMenuById(tableData, formValues.id);
        if (!original) return;

        const oldPid = original.pid;
        const newPid = formValues.pid;

        const updatedMenu: Menus = {
          ...formValues,
          children: original.children || [],
        };

        if (oldPid !== newPid) {
          // 从旧父节点移除
          if (oldPid) {
            const oldParent = findMenuById(tableData, oldPid);
            const childIndex = oldParent?.children?.findIndex((c) => c.id === formValues.id);
            if (childIndex !== undefined && childIndex > -1) {
              oldParent?.children?.splice(childIndex, 1);
            }
          } else {
            const rootIndex = tableData.findIndex((m) => m.id === formValues.id);
            if (rootIndex > -1) {
              tableData.splice(rootIndex, 1);
            }
          }

          // 添加到新父节点
          if (newPid) {
            const newParent = findMenuById(tableData, newPid);
            newParent?.children?.push(updatedMenu);
          } else {
            tableData.push(updatedMenu);
          }
        } else {
          updateMenuInTree(tableData, updatedMenu);
        }
      } else {
        const newMenu: Menus = {
          ...formValues,
          id: Date.now().toString(),
          children: [],
        };

        if (formValues.pid) {
          const parent = findMenuById(tableData, formValues.pid);
          parent?.children?.push(newMenu);
        } else {
          tableData.push(newMenu);
        }
      }

      setTableData([...tableData]);
      message.success(isEdit ? '修改成功' : '新增成功');
      setDialogVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const delMenu = (row: Menus) => {
    const removeMenu = (menus: Menus[], id: string): boolean => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === id) {
          menus.splice(i, 1);
          return true;
        }
        if (menus[i].children && removeMenu(menus[i].children!, id)) {
          return true;
        }
      }
      return false;
    };

    const newData = [...tableData];
    if (removeMenu(newData, row.id)) {
      setTableData(newData);
      message.success('删除成功');
    } else {
      message.error('删除失败');
    }
  };

  const tableColumns: ColumnsType<Menus> = columns
    .filter((col) => col.visible)
    .map((col) => {
      if (col.prop === 'icon') {
        return {
          title: col.label,
          dataIndex: col.prop,
          key: col.prop,
          width: col.width,
          align: col.align,
          render: (icon: string) => (icon ? <i className={`iconfont ${icon}`} /> : null),
        };
      }

      if (col.prop === 'actions') {
        return {
          title: col.label,
          key: 'actions',
          width: col.width,
          align: col.align,
          render: (_: any, record: Menus) => (
            <div className="actions">
              <Button type="primary" size="small" onClick={() => openEditDialog(record)}>
                修改
              </Button>
              <Button danger size="small" onClick={() => delMenu(record)}>
                删除
              </Button>
            </div>
          ),
        };
      }

      return {
        title: col.label,
        dataIndex: col.prop,
        key: col.prop,
        width: col.width,
        align: col.align,
      };
    });

  return (
    <div className="operation">
      <div className="column">
        <div className="column-left">
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddDialog}>
            新增
          </Button>
        </div>
        <div className="column-right">
          <TableActions
            columns={columns}
            showColumnsType="checkbox"
            onColumnsChange={setColumns}
          />
        </div>
      </div>

      <Table
        dataSource={tableData}
        columns={tableColumns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={isEdit ? '修改菜单' : '新增菜单'}
        open={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        onOk={submitForm}
        width={550}
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="菜单名称" name="title" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="图标" name="icon">
            <Input />
          </Form.Item>
          <Form.Item label="父菜单" name="pid">
            <Cascader
              options={cascaderMenuOptions}
              fieldNames={{ value: 'id', label: 'title' }}
              changeOnSelect
              placeholder="请选择父菜单"
              style={{ width: '100%' }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="路由地址" name="index" rules={[{ required: true, message: '请输入路由地址' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="权限标识" name="permiss">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManage;
