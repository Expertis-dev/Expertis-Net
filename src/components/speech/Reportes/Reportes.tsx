"use client"

import { useEffect, useState, type ElementType } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const EstadoCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description: string
}) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 text-center">
    <Icon className="h-8 w-8 text-primary" />
    <p className="text-base font-semibold">{title}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
)

export default function Reportes() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  useEffect(() => {
    document.title = "Tablero de Control - Speech Analytics"
  }, [])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const recargarDashboard = () => {
    setIsLoading(true)
    setHasError(false)
    setIframeKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Speech Analytics</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            Tablero de Control
          </h1>

          <Button variant="outline" onClick={recargarDashboard} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
        <p className="text-muted-foreground">
          Visualiza los indicadores de Speech Analytics integrados en tu flujo actual. Puedes recargar cuando sea
          necesario.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-[16/9]" data-reportes-iframe>
            {hasError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <EstadoCard
                  icon={AlertTriangle}
                  title="Error al cargar"
                  description="No se pudo obtener el dashboard. Intenta recargar para volver a solicitarlo."
                />
                <Button onClick={recargarDashboard} className="mt-2 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  title="Dashboard Speech Analytics"
                  src="https://app.powerbi.com/view?r=eyJrIjoiNDgxZDNkMTctYWU0My00YjQ5LWJhZTQtOWNlYjJiOTNmMTAyIiwidCI6IjMwZDFmYWFmLTFjZWYtNDMxZC1iNTFmLTE2N2UyNzg2YjFlMCIsImMiOjR9"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  className="h-full w-full"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
