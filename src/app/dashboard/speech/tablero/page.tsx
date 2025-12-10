import { SpeechPermissionGate } from "@/components/speech/guards"
import Reportes from "@/modules/speech/components/Reportes/Reportes"

export const metadata = {
  title: "Speech Analytics | Tablero",
}

export default function SpeechTableroPage() {
  return (
    <SpeechPermissionGate requiredPermiso="PERMISO_Tablero-ver">
      <Reportes />
    </SpeechPermissionGate>
  )
}
