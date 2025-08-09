"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationButton } from "@/components/notification-button"
import { Sidebar } from "@/components/sidebar"
import { Menu, Home, FileText, Calendar, User } from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [userInfo, setUserInfo] = useState({ name: "", cargo: "" })
  const [userCargo, setUserCargo] = useState<number>(1)
  const pathname = usePathname()

  // Obtener cargo y datos de usuario solo en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCargo = Number.parseInt(localStorage.getItem("userCargo") || "1")
      setUserCargo(storedCargo)

      const userName = localStorage.getItem("userName") || "Usuario"
      const cargoNames = {
        "1": "Administrador",
        "2": "Supervisor",
        "3": "Asesor",
      }
      setUserInfo({
        name: userName,
        cargo: cargoNames[String(storedCargo) as keyof typeof cargoNames] || "Usuario",
      })
    }
  }, [])

  // Auto-expand menus
  useEffect(() => {
    if (pathname.includes("/justificaciones")) {
      setExpandedMenus((prev) => (prev.includes("justificaciones") ? prev : [...prev, "justificaciones"]))
    }
    if (pathname.includes("/vacaciones")) {
      setExpandedMenus((prev) => (prev.includes("vacaciones") ? prev : [...prev, "vacaciones"]))
    }
  }, [pathname])

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      // Limpiar cookies
      document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "userCargo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Limpiar localStorage
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("username")
      localStorage.removeItem("userName")
      localStorage.removeItem("userCargo")

      window.location.href = "/"
    }
  }

  const getMenuItems = () => {
    type SubItem = { title: string; href: string }
    type MenuItem = {
      id: string
      title: string
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
      href: string
      subItems: SubItem[]
    }

    const baseItems: MenuItem[] = [
      {
        id: "home",
        title: "Dashboard",
        icon: Home,
        href: "/dashboard",
        subItems: [],
      },
    ]

    if (userCargo <= 2) {
      baseItems.push({
        id: "justificaciones",
        title: "Justificaciones",
        icon: FileText,
        href: "#",
        subItems: [
          { title: "Nueva Justificación", href: "/dashboard/justificaciones/nueva" },
          { title: "Listar Justificaciones", href: "/dashboard/justificaciones/listar" },
        ],
      })
    }

    const vacacionesSubItems = [
      { title: "Enviar Solicitud", href: "/dashboard/vacaciones/solicitar" },
      { title: "Mis Solicitudes", href: "/dashboard/vacaciones/mis-solicitudes" },
    ]

    if (userCargo === 1) {
      vacacionesSubItems.push({ title: "Registrar Vacaciones Asesor", href: "/dashboard/vacaciones/registrar-asesor" })
    }

    if (userCargo <= 2) {
      vacacionesSubItems.push({ title: "Solicitudes Asesor", href: "/dashboard/vacaciones/solicitudes-asesor" })
    }

    baseItems.push({
      id: "vacaciones",
      title: "Vacaciones",
      icon: Calendar,
      href: "#",
      subItems: vacacionesSubItems,
    })

    return baseItems
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {/* Header */}
        <header className="bg-background backdrop-blur-sm border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <Sidebar
                  menuItems={getMenuItems()}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  pathname={pathname}
                  onLogout={handleLogout}
                  isMobile={true}
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image src="/icono-logo.png" alt="Logo Central" fill className="object-contain" />
              </div>
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-cyan-700 to-teal-500 
                  dark:from-cyan-400 dark:to-teal-200 bg-clip-text text-transparent">
                  ExpertisNet
                </span>
                <div className="text-xs text-muted-foreground -mt-1">Intranet</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium text-foreground">{userInfo.name}</div>
                <div className="text-xs text-muted-foreground">{userInfo.cargo}</div>
              </div>
            </div>

            <NotificationButton />
            <AnimatedThemeToggler className="cursor-pointer" />
          </div>
        </header>

        <div className="flex">
          <div className="hidden lg:block w-80 border-r border-border bg-background backdrop-blur-sm">
            <Sidebar
              menuItems={getMenuItems()}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              pathname={pathname}
              onLogout={handleLogout}
              isMobile={false}
            />
          </div>

          <main className="flex-1 overflow-hidden">
            <div className="lg:p-4 h-[calc(100vh-4rem)] overflow-y-auto">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
