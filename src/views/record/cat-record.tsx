import React from 'react';
import { Row, Col, Card } from 'antd';
import DatePunch from '@/components/calendar/DatePunch';
import CarouselItem from './components/CarouselItem';
import CardList from './components/CardList';
import './cat-record.scss';

const CatRecord: React.FC = () => {
  return (
    <div className="cat-record">
      <Row>
        <Col span={17}>
          <CardList />
        </Col>
        <Col span={7} className="right-side">
          <div className="todoList">
            <Card>
              <div className="summary">
                <div className="all">
                  <div className="a">参与天数</div>
                  <span>99</span>
                </div>
                <div className="submit">
                  <div className="a">记录数</div>
                  <span>11</span>
                </div>
                <div className="contribution">
                  <div className="a">贡献等级</div>
                  <span>
                    <i className="iconfont icon-tubiao_jingxiaoshangdengji"></i>
                  </span>
                </div>
              </div>
            </Card>
            <div className="stickey">
              <DatePunch />
              <CarouselItem />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CatRecord;
