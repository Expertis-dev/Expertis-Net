"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useUser } from "@/Provider/UserProvider"
import speechApi from "@/services/speech/api"
import type { SpeechPermiso } from "@/types/speech/analytics"

interface SpeechAuthContextValue {
  loading: boolean
  permisos: SpeechPermiso[]
  permisosCargados: boolean
  cargarPermisos: () => Promise<SpeechPermiso[]>
  hasPermiso: (permiso: SpeechPermiso) => boolean
  tienePermisoModulo: (modulo: string) => boolean
  getPermisos: () => SpeechPermiso[]
}

const SpeechAuthContext = createContext<SpeechAuthContextValue | null>(null)

export const SpeechAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [permisosCargados, setPermisosCargados] = useState(false)
  const [permisos, setPermisos] = useState<SpeechPermiso[]>([])

  const cargarPermisos = useCallback(async () => {
    if (!user) {
      setPermisos([])
      setPermisosCargados(true)
      setLoading(false)
      return []
    }
    try {
      setLoading(true)
      const response = await speechApi.get<SpeechPermiso[]>("/permisos")
      const data = Array.isArray(response.data) ? response.data : []
      setPermisos(data)
      return data
    } catch (error) {
      console.error("[SpeechAuth] Error al cargar permisos:", error)
      setPermisos([])
      return []
    } finally {
      setPermisosCargados(true)
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setPermisos([])
      setPermisosCargados(true)
      setLoading(false)
      return
    }
    cargarPermisos().catch((error) => {
      console.error("[SpeechAuth] Error inicial al cargar permisos:", error)
    })
  }, [user, cargarPermisos])

  const hasPermiso = useCallback(
    (permiso: SpeechPermiso) => permisos.includes(permiso),
    [permisos],
  )

  const tienePermisoModulo = useCallback(
    (modulo: string) => permisos.some((permiso) => permiso.includes(`PERMISO_${modulo}`)),
    [permisos],
  )

  const getPermisos = useCallback(() => permisos, [permisos])

  const value = useMemo<SpeechAuthContextValue>(
    () => ({
      loading,
      permisos,
      permisosCargados,
      cargarPermisos,
      hasPermiso,
      tienePermisoModulo,
      getPermisos,
    }),
    [loading, permisos, permisosCargados, cargarPermisos, hasPermiso, tienePermisoModulo, getPermisos],
  )

  return <SpeechAuthContext.Provider value={value}>{children}</SpeechAuthContext.Provider>
}

export const useSpeechAuth = (): SpeechAuthContextValue => {
  const context = useContext(SpeechAuthContext)
  if (!context) {
    throw new Error("useSpeechAuth debe usarse dentro de SpeechAuthProvider")
  }
  return context
}
