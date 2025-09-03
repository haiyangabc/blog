import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { LoginCredentials } from "@/types/auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 类型检查
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        // 检查用户是否存在
        if (!user) {
          throw new Error("用户不存在");
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("密码不正确");
        }

        // 返回用户信息（不包含密码）
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: "/login", // 自定义登录页面
    error: "/login", // 错误页面指向登录页
  },
  callbacks: {
    async jwt({ token, user }) {
      // 登录时将用户ID添加到token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 将用户ID添加到session
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
