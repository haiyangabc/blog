'use client'
import React, { useState, useEffect } from 'react';
import Link from "next/link"
import { Menu, X, User, CircleUserRound,Home } from "lucide-react"
import { useSession,  signOut } from "next-auth/react"


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  const onLogout = () => {

  }

  const navigation = [
    // { name: "首页", href: "/", icon: Home },
    // { name: "文章", href: "/posts", icon: BookOpen },
    {name: "首页", href: "/"},
    // { name: "关于我", href: "#aboutMe", icon: IconUserCircle },
    { name: "发表文章", href: "/publish"},
  ]

  return (
    <header className={`  z-50 w-full  bg-background/95  backdrop-blur border-b supports-[backdrop-filter]:bg-background/60`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
            <span className="text-xl font-bold text-gray-900">李世海</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Social Links */}
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
              <Link
                href="https://github.com"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Github className="w-5 h-5" /> */}
              </Link>
              <Link
                href="https://twitter.com"
                className="text-gray-600 hover:text-blue-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Twitter className="w-5 h-5" /> */}
              </Link>
            </div>
          </div>
          {/* Login button */}
          {session ? (
          //   <AlertDialog>
          //   <AlertDialogTrigger>
          //   <button 
          //     onClick={onLogout}
          //     className="text-gray-700 gap-2 h-8 px-2 flex space-x-1 items-center  transition-colors"
          //   >
          //     <CircleUserRound   className="w-5 h-8"/>
          //     <span className=" leading-5">登出</span>
          //   </button>
          //   </AlertDialogTrigger>
          //   <AlertDialogContent>
          //     <AlertDialogHeader>
          //       <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
          //       <AlertDialogDescription>
          //         点击确认后将退出当前账号。
          //       </AlertDialogDescription>
          //     </AlertDialogHeader>
          //     <AlertDialogFooter>
          //       <AlertDialogCancel>取消</AlertDialogCancel>
          //       <AlertDialogAction onClick={() => signOut()}>
          //         确认退出
          //       </AlertDialogAction>
          //     </AlertDialogFooter>
          //   </AlertDialogContent>
          // </AlertDialog>
            <button 
              onClick={onLogout}
              className="text-gray-700 gap-2 h-8 px-2 flex space-x-1 items-center  transition-colors"
            >
              <CircleUserRound   className="w-5 h-8"/>
              <span className=" leading-5">登出</span>
            </button>
          ) : (
            <Link href="/login" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <CircleUserRound   className="w-5 h-5"/>
              <span className=" leading-5">登录</span>
            </Link>
          )}
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Mobile Social Links */}
              <div className="flex items-center space-x-4 px-3 py-2">
                <Link
                  href="https://github.com"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* <Github className="w-5 h-5" /> */}
                </Link>
                <Link
                  href="https://twitter.com"
                  className="text-gray-600 hover:text-blue-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* <Twitter className="w-5 h-5" /> */}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
