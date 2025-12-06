import { faker } from '@faker-js/faker';
import type { ChartResponse, LineData, PieData, BarData } from '@/types/echarts';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchLineData = async (): Promise<ChartResponse<LineData>> => {
  await delay(300);
  return {
    success: true,
    data: {
      xData: ['一月', '三月', '五月', '七月', '九月', '十二月'],
      seriesData: Array.from({ length: 6 }, () => faker.number.int({ min: 100, max: 200 })),
      xAxisType: 'category',
    },
  };
};

export const fetchBreedPieData = async (): Promise<ChartResponse<PieData[]>> => {
  await delay(300);
  const breeds = ['奶牛猫', '狸花猫', '橘猫', '玳瑁猫', '三花猫', '白猫', '金色传说', '黑猫'];
  return {
    success: true,
    data: breeds.map((name) => ({
      value: faker.number.int({ min: 5, max: 100 }),
      name,
    })),
  };
};

export const fetchAgeBarData = async (): Promise<ChartResponse<BarData>> => {
  await delay(300);
  return {
    success: true,
    data: {
      xData: ['幼猫 (<1岁)', '青年猫 (1-2岁)', '状年猫 (3-6岁)', '中年猫(7-10岁)', '老年猫 (>11岁)'],
      seriesData: Array.from({ length: 5 }, () => faker.number.int({ min: 10, max: 100 })),
    },
  };
};
