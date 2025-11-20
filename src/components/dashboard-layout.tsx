"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Menu, Home, FileText, Calendar, User, UserPlus, Bot } from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler"
import { useUser } from "@/Provider/UserProvider"

interface DashboardLayoutProps {
  readonly children: React.ReactNode
}
interface SubItem { title: string; href: string }
interface MenuItem {
  id: string
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href: string
  subItems: SubItem[]
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false);
  // Auto-expand menus
  useEffect(() => {
    if (pathname.includes("/justificaciones")) {
      setExpandedMenus((prev) => (prev.includes("justificaciones") ? prev : [...prev, "justificaciones"]))
    }
    if (pathname.includes("/vacaciones")) {
      setExpandedMenus((prev) => (prev.includes("vacaciones") ? prev : [...prev, "vacaciones"]))
    }
    setMounted(true);
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
      localStorage.clear();
      window.location.href = "/"
    }
  }

  const getMenuItems = () => {
    const baseItems: MenuItem[] = [
      {
        id: "home",
        title: "Home",
        icon: Home,
        href: "/dashboard",
        subItems: [],
      },
    ]
    if (!user) return baseItems // si no hay user aún


    // 🔹 JUSTIFICACIONES
    if (
      user.id_cargo !== 9 &&
      [5, 7, 8, 1, 3, 21, 4].includes(user.id_cargo)
    ) {
      const subItems: SubItem[] = []

      if ([5, 7, 8].includes(user.id_cargo)) {
        subItems.push({
          title: "Nueva Justificación",
          href: "/dashboard/justificaciones/nueva",
        })
      }

      subItems.push({
        title: "Listar Justificaciones",
        href: "/dashboard/justificaciones/listar",
      })

      baseItems.push({
        id: "justificaciones",
        title: "Justificaciones",
        icon: FileText,
        href: "#",
        subItems,
      })
    }
    // 🔹 VACACIONES
    if (user.id_cargo !== 6) {
      const vacacionesSubItems: SubItem[] = []
      if (user.id_cargo !== 9) {
        vacacionesSubItems.push(
          { title: "Enviar Solicitud", href: "/dashboard/vacaciones/solicitar" },
          { title: "Mis Solicitudes", href: "/dashboard/vacaciones/mis-solicitudes" },
        )
      }
      if (user.id_cargo === 5) {
        vacacionesSubItems.push(
          { title: "Registrar Vacaciones Asesor", href: "/dashboard/vacaciones/registrar-asesor" },
          { title: "Solicitudes Asesores", href: "/dashboard/vacaciones/solicitudes-asesor" },
        )
      }

      if ((user.idEmpleado === user.idJefe && user.id_cargo !== 9) || user.idEmpleado === 214) {
        vacacionesSubItems.push({
          title: "Solicitudes Equipo",
          href: "/dashboard/vacaciones/solicitudes-equipo",
        })
      }

      if (user.id_cargo === 9 || user.idEmpleado === 179) {
        vacacionesSubItems.push({
          title: "Solicitudes Aprobadas",
          href: "/dashboard/vacaciones/solicitudes-aprobadas",
        })
      }
      if (user.id_cargo === 9) {
        vacacionesSubItems.push(
          { title: "Solicitudes Pendientes", href: "/dashboard/vacaciones/solicitudes-pendientes" },
          { title: "Calendario Jefes Área", href: "/dashboard/vacaciones/calendario" },
        )
      }
      baseItems.push({
        id: "mcp",
        title: "Consultas Expertito",
        icon: Bot,
        href: "/dashboard/consultas",
        subItems: [],
      })
      baseItems.push(
        {
          id: "vacaciones",
          title: "Vacaciones",
          icon: Calendar,
          href: "#",
          subItems: vacacionesSubItems,
        },
        {
          id: "admin",
          title: "Admin",
          icon: UserPlus,
          href: "#",
          subItems: [
            {
              title: "Crear nuevo empleado",
              href: "/dashboard/admin/crear-empleado",
            },
            {
              title: "Eliminar Empleado",
              href: "/dashboard/admin/eliminar-empleado",
            },
            {
              title: "Carga Masiva Empleados",
              href: "/dashboard/admin/carga-masiva",
            }
          ],
        }
      )
    }
    return baseItems
  }
  if (!mounted) return null;
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
              <SheetContent side="left" className="w-72 max-h-screen overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                      <Image src="/icono-logo.png" alt="Logo Central" fill sizes="4xl" className="object-contain" />
                    </div>
                    <div>
                      <span className="font-bold text-lg bg-gradient-to-r from-cyan-700 to-teal-500 dark:from-cyan-400 dark:to-teal-200 bg-clip-text text-transparent">
                        ExpertisNet
                      </span>
                      <div className="text-xs text-muted-foreground -mt-1">Intranet</div>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="py-1">
                    <div className="font-medium text-foreground">{user?.usuario}, {user?.cargo}</div>
                  </SheetDescription>
                </SheetHeader>
                <Sidebar
                  menuItems={getMenuItems()}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  pathname={pathname}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image src="/icono-logo.png" alt="Logo Central" fill sizes="4xl" className="object-contain" />
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
              {user && (
                <div className="text-sm">
                  <div className="font-medium text-foreground">{user.usuario}</div>
                  <div className="text-xs text-muted-foreground">{user.cargo}</div>
                </div>
              )}
            </div>
            {/* <NotificationButton /> */}
            <AnimatedThemeToggler className="cursor-pointer" />
          </div>
        </header>
        <div className="flex">
          <div className="hidden lg:block w-72 border-r border-border bg-background backdrop-blur-sm">
            <Sidebar
              menuItems={getMenuItems()}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              pathname={pathname}
              onLogout={handleLogout}
            />
          </div>

          <main className="flex-1 overflow-hidden">
            <div className="p-4 h-[calc(100vh-4rem)] overflow-y-auto">
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
