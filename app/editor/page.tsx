'use client'
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pencil,
  Eye,
  Save,
  Trash,
  CheckCircle,
  XCircle,
  Plus,
  Tag,
  // Category,
  Clock,
  User,
  Calendar,
  Search,
  Loader,
  ChevronDown,
  Edit,
  // Publish,
} from 'lucide-react';
import MdEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/router';

// 表单验证 schema
const schema = yup.object({
  title: yup.string().required('请输入博客标题').max(100, '标题长度不能超过100个字符'),
  content: yup.string().required('请输入博客内容'),
  excerpt: yup.string().max(200, '摘要长度不能超过200个字符'),
  category: yup.string().required('请选择博客分类'),
  tags: yup.array().min(1, '至少需要添加一个标签'),
});

// 模拟分类数据
const categories = [
  { id: 'frontend', name: '前端开发' },
  { id: 'backend', name: '后端开发' },
  { id: 'mobile', name: '移动开发' },
  { id: 'ai', name: '人工智能' },
  { id: 'devops', name: 'DevOps' },
  { id: 'design', name: '设计' },
];

// 博客编辑器组件
const Editor: React.FC = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    'JavaScript', 'React', 'TypeScript', 'Node.js', 'Vue', 'Angular', 'Next.js', 'Tailwind CSS', 'Redux', 'GraphQL'
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: [],
    },
  });


  // 处理保存博客
  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('博客保存成功:', data);
      alert('博客已保存');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 处理发布博客
  const handlePublish = async (data: any) => {
    setIsPublishing(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('博客发布成功:', data);
      alert('博客已发布');
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败，请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  // 处理删除博客
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('博客已删除');
      alert('博客已删除');
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // 添加标签
  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setValue('tags', [...selectedTags, tag]);
    }
  };

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    const updatedTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(updatedTags);
    setValue('tags', updatedTags);
  };

  // 处理自定义标签
  const handleCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const tag = e.currentTarget.value.trim();
      if (tag && !selectedTags.includes(tag)) {
        handleAddTag(tag);
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 顶部操作栏 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1  className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-800 dark:text-white">
              编辑博客
            </h1>
            <p className="text-gray-500 dark:text-gray-400">撰写你的精彩内容</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>{previewMode ? '编辑模式' : '预览模式'}</span>
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleSubmit(handleSave)}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              
              <span>保存草稿</span>
            </Button>
            
            <Button
              onClick={handleSubmit(handlePublish)}
              disabled={isPublishing}
              className="flex items-center space-x-2"
            >
              
              <span>发布</span>
            </Button>
          </div>
        </div>
        
        {/* 博客表单 */}
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300">
          <form onSubmit={handleSubmit(handlePublish)} className="p-6">
            {/* 标题 */}
            <FormControl className="mb-6">
              <FormLabel htmlFor="title">博客标题</FormLabel>
              <Input
                id="title"
                type="text"
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary/70"
                {...register('title')}
              />
              {errors.title && (
                <FormErrorMessage>{errors.title.message}</FormErrorMessage>
              )}
            </FormControl>
            
            {/* 分类和标签 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 分类 */}
              <FormControl>
                <FormLabel htmlFor="category">分类</FormLabel>
                <Select.Root className="relative w-full">
                  <Select.Trigger
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/70"
                  >
                    <Select.Value placeholder="选择分类" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      className="absolute z-50 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto"
                      sideOffset={2}
                    >
                      {categories.map((category) => (
                        <Select.Item
                          key={category.id}
                          value={category.id}
                          className="relative py-2 pl-8 pr-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <span>{category.name}</span>
                          <Select.ItemIndicator className="absolute left-3 top-1/2 -translate-y-1/2" />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {errors.category && (
                  <FormErrorMessage>{errors.category.message}</FormErrorMessage>
                )}
              </FormControl>
              
              {/* 标签 */}
              <FormControl>
                <FormLabel>标签</FormLabel>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2">
                  {selectedTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <XCircle size={12} />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="添加标签..."
                    onKeyDown={handleCustomTag}
                    className="flex-grow border-none focus:ring-0 bg-transparent text-sm placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <Popover.Root className="relative">
                  <Popover.Trigger>
                    <Button variant="outline" size="small" className="flex items-center gap-1">
                      <Plus size={14} />
                      <span>从推荐标签添加</span>
                    </Button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content className="w-64 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-3">
                      <div className="mb-2">
                        <Input
                          type="text"
                          placeholder="搜索标签..."
                          className="w-full rounded-lg border-gray-300 dark:border-gray-600 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {availableTags.map((tag) => (
                          <div
                            key={tag}
                            className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
                              selectedTags.includes(tag)
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => handleAddTag(tag)}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
                {errors.tags && (
                  <FormErrorMessage>{errors.tags.message}</FormErrorMessage>
                )}
              </FormControl>
            </div>
            
            {/* 摘要 */}
            <FormControl className="mb-6">
              <FormLabel htmlFor="excerpt">摘要 (可选)</FormLabel>
              <Input
                id="excerpt"
                type="text"
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary/70"
                placeholder="输入简短的内容摘要..."
                {...register('excerpt')}
              />
              <FormHelperText>最多200个字符，用于列表预览</FormHelperText>
            </FormControl>
            
            {/* Markdown 编辑器 */}
            <FormControl className="mb-6">
              <FormLabel>内容</FormLabel>
              <MdEditor
                value={content}
                onChange={(value) => {
                  setContent(value || '');
                  setValue('content', value);
                }}
                height="500px"
                preview="edit"
                className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"
                remarkPlugins={[remarkGfm]}
              />
              {errors.content && (
                <FormErrorMessage>{errors.content.message}</FormErrorMessage>
              )}
            </FormControl>
            
            {/* 发布设置 */}
            <Card className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
              <Text size="sm" className="font-medium mb-3">发布设置</Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 发布状态 */}
                <FormControl>
                  <FormLabel>发布状态</FormLabel>
                  <RadioGroup.Root defaultValue="draft" className="flex gap-3">
                    <RadioGroup.Item
                      value="draft"
                      className="flex items-center gap-2 cursor-pointer"
                      {...register('published')}
                    >
                      <RadioGroup.Indicator className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-500" />
                      <span>草稿</span>
                    </RadioGroup.Item>
                    <RadioGroup.Item
                      value="published"
                      className="flex items-center gap-2 cursor-pointer"
                      {...register('published')}
                    >
                      <RadioGroup.Indicator className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-500" />
                      <span>已发布</span>
                    </RadioGroup.Item>
                  </RadioGroup.Root>
                </FormControl>
                
                {/* 作者信息 */}
                <FormControl>
                  <FormLabel>作者</FormLabel>
                  <div className="flex items-center gap-3">
                    <Avatar size={32} src="https://picsum.photos/200/200?random=1" />
                    <div>
                      <Text size="sm" className="font-medium">张三</Text>
                      <Text size="xs" className="text-gray-500 dark:text-gray-400">zhang@example.com</Text>
                    </div>
                    <Button variant="outline" size="small">
                      更改
                    </Button>
                  </div>
                </FormControl>
              </div>
            </Card>
            
            {/* 底部操作 */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="destructive"
                size="medium"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash size={16} />
                <span>删除博客</span>
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="medium"
                  onClick={handleSubmit(handleSave)}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  {isSaving ? (
                    <Spinner size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>保存草稿</span>
                </Button>
                
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleSubmit(handlePublish)}
                  disabled={isPublishing}
                  className="flex items-center space-x-2"
                >
                  {isPublishing ? (
                    <Spinner size={16} />
                  ) : (
                    <Publish size={16} />
                  )}
                  <span>发布</span>
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
      
      {/* 删除确认对话框 */}
      <AlertDialog.Root
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
          <AlertDialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            删除博客
          </AlertDialog.Title>
          <AlertDialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
            你确定要删除这篇博客吗？此操作不可撤销，所有内容都将被永久删除。
          </AlertDialog.Description>
          <div className="flex justify-end space-x-3">
            <Button onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Spinner size={16} />
              ) : (
                <Trash size={16} />
              )}
              <span>确认删除</span>
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default Editor;