"use client"

import type { ReactNode } from "react"
import "@fortawesome/fontawesome-free/css/all.min.css"
import { SpeechProtectedRoute } from "@/components/speech/guards"
import SideNav from "@/components/speech/SideNav/SideNav"

export const SpeechShell = ({ children }: { children: ReactNode }) => {
  return (
    <SpeechProtectedRoute>
      <SideNav>{children}</SideNav>
    </SpeechProtectedRoute>
  )
}

export default SpeechShell
