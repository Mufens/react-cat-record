import { faker } from '@faker-js/faker';
import type { User, UserQueryParams } from '@/types/user';
import axios from 'axios';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 使用 faker 生成用户数据（带持久化）
let usersData: User[] = [];

// 初始化默认用户
const initializeUsers = () => {
  if (usersData.length === 0) {
    const defaultUsers: User[] = [
      {
        id: 1111111,
        name: 'admin',
        password: '123456',
        status: true,
        role: '管理员',
        email: 'admin@123.com',
        avatar: '/images/avatar.jpg',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 21111,
        name: 'golden',
        password: 'golden123',
        status: true,
        role: '金角大王',
        email: 'golden@example.com',
        avatar: '/images/avatar.jpg',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 333333,
        name: '银角大王',
        password: 'silver123',
        status: true,
        role: '银角大王',
        email: 'silver@333.com',
        avatar: '/images/avatar.jpg',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 412222,
        name: '猫',
        password: '123456',
        status: true,
        role: '爱喵用户',
        email: 'cat@666.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 5222222,
        name: '猫将来你和我会在一起吗',
        password: '123456',
        status: true,
        role: '爱喵用户特等生',
        email: 'cat@666.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 6345341236865,
        name: '爱爱爱安安',
        password: '123456',
        status: false,
        role: '爱喵用户',
        email: 'cat@333.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 6345341236866,
        name: '翠芬',
        password: '123456',
        status: true,
        role: '爱喵用户',
        email: 'cat@663.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 6345341236867,
        name: '小白',
        password: '123456789',
        status: true,
        role: '爱喵用户',
        email: 'cat@888.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 6345341236888,
        name: '小黑',
        password: '123456qq',
        status: true,
        role: '爱喵用户特等生',
        email: 'cat@123456.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 63453412362238,
        name: 'w(ﾟДﾟ)w',
        password: '123456qq',
        status: true,
        role: '爱喵用户',
        email: 'cat@1234567.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
      {
        id: 63453412362788,
        name: 'www',
        password: '123456',
        status: true,
        role: '使者',
        email: 'cat@aass.com',
        avatar: '',
        createdAt: faker.date.past().toISOString(),
      },
    ];
    usersData = defaultUsers;
  }
};

// 初始化数据
initializeUsers();

// 注册接口
export const registerAPI = async (userData: Omit<User, 'id' | 'status' | 'createdAt'>) => {
  await delay(500);
  initializeUsers();

  // 检查用户名和邮箱是否已存在
  const exists = usersData.some((u) => u.name === userData.name || u.email === userData.email);
  if (exists) throw new Error('用户名或邮箱已被注册');

  const newUser: User = {
    ...userData,
    id: faker.number.int({ min: 1000000, max: 9999999 }),
    status: true,
    createdAt: new Date().toISOString(),
  };
  usersData.push(newUser);
  return newUser;
};

// 登录接口
export const loginAPI = async (credentials: { name: string; password: string }) => {
  await delay(500);
  initializeUsers();
  const user = usersData.find((u) => u.name === credentials.name && u.password === credentials.password);
  if (!user) throw new Error('用户名或密码错误');
  if (!user.status) throw new Error('用户已被禁用');
  return user;
};

// 获取用户信息接口
export const getUserInfoAPI = async (userId: number) => {
  await delay(500);
  initializeUsers();
  const user = usersData.find((u) => u.id === userId);
  if (!user) throw new Error('用户不存在');
  return user;
};

export const updatePasswordAPI = async (
  userId: number,
  oldPassword: string,
  newPassword: string,
) => {
  await delay(500);
  initializeUsers();
  const user = usersData.find((u) => u.id === userId);
  if (!user) throw new Error('用户不存在');
  if (user.password !== oldPassword) throw new Error('原密码错误');

  user.password = newPassword;
  return true;
};

export const updateUserInfoAPI = async (userId: number, updateData: Partial<User>) => {
  await delay(500);
  initializeUsers();
  const userIndex = usersData.findIndex((u) => u.id === userId);
  if (userIndex === -1) throw new Error('用户不存在');

  // 用户名唯一性校验
  if (updateData.name && usersData.some((u) => u.id !== userId && u.name === updateData.name)) {
    throw new Error('用户名已存在');
  }

  usersData[userIndex] = { ...usersData[userIndex], ...updateData };
  return usersData[userIndex];
};

//获取用户列表
export const getUserListAPI = async (params: UserQueryParams) => {
  await delay(300);
  initializeUsers();
  const { pagenum = 1, pagesize = 10, name, email, status, role } = params;

  let filtered = [...usersData];

  // 过滤逻辑
  if (name) filtered = filtered.filter((u) => u.name.includes(name));
  if (email) filtered = filtered.filter((u) => u.email.includes(email));
  if (status !== undefined) filtered = filtered.filter((u) => u.status === status);
  if (role) filtered = filtered.filter((u) => u.role === role);

  // 分页计算
  const start = (pagenum - 1) * pagesize;
  const end = start + Number(pagesize);

  return {
    code: 200,
    data: {
      list: filtered.slice(start, end),
      total: filtered.length,
    },
  };
};

// 新增用户
export const addUserData = async (data: Omit<User, 'id' | 'createdAt' | 'avatar'> & { avatar?: string }) => {
  await delay(300);
  initializeUsers();
  const exists = usersData.some((u) => u.name === data.name || u.email === data.email);
  if (exists) return { code: 400, message: '用户名或邮箱已存在' };

  const newUser: User = {
    ...data,
    id: faker.number.int({ min: 1000000, max: 9999999 }),
    createdAt: new Date().toISOString(),
    avatar: data.avatar || '',
    status: data.status ?? true,
  };
  usersData.push(newUser);
  return { code: 200, data: newUser };
};

// 编辑用户
export const editUserData = async (id: number, data: Partial<User>) => {
  await delay(300);
  initializeUsers();
  const index = usersData.findIndex((u) => u.id === id);

  if (index === -1) return { code: 404, message: '用户不存在' };

  // 唯一性校验
  const exists = usersData.some(
    (u) => u.id !== id && (u.name === data.name || u.email === data.email),
  );
  if (exists) return { code: 400, message: '用户名或邮箱已存在' };

  usersData[index] = { ...usersData[index], ...data };
  return { code: 200, data: usersData[index] };
};

// 删除用户
export const deleteUserData = async (id: number) => {
  await delay(300);
  initializeUsers();
  const index = usersData.findIndex((u) => u.id === id);
  if (index > -1) {
    usersData.splice(index, 1);
    return { success: true };
  }
  return { success: false };
};

// 批量删除用户
export const deleteBatchUserData = async (ids: number[]) => {
  await delay(300);
  initializeUsers();
  let deleteCount = 0;

  ids.forEach((id) => {
    const index = usersData.findIndex((u) => u.id === id);
    if (index > -1) {
      usersData.splice(index, 1);
      deleteCount++;
    }
  });

  return {
    success: deleteCount > 0,
    message: deleteCount > 0 ? `成功删除${deleteCount}个用户` : '未找到匹配用户',
  };
};
