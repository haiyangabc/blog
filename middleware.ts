// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. 使用命名导出
export function middleware(request: NextRequest) {
  // 在这里添加你的中间件逻辑
  
  // 示例：简单的请求日志
  console.log(`[Middleware] ${request.method} ${request.url}`)
  
  // 继续处理请求
  return NextResponse.next()
}

// 或者使用默认导出（二选一）
// export default function middleware(request: NextRequest) {
//   return NextResponse.next()
// }