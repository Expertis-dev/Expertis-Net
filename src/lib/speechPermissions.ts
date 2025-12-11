"use client"

type PermisosSource = Record<string, unknown>

const collectPermisos = (source: PermisosSource | unknown): string[] => {
  if (!source || typeof source !== "object") {
    return []
  }

  const permisos: string[] = []

  Object.values(source as PermisosSource).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((permiso) => {
        if (typeof permiso === "string" && permiso.startsWith("PERMISO_")) {
          permisos.push(permiso)
        }
      })
      return
    }

    if (value && typeof value === "object") {
      permisos.push(...collectPermisos(value as PermisosSource))
    }
  })

  return permisos
}

export const getSpeechPermisos = (): string[] => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem("permisos")
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as PermisosSource
    return collectPermisos(parsed)
  } catch (error) {
    console.error("[SpeechPermissions] Error leyendo permisos", error)
    return []
  }
}

export const getSpeechAlias = (): string | null => {
  if (typeof window === "undefined") {
    return null
  }

  const alias = window.localStorage.getItem("alias")
  if (alias) {
    return alias
  }

  try {
    const rawUser = window.localStorage.getItem("user")
    if (!rawUser) {
      return null
    }
    const parsed = JSON.parse(rawUser) as { alias?: string; usuario?: string }
    return parsed.alias ?? parsed.usuario ?? null
  } catch {
    return null
  }
}
