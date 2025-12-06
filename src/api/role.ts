import { faker } from '@faker-js/faker';
import type { RoleQueryParams, Role, CreateRoleDTO, PermissionNode } from '@/types/role';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 使用 faker 生成角色数据（带持久化）
let rolesData: Role[] = [];

// 初始化默认角色
const initializeRoles = () => {
  if (rolesData.length === 0) {
    const defaultRoles: Role[] = [
      {
        id: faker.string.uuid(),
        name: '管理员',
        remark: '拥有系统最高权限,掌管力量的神',
        status: true,
        createdAt: faker.date.past().toISOString(),
        permissions: [
          'overview:view',
          'record:view',
          'message:view',
          'us:view',
          'cat:view',
          'user:view',
          'role:view',
          'cat:add',
          'cat:edit',
          'cat:delete',
          'user:add',
          'user:edit',
          'user:delete',
          'role:add',
          'role:edit',
          'role:delete',
          'menu:view',
          'menu:add',
          'menu:edit',
          'menu:delete',
        ],
      },
      {
        id: faker.string.uuid(),
        name: '金角大王',
        remark: '管理员的左膀',
        status: true,
        createdAt: faker.date.past().toISOString(),
        permissions: [
          'overview:view',
          'record:view',
          'message:view',
          'us:view',
          'user:view',
          'role:view',
          'cat:view',
          'cat:add',
          'cat:edit',
          'cat:delete',
          'user:add',
          'user:edit',
          'user:delete',
        ],
      },
      {
        id: faker.string.uuid(),
        name: '银角大王',
        remark: '右臂',
        status: false,
        createdAt: faker.date.past().toISOString(),
        permissions: [
          'overview:view',
          'record:view',
          'message:view',
          'us:view',
          'cat:view',
          'user:view',
          'role:view',
          'cat:add',
          'cat:edit',
          'cat:delete',
        ],
      },
      {
        id: faker.string.uuid(),
        name: '爱喵用户特等生',
        remark: '猫咪爱好者专属角色',
        status: true,
        createdAt: faker.date.past().toISOString(),
        permissions: [
          'overview:view',
          'record:view',
          'message:view',
          'us:view',
          'cat:view',
          'cat:add',
          'cat:edit',
          'cat:delete',
        ],
      },
      {
        id: faker.string.uuid(),
        name: '爱喵用户',
        remark: '猫咪爱好者专属角色',
        status: true,
        createdAt: faker.date.past().toISOString(),
        permissions: ['overview:view', 'record:view', 'message:view', 'us:view'],
      },
      {
        id: faker.string.uuid(),
        name: '使者',
        remark: '使者角色',
        status: true,
        createdAt: faker.date.past().toISOString(),
        permissions: ['overview:view', 'record:view', 'message:view', 'us:view', 'cat:view'],
      },
    ];
    rolesData = defaultRoles;
  }
};

// 初始化权限列表
const allPermissions: PermissionNode[] = [
  {
    id: 0,
    icon: 'icon-shouye',
    label: '首页',
    value: 'overview:view',
  },
  {
    id: 1,
    icon: 'icon-jilu',
    label: '记录',
    value: 'record:view',
  },
  {
    id: 2,
    icon: 'icon-Gc_120_line-Menu',
    label: '系统管理',
    value: 'manage',
    children: [
      {
        id: 21,
        icon: 'icon-claw',
        label: '猫猫管理',
        value: 'manage:cat',
        isPenultimate: true,
        children: [
          { id: 211, label: '查看', value: 'cat:view' },
          { id: 212, label: '添加', value: 'cat:add' },
          { id: 213, label: '修改', value: 'cat:edit' },
          { id: 214, label: '删除', value: 'cat:delete' },
        ],
      },
      {
        id: 22,
        icon: 'icon-Gc_32_line-UserManagement',
        label: '用户管理',
        value: 'manage-user',
        isPenultimate: true,
        children: [
          { id: 220, label: '查看', value: 'user:view' },
          { id: 221, label: '添加', value: 'user:add' },
          { id: 222, label: '修改', value: 'user:edit' },
          { id: 223, label: '删除', value: 'user:delete' },
        ],
      },
      {
        id: 23,
        icon: 'icon-a-jiaoseguanli2',
        label: '角色管理',
        value: 'manage:role',
        isPenultimate: true,
        children: [
          { id: 230, label: '查看', value: 'role:view' },
          { id: 231, label: '添加', value: 'role:add' },
          { id: 232, label: '修改', value: 'role:edit' },
          { id: 233, label: '删除', value: 'role:delete' },
        ],
      },
      {
        id: 24,
        icon: 'icon-caidan',
        label: '菜单管理',
        value: 'menu:role',
        isPenultimate: true,
        children: [
          { id: 240, label: '查看', value: 'menu:view' },
          { id: 241, label: '添加', value: 'menu:add' },
          { id: 242, label: '修改', value: 'menu:edit' },
          { id: 243, label: '删除', value: 'menu:delete' },
        ],
      },
    ],
  },
  { id: 3, icon: 'icon-maojiazhengchangx', label: '留言板', value: 'message:view' },
  { id: 4, icon: 'icon-personalcenter', label: '个人中心', value: 'us:view' },
];

// 初始化数据
initializeRoles();

// 获取角色列表
export const getRoleListAPI = async (params: RoleQueryParams) => {
  await delay(300);
  initializeRoles();
  const { pagenum = 1, pagesize = 10, name, status } = params;

  let filtered = [...rolesData];

  // 过滤逻辑
  if (name) {
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (status !== undefined) {
    filtered = filtered.filter((item) => item.status === status);
  }

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

//新增角色
export const addRoleAPI = async (roleData: CreateRoleDTO) => {
  await delay(300);
  initializeRoles();

  const newRole: Role = {
    ...roleData,
    id: faker.string.uuid(),
    createdAt: new Date().toISOString(),
    permissions: roleData.permissions || [],
  };
  rolesData.push(newRole);
  return { code: 200, data: newRole };
};

//编辑角色
export const editRoleAPI = async (roleId: string, roleData: Partial<Role>) => {
  await delay(300);
  initializeRoles();
  const index = rolesData.findIndex((r) => r.id === roleId);
  if (index > -1) {
    rolesData[index] = {
      ...rolesData[index],
      ...roleData,
      permissions: roleData.permissions || rolesData[index].permissions,
    };
    return { code: 200, data: rolesData[index] };
  }
  return { code: 404, message: '角色不存在' };
};

// 删除角色
export const deleteRoleAPI = async (roleId: string) => {
  await delay(300);
  initializeRoles();
  const index = rolesData.findIndex((r) => r.id === roleId);
  if (index > -1) {
    rolesData.splice(index, 1);
    return { code: 200 };
  }
  return { code: 404 };
};

//获取所有菜单和按钮权限列表
export const getAllPermissionAPI = async () => {
  await delay(300);
  return {
    code: 200,
    data: allPermissions,
  };
};

// 根据角色名称获取权限
export const getRolePermissionsAPI = async (roleName: string) => {
  await delay(300);
  initializeRoles();
  const role = rolesData.find((r) => r.name === roleName);
  if (role && !role.status) {
    // 角色被禁用，返回爱喵用户的权限
    const defaultRole = rolesData.find((r) => r.name === '爱喵用户');
    return { data: defaultRole?.permissions || [] };
  }
  return { data: role?.permissions || [] };
};
