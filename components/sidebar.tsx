import Tag from "@/components/ui/Tag";
// import TrendingUp from "@/components/ui/TrendingUp";
import Link from "next/link"

export function Sidebar() {
  const categories = [
    { name: "技术", count: 15, href: "/category/tech" },
    { name: "生活", count: 8, href: "/category/life" },
    { name: "读书", count: 5, href: "/category/books" },
    { name: "旅行", count: 3, href: "/category/travel" },
  ]

  const tags = ["React", "Next.js", "TypeScript", "JavaScript", "CSS", "Node.js", "Python", "设计"]

  const recentPosts = [
    {
      title: "如何使用 Next.js 构建现代化博客",
      date: "2024-01-15",
      href: "/post/nextjs-blog",
    },
    {
      title: "TypeScript 最佳实践指南",
      date: "2024-01-10",
      href: "/post/typescript-guide",
    },
    {
      title: "CSS Grid 布局完全指南",
      date: "2024-01-05",
      href: "/post/css-grid-guide",
    },
  ]

  return (
    <aside className="space-y-6">
     

      
    </aside>
  )
}
