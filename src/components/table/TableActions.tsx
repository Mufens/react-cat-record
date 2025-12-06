import React, { useState } from 'react';
import { Tooltip, Dropdown, Checkbox, MenuProps } from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import './TableActions.scss';

interface ColumnItem {
  label: string;
  prop: string;
  visible: boolean;
}

interface TableActionsProps {
  columns: ColumnItem[];
  showColumnsType?: 'transfer' | 'checkbox';
  onRefresh?: () => void;
  onColumnsChange?: (columns: ColumnItem[]) => void;
}

const TableActions: React.FC<TableActionsProps> = ({
  columns,
  showColumnsType = 'checkbox',
  onRefresh,
  onColumnsChange,
}) => {
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  const handleRefresh = () => {
    onRefresh?.();
  };

  const handleCheckboxChange = (checked: boolean, label: string) => {
    const newColumns = columns.map((item) => {
      if (item.label === label) {
        return { ...item, visible: checked };
      }
      return item;
    });
    onColumnsChange?.(newColumns);
  };

  const menuItems: MenuProps['items'] =
    showColumnsType === 'checkbox'
      ? columns.map((item) => ({
          key: item.prop,
          label: (
            <Checkbox
              checked={item.visible}
              onChange={(e) => handleCheckboxChange(e.target.checked, item.label)}
            >
              {item.label}
            </Checkbox>
          ),
        }))
      : [];

  return (
    <div className="column-right">
      <Tooltip title="刷新" placement="top">
        <ReloadOutlined className="action-icon" onClick={handleRefresh} />
      </Tooltip>

      <Tooltip title="列设置" placement="top">
        <Dropdown
          open={showColumnDropdown}
          onOpenChange={setShowColumnDropdown}
          trigger={['click']}
          menu={{ items: menuItems }}
        >
          <SettingOutlined className="action-icon" />
        </Dropdown>
      </Tooltip>
    </div>
  );
};

export default TableActions;

