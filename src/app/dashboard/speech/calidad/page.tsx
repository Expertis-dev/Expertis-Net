import { SpeechPermissionGate } from "@/components/speech/guards"
import Calidad from "@/modules/speech/components/Calidad/Calidad"

export const metadata = {
  title: "Speech Analytics | Calidad",
}

export default function SpeechCalidadPage() {
  return (
    <SpeechPermissionGate requiredModule="Calidad">
      <Calidad />
    </SpeechPermissionGate>
  )
}
