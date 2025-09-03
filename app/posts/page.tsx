'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faX,
  faTrash,
  faEdit,
  faEye,
  faCalendar,
  faUser,
  faClock,
  faTag,
  faFolder,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faUpDown,
  faPenToSquare
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/lib/context/AuthContext';
import { PostListItemVO, PaginationResultVO } from '@/lib/vo';

// 类型定义
interface BlogListState {
  posts: PostListItemVO[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedIds: number[];
  isSelecting: boolean;
}

// 动画变体
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
  hover: { scale: 1.02, transition: { duration: 0.3 } }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const filterVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export default function BlogListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [state, setState] = useState<BlogListState>({
    posts: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    selectedIds: [],
    isSelecting: false
  });
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    tagId: searchParams.get('tagId') ? Number(searchParams.get('tagId')) : undefined,
    authorId: searchParams.get('authorId') ? Number(searchParams.get('authorId')) : undefined,
    published: searchParams.get('published') === 'true' ? true : 
               searchParams.get('published') === 'false' ? false : undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  });
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<{id: number; name: string}[]>([]);
  const [availableTags, setAvailableTags] = useState<{id: number; name: string}[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  // 提取所有可用的分类和标签
  useEffect(() => {
    if (state.posts.length > 0) {
      const categories = new Map<number, string>();
      const tags = new Map<number, string>();
      
      state.posts.forEach(post => {
        post.categories.forEach(cat => categories.set(cat.id, cat.name));
        post.tags.forEach(tag => tags.set(tag.id, tag.name));
      });
      
      setAvailableCategories(Array.from(categories.entries()).map(([id, name]) => ({ id, name })));
      setAvailableTags(Array.from(tags.entries()).map(([id, name]) => ({ id, name })));
    }
  }, [state.posts]);

  // 加载博客文章
  const fetchPosts = async (page: number = 1, reset: boolean = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', state.pagination.limit.toString());
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId !== undefined) params.append('categoryId', filters.categoryId.toString());
      if (filters.tagId !== undefined) params.append('tagId', filters.tagId.toString());
      if (filters.authorId !== undefined) params.append('authorId', filters.authorId.toString());
      if (filters.published !== undefined) params.append('published', filters.published.toString());
      
      // 更新URL但不触发导航
      router.push(`/posts?${params.toString()}`, { scroll: false });
      
      // 调用API
      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '获取文章失败');
      }
      
      const result = data.data as PaginationResultVO<PostListItemVO>;
      
      setState(prev => ({
        ...prev,
        posts: reset ? result.items : [...prev.posts, ...result.items],
        loading: false,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }));
    } catch (err) {
      console.error('获取文章失败:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '获取文章时发生错误'
      }));
    }
  };

  // 初始加载和参数变化时重新加载
  useEffect(() => {
    if (authLoading) return;
    
    // 从URL参数初始化页面
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    fetchPosts(page, true);
  }, [filters, authLoading]);

  // 实现无限滚动
  useEffect(() => {
    if (state.loading || state.pagination.page >= state.pagination.totalPages) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchPosts(state.pagination.page + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [state.loading, state.pagination.page, state.pagination.totalPages]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(1, true);
  };

  // 处理筛选条件变化
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // 重置到第一页
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
  };

  // 清除所有筛选条件
  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: undefined,
      tagId: undefined,
      authorId: undefined,
      published: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
    setMobileFiltersOpen(false);
  };

  // 切换排序方式
  const toggleSortOrder = () => {
    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // 切换文章选择
  const togglePostSelection = (id: number) => {
    setState(prev => {
      const isSelected = prev.selectedIds.includes(id);
      return {
        ...prev,
        selectedIds: isSelected
          ? prev.selectedIds.filter(selectedId => selectedId !== id)
          : [...prev.selectedIds, id],
        isSelecting: true
      };
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    setState(prev => {
      if (prev.selectedIds.length === prev.posts.length) {
        return { ...prev, selectedIds: [] };
      } else {
        return { ...prev, selectedIds: prev.posts.map(post => post.id) };
      }
    });
  };

  // 退出选择模式
  const exitSelectionMode = () => {
    setState(prev => ({ ...prev, selectedIds: [], isSelecting: false }));
  };

  // 批量删除文章
  const handleBulkDelete = async () => {
    if (!confirm(`确定要删除选中的 ${state.selectedIds.length} 篇文章吗？`)) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: state.selectedIds })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '删除失败');
      }
      
      // 重新加载当前页
      fetchPosts(state.pagination.page, true);
      setState(prev => ({ ...prev, selectedIds: [], isSelecting: false }));
    } catch (err) {
      console.error('批量删除失败:', err);
      alert(err instanceof Error ? err.message : '删除文章时发生错误');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // 渲染加载状态
  if (authLoading || state.loading && state.posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">加载文章中...</p>
      </div>
    );
  }

  // 渲染错误状态
  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-600 font-semibold text-xl mb-2">发生错误</h3>
          <p className="text-red-500 mb-4">{state.error}</p>
          <button
            onClick={() => fetchPosts(state.pagination.page, true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作按钮 */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">博客文章</h1>
            <p className="text-gray-600">发现和探索最新的文章内容</p>
          </div>
          
          {isAuthenticated && (
            <Link
              href="/posts/create"
              className="mt-4 md:mt-0 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
              创建新文章
            </Link>
          )}
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <input
            type="text"
            placeholder="搜索文章标题、摘要或内容..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faX} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 活跃筛选条件 */}
      {(filters.search || filters.categoryId || filters.tagId || filters.authorId || filters.published !== undefined) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-2">
          <span className="text-gray-700 font-medium">活跃筛选条件:</span>
          
          {filters.search && (
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              搜索: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-2 text-blue-600 hover:text-blue-900"
              >
                <FontAwesomeIcon icon={faX} className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {filters.categoryId && (
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              分类: {availableCategories.find(c => c.id === filters.categoryId)?.name}
              <button
                onClick={() => handleFilterChange('categoryId', undefined)}
                className="ml-2 text-green-600 hover:text-green-900"
              >
                <FontAwesomeIcon icon={faX} className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {filters.tagId && (
            <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              标签: {availableTags.find(t => t.id === filters.tagId)?.name}
              <button
                onClick={() => handleFilterChange('tagId', undefined)}
                className="ml-2 text-purple-600 hover:text-purple-900"
              >
                <FontAwesomeIcon icon={faX} className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {filters.authorId && (
            <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              作者文章
              <button
                onClick={() => handleFilterChange('authorId', undefined)}
                className="ml-2 text-yellow-600 hover:text-yellow-900"
              >
                <FontAwesomeIcon icon={faX} className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {filters.published !== undefined && (
            <div className="flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
              {filters.published ? '已发布' : '草稿'}
              <button
                onClick={() => handleFilterChange('published', undefined)}
                className="ml-2 text-gray-600 hover:text-gray-900"
              >
                <FontAwesomeIcon icon={faX} className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-900 ml-auto flex items-center text-sm font-medium"
          >
            <FontAwesomeIcon icon={faX} className="mr-1 w-4 h-4" />
            清除所有筛选
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 移动端筛选按钮 */}
        <button
          className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg flex items-center justify-center mb-4"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2" />
          筛选
        </button>

        {/* 筛选侧边栏 */}
        <motion.div
          variants={filterVariants}
          initial="hidden"
          animate={mobileFiltersOpen ? "show" : "hidden"}
          className={`${mobileFiltersOpen ? 'block' : 'hidden lg:block'} w-full lg:w-64 shrink-0`}
        >
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900">筛选条件</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                重置
              </button>
            </div>

            {/* 分类筛选 */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FontAwesomeIcon icon={faFolder} className="mr-2 text-green-500 w-4 h-4" />
                分类
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {availableCategories.map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={filters.categoryId === category.id}
                      onChange={() => handleFilterChange('categoryId', category.id)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">{category.name}</span>
                  </label>
                ))}
                {availableCategories.length === 0 && (
                  <p className="text-gray-500 text-sm">暂无分类数据</p>
                )}
              </div>
            </div>

            {/* 标签筛选 */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FontAwesomeIcon icon={faTag} className="mr-2 text-purple-500 w-4 h-4" />
                标签
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {availableTags.map(tag => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="radio"
                      name="tag"
                      value={tag.id}
                      checked={filters.tagId === tag.id}
                      onChange={() => handleFilterChange('tagId', tag.id)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">{tag.name}</span>
                  </label>
                ))}
                {availableTags.length === 0 && (
                  <p className="text-gray-500 text-sm">暂无标签数据</p>
                )}
              </div>
            </div>

            {/* 发布状态筛选 */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">发布状态</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="published"
                    value=""
                    checked={filters.published === undefined}
                    onChange={() => handleFilterChange('published', undefined)}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">全部</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="published"
                    value="true"
                    checked={filters.published === true}
                    onChange={() => handleFilterChange('published', true)}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">已发布</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="published"
                    value="false"
                    checked={filters.published === false}
                    onChange={() => handleFilterChange('published', false)}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">草稿</span>
                </label>
              </div>
            </div>

            {/* 作者筛选 */}
            {isAuthenticated && (
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.authorId === Number(user?.id)}
                    onChange={(e) => handleFilterChange(
                      'authorId', 
                      e.target.checked ? Number(user?.id) : undefined
                    )}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">只看我的文章</span>
                </label>
              </div>
            )}

            {/* 排序方式 */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">排序方式</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortBy"
                    value="createdAt"
                    checked={filters.sortBy === 'createdAt'}
                    onChange={() => handleFilterChange('sortBy', 'createdAt')}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">发布时间</span>
                  <button
                    type="button"
                    onClick={toggleSortOrder}
                    disabled={filters.sortBy !== 'createdAt'}
                    className={`ml-2 p-1 rounded ${
                      filters.sortBy === 'createdAt' 
                        ? 'text-gray-700 hover:text-blue-600' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <FontAwesomeIcon icon={faUpDown} className="w-4 h-4" />
                  </button>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortBy"
                    value="title"
                    checked={filters.sortBy === 'title'}
                    onChange={() => handleFilterChange('sortBy', 'title')}
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">标题</span>
                  <button
                    type="button"
                    onClick={toggleSortOrder}
                    disabled={filters.sortBy !== 'title'}
                    className={`ml-2 p-1 rounded ${
                      filters.sortBy === 'title' 
                        ? 'text-gray-700 hover:text-blue-600' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <FontAwesomeIcon icon={faUpDown} className="w-4 h-4" />
                  </button>
                </label>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 文章列表 */}
        <div className="flex-1">
          {/* 选择模式工具栏 */}
          {state.isSelecting && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-700 hover:text-blue-600 mr-3"
                >
                  {state.selectedIds.length === state.posts.length ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
                  ) : (
                    <div className="w-5 h-5 border border-gray-400 rounded"></div>
                  )}
                </button>
                <span className="text-gray-700">
                  已选择 {state.selectedIds.length} 篇文章
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exitSelectionMode}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={state.loading}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1 w-4 h-4" />
                  删除所选
                </button>
              </div>
            </div>
          )}

          {/* 文章列表为空 */}
          {state.posts.length === 0 && !state.loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faFilter} className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">未找到文章</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.categoryId || filters.tagId
                  ? '没有符合当前筛选条件的文章'
                  : '目前还没有发布任何文章'}
              </p>
              {isAuthenticated && (
                <Link
                  href="/posts/create"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
                  创建你的第一篇文章
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-5"
            >
              {state.posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                  ref={index === state.posts.length - 1 ? lastPostRef : null}
                >
                  <div className="p-5">
                    {/* 选择框（仅在选择模式下显示） */}
                    {state.isSelecting && (
                      <div className="absolute top-4 left-4 z-10">
                        <button
                          onClick={() => togglePostSelection(post.id)}
                          className={`w-5 h-5 rounded border ${
                            state.selectedIds.includes(post.id)
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-gray-300'
                          } flex items-center justify-center`}
                        >
                          {state.selectedIds.includes(post.id) && (
                            <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* 文章信息 */}
                      <div className="flex-1">
                        {/* 标题 */}
                        <h2 className="text-xl font-bold mb-2 group">
                          <Link
                            href={`/posts/${post.slug}`}
                            className="text-gray-900 hover:text-blue-600 transition-colors inline-block"
                          >
                            <span className="bg-gradient-to-r from-blue-500 to-blue-500 bg-[length:0px_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
                              {post.title}
                            </span>
                          </Link>
                          {!post.published && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              草稿
                            </span>
                          )}
                        </h2>

                        {/* 摘要 */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt || '无摘要'}
                        </p>

                        {/* 元数据 */}
                        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faUser} className="mr-1 w-4 h-4" />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faCalendar} className="mr-1 w-4 h-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faClock} className="mr-1 w-4 h-4" />
                            <span>{post.readTime} 分钟阅读</span>
                          </div>
                        </div>

                        {/* 分类和标签 */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.categories.map(category => (
                            <Link
                              key={category.id}
                              href={`/posts?categoryId=${category.id}`}
                              className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >
                              <FontAwesomeIcon icon={faFolder} className="mr-1 w-3 h-3" />
                              {category.name}
                            </Link>
                          ))}
                          {post.tags.map(tag => (
                            <Link
                              key={tag.id}
                              href={`/posts?tagId=${tag.id}`}
                              className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTag} className="mr-1 w-3 h-3" />
                              {tag.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    {isAuthenticated && post.author.id.toString() === user?.id && (
                      <div className="mt-4 flex justify-end gap-2">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1 w-4 h-4" />
                          查看
                        </Link>
                        <Link
                          href={`/posts/edit/${post.id}`}
                          className="px-3 py-1 text-sm border border-blue-300 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex items-center"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1 w-4 h-4" />
                          编辑
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}

          {/* 加载更多指示器 */}
          {state.loading && state.posts.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* 分页控件（当不使用无限滚动时） */}
          {/* <div className="flex justify-center items-center mt-10 gap-2">
            <button
              onClick={() => fetchPosts(state.pagination.page - 1, true)}
              disabled={state.pagination.page === 1 || state.loading}
              className={`p-2 rounded-full transition-colors ${
                state.pagination.page === 1 || state.loading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            
            {[...Array(Math.min(5, state.pagination.totalPages))].map((_, i) => {
              let pageNum;
              if (state.pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (state.pagination.page <= 3) {
                pageNum = i + 1;
              } else if (state.pagination.page >= state.pagination.totalPages - 2) {
                pageNum = state.pagination.totalPages - 4 + i;
              } else {
                pageNum = state.pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchPosts(pageNum, true)}
                  disabled={state.loading}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                    state.pagination.page === pageNum
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => fetchPosts(state.pagination.page + 1, true)}
              disabled={state.pagination.page >= state.pagination.totalPages || state.loading}
              className={`p-2 rounded-full transition-colors ${
                state.pagination.page >= state.pagination.totalPages || state.loading
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
