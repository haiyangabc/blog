// app/blog/[slug]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEdit,
  faTrash,
  faUser,
  faCalendar,
  faClock,
  faTag,
  faFolder,
  faShareAlt,
  faCopy,
  faCheck,
  faX,
  faEye,
  faChevronRight,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';

// Markdown 相关依赖
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // 支持表格、删除线等 GFM 语法
// import remarkPrism from 'remark-prism'; // 代码高亮
import rehypeRaw from 'rehype-raw'; // 支持解析 HTML 原生语法

// 引入类型定义和权限 hooks
import { PostDetailVO, PostListItemVO } from '@/lib/vo';
import { useAuth } from '@/lib/context/AuthContext';

// 引入代码高亮样式（可根据需求替换主题）
// import 'prismjs/themes/prism-tomorrow.css';
// import 'prismjs/components/prism-typescript.min.js';
// import 'prismjs/components/prism-javascript.min.js';
// import 'prismjs/components/prism-html.min.js';
// import 'prismjs/components/prism-css.min.js';

// 相关文章类型（复用 PostListItemVO 核心字段）
type RelatedPost = Pick<
  PostListItemVO,
  'id' | 'title' | 'slug' | 'excerpt' | 'author' | 'createdAt' | 'categories' | 'readTime'
>;

