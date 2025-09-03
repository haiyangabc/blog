import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { RegisterData } from "@/types/auth";

const prisma = new PrismaClient();

// 密码强度验证
const isStrongPassword = (password: string): boolean => {
  // 至少8个字符，包含字母和数字
  const minLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  return minLength && hasLetters && hasNumbers;
};

// 邮箱格式验证
const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(req: Request) {
  try {
    const body: RegisterData = await req.json();
    const { email, password, name } = body;

    // 基础验证
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ message: "请填写所有必填字段" }),
        { status: 400 }
      );
    }

    // 邮箱格式验证
    if (!isEmailValid(email)) {
      return new Response(
        JSON.stringify({ message: "请输入有效的邮箱地址" }),
        { status: 400 }
      );
    }

    // 密码强度验证
    if (!isStrongPassword(password)) {
      return new Response(
        JSON.stringify({ 
          message: "密码至少需要8个字符，且包含字母和数字" 
        }),
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "该邮箱已被注册" }),
        { status: 400 }
      );
    }

    // 密码加密（增加盐值复杂度）
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return new Response(
      JSON.stringify({ 
        message: "用户注册成功",
        user 
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("注册失败:", error);
    return new Response(
      JSON.stringify({ message: "注册失败，请稍后再试" }),
      { status: 500 }
    );
  }
}
