import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Input, Select, Tag, Pagination, Space, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ZoomInOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { formatDate } from '@/utils/format';
import TableActions from '@/components/table/TableActions';
import { fetchCatData, deleteCatData, deleteBatchCatData } from '@/api/cat';
import type { CatItem, CatQueryParams } from '@/types/cat';
import CatDetail from './components/CatDetail';
import CatEdit, { CatEditRef } from './components/CatEdit';
import { usePermission } from '@/hooks/usePermission';
import './cat-manage.scss';

interface ColumnItem {
  label: string;
  prop: string;
  visible: boolean;
  type?: string;
  width?: string | number;
  fixed?: 'right' | 'left';
  headerAlign?: 'center' | 'left' | 'right';
}

const CatManage: React.FC = () => {
  const [catList, setCatList] = useState<CatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentCat, setCurrentCat] = useState<CatItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const catEditRef = useRef<CatEditRef>(null);
  const { hasPermission } = usePermission();

  const [columns, setColumns] = useState<ColumnItem[]>([
    { label: '选择', prop: 'selection', visible: true, type: 'selection' },
    { label: '#', prop: 'index', visible: true, type: 'index' },
    { label: '编号', prop: 'id', visible: true },
    { label: '姓名', prop: 'name', visible: true },
    { label: '品种', prop: 'breed', visible: true },
    { label: '年龄', prop: 'age', visible: true },
    { label: '性别', prop: 'gender', visible: true },
    { label: '健康状况', prop: 'healthStatus', visible: true },
    { label: '活动区域', prop: 'area', visible: true, width: 120 },
    { label: '亲和度等级', prop: 'friendliness', visible: true, width: 100 },
    { label: '领养状态', prop: 'adoptionStatus', visible: true },
    { label: '登记时间', prop: 'createTime', visible: true, width: 120 },
    { label: '操作', prop: 'actions', visible: true, width: 150, fixed: 'right', headerAlign: 'center' },
  ]);

  const [queryParams, setQueryParams] = useState<CatQueryParams>({
    pagenum: 1,
    pagesize: 10,
    breed: '',
    adoptionStatus: undefined,
  });

  const fetchCatList = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = {
        pagenum: queryParams.pagenum || 1,
        pagesize: queryParams.pagesize || 10,
      };
      if (queryParams.breed) params.breed = queryParams.breed;
      if (queryParams.adoptionStatus) params.adoptionStatus = queryParams.adoptionStatus;
      const response = await fetchCatData(params);
      if (response?.data) {
        setCatList(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('数据加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatList();
  }, [queryParams.pagenum, queryParams.pagesize]);

  const search = () => {
    setQueryParams((prev) => ({ ...prev, pagenum: 1 }));
    fetchCatList();
  };

  const reset = () => {
    setQueryParams({ pagenum: 1, pagesize: 6, breed: '', adoptionStatus: undefined });
    fetchCatList();
  };

  const onSizeChange = (current: number, size: number) => {
    setQueryParams((prev) => ({ ...prev, pagesize: size, pagenum: 1 }));
  };

  const onCurrentChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, pagenum: page }));
  };

  const getStarColor = (index: number, friendliness: number): string => {
    return index <= friendliness ? 'var(--rate-color)' : '#C0C0C0';
  };

  const ViewCat = (row: CatItem) => {
    setCurrentCat(row);
    setDetailVisible(true);
  };

  const AddCat = () => {
    catEditRef.current?.open();
  };

  const EditCat = (row: CatItem) => {
    catEditRef.current?.open(row);
  };

  const DelCat = async (row?: CatItem) => {
    try {
      const ids = row ? [row.id] : selectedRowKeys.map((key) => Number(key));
      Modal.confirm({
        title: '提示',
        content: `此操作将永久删除${row ? '该猫咪' : `选中的${ids.length}只猫咪`}, 是否继续?`,
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          try {
            if (row) {
              await deleteCatData(row.id);
            } else {
              await deleteBatchCatData(ids);
              message.success('删除成功');
            }
            fetchCatList();
            setSelectedRowKeys([]);
          } catch (error) {
            console.error('删除失败:', error);
          }
        },
      });
    } catch {
      console.log('取消删除');
    }
  };

  const onSuccess = (type: 'add' | 'edit') => {
    if (type === 'add') {
      const lastPage = Math.ceil((total + 1) / queryParams.pagesize);
      setQueryParams((prev) => ({ ...prev, pagenum: lastPage }));
    }
    fetchCatList();
  };


  const tableColumns: ColumnsType<CatItem> = columns
    .filter((col) => col.visible && col.prop !== 'selection')
    .map((col) => {
      if (col.type === 'index') {
        return {
          title: col.label,
          key: 'index',
          width: 60,
          render: (_: any, __: any, index: number) => index + 1,
        };
      }

      if (col.prop === 'healthStatus') {
        return {
          title: col.label,
          dataIndex: col.prop,
          key: col.prop,
          render: (status: string) => {
            const color = status === '健康' ? 'success' : status === '生病' ? 'warning' : 'default';
            return <Tag color={color}>{status}</Tag>;
          },
        };
      }

      if (col.prop === 'friendliness') {
        return {
          title: col.label,
          dataIndex: col.prop,
          key: col.prop,
          width: col.width,
          render: (friendliness: number) => (
            <div className="rate">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ color: getStarColor(i, friendliness) }}>
                  {i <= friendliness ? '★' : '☆'}
                </span>
              ))}
            </div>
          ),
        };
      }

      if (col.prop === 'adoptionStatus') {
        return {
          title: col.label,
          dataIndex: col.prop,
          key: col.prop,
          render: (status: string) => (
            <Tag color={status === '已领养' ? 'success' : 'default'}>{status}</Tag>
          ),
        };
      }

      if (col.prop === 'createTime') {
        return {
          title: col.label,
          dataIndex: col.prop,
          key: col.prop,
          width: col.width,
          ellipsis: true,
          render: (time: string) => formatDate(time),
        };
      }

      if (col.prop === 'actions') {
        return {
          title: col.label,
          key: 'actions',
          width: col.width,
          fixed: col.fixed,
          align: 'center',
          render: (_: any, record: CatItem) => (
            <Space>
              <Button
                type="primary"
                icon={<ZoomInOutlined />}
                shape="circle"
                size="small"
                onClick={() => ViewCat(record)}
              />
              {hasPermission('cat:edit') && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  shape="circle"
                  size="small"
                  onClick={() => EditCat(record)}
                />
              )}
              {hasPermission('cat:delete') && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  shape="circle"
                  size="small"
                  onClick={() => DelCat(record)}
                />
              )}
            </Space>
          ),
        };
      }

      return {
        title: col.label,
        dataIndex: col.prop,
        key: col.prop,
        width: col.width,
        ellipsis: col.prop === 'area' || col.prop === 'id' || col.prop === 'createTime',
      };
    });

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className="cat-manage">
      <div className="search-container">
        <Space>
          <Input
            placeholder="请输入品种"
            style={{ width: 150 }}
            value={queryParams.breed}
            onChange={(e) => setQueryParams((prev) => ({ ...prev, breed: e.target.value }))}
            allowClear
          />
          <Select
            placeholder="请选择"
            style={{ width: 100 }}
            value={queryParams.adoptionStatus}
            onChange={(value) => setQueryParams((prev) => ({ ...prev, adoptionStatus: value }))}
            allowClear
          >
            <Select.Option value="已领养">已领养</Select.Option>
            <Select.Option value="未领养">未领养</Select.Option>
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
            {hasPermission('cat:add') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={AddCat}>
                新增
              </Button>
            )}
            {selectedRowKeys.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={() => DelCat()}>
                批量删除
              </Button>
            )}
          </div>
          <div className="column-right">
            <TableActions
              columns={columns}
              showColumnsType="checkbox"
              onRefresh={fetchCatList}
              onColumnsChange={setColumns}
            />
          </div>
        </div>

        <Table
          dataSource={catList}
          columns={tableColumns}
          loading={loading}
          rowSelection={rowSelection}
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
        style={{ marginTop: 10, marginRight: 5, display: 'flex', justifyContent: 'flex-end' }}
      />

      {currentCat && (
        <CatDetail catData={currentCat} visible={detailVisible} onClose={() => setDetailVisible(false)} />
      )}
      <CatEdit ref={catEditRef} onSuccess={onSuccess} />
    </div>
  );
};

export default CatManage;
