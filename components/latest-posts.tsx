import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react"

interface Post {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  tags: string[]
  image: string
  slug: string
}

const posts: Post[] = [
  {
    id: "1",
    title: "Next.js 14 新特性深度解析",
    excerpt: "探索 Next.js 14 带来的革命性变化，包括 App Router 的完善、Server Actions 的优化，以及性能提升的细节。",
    date: "2024-01-15",
    readTime: "8 分钟",
    category: "前端开发",
    tags: ["Next.js", "React", "Web开发"],
    image: "/placeholder.svg?height=200&width=300",
    slug: "nextjs-14-features",
  },
  {
    id: "2",
    title: "TypeScript 高级类型系统实战",
    excerpt: "深入理解 TypeScript 的高级类型系统，掌握泛型、条件类型、映射类型等核心概念，提升代码质量。",
    date: "2024-01-10",
    readTime: "12 分钟",
    category: "编程语言",
    tags: ["TypeScript", "类型系统", "最佳实践"],
    image: "/placeholder.svg?height=200&width=300",
    slug: "typescript-advanced-types",
  },
  {
    id: "3",
    title: "现代 CSS 布局技巧与实践",
    excerpt: "从 Flexbox 到 Grid，从响应式设计到容器查询，全面掌握现代 CSS 布局的核心技术。",
    date: "2024-01-05",
    readTime: "10 分钟",
    category: "前端开发",
    tags: ["CSS", "布局", "响应式"],
    image: "/placeholder.svg?height=200&width=300",
    slug: "modern-css-layout",
  },
]

export function LatestPosts() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">最新文章</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">分享我在开发过程中的经验、思考和技术见解</p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              {/* Post Image */}
              <div className="relative h-48 overflow-hidden">
                {/* <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                /> */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-4">{post.date}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
                    >
                      {/* <Tag className="w-3 h-3 mr-1" /> */}
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/posts/${post.slug}`}
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors group"
                >
                  阅读全文
                  {/* <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" /> */}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Posts Button */}
        <div className="text-center">
          <Link
            href="/posts"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 group"
          >
            查看所有文章
            {/* <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /> */}
          </Link>
        </div>
      </div>
    </section>
  )
}
