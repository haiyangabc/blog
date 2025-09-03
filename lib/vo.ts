// 视图对象（View Object）定义
// 用于前端展示的数据结构，通常从API获取后进行格式化

// 用户视图对象
export interface UserVO {
  id: number;
  email: string;
  name?: string;
  createdAt: string; // ISO日期字符串
  updatedAt: string; // ISO日期字符串
}

// 标签视图对象
export interface TagVO {
  id: number;
  name: string;
  postCount?: number; // 可选：该标签下的文章数量
}

// 分类视图对象
export interface CategoryVO {
  id: number;
  name: string;
  postCount?: number; // 可选：该分类下的文章数量
}

// 简化的文章视图对象（用于列表展示）
export interface PostListItemVO {
  id: number;
  title: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  author: Omit<UserVO, 'email'>; // 不包含邮箱信息的用户对象
  categoryIds: number[];
  categories: Pick<CategoryVO, 'id' | 'name'>[];
  tags: Pick<TagVO, 'id' | 'name'>[];
  createdAt: string; // ISO日期字符串
  updatedAt: string; // ISO日期字符串
  readTime?: number; // 可选：预计阅读时间（分钟）
  views?: number; // 可选：浏览量
}

// 完整的文章视图对象（用于详情页）
export interface PostDetailVO extends PostListItemVO {
  content: string;
  // 可以根据需要添加其他详情页特有的字段
}

// 分页响应视图对象
export interface PaginationResultVO<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 通用的API响应视图对象
export interface ApiResponseVO<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 认证相关视图对象
export interface AuthResultVO {
  user: UserVO;
  token?: string; // 如果使用JWT认证
  sessionId?: string; // 如果使用session认证
}

// 统计信息视图对象
export interface StatsVO {
  totalPosts: number;
  totalPublishedPosts: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
  recentActivity?: {
    date: string;
    count: number;
  }[];
}

// 评论视图对象（如果项目有评论功能）
export interface CommentVO {
  id: number;
  content: string;
  author: Pick<UserVO, 'id' | 'name'>;
  postId: number;
  parentId?: number; // 可选：用于回复功能
  createdAt: string;
  updatedAt: string;
}

// 搜索结果视图对象
export interface SearchResultVO {
  type: 'post' | 'category' | 'tag' | 'user';
  id: number;
  title: string;
  snippet?: string;
  url: string;
  createdAt?: string;
}