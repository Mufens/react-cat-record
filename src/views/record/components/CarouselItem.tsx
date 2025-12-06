import React from 'react';
import { Carousel, Card } from 'antd';
import carousel1 from '@/assets/images/carousel/carousel1.jpg';
import carousel2 from '@/assets/images/carousel/carousel2.jpg';
import carousel3 from '@/assets/images/carousel/carousel3.jpg';
import carousel4 from '@/assets/images/carousel/carousel4.jpg';
import carousel5 from '@/assets/images/carousel/carousel5.jpg';
import './CarouselItem.scss';

const CarouselItem: React.FC = () => {
  const prefecture = [
    { text: '救助专区', bg: carousel1 },
    { text: '猫咪相册', bg: carousel2 },
    { text: '领养专区', bg: carousel3 },
    { text: '活动专区', bg: carousel4 },
    { text: '猫咪日记', bg: carousel5 },
  ];

  return (
    <Card bodyStyle={{ padding: '0px' }}>
      <Carousel autoplay autoplaySpeed={4000}>
        {prefecture.map((item) => (
          <div key={item.text}>
            <div
              className="custom-carousel-item"
              style={{
                backgroundImage: `url(${item.bg})`,
                height: '150px',
              }}
            >
              <div className="content">{item.text}</div>
            </div>
          </div>
        ))}
      </Carousel>
    </Card>
  );
};

export default CarouselItem;
