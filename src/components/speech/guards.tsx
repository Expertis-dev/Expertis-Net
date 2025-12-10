"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/Provider/UserProvider"
import { useSpeechAuth } from "@/modules/speech/context/SpeechAuthContext"
import FullScreenLoader from "./FullScreenLoader"

interface PermissionGateProps {
  children: React.ReactNode
  requiredPermiso?: string
  requiredModule?: string
}

export const SpeechProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { user } = useUser()
  const { loading, getPermisos, cargarPermisos } = useSpeechAuth()
  const [ready, setReady] = useState(false)
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null

  useEffect(() => {
    let cancelled = false

    if (!user || !token) {
      router.replace("/")
      return () => {
        cancelled = true
      }
    }

    const permisosActuales = getPermisos()
    if (permisosActuales.length === 0) {
      cargarPermisos()
        .catch((error) => console.error("[SpeechProtectedRoute] Error al cargar permisos:", error))
        .finally(() => {
          if (!cancelled) {
            setReady(true)
          }
        })
      return () => {
        cancelled = true
      }
    }

    setReady(true)
    return () => {
      cancelled = true
    }
  }, [user, token, cargarPermisos, getPermisos, router])

  if (loading || !ready) {
    return <FullScreenLoader mensaje="Validando sesión..." />
  }

  return <>{children}</>
}

export const SpeechPermissionGate = ({ children, requiredModule, requiredPermiso }: PermissionGateProps) => {
  const router = useRouter()
  const { permisosCargados, hasPermiso, tienePermisoModulo } = useSpeechAuth()
  const [allowRender, setAllowRender] = useState(false)

  useEffect(() => {
    if (!permisosCargados) {
      setAllowRender(false)
      return
    }

    if (requiredPermiso && !hasPermiso(requiredPermiso)) {
      router.replace("/speech/home")
      return
    }

    if (requiredModule && !tienePermisoModulo(requiredModule)) {
      router.replace("/speech/home")
      return
    }

    setAllowRender(true)
  }, [permisosCargados, requiredPermiso, requiredModule, hasPermiso, tienePermisoModulo, router])

  if (!permisosCargados || !allowRender) {
    return <FullScreenLoader mensaje="Verificando permisos..." />
  }

  return <>{children}</>
}
