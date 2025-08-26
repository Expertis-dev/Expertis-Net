"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Image } from "antd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, User, FileText } from "lucide-react"
import { Justificaciones } from "../../types/Justificaciones"
import { useEffect, useState } from "react"

interface ViewJustificationModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly justification: Justificaciones
}

export function ViewJustificationModal({ isOpen, onClose, justification }: ViewJustificationModalProps) {
  const [urls, setUrls] = useState<{ urlPrueba: string }[]>([])

  useEffect(() => {
    const ObtenerURLImagenes = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerPruebas/${justification.id}`, {
        method: "GET",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error("Error al obtener pruebas")
      const data = await res.json()
      setUrls(data.data)
    }
    if (justification) ObtenerURLImagenes()
  }, [justification])

  if (!justification) return null

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "PERMISO":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm">PERMISO</Badge>
      case "TARDANZA":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm">TARDANZA</Badge>
      case "FALTA":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">FALTA</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-7xl"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalles de Justificación
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Datos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User className="h-4 w-4" />
                        Asesor
                      </div>
                      <div className="font-semibold">{justification.asesor}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        Fecha
                      </div>
                      <div className="font-semibold">{justification.fecha.split("T")[0]}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Nivel 1</div>
                      <div>{getStatusBadge(justification.nivel1)}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Nivel 2</div>
                      <div className="font-semibold">{justification.nivel2.split("_")[1]}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Nivel 3</div>
                      <div className="font-semibold">{justification.nivel3}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Penalidad</div>
                      <div className="font-semibold">{justification.penalidad}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Descuento</div>
                      <div className="font-semibold">{justification.descuento}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Descripción</div>
                      <div className="font-semibold">{justification.descripcion}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Minutos Permiso</div>
                      <div className="font-semibold">{justification.minutos_permiso}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Observación</div>
                      <div className=" font-semibold">{justification.observacion || "Sin observaciones"}</div>
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div>
                    <p className="mb-2 font-semibold">Pruebas</p>
                    {urls.length > 0 ? (
                      <Image.PreviewGroup>
                        <div className="grid grid-cols-3 gap-2">
                          {urls.slice(0, 4).map((url, index) => (
                            <motion.div
                              key={url.urlPrueba}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="rounded-lg overflow-hidden cursor-pointer"
                            >
                              <Image
                              width={200}
                              height={200}
                                src={url.urlPrueba}
                                alt={`Prueba ${index + 1}`}
                                className="object-cover rounded-lg"
                              />
                            </motion.div>
                          ))}
                          {urls.length > 4 && (
                            <div className="h-32 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer">
                              <span className="text-slate-700 dark:text-slate-200 font-semibold text-lg">
                                +{urls.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </Image.PreviewGroup>
                    ) : (
                      <p className="text-sm text-slate-500">No hay pruebas disponibles</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
