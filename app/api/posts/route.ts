import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreatePostSchema, PostQuerySchema } from '@/lib/dto';
import { PostListItemVO, ApiResponseVO, PaginationResultVO } from '@/lib/vo';

const prisma = new PrismaClient();

/**
 * 格式化文章数据为PostListItemVO
 */
const formatPostToVO = (post: any): PostListItemVO => {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
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

/**
 * 批量删除文章
 */
export async function DELETE(request: Request) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { ids } = data;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '请提供要删除的文章ID' },
        { status: 400 }
      );
    }

    // 验证所有ID是否为有效数字
    const validIds = ids.filter(id => !isNaN(Number(id))).map(id => Number(id));
    
    if (validIds.length === 0) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '请提供有效的文章ID' },
        { status: 400 }
      );
    }

    // 检查文章是否存在且属于当前用户
    const existingPosts = await prisma.post.findMany({
      where: { id: { in: validIds }, authorId: parseInt(session.user.id) }
    });
    
    if (existingPosts.length !== validIds.length) {
      const existingIds = existingPosts.map(post => post.id);
      const unauthorizedIds = validIds.filter(id => !existingIds.includes(id));
      
      return NextResponse.json<ApiResponseVO>(
        { 
          success: false, 
          error: `您无权删除文章ID ${unauthorizedIds.join(', ')}` 
        },
        { status: 403 }
      );
    }

    // 先删除关联关系
    await Promise.all([
      prisma.categoriesOnPosts.deleteMany({
        where: { postId: { in: validIds } }
      })
    ]);

    // 批量删除文章
    await prisma.post.deleteMany({
      where: { id: { in: validIds } }
    });

    return NextResponse.json<ApiResponseVO>(
      { success: true, message: `成功删除了 ${validIds.length} 篇文章` }
    );
  } catch (error) {
    console.error('批量删除文章失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '批量删除文章失败' },
      { status: 500 }
    );
  }
}

// 获取文章列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 构建查询参数对象
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId') || '0') : undefined,
      tagId: searchParams.get('tagId') ? parseInt(searchParams.get('tagId') || '0') : undefined,
      authorId: searchParams.get('authorId') ? parseInt(searchParams.get('authorId') || '0') : undefined,
      published: searchParams.get('published') === 'true' ? true : searchParams.get('published') === 'false' ? false : undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    };
    
    // 验证查询参数
    const validationResult = PostQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json<ApiResponseVO>(
        { 
          success: false, 
          error: validationResult.error.issues[0]?.message || '查询参数验证失败' 
        },
        { status: 400 }
      );
    }

    const { page, limit, search, categoryId, tagId, authorId, published, sortBy, sortOrder } = validationResult.data;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (categoryId) where.categories = { some: { categoryId } };
    if (tagId) where.tags = { some: { id: tagId } };
    if (authorId) where.authorId = authorId;
    if (published !== undefined) where.published = published;

    // 查询文章总数和列表
    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, createdAt: true, updatedAt: true } },
          tags: { select: { id: true, name: true } },
          categories: {
            include: {
              category: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      })
    ]);

    // 格式化数据
    const formattedPosts = posts.map(formatPostToVO);

    const result: PaginationResultVO<PostListItemVO> = {
      items: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    return NextResponse.json<ApiResponseVO<PaginationResultVO<PostListItemVO>>>({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: Request) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 验证请求数据
    const data = await request.json();
    const validationResult = CreatePostSchema.safeParse(data);
    
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
      published = false, 
      categoryIds = [], 
      categoryNames = [], 
      tagNames = [] 
    } = validationResult.data;

    // 生成slug（如果未提供）
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 检查slug是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });

    if (existingPost) {
      // 添加时间戳确保唯一性
      const uniqueSlug = `${slug}-${Date.now()}`;
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: `该标题的slug已被使用，请使用不同标题或手动指定slug`, data: { suggestedSlug: uniqueSlug } },
        { status: 400 }
      );
    }

    // 处理标签
    const tagCreateOrConnect = tagNames.map((tagName: string) => ({
      where: { name: tagName },
      create: { name: tagName }
    }));

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

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        published,
        authorId: parseInt(session.user.id),
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

    // 格式化返回数据
    const formattedPost = formatPostToVO(post);

    return NextResponse.json<ApiResponseVO<PostListItemVO>>(
      { success: true, data: formattedPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '创建文章失败' },
      { status: 500 }
    );
  }
}
