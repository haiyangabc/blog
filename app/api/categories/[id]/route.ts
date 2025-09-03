import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UpdateCategorySchema } from '@/lib/dto';
import { CategoryVO, ApiResponseVO } from '@/lib/vo';

const prisma = new PrismaClient();

export const runtime = 'edge';

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

/**
 * 获取单个分类详情
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无效的分类ID' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { posts: true } }
      }
    });

    if (!category) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '分类不存在' },
        { status: 404 }
      );
    }

    const formattedCategory = formatCategoryToVO(category);
    
    return NextResponse.json<ApiResponseVO<CategoryVO>>(
      { success: true, data: formattedCategory }
    );
  } catch (error) {
    console.error('获取分类详情失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '获取分类详情失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新分类
 */
export async function PUT(
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

    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无效的分类ID' },
        { status: 400 }
      );
    }

    // 验证请求数据
    const data = await request.json();
    const validationResult = UpdateCategorySchema.safeParse(data);
    
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

    // 验证分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查分类名是否已被使用
    const nameExists = await prisma.category.findFirst({
      where: { name, id: { not: categoryId } }
    });

    if (nameExists) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '该分类名称已存在' },
        { status: 400 }
      );
    }

    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
      include: {
        _count: { select: { posts: true } }
      }
    });

    const formattedCategory = formatCategoryToVO(updatedCategory);
    
    return NextResponse.json<ApiResponseVO<CategoryVO>>(
      { success: true, data: formattedCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '更新分类失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除单个分类
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

    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '无效的分类ID' },
        { status: 400 }
      );
    }

    // 验证分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json<ApiResponseVO>(
        { success: false, error: '分类不存在' },
        { status: 404 }
      );
    }

    // 先删除关联关系
    await prisma.categoriesOnPosts.deleteMany({
      where: { categoryId }
    });

    // 删除分类
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json<ApiResponseVO>(
      { success: true, message: '分类已成功删除' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json<ApiResponseVO>(
      { success: false, error: '删除分类失败' },
      { status: 500 }
    );
  }
}