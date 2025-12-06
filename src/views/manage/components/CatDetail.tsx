import React from 'react';
import { Modal, Descriptions, Tag, Image } from 'antd';
import { formatDate } from '@/utils/format';
import type { CatItem } from '@/types/cat';
import cat from '@/assets/images/cat.jpg';
import './CatDetail.scss';

interface CatDetailProps {
  catData: CatItem;
  visible: boolean;
  onClose: () => void;
}

const CatDetail: React.FC<CatDetailProps> = ({ catData, visible, onClose }) => {
  const healthTagType = (status: string) => {
    return status === '健康' ? 'success' : status === '生病' ? 'warning' : 'default';
  };

  const getStarColor = (index: number, friendliness: number): string => {
    return index <= friendliness ? 'var(--rate-color)' : '#C0C0C0';
  };

  return (
    <Modal open={visible} onCancel={onClose} title="猫咪详情" width={750} footer={null}>
      <Descriptions bordered>
        <Descriptions.Item label="活动区域">{catData.area}</Descriptions.Item>

        <Descriptions.Item label="亲和度等级">
          <div className="rate">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ color: getStarColor(i, catData.friendliness) }}>
                {i <= catData.friendliness ? '★' : '☆'}
              </span>
            ))}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="健康状况">
          <Tag color={healthTagType(catData.healthStatus)}>{catData.healthStatus}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="照片" span={2}>
          <Image
            width={200}
            height={200}
            src={catData.catImg || cat}
            style={{ objectFit: 'cover' }}
            preview={false}
          />
        </Descriptions.Item>

        <Descriptions.Item label="姓名">{catData.name}</Descriptions.Item>

        <Descriptions.Item label="品种">{catData.breed}</Descriptions.Item>

        <Descriptions.Item label="年龄">{catData.age}</Descriptions.Item>

        <Descriptions.Item label="领养状态">
          <Tag color={catData.adoptionStatus === '已领养' ? 'success' : 'default'}>
            {catData.adoptionStatus}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="编号">{catData.id}</Descriptions.Item>

        <Descriptions.Item label="性别">{catData.gender}</Descriptions.Item>

        <Descriptions.Item label="登记时间">{formatDate(catData.createTime)}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default CatDetail;

