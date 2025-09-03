import Image from "next/image"
import Link from "next/link"
// import { ArrowRight, Download } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                你好，我是
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  李世海
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed">全栈开发工程师 & 技术博主</p>
              <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                专注于现代 Web 开发技术，热爱分享编程经验和技术见解。 通过代码创造价值，用文字传递知识。
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/posts"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 group"
              >
                查看我的文章
                {/* <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /> */}
              </Link>
              <Link
                href="/resume.pdf"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Download className="mr-2 w-4 h-4" /> */}
                下载简历
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">技术文章</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">文章阅读</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">3年+</div>
                <div className="text-sm text-gray-600">开发经验</div>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-2xl">👋</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xl">💻</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
