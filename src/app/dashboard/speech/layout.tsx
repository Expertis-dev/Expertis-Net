import type { ReactNode } from "react"
import SpeechProviders from "@/modules/speech/providers/SpeechProviders"
import SpeechShell from "@/modules/speech/components/SpeechShell"

export default function SpeechLayout({ children }: { children: ReactNode }) {
  return (
    <SpeechProviders>
      <SpeechShell>{children}</SpeechShell>
    </SpeechProviders>
  )
}
