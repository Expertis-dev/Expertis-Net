import { SpeechPermissionGate } from "@/components/speech/guards"
import Reclamos from "@/modules/speech/components/Reclamos/Reclamos"

export const metadata = {
  title: "Speech Analytics | Reclamos",
}

export default function SpeechReclamosPage() {
  return (
    <SpeechPermissionGate requiredModule="Reclamos">
      <Reclamos />
    </SpeechPermissionGate>
  )
}
