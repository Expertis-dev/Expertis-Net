"use client"

import { useEffect, useMemo, useState } from "react"
import { getSpeechPermisos } from "@/lib/speechPermissions"

export const useSpeechPermissions = () => {
  const [permisos, setPermisos] = useState<string[]>([])

  useEffect(() => {
    setPermisos(getSpeechPermisos())

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "permisos") {
        return
      }
      setPermisos(getSpeechPermisos())
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const hasPermiso = useMemo(
    () => (permiso: string) => permisos.includes(permiso),
    [permisos],
  )

  const tienePermisoModulo = useMemo(
    () => (modulo: string) => permisos.some((permiso) => permiso.includes(`PERMISO_${modulo}`)),
    [permisos],
  )

  return {
    permisos,
    hasPermiso,
    tienePermisoModulo,
  }
}

export default useSpeechPermissions
