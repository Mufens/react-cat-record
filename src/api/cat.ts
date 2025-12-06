import { faker } from '@faker-js/faker';
import type { CatItem } from '@/types/cat';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 使用 faker 生成猫咪数据（带持久化）
let catData: CatItem[] = [];

// 猫咪品种列表
const catBreeds = ['橘猫', '梨花猫', '白猫', '奶牛猫', '黑猫', '雀猫', '三花猫', '玳瑁猫'];
const healthStatuses: CatItem['healthStatus'][] = ['健康', '生病', '喵星'];
const adoptionStatuses: CatItem['adoptionStatus'][] = ['已领养', '未领养'];
const genders: CatItem['gender'][] = ['公', '母'];
const areas = [
  '生活服务中心',
  '东区12栋',
  '东区操场',
  '南区11栋',
  '梦月湖旁',
  '北区食堂',
  '志敏大道222号十字路口绿化带旁',
];

// 初始化默认猫咪数据
const initializeCats = () => {
  if (catData.length === 0) {
    const defaultCats: CatItem[] = [
      {
        id: 111,
        name: '大宝',
        breed: '橘猫',
        age: '12岁',
        gender: '公',
        healthStatus: '健康',
        adoptionStatus: '未领养',
        area: '生活服务中心',
        friendliness: 5,
        createTime: faker.date.past().toISOString(),
        catImg: '/images/111.jpg',
      },
      {
        id: 112,
        name: '海参',
        breed: '梨花猫',
        age: '8岁',
        gender: '公',
        healthStatus: '生病',
        adoptionStatus: '未领养',
        area: '东区12栋',
        friendliness: 3,
        createTime: faker.date.past().toISOString(),
        catImg: '/images/113.jpg',
      },
      {
        id: 113,
        name: '年糕',
        breed: '白猫',
        age: '2岁',
        gender: '公',
        healthStatus: '喵星',
        adoptionStatus: '未领养',
        area: '东区操场',
        friendliness: 3,
        createTime: faker.date.past().toISOString(),
        catImg: '',
      },
      {
        id: 114,
        name: '来财',
        breed: '奶牛猫',
        age: '五个月',
        gender: '母',
        healthStatus: '健康',
        adoptionStatus: '已领养',
        area: '南区11栋',
        friendliness: 5,
        createTime: faker.date.past().toISOString(),
        catImg: '/images/113.jpg',
      },
      {
        id: 115,
        name: '胖虎',
        breed: '橘猫',
        age: '3岁',
        gender: '公',
        healthStatus: '健康',
        adoptionStatus: '未领养',
        area: '梦月湖旁',
        friendliness: 2,
        createTime: faker.date.past().toISOString(),
        catImg: '',
      },
      {
        id: 116,
        name: '13号',
        breed: '奶牛猫',
        age: '2岁',
        gender: '母',
        healthStatus: '健康',
        adoptionStatus: '未领养',
        area: '东区12栋',
        friendliness: 1,
        createTime: faker.date.past().toISOString(),
        catImg: '',
      },
      {
        id: 117,
        name: '大喵',
        breed: '黑猫',
        age: '三个月',
        gender: '公',
        healthStatus: '健康',
        adoptionStatus: '未领养',
        area: '生活服务中心',
        friendliness: 4,
        createTime: faker.date.past().toISOString(),
        catImg: '',
      },
      {
        id: 118,
        name: '八八波一',
        breed: '雀猫',
        age: '2岁',
        gender: '母',
        healthStatus: '健康',
        adoptionStatus: '未领养',
        area: '志敏大道222号十字路口绿化带旁',
        friendliness: 5,
        createTime: faker.date.past().toISOString(),
        catImg: '',
      },
      {
        id: 119,
        name: '土豆',
        breed: '橘猫',
        age: '六个月',
        gender: '母',
        healthStatus: '健康',
        adoptionStatus: '未领养',
        area: '北区食堂',
        friendliness: 5,
        createTime: faker.date.past().toISOString(),
        catImg: '/images/113.jpg',
      },
    ];
    catData = defaultCats;
  }
};

// 初始化数据
initializeCats();

export const fetchCatData = async (params?: Record<string, string | number | boolean>) => {
  await delay(300);
  initializeCats();
  const { pagenum = 1, pagesize = 10, breed, adoptionStatus } = (params || {}) as any;

  let filteredData = [...catData];

  if (breed) filteredData = filteredData.filter((item) => item.breed === breed);
  if (adoptionStatus)
    filteredData = filteredData.filter((item) => item.adoptionStatus === adoptionStatus);

  const start = (pagenum - 1) * Number(pagesize);
  const end = start + Number(pagesize);

  return {
    success: true,
    data: {
      data: filteredData.slice(start, end),
      total: filteredData.length,
    },
  };
};

// 新增猫咪
export const addCatData = async (data: Partial<CatItem>) => {
  await delay(300);
  initializeCats();
  const newCat: CatItem = {
    id: faker.number.int({ min: 100, max: 999999 }),
    ...data,
    name: data.name || faker.person.firstName(),
    breed: data.breed || faker.helpers.arrayElement(catBreeds),
    age: data.age || `${faker.number.int({ min: 1, max: 15 })}岁`,
    gender: data.gender || faker.helpers.arrayElement(genders),
    healthStatus: data.healthStatus || faker.helpers.arrayElement(healthStatuses),
    adoptionStatus: data.adoptionStatus || faker.helpers.arrayElement(adoptionStatuses),
    area: data.area || faker.helpers.arrayElement(areas),
    friendliness: data.friendliness ?? faker.number.int({ min: 1, max: 5 }),
    createTime: data.createTime || new Date().toISOString(),
    catImg: data.catImg || '',
  } as CatItem;
  catData.push(newCat);
  return { success: true, data: newCat };
};

// 编辑猫咪
export const editCatData = async (id: number, data: Partial<CatItem>) => {
  await delay(300);
  initializeCats();
  const index = catData.findIndex((item) => item.id === id);
  if (index >= 0) {
    catData[index] = {
      ...catData[index],
      ...data,
      catImg: data.catImg || catData[index].catImg,
    };
    return { success: true, data: catData[index] };
  }
  return { success: false };
};

// 删除猫咪
export const deleteCatData = async (id: number) => {
  await delay(300);
  initializeCats();
  const index = catData.findIndex((item) => item.id === id);
  if (index >= 0) {
    catData.splice(index, 1);
    return { success: true };
  }
  return { success: false };
};

//批量删除猫咪
export const deleteBatchCatData = async (ids: number[]) => {
  await delay(300);
  initializeCats();
  catData = catData.filter((item) => !ids.includes(item.id));
  return { success: true };
};
