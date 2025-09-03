import Link from "next/link"
// import { Github, Twitter, Mail, Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JD</span>
              </div>
              <span className="text-xl font-bold">李世海</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              全栈开发工程师，专注于现代 Web 技术。 通过代码创造价值，用文字传递知识。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Github className="w-5 h-5" /> */}
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Twitter className="w-5 h-5" /> */}
              </a>
              <a href="mailto:john.doe@example.com" className="text-gray-400 hover:text-red-400 transition-colors">
                {/* <Mail className="w-5 h-5" /> */}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/posts" className="text-gray-400 hover:text-white transition-colors">
                  文章
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  关于
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  联系
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">文章分类</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/frontend" className="text-gray-400 hover:text-white transition-colors">
                  前端开发
                </Link>
              </li>
              <li>
                <Link href="/category/backend" className="text-gray-400 hover:text-white transition-colors">
                  后端开发
                </Link>
              </li>
              <li>
                <Link href="/category/tutorial" className="text-gray-400 hover:text-white transition-colors">
                  教程指南
                </Link>
              </li>
              <li>
                <Link href="/category/thoughts" className="text-gray-400 hover:text-white transition-colors">
                  思考感悟
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {currentYear} 李世海. 保留所有权利.</p>
          <p className="text-gray-400 text-sm flex items-center mt-4 sm:mt-0">
            {/* Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> using Next.js & Tailwind CSS */}
          </p>
        </div>
      </div>
    </footer>
  )
}
