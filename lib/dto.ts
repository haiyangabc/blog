import { z } from 'zod';

// 用户相关 DTO
// 注册用户
export const RegisterUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email('请输入有效的电子邮箱地址').min(1, '电子邮箱不能为空'),
  password: z.string().min(8, '密码长度至少为8个字符').max(100)
});
export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

// 登录用户
export const LoginUserSchema = z.object({
  email: z.string().email('请输入有效的电子邮箱地址').min(1, '电子邮箱不能为空'),
  password: z.string().min(8, '密码长度至少为8个字符').max(100)
});
export type LoginUserDto = z.infer<typeof LoginUserSchema>;

// 更新用户信息
export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email('请输入有效的电子邮箱地址').optional(),
  // 注意：密码更新应使用专门的端点，避免意外修改
});
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

// 文章相关 DTO
// 创建文章
export const CreatePostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(255, '标题不能超过255个字符'),
  content: z.string().min(1, '内容不能为空'),
  excerpt: z.string().optional(),
  published: z.boolean().optional().default(false),
  categoryIds: z.array(z.number()).optional(), // 已存在分类 ID
  categoryNames: z.array(z.string()).optional(), // 要新建的分类名
  tagNames: z.array(z.string()).optional(),      // 标签名（唯一）
});
export type CreatePostDto = z.infer<typeof CreatePostSchema>;

// 更新文章
export const UpdatePostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(255, '标题不能超过255个字符').optional(),
  content: z.string().min(1, '内容不能为空').optional(),
  excerpt: z.string().optional(),
  published: z.boolean().optional(),
  categoryIds: z.array(z.number()).optional(),
  categoryNames: z.array(z.string()).optional(),
  tagNames: z.array(z.string()).optional(),
});
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;

// 标签相关 DTO
// 创建标签
export const CreateTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50个字符')
});
export type CreateTagDto = z.infer<typeof CreateTagSchema>;

// 更新标签
export const UpdateTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50个字符')
});
export type UpdateTagDto = z.infer<typeof UpdateTagSchema>;

// 分类相关 DTO
// 创建分类
export const CreateCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50个字符')
});
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;

// 更新分类
export const UpdateCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50个字符')
});
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;

// 文章分类关联 DTO
export const CreateCategoryPostSchema = z.object({
  postId: z.number().positive(),
  categoryId: z.number().positive()
});
export type CreateCategoryPostDto = z.infer<typeof CreateCategoryPostSchema>;

// 通用分页查询 DTO
export const PaginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10)
});
export type PaginationDto = z.infer<typeof PaginationSchema>;

// 文章查询参数扩展 DTO
export const PostQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  categoryId: z.number().positive().optional(),
  tagId: z.number().positive().optional(),
  authorId: z.number().positive().optional(),
  published: z.boolean().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
export type PostQueryDto = z.infer<typeof PostQuerySchema>;