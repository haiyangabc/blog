import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateCategorySchema } from '@/lib/dto';
import { CategoryVO, ApiResponseVO, PaginationResultVO } from '@/lib/vo';

const prisma = new PrismaClient();


/**
 * 格式化分类数据为CategoryVO
 */
const formatCategoryToVO = (category: any): CategoryVO => {
  return {
    id: category.id,
    name: category.name,
    postCount: category._count?.posts || 0
  };
};

// 获取分类列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
    
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    // 查询分类总数和列表
    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        include: {
          _count: { select: { posts: true } }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      })
    ]);
    
    // 格式化数据
    const formattedCategories = categories.map(formatCategoryToVO);
    
    const result: PaginationResultVO<CategoryVO> = {
      items: formattedCategories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
    
    return NextResponse.json<ApiResponseVO<PaginationResultVO<CategoryVO>>>({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '获取分类列表失败' },
      { status: 500 }
    );
  }
}

// // 创建分类
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
    const validationResult = CreateCategorySchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json<ApiResponseVO>(
        { 
          success: false, 
          error: validationResult.error.issues[0]?.message || '输入数据验证失败' 
        },
        { status: 400 }
      );
    }

    const { name } = validationResult.data;

    // 检查分类是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '该分类已存在' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name },
      include: {
        _count: { select: { posts: true } }
      }
    });

    const formattedCategory = formatCategoryToVO(category);
    
    return NextResponse.json<ApiResponseVO<CategoryVO>>(
      { success: true, data: formattedCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '创建分类失败' },
      { status: 500 }
    );
  }
}

// // 批量删除分类
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
        { success: false, error: '请提供要删除的分类ID' },
        { status: 400 }
      );
    }

    // 验证所有ID是否为有效数字
    const validIds = ids.filter(id => !isNaN(Number(id))).map(id => Number(id));
    
    if (validIds.length === 0) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '请提供有效的分类ID' },
        { status: 400 }
      );
    }

    // 检查分类是否存在
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: validIds } }
    });
    
    if (existingCategories.length !== validIds.length) {
      const existingIds = existingCategories.map(cat => cat.id);
      const missingIds = validIds.filter(id => !existingIds.includes(id));
      
      return NextResponse.json<ApiResponseVO>(
        { 
          success: false, 
          error: `分类ID ${missingIds.join(', ')} 不存在` 
        },
        { status: 404 }
      );
    }

    // 先删除关联关系
    await prisma.categoriesOnPosts.deleteMany({
      where: { categoryId: { in: validIds } }
    });

    // 再删除分类
    await prisma.category.deleteMany({
      where: { id: { in: validIds } }
    });

    return NextResponse.json<ApiResponseVO>(
      { success: true, message: `成功删除了 ${validIds.length} 个分类` }
    );
  } catch (error) {
    console.error('批量删除分类失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '批量删除分类失败' },
      { status: 500 }
    );
  }
}
