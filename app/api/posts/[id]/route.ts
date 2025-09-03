import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UpdatePostSchema } from '@/lib/dto';
import { PostDetailVO, ApiResponseVO } from '@/lib/vo';

const prisma = new PrismaClient();

export const runtime = 'edge';

/**
 * 格式化文章数据为PostDetailVO
 */
const formatPostToVO = (post: any): PostDetailVO => {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    slug: post.slug,
    published: post.published,
    author: {
      id: post.author.id,
      name: post.author.name,
      createdAt: post.author.createdAt.toISOString(),
      updatedAt: post.author.updatedAt.toISOString()
    },
    categoryIds: post.categories.map((ct: any) => ct.category.id),
    categories: post.categories.map((ct: any) => ({
      id: ct.category.id,
      name: ct.category.name
    })),
    tags: post.tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name
    })),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    readTime: Math.ceil(post.content.length / 2000), // 估计阅读时间
    views: post.views || 0
  };
}

// 获取单篇文章详情
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无效的文章ID' },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } },
        tags: { select: { id: true, name: true } },
        categories: {
          include: {
            category: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    // 检查是否为作者或文章已发布
    const session = await getServerSession(authOptions);
    const isAuthor = session?.user?.id === post.authorId.toString();
    
    if (!post.published && !isAuthor) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无权访问此文章' },
        { status: 403 }
      );
    }


    // 使用格式化函数
    const formattedPost = formatPostToVO(post);

    return NextResponse.json<ApiResponseVO<PostDetailVO>>(
      { success: true, data: formattedPost }
    );
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '获取文章详情失败' },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const postId = parseInt(params.id);
    if (isNaN(postId)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无效的文章ID' },
        { status: 400 }
      );
    }

    // 验证请求数据
    const data = await request.json();
    const validationResult = UpdatePostSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json<ApiResponseVO>(
        { 
          success: false, 
          error: validationResult.error.issues[0]?.message || '输入数据验证失败' 
        },
        { status: 400 }
      );
    }

    const { 
      title, 
      content, 
      excerpt, 
      published, 
      categoryIds = [], 
      categoryNames = [], 
      tagNames = [] 
    } = validationResult.data;

    // 验证文章是否存在及权限
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    // 检查是否为文章作者
    if (existingPost.authorId !== parseInt(session.user.id)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无权修改此文章' },
        { status: 403 }
      );
    }

    // 生成slug（如果标题变化）
    let slug = existingPost.slug;
    if (title && title !== existingPost.title) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 检查slug是否已存在
      const slugExists = await prisma.post.findFirst({
        where: { slug, id: { not: postId } }
      });

      if (slugExists) {
        return NextResponse.json<ApiResponseVO>(
          { success: false, error: '该标题生成的slug已被使用，请使用不同标题' },
          { status: 400 }
        );
      }
    }

    // 先删除现有标签关联
    await prisma.post.update({
      where: { id: postId },
      data: { tags: { set: [] } }
    });

    // 处理标签
    const tagCreateOrConnect = tagNames.map((tagName: string) => ({
      where: { name: tagName },
      create: { name: tagName }
    }));

    // 先删除现有分类关联
    await prisma.categoriesOnPosts.deleteMany({
      where: { postId }
    });

    // 处理现有分类
    const categoryConnect = categoryIds
      .filter(id => !isNaN(Number(id)))
      .map(id => ({ category: { connect: { id: Number(id) } } }));

    // 处理新分类
    const categoryCreate = categoryNames.map((categoryName: string) => ({
      category: { 
        where: { name: categoryName }, 
        create: { name: categoryName } 
      }
    }));

    // 合并分类处理
    const allCategories = [...categoryConnect, ...categoryCreate];

    // 更新文章
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        excerpt: excerpt || existingPost.excerpt,
        slug,
        published: published !== undefined ? published : existingPost.published,
        tags: tagNames.length > 0 ? {
          connectOrCreate: tagCreateOrConnect
        } : undefined,
        categories: allCategories.length > 0 ? {
          create: allCategories
        } : undefined
      },
      include: {
        author: { select: { id: true, name: true, createdAt: true, updatedAt: true } },
        tags: { select: { id: true, name: true } },
        categories: {
          include: {
            category: { select: { id: true, name: true } }
          }
        }
      }
    });

    // 使用格式化函数
    const formattedPost = formatPostToVO(updatedPost);

    return NextResponse.json<ApiResponseVO<PostDetailVO>>(
      { success: true, data: formattedPost }
    );
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '更新文章失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除文章
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无效的文章ID' },
        { status: 400 }
      );
    }

    // 验证文章是否存在及权限
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '文章不存在' },
        { status: 404 }
      );
    }

    // 检查是否为文章作者
    if (existingPost.authorId !== parseInt(session.user.id)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无权删除此文章' },
        { status: 403 }
      );
    }

    // 先删除关联关系
    await Promise.all([
      prisma.post.update({
        where: { id: postId },
        data: { tags: { set: [] } }
      }),
      prisma.categoriesOnPosts.deleteMany({
        where: { postId }
      })
    ]);

    // 删除文章
    await prisma.post.delete({
      where: { id: postId }
    });

    return NextResponse.json<ApiResponseVO>(
      { success: true, message: '文章已成功删除' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '删除文章失败' },
      { status: 500 }
    );
  }
}
