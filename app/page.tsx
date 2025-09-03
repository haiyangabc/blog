'use client'
import { HeroSection } from "@/components/hero-section"
import { LatestPosts } from "@/components/latest-posts"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { title } from "process"
import { useEffect } from "react"
import { toast } from "sonner"
export default function HomePage() {
  

  return (
    <div >
      <main>
        <HeroSection />
        <LatestPosts />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  )
}
