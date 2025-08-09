"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, User, FileText } from "lucide-react"
interface Justification {
  id: number
  fecha: string
  asesor: string
  grupo: string
  tipo: string
  tipo2: string
  estado: string
  observacion: string
}
interface ViewJustificationModalProps {
  isOpen: boolean
  onClose: () => void
  justification: Justification 
}

export function ViewJustificationModal({ isOpen, onClose, justification }: ViewJustificationModalProps) {
  if (!justification) return null

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aprobado</Badge>
      case "Pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendiente</Badge>
        )
      case "Rechazado":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rechazado</Badge>
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
            className="w-full max-w-2xl"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      Fecha
                    </div>
                    <div className="font-semibold">{justification.fecha}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <User className="h-4 w-4" />
                      Asesor
                    </div>
                    <div className="font-semibold">{justification.asesor}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Grupo</div>
                    <div className="font-semibold">{justification.grupo}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Estado</div>
                    <div>{getStatusBadge(justification.estado)}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Tipo</div>
                    <div className="font-semibold">{justification.tipo}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Subtipo</div>
                    <div className="font-semibold">{justification.tipo2}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Observación</div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {justification.observacion || "Sin observaciones"}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={onClose}
                    className="bg-[#001529] hover:bg-[#002040] dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
