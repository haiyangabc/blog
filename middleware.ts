// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {auth} from '@/auth'


// 1. 使用命名导出
export async function middleware(request: NextRequest) {
  // 在这里添加你的中间件逻辑

  return NextResponse.next()
}
