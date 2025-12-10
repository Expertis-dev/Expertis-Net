"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSpeechAuth } from "@/modules/speech/context/SpeechAuthContext"
import { useUser } from "@/Provider/UserProvider"
import "./SideNav.css"

interface NavItem {
  label: string
  icon: string
  route: string
  permiso?: string
  permisoModulo?: string
}

const navItems: NavItem[] = [
  {
    label: "Tablero",
    icon: "fas fa-chart-pie",
    route: "tablero",
    permiso: "PERMISO_Tablero-ver",
  },
  {
    label: "Pagos",
    icon: "fas fa-money-bill-wave",
    route: "pagos",
    permisoModulo: "Pagos",
  },
  {
    label: "Calidad",
    icon: "fas fa-award",
    route: "calidad",
    permisoModulo: "Calidad",
  },
  {
    label: "Reclamos",
    icon: "fas fa-exclamation-circle",
    route: "reclamos",
    permisoModulo: "Reclamos",
  },
  {
    label: "Ajustes",
    icon: "fas fa-sliders-h",
    route: "ajustes",
    permisoModulo: "Speech",
  },
]

export const SideNav = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const { hasPermiso, tienePermisoModulo } = useSpeechAuth()

  const [collapsed, setCollapsed] = useState(false)

  const alias = useMemo(() => {
    if (user?.usuario) {
      return user.usuario
    }
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("alias")
      if (stored) return stored
    }
    return "Usuario"
  }, [user])

  const initial = alias.trim().charAt(0).toUpperCase()
  const [nombre, apellido] = alias.trim().split(" ")

  const visibleItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.permiso && !hasPermiso(item.permiso)) return false
        if (item.permisoModulo && !tienePermisoModulo(item.permisoModulo)) return false
        return true
      }),
    [hasPermiso, tienePermisoModulo],
  )

  const currentRoute = useMemo(() => {
    if (!pathname) return ""
    if (pathname.startsWith("/speech/")) {
      return pathname.replace("/speech/", "")
    }
    return pathname.replace("/speech", "")
  }, [pathname])

  const goTo = (route: string) => {
    router.push(`/speech/${route}`)
  }

  const cerrarSesion = () => {
    if (typeof window === "undefined") return
    if (!window.confirm("¿Estás seguro de que deseas cerrar sesión?")) return
    const procesos = window.localStorage.getItem("procesos_realizados") ?? "0"
    const fechas = window.localStorage.getItem("fecha_procesos") ?? ""
    window.localStorage.clear()
    window.localStorage.setItem("procesos_realizados", procesos)
    window.localStorage.setItem("fecha_procesos", fechas)
    window.location.href = "/"
  }

  const isActive = (route: string) => {
    if (!currentRoute) return route === "tablero"
    if (collapsed) {
      return currentRoute.startsWith(route)
    }
    return currentRoute === route
  }

  return (
    <div className="layout-wrapper">
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <button
          className="toggle-btn"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          <i className={`fas fa-${collapsed ? "angle-right" : "angle-left"}`}></i>
        </button>

        <div className="user-section">
          <div className="user-avatar">{initial || "U"}</div>
          {!collapsed && (
            <div className="user-info-container">
              <div className="user-nombre-apellido">
                <span className="nombre">{nombre ?? ""}</span>
                {apellido && <span className="apellido"> {apellido}</span>}
              </div>
            </div>
          )}
        </div>

        <div className="divider" />

        <nav className="nav-list">
          {visibleItems.map((item) => (
            <button
              key={item.route}
              className={`nav-btn ${isActive(item.route) ? "active" : ""}`}
              onClick={() => goTo(item.route)}
              title={collapsed ? item.label : ""}
            >
              <i className={item.icon}></i>
              {!collapsed && <span className="nav-text">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="divider" />

        <button className="nav-btn logout-btn" onClick={cerrarSesion} title={collapsed ? "Cerrar sesión" : ""}>
          <i className="fas fa-sign-out-alt"></i>
          {!collapsed && <span className="nav-text">Cerrar Sesión</span>}
        </button>

        {!collapsed && (
          <div className="sidebar-footer">
            <span className="app-version">Speech Analytics v2.0</span>
          </div>
        )}
      </div>

      <div className={`main-content ${collapsed ? "sidebar-collapsed" : ""}`}>{children}</div>
    </div>
  )
}

export default SideNav
