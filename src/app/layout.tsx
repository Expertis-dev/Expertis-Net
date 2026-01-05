import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { UserProvider } from "@/Provider/UserProvider"
import ReactQueryProvider from "@/Provider/ReactQueryProvider"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "ExpertisNet",
  description: "Sistema de gestion empresarial",
}
export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ReactQueryProvider>
          <UserProvider>
            {children}
            <Toaster position="top-right" richColors theme="system" />
          </UserProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
