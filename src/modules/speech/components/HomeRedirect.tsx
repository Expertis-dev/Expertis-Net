"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSpeechAuth } from "@/modules/speech/context/SpeechAuthContext"

export const HomeRedirect = () => {
  const router = useRouter()
  const { hasPermiso, tienePermisoModulo } = useSpeechAuth()

  useEffect(() => {
    if (hasPermiso("PERMISO_Tablero-ver")) {
      router.replace("/speech/tablero")
    } else if (tienePermisoModulo("Pagos")) {
      router.replace("/speech/pagos")
    } else if (tienePermisoModulo("Calidad")) {
      router.replace("/speech/calidad")
    } else if (tienePermisoModulo("Reclamos")) {
      router.replace("/speech/reclamos")
    } else {
      router.replace("/dashboard")
    }
  }, [router, hasPermiso, tienePermisoModulo])

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      Redirigiendo...
    </div>
  )
}

export default HomeRedirect
