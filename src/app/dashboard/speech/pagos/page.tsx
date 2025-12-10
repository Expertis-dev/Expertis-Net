import { SpeechPermissionGate } from "@/components/speech/guards"
import Pagos from "@/modules/speech/components/Pagos/Pagos"

export const metadata = {
  title: "Speech Analytics | Pagos",
}

export default function SpeechPagosPage() {
  return (
    <SpeechPermissionGate requiredModule="Pagos">
      <Pagos />
    </SpeechPermissionGate>
  )
}
