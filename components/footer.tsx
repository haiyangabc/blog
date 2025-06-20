import { BookOpen, Github, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">我的博客</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              分享技术见解、生活感悟和学习心得。致力于创造有价值的内容，与读者一起成长。
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:contact@example.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  关于我
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  联系方式
                </Link>
              </li>
              <li>
                <Link href="/rss" className="text-muted-foreground hover:text-foreground transition-colors">
                  RSS 订阅
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">分类</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/tech" className="text-muted-foreground hover:text-foreground transition-colors">
                  技术
                </Link>
              </li>
              <li>
                <Link href="/category/life" className="text-muted-foreground hover:text-foreground transition-colors">
                  生活
                </Link>
              </li>
              <li>
                <Link href="/category/books" className="text-muted-foreground hover:text-foreground transition-colors">
                  读书
                </Link>
              </li>
              <li>
                <Link href="/category/travel" className="text-muted-foreground hover:text-foreground transition-colors">
                  旅行
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 我的博客. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}