// 动画变体（提升交互体验）
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function BlogDetailPage() {
  // 路由参数和导航
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  
  // 状态管理
  const [post, setPost] = useState<PostDetailVO | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 权限相关
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isAuthor = post && user ? post.author.id.toString() === user.id : false;
  
  // 页面滚动监听（控制返回顶部按钮显示）
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 获取文章详情（通过 slug 匹配）
  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // 调用 API：通过 slug 精准查询文章（复用列表接口，限制返回 1 条）
      const response = await fetch(`/api/posts?slug=${slug}&limit=1`);
      const data = await response.json();

      if (!data.success || !data.data?.items || data.data.items.length === 0) {
        throw new Error('文章不存在或已被删除');
      }

      // 提取文章详情
      const postDetail = data.data.items[0] as PostDetailVO;
      setPost(postDetail);

      // 同步获取相关文章（同分类/同标签）
      fetchRelatedPosts(postDetail.categories[0]?.id, postDetail.id);

    } catch (err) {
      console.error('获取文章详情失败:', err);
      setError(err instanceof Error ? err.message : '获取文章时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 获取相关文章（基于分类关联）
  const fetchRelatedPosts = async (categoryId?: number, currentPostId?: number) => {
    if (!categoryId || !currentPostId) return;

    try {
      const response = await fetch(`/api/posts?categoryId=${categoryId}&limit=3&excludeId=${currentPostId}`);
      const data = await response.json();

      if (data.success && data.data?.items) {
        setRelatedPosts(data.data.items as RelatedPost[]);
      }
    } catch (err) {
      console.error('获取相关文章失败:', err);
    }
  };

  // 初始化加载文章
  useEffect(() => {
    if (slug) {
      fetchPostDetail();
    }
  }, [slug, authLoading]);

  // 复制文章链接
  const copyPostLink = () => {
    const postUrl = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 删除文章（仅作者可操作）
  const handleDeletePost = async () => {
    if (!post) return;

    try {
      setLoadingDelete(true);
      const response = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [post.id] })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '删除文章失败');
      }

      // 删除成功后跳转回列表页
      router.push('/blog');
    } catch (err) {
      console.error('删除文章失败:', err);
      alert(err instanceof Error ? err.message : '删除文章时发生错误');
    } finally {
      setLoadingDelete(false);
      setShowDeleteConfirm(false);
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">加载文章中...</p>
      </div>
    );
  }

  // 渲染错误状态
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <FontAwesomeIcon icon={faX} className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-red-600 font-semibold text-xl mb-2">文章获取失败</h3>
          <p className="text-red-500 mb-6">{error || '未找到该文章'}</p>
          <Link
            href="/blog"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回博客列表
          </Link>
        </div>
      </div>
    );
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回顶部按钮 */}
      {isScrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}

      {/* 确认删除弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">确认删除文章？</h3>
            <p className="text-gray-600 mb-6">
              此操作将永久删除文章《{post.title}》，且无法恢复。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loadingDelete}
              >
                取消
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={loadingDelete}
              >
                {loadingDelete ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文章头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回博客列表
          </Link>
        </div>
      </div>

      {/* 文章主体内容 */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 文章详情区（左侧主内容） */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:w-2/3"
          >
            {/* 文章标题区 */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* 文章状态标签（草稿/已发布） */}
              {!post.published && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mb-4">
                  草稿状态
                </span>
              )}

              {/* 文章元数据（作者、日期、阅读时间等） */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 text-sm mb-6">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2 w-4 h-4" />
                  <span>{post.author.name}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendar} className="mr-2 w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-2 w-4 h-4" />
                  <span>{post.readTime} 分钟阅读</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEye} className="mr-2 w-4 h-4" />
                  <span>{post.views || 0} 次浏览</span>
                </div>
              </div>

              {/* 作者操作按钮（仅作者可见） */}
              {isAuthor && (
                <div className="flex gap-3 mb-6">
                  <Link
                    href={`/blog/edit/${post.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    编辑文章
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    删除文章
                  </button>
                </div>
              )}

              {/* 文章分类和标签 */}
              <div className="flex flex-wrap gap-3 mb-6">
                {/* 分类 */}
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faFolder} className="text-green-500 mr-2 w-4 h-4" />
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog?categoryId=${category.id}`}
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      {category.name}
                      {category !== post.categories[post.categories.length - 1] && ','}
                    </Link>
                  ))}
                </div>

                {/* 标签 */}
                <div className="flex items-center flex-wrap">
                  <FontAwesomeIcon icon={faTag} className="text-purple-500 mr-2 w-4 h-4" />
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog?tagId=${tag.id}`}
                      className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mr-2 mb-1 hover:bg-purple-200 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 文章分享和复制链接 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={copyPostLink}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-2 w-4 h-4" />
                  <span>{copied ? '已复制' : '复制链接'}</span>
                </button>
                <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <FontAwesomeIcon icon={faShareAlt} className="mr-2 w-4 h-4" />
                  <span>分享文章</span>
                </button>
              </div>
            </motion.div>

            {/* 文章封面图（可选） */}
            {/* {post.coverImage && (
              <motion.div variants={itemVariants} className="mb-8 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </motion.div>
            )} */}

            {/* Markdown 内容渲染区 */}
            <motion.article
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8 prose prose-blue max-w-none"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                // className="prose prose-lg prose-headings:font-bold prose-img:rounded-lg prose-table:min-w-full prose-pre:bg-gray-900 prose-pre:text-gray-100"
              >
                {post.content}
              </ReactMarkdown>
            </motion.article>

            {/* 文章更新时间 */}
            <motion.div
              variants={itemVariants}
              className="text-gray-500 text-sm mb-8 italic"
            >
              最后更新时间：{formatDate(post.updatedAt)}
            </motion.div>

            {/* 文章底部操作栏 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center"
            >
              <Link
                href="/blog"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                返回博客列表
              </Link>
              {relatedPosts.length > 0 && (
                <Link
                  href={`/blog/${relatedPosts[0].slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  下一篇：{relatedPosts[0].title.length > 15 ? `${relatedPosts[0].title.slice(0, 15)}...` : relatedPosts[0].title}
                  <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* 侧边栏（右侧） */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:w-1/3"
          >
            {/* 作者信息卡片 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
                作者信息
              </h3>
              <div className="flex items-center mb-4">
                {/* 作者头像（默认使用占位图，可替换为真实头像接口） */}
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="text-gray-600 font-medium">{post.author?.name?.charAt(0)?.toUpperCase() || ''}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                  <p className="text-gray-500 text-sm">
                    加入时间：{formatDate(post.author.createdAt)}
                  </p>
                </div>
              </div>
              {/* 作者文章统计（可扩展更多统计项） */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-sm">发布文章</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {/* 此处可替换为真实的作者文章数接口数据 */}
                    {Math.floor(Math.random() * 20) + 1}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-sm">总阅读量</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {/* 此处可替换为真实的作者阅读量接口数据 */}
                    {Math.floor(Math.random() * 10000) + 1000}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 相关文章卡片 */}
            {relatedPosts.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6 mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faBookOpen} className="mr-2 text-blue-500" />
                  相关推荐
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="block group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 mb-2 line-clamp-1">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {relatedPost.excerpt || '暂无摘要'}
                      </p>
                      <div className="flex justify-between items-center text-gray-500 text-xs">
                        <span>{formatDate(relatedPost.createdAt)}</span>
                        <span>{relatedPost.readTime} 分钟阅读</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 热门标签卡片 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faTag} className="mr-2 text-blue-500" />
                热门标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* 提取所有文章的标签并去重（可替换为接口获取的热门标签） */}
                {Array.from(
                  new Set([
                    ...post.tags.map((tag) => tag.name),
// 由于 RelatedPost 类型上不存在 tags 属性，需要确认该类型定义
// 这里假设相关文章的 tags 信息没有被包含在 RelatedPost 中，暂时返回空数组
                    ...[]
                  ])
                ).map((tagName, index) => (
                  <Link
                    key={index}
                    href={`/blog?tagName=${tagName}`}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {tagName}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} 博客平台. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}
