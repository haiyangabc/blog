"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useForm } from 'react-hook-form';
import React from 'react';

// 文章表单数据类型
interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  tags: string[];
  categories: string[];
}

// 标签和分类选项类型
interface OptionType {
  id: number;
  name: string;
}

export default function CreatePostPage() {
  const { requireAuth, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableTags, setAvailableTags] = useState<OptionType[]>([]);
  const [availableCategories, setAvailableCategories] = useState<OptionType[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  // 初始化表单
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      slug: '',
      published: false,
      tags: [],
      categories: []
    }
  });

  const tags = watch('tags', []);
  const categories = watch('categories', []);
  const title = watch('title', '');

  // 页面加载时验证登录状态并获取标签和分类
  useEffect(() => {
    if (!authLoading) {
      requireAuth();
      
      // 获取所有标签和分类
      const fetchOptions = async () => {
        try {
          const [tagsRes, categoriesRes] = await Promise.all([
            fetch('/api/tags'),
            fetch('/api/categories')
          ]);
          
          if (tagsRes.ok && categoriesRes.ok) {
            const tagsData = await tagsRes.json();
            const categoriesData = await categoriesRes.json();
            
            setAvailableTags(tagsData);
            setAvailableCategories(categoriesData);
          }
        } catch (err) {
          console.error('获取标签和分类失败:', err);
        }
      };
      
      fetchOptions();
    }
  }, [authLoading, requireAuth]);

  // 自动生成slug
  useEffect(() => {
    if (title && !watch('slug')) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      
      setValue('slug', generatedSlug);
    }
  }, [title, setValue, watch]);

  // 添加标签
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput && !tags.includes(tagInput)) {
      setValue('tags', [...tags, tagInput]);
      setTagInput('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  // 添加分类
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryInput && !categories.includes(categoryInput)) {
      setValue('categories', [...categories, categoryInput]);
      setCategoryInput('');
    }
  };

  // 移除分类
  const handleRemoveCategory = (categoryToRemove: string) => {
    setValue('categories', categories.filter(cat => cat !== categoryToRemove));
  };

  // 提交表单
  const onSubmit = async (data: PostFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '发布文章失败');
      }

      const result = await response.json();
      setSuccess('文章发布成功！');
      
      // 3秒后跳转到文章列表或文章详情
      setTimeout(() => {
        router.push(`/dashboard/posts`);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : '发布文章时发生错误');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  if (!isAuthenticated) {
    return null; // 已在requireAuth中处理重定向
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">发布新文章</h1>
        <p className="text-gray-600 mt-2">创建并发布你的博客文章</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 标题 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            文章标题 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: '标题不能为空' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL路径) <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
              /posts/
            </span>
            <input
              id="slug"
              type="text"
              {...register('slug', { required: 'Slug不能为空' })}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            用于URL的简短标识符，只能包含字母、数字和连字符
          </p>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        {/* 摘要 */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
            摘要
          </label>
          <textarea
            id="excerpt"
            rows={3}
            {...register('excerpt')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="文章的简短描述"
            disabled={loading}
          ></textarea>
        </div>

        {/* 内容 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            文章内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={15}
            {...register('content', { required: '内容不能为空' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="在这里编写你的文章内容..."
            disabled={loading}
          ></textarea>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <div className="flex mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="输入标签并按回车添加"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              disabled={loading || !tagInput}
            >
              添加
            </button>
          </div>

          {/* 已选标签 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* 可用标签 */}
          {availableTags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">推荐标签:</p>
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter(tag => !tags.includes(tag.name))
                  .map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setValue('tags', [...tags, tag.name])}
                      className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
                      disabled={loading}
                    >
                      {tag.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类
          </label>
          <div className="flex mb-3">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="输入分类并按回车添加"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              disabled={loading || !categoryInput}
            >
              添加
            </button>
          </div>

          {/* 已选分类 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm"
              >
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* 可用分类 */}
          {availableCategories.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">已有分类:</p>
              <div className="flex flex-wrap gap-2">
                {availableCategories
                  .filter(cat => !categories.includes(cat.name))
                  .map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setValue('categories', [...categories, category.name])}
                      className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
                      disabled={loading}
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 发布选项 */}
        <div className="flex items-center">
          <input
            id="published"
            type="checkbox"
            {...register('published')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
            立即发布
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? '发布中...' : '发布文章'}
          </button>
        </div>
      </form>
    </div>
  );
}
