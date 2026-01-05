"use client"

import { getSpeechAlias } from "@/lib/speechPermissions"

const normalizeAlias = (value: string | null | undefined) => {
  if (!value || typeof value !== "string") {
    return ""
  }
  return value.trim().toLowerCase()
}

export const SPEECH_ADMIN_ALIASES: string[] = [
  "JHON PULACHE", "MAURO ADAUTO"
]

const ADMIN_ALIAS_SET = new Set(SPEECH_ADMIN_ALIASES.map(normalizeAlias).filter(Boolean))

export const isSpeechAdminAlias = (alias?: string | null): boolean => {
  const normalizedAlias = normalizeAlias(alias)
  if (!normalizedAlias) {
    return false
  }
  return ADMIN_ALIAS_SET.has(normalizedAlias)
}

export const getCurrentSpeechAdminStatus = () => {
  const alias = getSpeechAlias()
  return {
    alias,
    isAdmin: isSpeechAdminAlias(alias),
  }
}
