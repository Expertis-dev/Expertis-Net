"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default ReactQueryProvider
