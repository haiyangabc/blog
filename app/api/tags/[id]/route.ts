import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UpdateTagSchema } from '@/lib/dto';
import { TagVO, ApiResponseVO } from '@/lib/vo';

const prisma = new PrismaClient();

// 格式化标签数据为 TagVO 格式
const formatTagToVO = (tag: any): TagVO => ({
  id: tag.id,
  name: tag.name,
  postCount: tag._count?.posts || 0
});

// 获取单个标签
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId) || numericId <= 0) {
      const response: ApiResponseVO = {
        success: false,
        message: '无效的标签ID'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const tag = await prisma.tag.findUnique({
      where: { id: numericId },
      include: { _count: { select: { posts: true } } }
    });

    if (!tag) {
      const response: ApiResponseVO = {
        success: false,
        message: '标签不存在'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // 格式化为 TagVO
    const formattedTag = formatTagToVO(tag);

    const response: ApiResponseVO<TagVO> = {
      success: true,
      data: formattedTag,
      message: '获取标签成功'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取标签失败:', error);
    const response: ApiResponseVO = {
      success: false,
      message: '获取标签失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// 更新标签
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId) || numericId <= 0) {
      const response: ApiResponseVO = {
        success: false,
        message: '无效的标签ID'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();
    
    // 使用 DTO 验证输入
    const validation = UpdateTagSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponseVO = {
        success: false,
        message: '输入验证失败',
        error: validation.error.issues.map(issue => issue.message).join(', ')
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { name } = validation.data;

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: numericId }
    });

    if (!existingTag) {
      const response: ApiResponseVO = {
        success: false,
        message: '标签不存在'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // 检查新名称是否已被其他标签使用
    const nameExists = await prisma.tag.findUnique({
      where: { name }
    });

    if (nameExists && nameExists.id !== numericId) {
      const response: ApiResponseVO = {
        success: false,
        message: '该标签名称已被使用'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const updatedTag = await prisma.tag.update({
      where: { id: numericId },
      data: { name },
      include: { _count: { select: { posts: true } } }
    });

    // 格式化为 TagVO
    const formattedTag = formatTagToVO(updatedTag);

    const response: ApiResponseVO<TagVO> = {
      success: true,
      data: formattedTag,
      message: '标签更新成功'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('更新标签失败:', error);
    const response: ApiResponseVO = {
      success: false,
      message: '更新标签失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// 删除单个标签
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId) || numericId <= 0) {
      const response: ApiResponseVO = {
        success: false,
        message: '无效的标签ID'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 检查要删除的标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: numericId }
    });

    if (!existingTag) {
      const response: ApiResponseVO = {
        success: false,
        message: '标签不存在'
      };
      return NextResponse.json(response, { status: 404 });
    }

    await prisma.tag.delete({
      where: { id: numericId }
    });

    const response: ApiResponseVO = {
      success: true,
      message: '标签已删除'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('删除标签失败:', error);
    const response: ApiResponseVO = {
      success: false,
      message: '删除标签失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
    return NextResponse.json(response, { status: 500 });
  }
}