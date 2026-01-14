import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simulación de datos de usuario (en producción vendría de una base de datos)
const users = {
  admin: { name: "Juan Pérez", idCargo: 1 }, // Administrador
  supervisor: { name: "María García", idCargo: 2 }, // Supervisor
  asesor: { name: "Carlos López", idCargo: 3 }, // Asesor
}

const speechRoutes = [
  "/dashboard/speech",
  "/dashboard/speech/tablero",
  "/dashboard/speech/pagos",
  "/dashboard/speech/calidad",
  "/dashboard/speech/reclamos",
]

// Definir rutas según el cargo
const routePermissions = {
  1: [
    // Administrador - acceso completo
    "/dashboard",
    "/dashboard/justificaciones/nueva",
    "/dashboard/justificaciones/listar",
    "/dashboard/vacaciones/solicitar",
    "/dashboard/vacaciones/mis-solicitudes",
    "/dashboard/vacaciones/registrar-asesor",
    "/dashboard/vacaciones/solicitudes-asesor",
    // ...speechRoutes,
  ],
  2: [
    // Supervisor - sin registro de vacaciones de asesor
    "/dashboard",
    "/dashboard/justificaciones/nueva",
    "/dashboard/justificaciones/listar",
    "/dashboard/vacaciones/solicitar",
    "/dashboard/vacaciones/mis-solicitudes",
    "/dashboard/vacaciones/solicitudes-asesor",
    // ...speechRoutes,
  ],
  3: [
    // Asesor - solo funciones básicas
    "/dashboard",
    "/dashboard/vacaciones/solicitar",
    "/dashboard/vacaciones/mis-solicitudes",
    // "/dashboard/speech",
    // "/dashboard/speech/tablero",
  ],
}

const canAccessPath = (pathname: string, allowedRoutes: string[] | undefined): boolean => {
  if (!allowedRoutes || allowedRoutes.length === 0) {
    return false
  }
  return allowedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo aplicar middleware a rutas del dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  // Obtener datos del usuario desde las cookies o headers
  const username = request.cookies.get("username")?.value
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !username) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Obtener información del usuario
  const userData = users[username as keyof typeof users]

  if (!userData) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Verificar permisos de ruta según el cargo
  const allowedRoutes = routePermissions[userData.idCargo as keyof typeof routePermissions]

  if (!canAccessPath(pathname, allowedRoutes)) {
    // Redirigir a la página principal del dashboard si no tiene permisos
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Agregar información del usuario a los headers para que esté disponible en los componentes
  const response = NextResponse.next()
  response.headers.set("x-user-name", userData.name)
  response.headers.set("x-user-cargo", userData.idCargo.toString())

  return response
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
