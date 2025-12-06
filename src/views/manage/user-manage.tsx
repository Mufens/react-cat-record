import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Input, Select, Tag, Pagination, Space, Modal, DatePicker, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/format';
import TableActions from '@/components/table/TableActions';
import { getUserListAPI, deleteUserData, deleteBatchUserData } from '@/api/user';
import type { User, UserQueryParams } from '@/types/user';
import UserEdit, { UserEditRef } from './components/UserEdit';
import { usePermission } from '@/hooks/usePermission';
import dayjs, { Dayjs } from 'dayjs';
import './user-manage.scss';

const { RangePicker } = DatePicker;

interface ColumnItem {
  label: string;
  prop: string;
  visible: boolean;
  type?: string;
  width?: string | number;
  fixed?: 'right' | 'left';
  headerAlign?: 'center' | 'left' | 'right';
  align?: 'center' | 'left' | 'right';
}

const UserManage: React.FC = () => {
  const [tableData, setTableData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const userEditRef = useRef<UserEditRef>(null);
  const { hasPermission } = usePermission();

  const [columns, setColumns] = useState<ColumnItem[]>([
    { label: '选择', prop: 'selection', visible: true, type: 'selection' },
    { label: '用户ID', prop: 'id', width: 120, visible: true },
    { label: '用户名', prop: 'name', visible: true },
    { label: '角色', prop: 'role', width: 120, visible: true },
    { label: '邮箱', prop: 'email', visible: true },
    { label: '用户状态', prop: 'status', headerAlign: 'center', align: 'center', width: 80, visible: true },
    { label: '创建时间', prop: 'createdAt', headerAlign: 'center', visible: true },
    { label: '操作', prop: 'actions', visible: true, width: 120, headerAlign: 'center', fixed: 'right' },
  ]);

  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    pagenum: 1,
    pagesize: 10,
    name: '',
    email: '',
    status: undefined,
    role: '',
    createStart: '',
    createEnd: '',
  });

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const res = await getUserListAPI(queryParams);
      setTableData(res.data.list);
      setTotal(res.data.total);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, [queryParams.pagenum, queryParams.pagesize]);

  const search = () => {
    setQueryParams((prev) => ({ ...prev, pagenum: 1 }));
    fetchUserList();
  };

  const reset = () => {
    setQueryParams({
      pagenum: 1,
      pagesize: 10,
      name: '',
      email: '',
      status: undefined,
      role: '',
      createStart: '',
      createEnd: '',
    });
    setDateRange(null);
    fetchUserList();
  };

  const AddUser = () => {
    userEditRef.current?.open();
  };

  const EditUser = (row: User) => {
    userEditRef.current?.open(row);
  };

  const delUser = (row: User) => {
    Modal.confirm({
      title: '提示',
      content: '是否删除该用户?',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUserData(row.id);
          message.success('删除成功');
          fetchUserList();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const batchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }
    Modal.confirm({
      title: '警告',
      content: '确定删除选中用户吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const ids = selectedRowKeys.map((key) => Number(key));
          await deleteBatchUserData(ids);
          message.success('删除成功');
          setSelectedRowKeys([]);
          fetchUserList();
        } catch {
          message.error('删除失败');
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

  const onSuccess = () => {
    const lastPage = Math.ceil((total + 1) / (queryParams.pagesize ?? 10));
    setQueryParams((prev) => ({ ...prev, pagenum: lastPage }));
    fetchUserList();
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
    // 注意：当前 API 可能不支持日期范围过滤，这里仅保存状态
    // 如果需要实现日期过滤，需要在 API 中添加相应逻辑
  };


  const tableColumns: ColumnsType<User> = columns
    .filter((col) => col.visible && col.prop !== 'selection')
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
          render: (_: any, record: User) => (
            <div className="actions">
              {hasPermission('user:edit') && (
                <Button type="primary" size="small" onClick={() => EditUser(record)}>
                  编辑
                </Button>
              )}
              {hasPermission('user:delete') && (
                <Button danger size="small" onClick={() => delUser(record)}>
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
        width: col.width,
        align: col.align,
        ellipsis: col.prop === 'email' || col.prop === 'id' || col.prop === 'name' || col.prop === 'role',
        sorter: col.prop === 'createdAt' ? (a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : undefined,
        defaultSortOrder: col.prop === 'createdAt' ? 'descend' : undefined,
      };
    });

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className="user-manage">
      <div className="search-container">
        <Space wrap>
          <Input
            placeholder="请输入用户名"
            style={{ width: 170 }}
            value={queryParams.name}
            onChange={(e) => setQueryParams((prev) => ({ ...prev, name: e.target.value }))}
            allowClear
          />
          <Input
            placeholder="请输入邮箱"
            style={{ width: 220 }}
            value={queryParams.email}
            onChange={(e) => setQueryParams((prev) => ({ ...prev, email: e.target.value }))}
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
          <Input
            placeholder="请输入角色"
            style={{ width: 170 }}
            value={queryParams.role}
            onChange={(e) => setQueryParams((prev) => ({ ...prev, role: e.target.value }))}
            allowClear
          />
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            style={{ width: 200 }}
          />
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
            {hasPermission('user:add') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={AddUser}>
                新增
              </Button>
            )}
            {selectedRowKeys.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={batchDelete}>
                批量删除
              </Button>
            )}
          </div>
          <div className="column-right">
            <TableActions
              columns={columns}
              showColumnsType="checkbox"
              onRefresh={fetchUserList}
              onColumnsChange={setColumns}
            />
          </div>
        </div>

        <Table
          dataSource={tableData}
          columns={tableColumns}
          loading={loading}
          rowSelection={rowSelection}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
      </div>

      <Pagination
        pageSizeOptions={['6', '10', '20', '30']}
        current={queryParams.pagenum}
        pageSize={queryParams.pagesize}
        total={total}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `共 ${total} 条`}
        onChange={onCurrentChange}
        onShowSizeChange={onSizeChange}
        style={{ marginTop: 10, marginRight: 5, display: 'flex', justifyContent: 'flex-end' }}
      />

      <UserEdit ref={userEditRef} onSuccess={onSuccess} />
    </div>
  );
};

export default UserManage;
