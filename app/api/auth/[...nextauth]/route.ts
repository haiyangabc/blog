import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // 推荐将配置抽离到 lib 目录

// App Router 中通过 export 导出 NextAuth 处理函数
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };