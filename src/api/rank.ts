import { faker } from '@faker-js/faker';
import type { RankResponse, RankItem } from '@/types/rank';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchRankData = async (): Promise<RankResponse> => {
  await delay(300);
  const categories = [
    { title: '绝育', color: '#f25e43' },
    { title: '医疗', color: '#E6A23C' },
    { title: '疫苗', color: '#67C23A' },
    { title: '驱虫', color: '#409EFF' },
    { title: '食品', color: '#f9e67a' },
    { title: '用具', color: '#909399' },
  ];

  const maxValue = faker.number.int({ min: 20000, max: 25000 });
  const rankData: RankItem[] = categories.map((cat, index) => {
    const value = faker.number.int({ min: 8000, max: maxValue });
    const percent = Math.round((value / maxValue) * 100);
    return {
      title: cat.title,
      value,
      percent,
      color: cat.color,
    };
  });

  // 按 value 降序排序
  rankData.sort((a, b) => b.value - a.value);

  return {
    success: true,
    data: rankData,
  };
};
