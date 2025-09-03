export interface Author {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: Author;
  tags: Tag[];
  categories: Category[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PostListResponse {
  posts: Post[];
  pagination: Pagination;
}

// API响应通用格式
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// 重构后的文章列表API响应格式
export interface PostListApiResponse {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
