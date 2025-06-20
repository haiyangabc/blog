// import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Badge from "@/components/ui/Badge"
// import { Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogPostCardProps {
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  image?: string
  href: string
}

export function BlogPostCard({
  title,
  excerpt,
  author,
  date,
  readTime,
  category,
  tags,
  image,
  href,
}: BlogPostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      {image && (
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      </div>
  )
}
