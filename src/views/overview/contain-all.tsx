import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Progress, Timeline } from 'antd';
import ReactECharts from 'echarts-for-react';
import CountUp from 'react-countup';
import type { EChartsOption } from 'echarts';
import { createLineOptions, createPieOptions, createBarOptions } from '@/components/options';
import { fetchCardData } from '@/api/count';
import { fetchLineData, fetchBreedPieData, fetchAgeBarData } from '@/api/echarts';
import { useAppSelector } from '@/store/hooks';
import type { CardData } from '@/types/count';
import type { LineData, PieData, BarData } from '@/types/echarts';
import { fetchRankData } from '@/api/rank';
import type { RankItem } from '@/types/rank';
import './contain-all.scss';

const ContainAll: React.FC = () => {
  const { currentTheme, isDarkMode } = useAppSelector((state) => state.themes);
  const [cards, setCards] = useState<CardData[]>([]);
  const [lineData, setLineData] = useState<LineData | undefined>();
  const [breedData, setBreedData] = useState<PieData[] | undefined>();
  const [ageData, setAgeData] = useState<BarData | undefined>();
  const [ranks, setRanks] = useState<RankItem[]>([]);

  const themeWatcher = useMemo(() => `${currentTheme}-${isDarkMode}`, [currentTheme, isDarkMode]);

  const dashOpt1 = useMemo<EChartsOption | undefined>(() => {
    return lineData ? createLineOptions(lineData) : undefined;
  }, [lineData, themeWatcher]);

  const dashOpt2 = useMemo<EChartsOption | undefined>(() => {
    return breedData ? createPieOptions(breedData, true) : undefined;
  }, [breedData, themeWatcher]);

  const dashOpt4 = useMemo<EChartsOption | undefined>(() => {
    return ageData ? createBarOptions(ageData) : undefined;
  }, [ageData, themeWatcher]);

  const activities = [
    { content: '第五次大抓捕13号圆满成功ᕑᗢᓫ', timestamp: '2025-04-12 ', color: '#00bcd4' },
    { content: '恭喜我队成功拿到猫德学院赞助⌯>ᴗo⌯ಣ', timestamp: '2025-02-15 ', color: '#1231d4' },
    { content: '经过多日训练多只猫咪已具猫德/•᷅•᷄\୭', timestamp: '2025-01-1 ', color: '#ff7aaE' },
    { content: '第三次大抓捕13号出师不利被放走𖦹𖦹 .ᐟ.ᐟ', timestamp: '2024-12-12 ', color: '#07bcd4' },
    { content: '今日开启猫咪领养平台=• ֊ •=', timestamp: '2024-11-15 ', color: '#bab267' },
    { content: '严厉加强绝育工作', timestamp: '2024-11-10 ', color: '#e58333' },
  ];

  const loadData = async () => {
    try {
      const res = await fetchCardData();
      if (res.success) {
        setCards(res.data);
      }
    } catch (err) {
      console.error('数据加载失败', err);
    }
  };

  const loadChartsData = async () => {
    try {
      const [lineRes, breedRes, ageRes] = await Promise.all([
        fetchLineData(),
        fetchBreedPieData(),
        fetchAgeBarData(),
      ]);

      if (lineRes.success) {
        setLineData(lineRes.data);
      }
      if (breedRes.success) {
        setBreedData(breedRes.data);
      }
      if (ageRes.success) {
        setAgeData(ageRes.data);
      }
    } catch (err) {
      console.error('图表数据加载失败', err);
    }
  };

  const loadRankData = async () => {
    try {
      const res = await fetchRankData();
      if (res.success) {
        setRanks(res.data);
      }
    } catch (err) {
      console.error('排行榜数据加载失败', err);
    }
  };

  useEffect(() => {
    loadData();
    loadChartsData();
    loadRankData();
  }, []);

  useEffect(() => {
    const reloadCharts = async () => {
      setLineData(undefined);
      setBreedData(undefined);
      setAgeData(undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await loadChartsData();
    };
    reloadCharts();
  }, [themeWatcher]);

  const sortedRanks = useMemo(() => {
    return [...ranks].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [ranks]);

  return (
    <div className="all">
      <Row gutter={20} className="card">
        {cards.map((card) => (
          <Col key={card.name} span={6}>
            <Card hoverable className="stat-card" bodyStyle={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '16px', minHeight: '100px' }}>
              <div className={`icon ${card.iconClass}`}>
                <i className={`iconfont ${card.icon}`}></i>
              </div>
              <div className="card-content">
                <div className="name">{card.name}</div>
                <div className="num">
                  <CountUp
                    className="count"
                    start={0}
                    end={card.count}
                    duration={2}
                    separator=","
                    decimals={0}
                  />
                  <span
                    className="change"
                    style={{ color: card.change.startsWith('+') ? '#67C23A' : '#F56C6C' }}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={20} className="chart">
        <Col span={14}>
          <Card>
            <div className="card-header">
              <p className="card-header-title">猫咪动态</p>
              <p className="card-header-desc">最近一年猫咪数量变化</p>
            </div>
            {dashOpt1 && (
              <ReactECharts
                className="chart1"
                option={dashOpt1}
                key={themeWatcher}
                style={{ height: '400px' }}
              />
            )}
          </Card>
        </Col>
        <Col span={10}>
          <Card>
            <div className="card-header">
              <p className="card-header-title">猫咪年龄分布</p>
              <p className="card-header-desc">猫咪年龄统计截止日期为2024.12.31</p>
            </div>
            {dashOpt4 && (
              <ReactECharts
                className="chart1"
                option={dashOpt4}
                key={themeWatcher}
                style={{ height: '400px' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={20} className="chart">
        <Col span={8}>
          <Card>
            {dashOpt2 && (
              <ReactECharts className="chart1" option={dashOpt2} style={{ height: '400px' }} />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card bodyStyle={{ height: '400px' }}>
            <div className="card-header">
              <p className="card-header-title">排行榜</p>
              <p className="card-header-desc">猫咪所花费的大米Top5</p>
            </div>
            <div className="rank">
              {sortedRanks.map((rank, index) => (
                <div key={rank.title + index} className="rank-item">
                  <div className="rank-item-avatar" style={{ backgroundColor: rank.color }}>
                    {index + 1}
                  </div>
                  <div className="rank-item-content">
                    <div className="rank-item-top">
                      <div className="rank-item-title">{rank.title}</div>
                      <div className="rank-item-desc">花销：¥{rank.value.toLocaleString()}</div>
                    </div>
                    <Progress
                      showInfo={false}
                      strokeColor={rank.color}
                      percent={rank.percent}
                      strokeWidth={8}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable bodyStyle={{ height: '400px' }}>
            <div className="card-header">
              <p className="card-header-title">时间线</p>
              <p className="card-header-desc">最新猫咪大事件消息</p>
            </div>
            <Timeline>
              {activities.map((activity, index) => (
                <Timeline.Item key={index} color={activity.color}>
                  <div className="timeline-item">{activity.content}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {activity.timestamp}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContainAll;
