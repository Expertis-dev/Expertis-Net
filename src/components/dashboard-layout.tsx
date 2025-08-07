"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationButton } from "@/components/notification-button"
import { Sidebar } from "@/components/sidebar"
import { Menu, Home, FileText, Calendar, User } from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [userInfo, setUserInfo] = useState({ name: "", cargo: "" })
  const pathname = usePathname()

  // Obtener información del usuario
  useEffect(() => {
    const userName = localStorage.getItem("userName") || "Usuario"
    const userCargo = localStorage.getItem("userCargo") || "1"

    const cargoNames = {
      "1": "Administrador",
      "2": "Supervisor",
      "3": "Asesor",
    }

    setUserInfo({
      name: userName,
      cargo: cargoNames[userCargo as keyof typeof cargoNames] || "Usuario",
    })
  }, [])

  // Auto-expand menus based on current path
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

  // Obtener cargo del usuario para filtrar menús
  const userCargo = Number.parseInt(localStorage.getItem("userCargo") || "1")

  const getMenuItems = () => {
    type SubItem = { title: string; href: string }
    type MenuItem = {
      id: string
      title: string
      icon: React.ElementType
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

    // Menú de justificaciones (solo admin y supervisor)
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

    // Menú de vacaciones
    const vacacionesSubItems = [
      { title: "Enviar Solicitud", href: "/dashboard/vacaciones/solicitar" },
      { title: "Mis Solicitudes", href: "/dashboard/vacaciones/mis-solicitudes" },
    ]

    // Agregar opciones adicionales según el cargo
    if (userCargo === 1) {
      // Solo administrador
      vacacionesSubItems.push({ title: "Registrar Vacaciones Asesor", href: "/dashboard/vacaciones/registrar-asesor" })
    }

    if (userCargo <= 2) {
      // Admin y supervisor
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
        <header className="bg-background/80 backdrop-blur-sm border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
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
                <span className="font-bold text-lg 
                      bg-gradient-to-r from-cyan-700 to-teal-500 
                    dark:from-cyan-400 dark:to-teal-200 
                      bg-clip-text text-transparent">
                  ExpertisNet
                </span>

                <div className="text-xs text-muted-foreground -mt-1">Intranet</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Información del usuario */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium text-foreground">{userInfo.name}</div>
                <div className="text-xs text-muted-foreground">{userInfo.cargo}</div>
              </div>
            </div>

            <NotificationButton />
            <ModeToggle />
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Desktop */}
          <div className="hidden lg:block w-80 border-r border-border bg-card">
            <Sidebar
              menuItems={getMenuItems()}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              pathname={pathname}
              onLogout={handleLogout}
              isMobile={false}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="p-4 lg:p-6 h-[calc(100vh-4rem)] overflow-y-auto">
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
