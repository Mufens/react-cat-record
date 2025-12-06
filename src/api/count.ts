import { faker } from '@faker-js/faker';
import type { CountResponse, CardData } from '@/types/count';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchCardData = async (): Promise<CountResponse> => {
  await delay(300);
  return {
    success: true,
    data: [
      {
        name: '用户访问量',
        count: faker.number.int({ min: 800, max: 1200 }),
        change: faker.helpers.arrayElement(['+20%', '+15%', '+10%', '-5%', '-10%']),
        iconClass: 'first',
        icon: 'icon-fangwenliang',
      } as CardData,
      {
        name: '领养数量',
        count: faker.number.int({ min: 100, max: 200 }),
        change: faker.helpers.arrayElement(['+5%', '+8%', '+12%', '-3%']),
        iconClass: 'second',
        icon: 'icon-maozhao',
      },
      {
        name: '猫咪数量',
        count: faker.number.int({ min: 200, max: 300 }),
        change: faker.helpers.arrayElement(['-10%', '-5%', '+2%', '+5%']),
        iconClass: 'third',
        icon: 'icon-xiaomao',
      },
      {
        name: '救助数量',
        count: faker.number.int({ min: 150, max: 250 }),
        change: faker.helpers.arrayElement(['+2%', '+5%', '+8%', '-2%']),
        iconClass: 'fourth',
        icon: 'icon-jiuzhuicon',
      },
    ],
  };
};
