// import '@radix-ui/themes/styles.css';
import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper";
import { Header } from "@/components/header"



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
          <AuthWrapper>
            <div className=" h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthWrapper>
      </body>
    </html>
  )
}

