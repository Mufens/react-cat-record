import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Input, Select, Tag, Pagination, Space, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/format';
import TableActions from '@/components/table/TableActions';
import { getRoleListAPI, deleteRoleAPI } from '@/api/role';
import type { Role, RoleQueryParams } from '@/types/role';
import RoleEdit, { RoleEditRef } from './components/RoleEdit';
import { usePermission } from '@/hooks/usePermission';
import './role-manage.scss';

interface ColumnItem {
  label: string;
  prop: string;
  visible: boolean;
  width?: string | number;
  fixed?: 'right' | 'left';
  headerAlign?: 'center' | 'left' | 'right';
  align?: 'center' | 'left' | 'right';
  showOverflowTooltip?: boolean;
}

const RoleManage: React.FC = () => {
  const [tableData, setTableData] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const roleEditRef = useRef<RoleEditRef>(null);
  const { hasPermission } = usePermission();

  const [columns, setColumns] = useState<ColumnItem[]>([
    {
      label: '角色ID',
      prop: 'id',
      headerAlign: 'center',
      align: 'center',
      visible: true,
      showOverflowTooltip: true,
    },
    { label: '角色名称', prop: 'name', headerAlign: 'center', align: 'center', visible: true },
    {
      label: '备注',
      prop: 'remark',
      headerAlign: 'center',
      align: 'center',
      visible: true,
      showOverflowTooltip: true,
    },
    {
      label: '角色状态',
      prop: 'status',
      headerAlign: 'center',
      align: 'center',
      width: 80,
      visible: true,
    },
    {
      label: '创建时间',
      prop: 'createdAt',
      headerAlign: 'center',
      align: 'center',
      visible: true,
    },
    {
      label: '操作',
      prop: 'actions',
      headerAlign: 'center',
      fixed: 'right',
      width: 120,
      visible: true,
    },
  ]);

  const [queryParams, setQueryParams] = useState<RoleQueryParams>({
    pagenum: 1,
    pagesize: 10,
    name: '',
    status: undefined,
  });

  const fetchRoleList = async () => {
    try {
      const res = await getRoleListAPI(queryParams);
      if (res.data) {
        setTableData(res.data.list || []);
        setTotal(res.data.total || 0);
      } else {
        setTableData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  useEffect(() => {
    fetchRoleList();
  }, [queryParams.pagenum, queryParams.pagesize]);

  const search = () => {
    setQueryParams((prev) => ({ ...prev, pagenum: 1 }));
    fetchRoleList();
  };

  const reset = () => {
    setQueryParams({
      pagenum: 1,
      pagesize: 10,
      name: '',
      status: undefined,
    });
    fetchRoleList();
  };

  const AddRole = () => {
    roleEditRef.current?.open();
  };

  const EditRole = (row: Role) => {
    roleEditRef.current?.open(row);
  };

  const DelRole = async (row: Role) => {
    Modal.confirm({
      title: '警告',
      content: `确认删除角色【${row.name}】吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await deleteRoleAPI(row.id);
          if (res.code === 200) {
            message.success('删除成功');
            fetchRoleList();
          }
        } catch (error) {
          if (error !== 'cancel') {
            message.error('删除失败');
          }
        }
      },
    });
  };

  const onSizeChange = (current: number, size: number) => {
    setQueryParams((prev) => ({ ...prev, pagesize: size, pagenum: 1 }));
  };

  const onCurrentChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, pagenum: page }));
  };

  const onSuccess = (type: 'add' | 'edit') => {
    if (type === 'add') {
      const lastPage = Math.ceil((total + 1) / (queryParams.pagesize ?? 10));
      setQueryParams((prev) => ({ ...prev, pagenum: lastPage }));
    }
    fetchRoleList();
  };


  const tableColumns: ColumnsType<Role> = columns
    .filter((col) => col.visible)
    .map((col) => {
      if (col.prop === 'status') {
        return {
          title: col.label,
          dataIndex: col.prop,
          key: col.prop,
          width: col.width,
          align: col.align,
          render: (status: boolean) => <Tag color={status ? 'success' : 'warning'}>{status ? '启用' : '禁用'}</Tag>,
        };
      }

      if (col.prop === 'createdAt') {
        return {
          title: col.label,
          dataIndex: col.prop,
          key: col.prop,
          align: col.align,
          render: (time: string) => formatDate(time),
        };
      }

      if (col.prop === 'actions') {
        return {
          title: col.label,
          key: 'actions',
          width: col.width,
          fixed: col.fixed,
          align: col.align,
          render: (_: any, record: Role) => (
            <div className="actions">
              {hasPermission('role:edit') && (
                <Button type="primary" size="small" onClick={() => EditRole(record)}>
                  编辑
                </Button>
              )}
              {hasPermission('role:delete') && (
                <Button danger size="small" onClick={() => DelRole(record)}>
                  删除
                </Button>
              )}
            </div>
          ),
        };
      }

      return {
        title: col.label,
        dataIndex: col.prop,
        key: col.prop,
        align: col.align,
        ellipsis: col.showOverflowTooltip,
      };
    });

  return (
    <div className="role-manage">
      <div className="search-container">
        <Space wrap>
          <Input
            placeholder="请输入角色名称"
            style={{ width: 170 }}
            value={queryParams.name}
            onChange={(e) => setQueryParams((prev) => ({ ...prev, name: e.target.value }))}
            allowClear
          />
          <Select
            placeholder="请选择"
            style={{ width: 120 }}
            value={queryParams.status}
            onChange={(value) => setQueryParams((prev) => ({ ...prev, status: value }))}
            allowClear
          >
            <Select.Option value={true}>启用</Select.Option>
            <Select.Option value={false}>禁用</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={search}>
            查询
          </Button>
          <Button icon={<ReloadOutlined />} onClick={reset}>
            重置
          </Button>
        </Space>
      </div>

      <div className="operation">
        <div className="column">
          <div className="column-left">
            {hasPermission('role:add') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={AddRole}>
                新增
              </Button>
            )}
          </div>
          <div className="column-right">
            <TableActions
              columns={columns}
              showColumnsType="checkbox"
              onRefresh={fetchRoleList}
              onColumnsChange={setColumns}
            />
          </div>
        </div>

        <Table
          dataSource={tableData}
          columns={tableColumns}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </div>

      <Pagination
        pageSizeOptions={['6', '10', '15', '20']}
        current={queryParams.pagenum}
        pageSize={queryParams.pagesize}
        total={total}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `共 ${total} 条`}
        onChange={onCurrentChange}
        onShowSizeChange={onSizeChange}
        style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}
      />

      <RoleEdit ref={roleEditRef} onSuccess={onSuccess} />
    </div>
  );
};

export default RoleManage;
