/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import type React from "react"
import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Menu, Home, FileText, Calendar, User, UserPlus, BookCheck } from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler"
import { useUser } from "@/Provider/UserProvider"
import { SocketContext } from "@/Context/SocketContex"
import * as UAParser from "ua-parser-js";

interface DashboardLayoutProps {
  readonly children: React.ReactNode
}

// ================== TIPOS Y HELPERS DE PERMISOS ==================

type Modulo = "Bases" | "Justificaciones" | "Vacaciones" | "Admin"

type Permisos = Partial<Record<Modulo, string[]>>

interface SubItem {
  title: string
  href: string
  modulo?: Modulo       // módulo al que pertenece
  permiso?: string      // nombre del permiso. Si es undefined → acceso libre
}

interface MenuItem {
  id: string
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href: string
  subItems: SubItem[]
}

// Leer permisos desde localStorage (JSON)
export const getPermisosFromStorage = (): Permisos | null => {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem("permisos")
  if (!raw) return null

  try {
    return JSON.parse(raw) as Permisos
  } catch (error) {
    console.error("Error parseando permisos desde localStorage:", error)
    return null
  }
}
export const getRolFromStorage = () => {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem("rol")
  if (!raw) return null

  try {
    return raw.replace(/"/g, "")
    // Resultado: LIDER AREA

  } catch (error) {
    console.error("Error parseando permisos desde localStorage:", error)
    return null
  }
}
// Si no hay permiso definido → ruta libre
export const tienePermiso = (
  permisos: Permisos | null,
  modulo?: Modulo,
  permiso?: string
): boolean => {
  if (!modulo || !permiso) return true

  const lista = permisos?.[modulo]
  if (!Array.isArray(lista)) return false

  return lista.includes(permiso)
}

// ================== CONFIGURACIÓN DEL MENÚ ==================

let MENU_CONFIG: MenuItem[] = [
  {
    id: "home",
    title: "Home",
    icon: Home,
    href: "/dashboard",
    subItems: [],
  },
  {
    id: "bases",
    title: "Bases",
    icon: BookCheck,
    href: "#",
    subItems: [
      {
        title: "Seguimiento Asesor",
        href: "/dashboard/bases",
        modulo: "Bases",
        permiso: "SeguimientoAsesor-ver",
      },
      /*{
        title: "Seguimiento Grupo",
        href: "/dashboard/bases/seguimiento-grupo",
        modulo: "Bases",
        permiso: "SeguimientoGrupo-ver",
      },*/
    ],
  },
  {
    id: "justificaciones",
    title: "Justificaciones",
    icon: FileText,
    href: "#",
    subItems: [
      {
        title: "Nueva Justificación",
        href: "/dashboard/justificaciones/nueva",
        modulo: "Justificaciones",
        permiso: "Justificacion-registrar",
      },
      {
        title: "Listar Justificaciones",
        href: "/dashboard/justificaciones/listar",
        modulo: "Justificaciones",
        permiso: "Justificacion-ver",
      }
    ],
  },
  {
    id: "vacaciones",
    title: "Vacaciones",
    icon: Calendar,
    href: "#",
    subItems: [
      {
        title: "Solicitar Vacaciones",
        href: "/dashboard/vacaciones/solicitar",
        modulo: "Vacaciones",
        permiso: "SolicitarVacaciones-registrar",
      },
      {
        title: "Mis Solicitudes",
        href: "/dashboard/vacaciones/mis-solicitudes",
        modulo: "Vacaciones",
        permiso: "Vacaciones-ver",
      },
      {
        title: "Registrar Vacaciones Asesor",
        href: "/dashboard/vacaciones/registrar-asesor",
        modulo: "Vacaciones",
        permiso: "VacacionesAsesor-registrar",
      },
      {
        title: "Solicitudes Asesores",
        href: "/dashboard/vacaciones/solicitudes-asesor",
        modulo: "Vacaciones",
        permiso: "SolicitudesAsesores-ver",
      },
      {
        title: "Solicitudes Equipo",
        href: "/dashboard/vacaciones/solicitudes-equipo",
        modulo: "Vacaciones",
        permiso: "SolicitudesEquipo-ver",
      },
      {
        title: "Solicitudes Pendientes",
        href: "/dashboard/vacaciones/solicitudes-pendientes",
        modulo: "Vacaciones",
        permiso: "SolicitudesPendientes-ver",
      },
      {
        title: "Solicitudes Aprobadas",
        href: "/dashboard/vacaciones/solicitudes-aprobadas",
        modulo: "Vacaciones",
        permiso: "SolicitudesAprobadas-ver",
      },
      {
        title: "Calendario Jefes Área",
        href: "/dashboard/vacaciones/calendario",
        modulo: "Vacaciones",
        permiso: "CalendarioJefes-ver",
      },
    ],
  },
  /*{
    id: "mcp",
    title: "Consultas Expertito",
    icon: Bot,
    href: "/dashboard/consultas",
    subItems: [], // sin permiso → acceso libre
  },*/
  {
    id: "admin",
    title: "Admin",
    icon: UserPlus,
    href: "#",
    subItems: [
      {
        title: "Crear nuevo empleado",
        href: "/dashboard/admin/crear-empleado",
        modulo: "Admin",
        permiso: "AdminUsuarios-ver",
      },
      {
        title: "Eliminar Empleado",
        href: "/dashboard/admin/eliminar-empleado",
        modulo: "Admin",
        permiso: "AdminUsuarios-ver",
      },
      {
        title: "Carga Masiva Empleados",
        href: "/dashboard/admin/carga-masiva",
        modulo: "Admin",
        permiso: "AdminUsuarios-ver",
      },
      {
        title: "Monitoreo",
        href: "/dashboard/admin/monitoreo",
        modulo: "Admin",
        permiso: "AdminUsuarios-ver",
      },
    ],
  },
]

// ================== COMPONENTE PRINCIPAL ==================
export const handleLogout = () => {
  if (typeof window !== "undefined") {
    document.cookie =
      "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie =
      "username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie =
      "userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie =
      "userCargo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    const numProcesos = window.localStorage.getItem("procesos_realizados") || "0"
    const fechas = window.localStorage.getItem("fecha_procesos") || "1990-01-01"
    window.localStorage.clear()
    window.localStorage.setItem("procesos_realizados", numProcesos)
    window.localStorage.setItem("fecha_procesos", fechas)
    window.location.href = "/"
  }
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const parser = new UAParser.UAParser(navigator.userAgent);
  const browser = parser.getBrowser(); // {name, version}
  const os = parser.getOS();           // {name, version}
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { socket } = useContext(SocketContext)
  const getDeviceId = () => {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("deviceId", id);
    }
    return id;
  };
  const getGeo = () =>
    new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 3000 }
      );
    });
  useEffect(() => {
    if (!socket) return;
    const sendUser = async () => {
      if (!user?.usuario) return;
      const payload = {
        usuario: user.usuario,
        deviceId: getDeviceId(),
        userAgent: `${browser.name || "Unknown"} ${browser.version || ""} ${os.name || "Unknown"} ${os.version || ""}`.trim(),
        geo: await getGeo(), // puede ser null si no hay permiso
        agencia: user.id_grupo === 14 ? "BPO" : "EXPERTIS",
      };
      socket.emit("user", payload);
    };
    const onForceLogout = () => {
      console.warn("Force logout recibido");
      handleLogout()
      window.location.href = "/";
    };

    const onConnect = () => {
      console.log("Conectado al servidor de sockets");
      sendUser();
      socket.on("force-logout", onForceLogout);
    };
    socket.on("connect", onConnect);
    if (socket.connected) sendUser();
    return () => {
      socket.off("connect", onConnect);
      socket.off("force-logout", onForceLogout);
    };
  }, [socket, user?.usuario]);
  useEffect(() => {
    if (pathname.includes("/justificaciones")) {
      setExpandedMenus((prev) =>
        prev.includes("justificaciones") ? prev : [...prev, "justificaciones"],
      )
    }
    if (pathname.includes("/vacaciones")) {
      setExpandedMenus((prev) =>
        prev.includes("vacaciones") ? prev : [...prev, "vacaciones"],
      )
    }
    setMounted(true)
  }, [pathname])

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId],
    )
  }


  const getMenuItems = (): MenuItem[] => {
    // Mientras no haya user, solo mostramos Home para evitar flickers raros
    if (!user) {
      return MENU_CONFIG.filter((item) => item.id === "home")
    }

    const permisos = getPermisosFromStorage()
    MENU_CONFIG = MENU_CONFIG.filter(item => {      
   
      return true
    }
    );
    return (
      MENU_CONFIG
        // Filtramos subItems por permisos; si el menú se queda sin subitems, se oculta
        .map((menu) => {
          if (!menu.subItems || menu.subItems.length === 0) {
            return menu
          }

          const filteredSubItems = menu.subItems.filter((sub) =>
            tienePermiso(permisos, sub.modulo, sub.permiso),
          )

          if (filteredSubItems.length === 0) return null

          return { ...menu, subItems: filteredSubItems }
        })
        .filter(Boolean) as MenuItem[]
    )
  }

  if (!mounted) return null

  const menuItems = getMenuItems()

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {/* Header */}
        <header className="bg-background backdrop-blur-sm border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Sidebar móvil */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 max-h-screen overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                      <Image
                        src="/icono-logo.png"
                        alt="Logo Central"
                        fill
                        sizes="4xl"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-lg bg-gradient-to-r from-cyan-700 to-teal-500 dark:from-cyan-400 dark:to-teal-200 bg-clip-text text-transparent">
                        ExpertisNet
                      </span>
                      <div className="text-xs text-muted-foreground -mt-1">
                        Intranet
                      </div>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="py-1">
                    <div className="font-medium text-foreground">
                      {user?.usuario}, {getRolFromStorage()}
                    </div>
                  </SheetDescription>
                </SheetHeader>

                <Sidebar
                  menuItems={menuItems}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  pathname={pathname}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>

            {/* Logo + título */}
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/icono-logo.png"
                  alt="Logo Central"
                  fill
                  sizes="4xl"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-cyan-700 to-teal-500 dark:from-cyan-400 dark:to-teal-200 bg-clip-text text-transparent">
                  ExpertisNet
                </span>
                <div className="text-xs text-muted-foreground -mt-1">
                  Intranet
                </div>
              </div>
            </div>
          </div>

          {/* Usuario + theme toggler */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              {user && (
                <div className="text-sm">
                  <div className="font-medium text-foreground">
                    {user.usuario}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getRolFromStorage()}
                  </div>
                </div>
              )}
            </div>
            <AnimatedThemeToggler className="cursor-pointer" />
          </div>
        </header>

        {/* Layout principal */}
        <div className="flex">
          {/* Sidebar desktop */}
          <div className="h-[calc(100vh-4rem)] overflow-y-auto hidden lg:block w-72 border-r border-border bg-background backdrop-blur-sm sidebar-scroll">
            <Sidebar
              menuItems={menuItems}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              pathname={pathname}
              onLogout={handleLogout}
            />
          </div>

          {/* Contenido */}
          <main className="flex-1 overflow-hidden">
            <div className="p-4 h-[calc(100vh-4rem)] overflow-y-auto sidebar-scroll">
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
