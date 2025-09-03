import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateTagSchema } from '@/lib/dto';
import { TagVO, ApiResponseVO } from '@/lib/vo';

const prisma = new PrismaClient();

// 格式化标签数据为 TagVO 格式
const formatTagToVO = (tag: any): TagVO => ({
  id: tag.id,
  name: tag.name,
  postCount: tag._count?.posts || 0
});

// 获取标签列表
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeCount = url.searchParams.get('includeCount') !== 'false';
    const search = url.searchParams.get('search');
    
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const tags = await prisma.tag.findMany({
      where,
      include: includeCount
        ? { _count: { select: { posts: true } } }
        : undefined,
      orderBy: { name: 'asc' }
    });

    // 格式化为 TagVO
    const formattedTags = tags.map(formatTagToVO);

    const response: ApiResponseVO<TagVO[]> = {
      success: true,
      data: formattedTags,
      message: '获取标签列表成功'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取标签列表失败:', error);
    const response: ApiResponseVO = {
      success: false,
      message: '获取标签列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// 创建标签
export async function POST(request: Request) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      const response: ApiResponseVO = {
        success: false,
        message: '请先登录'
      };
      return NextResponse.json(response, { status: 401 });
    }

    const body = await request.json();
    
    // 使用 DTO 验证输入
    const validation = CreateTagSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponseVO = {
        success: false,
        message: '输入验证失败',
        error: validation.error.issues.map(issue => issue.message).join(', ')
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { name } = validation.data;

    // 检查标签是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag) {
      const response: ApiResponseVO = {
        success: false,
        message: '该标签已存在'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: { name },
      include: { _count: { select: { posts: true } } }
    });

    // 格式化为 TagVO
    const formattedTag = formatTagToVO(tag);

    const response: ApiResponseVO<TagVO> = {
      success: true,
      data: formattedTag,
      message: '标签创建成功'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('创建标签失败:', error);
    const response: ApiResponseVO = {
      success: false,
      message: '创建标签失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
    return NextResponse.json(response, { status: 500 });
  }
}



// 批量删除标签
export async function DELETE(request: Request) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      const response: ApiResponseVO = {
        success: false,
        message: '请先登录'
      };
      return NextResponse.json(response, { status: 401 });
    }

    // 批量删除
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      const response: ApiResponseVO = {
        success: false,
        message: '请提供要删除的标签ID列表'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 验证所有ID是否为有效的数字
    const invalidIds = ids.filter(id => isNaN(parseInt(id, 10)) || parseInt(id, 10) <= 0);
    if (invalidIds.length > 0) {
      const response: ApiResponseVO = {
        success: false,
        message: `无效的标签ID: ${invalidIds.join(', ')}`
      };
      return NextResponse.json(response, { status: 400 });
    }

    const numericIds = ids.map(id => parseInt(id, 10));

    // 检查要删除的标签是否存在
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: numericIds } }
    });

    if (existingTags.length !== numericIds.length) {
      const existingIds = new Set(existingTags.map(tag => tag.id));
      const nonExistingIds = numericIds.filter(id => !existingIds.has(id));
      const response: ApiResponseVO = {
        success: false,
        message: `以下标签不存在: ${nonExistingIds.join(', ')}`
      };
      return NextResponse.json(response, { status: 404 });
    }

    await prisma.tag.deleteMany({
      where: { id: { in: numericIds } }
    });

    const response: ApiResponseVO = {
      success: true,
      message: '标签已批量删除'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('批量删除标签失败:', error);
    const response: ApiResponseVO = {
      success: false,
      message: '批量删除标签失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
