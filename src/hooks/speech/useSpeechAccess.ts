"use client"

import { useEffect, useState } from "react"
import { isSpeechAdminPerms } from "@/lib/speechAdmins"
import { getSpeechAlias, getSpeechPermisos } from "@/lib/speechPermissions"

const readAccessSnapshot = () => {
  const permisos = getSpeechPermisos()
  const alias = getSpeechAlias()
  const isAdmin = isSpeechAdminPerms(permisos)
  return {
    alias,
    isAdmin,
    canUseFilters: true,
  }
}

export const useSpeechAccess = () => {
  const [state, setState] = useState(readAccessSnapshot)

  useEffect(() => {
    const sync = () => setState(readAccessSnapshot())

    sync()

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "alias" && event.key !== "user" && event.key !== "permisos") {
        return
      }
      sync()
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return state
}
