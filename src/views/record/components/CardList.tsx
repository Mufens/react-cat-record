import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Avatar } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { MessageItem } from '@/components/cardList';
import { messageList } from '@/components/cardList';
import CardDetail from './CardDetail';
import './CardList.scss';

interface ColumnItem extends MessageItem {
  originalIndex?: number;
}

const CardList: React.FC = () => {
  const [columns, setColumns] = useState<ColumnItem[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(3);
  const [isVisible, setIsVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MessageItem | null>(null);

  const handleCardClick = (item: MessageItem) => {
    setSelectedItem(item);
    setVisible(true);
  };

  const calculateLayout = async () => {
    if (!containerRef.current) return;
    setIsVisible(false);

    const containerWidth = containerRef.current.offsetWidth;
    const minColumnWidth = 240;
    const gap = 16;

    const newColumnCount = Math.max(1, Math.floor((containerWidth + gap) / (minColumnWidth + gap)));
    setColumnCount(newColumnCount);

    const tempColumns: ColumnItem[][] = Array.from({ length: newColumnCount }, () => []);

    // 等待图片加载完成
    const images = Array.from(containerRef.current.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.addEventListener('load', () => resolve());
              img.addEventListener('error', () => resolve());
            }
          })
      )
    );

    const allItems = Array.from(containerRef.current.querySelectorAll('.waterfall-item'));
    const heightMap = new Map<string, number>();
    allItems.forEach((item) => {
      const element = item as HTMLElement;
      const id = element.dataset.id;
      if (id) {
        heightMap.set(id, element.clientHeight);
      }
    });

    const columnHeights = new Array(newColumnCount).fill(0);
    messageList.forEach((item, index) => {
      const targetCol = columnHeights.indexOf(Math.min(...columnHeights));
      const itemHeight = heightMap.get(index.toString()) || 0;

      columnHeights[targetCol] += itemHeight + gap;
      tempColumns[targetCol].push({ ...item, originalIndex: index });
    });

    setColumns(tempColumns);
    setIsVisible(true);
  };

  const handleItemUpdate = (updatedItem: MessageItem) => {
    const index = messageList.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      messageList.splice(index, 1, updatedItem);
      calculateLayout();
    }
  };

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateLayout, 200);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      calculateLayout();
    }

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    if (messageList.length > 0) {
      calculateLayout();
    }
  }, [messageList.length]);

  const imageSrc = (item: MessageItem) => {
    if (Array.isArray(item.pictures)) {
      return item.pictures[0] || '';
    }
    return item.pictures || '';
  };

  return (
    <div ref={containerRef} className="waterfall-container" style={{ opacity: isVisible ? 1 : 0 }}>
      {isVisible ? (
        <>
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="waterfall-column">
              {col.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="waterfall-item"
                  data-id={item.originalIndex}
                  bodyStyle={{ padding: '0px' }}
                  hoverable
                >
                  <div className="image-box" style={{ aspectRatio: item.ratio || '1' }}>
                    <img src={imageSrc(item)} alt={item.title} className="cover-image" />
                  </div>
                  <div className="content-box">
                    <div className="content-text">{item.title}</div>
                    <div className="meta-info">
                      <div className="user-info">
                        <Avatar src={item.avatar} size={24} />
                        <span className="username">{item.author}</span>
                      </div>
                      <div className="view-count">
                        <EyeOutlined />
                        {item.view}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
          {selectedItem && (
            <CardDetail
              visible={visible}
              item={selectedItem}
              onClose={() => setVisible(false)}
              onUpdate={handleItemUpdate}
            />
          )}
        </>
      ) : (
        <div className="hidden-render">
          {messageList.map((item, index) => (
            <Card
              key={index}
              className="waterfall-item"
              data-id={index}
              bodyStyle={{ padding: '0px' }}
              hoverable
            >
              <div className="image-box" style={{ aspectRatio: item.ratio || '1' }}>
                <img src={imageSrc(item)} alt={item.title} className="cover-image" />
              </div>
              <div className="content-box">
                <div className="content-text">{item.title}</div>
                <div className="meta-info">
                  <div className="user-info">
                    <Avatar src={item.avatar} size={24} />
                    <span className="username">{item.author}</span>
                  </div>
                  <div className="view-count">
                    <EyeOutlined />
                    {item.view}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardList;
