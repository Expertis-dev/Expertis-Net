"use client"

import { useEffect, useState } from "react"
import { getCurrentSpeechAdminStatus } from "@/lib/speechAdmins"

const readAccessSnapshot = () => getCurrentSpeechAdminStatus()

export const useSpeechAccess = () => {
  const [state, setState] = useState(readAccessSnapshot)

  useEffect(() => {
    const sync = () => setState(readAccessSnapshot())

    sync()

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "alias" && event.key !== "user") {
        return
      }
      sync()
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return state
}
