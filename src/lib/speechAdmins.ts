"use client"

import { getSpeechAlias, getSpeechPermisos } from "@/lib/speechPermissions"

export const isSpeechAdminPerms = (permisos: string[]) => {
  const hasPagos =
    permisos.includes("PERMISO_PagosInterno-ver") &&
    permisos.includes("PERMISO_PagosExterno-ver") &&
    permisos.includes("PERMISO_PagosJudicial-ver")
  const hasCalidad =
    permisos.includes("PERMISO_CalidadInterno-ver") &&
    permisos.includes("PERMISO_CalidadExterno-ver") &&
    permisos.includes("PERMISO_CalidadJudicial-ver")
  const hasReclamos =
    permisos.includes("PERMISO_ReclamosInterno-ver") &&
    permisos.includes("PERMISO_ReclamosExterno-ver") &&
    permisos.includes("PERMISO_ReclamosJudicial-ver")

  return hasPagos && hasCalidad && hasReclamos
}

export const getCurrentSpeechAdminStatus = () => {
  const alias = getSpeechAlias()
  const permisos = getSpeechPermisos()
  return {
    alias,
    isAdmin: isSpeechAdminPerms(permisos),
  }
}
