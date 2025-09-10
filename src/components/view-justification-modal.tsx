import { motion, AnimatePresence } from "framer-motion"
import { Image } from "antd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Calendar, User, FileText } from "lucide-react"
import { Justificaciones } from "../types/Justificaciones"
import { BadgeStatus } from "./BadgeStatus"
import { useURL } from "@/hooks/useURL"
interface ViewJustificationModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly justification: Justificaciones
}
export function ViewJustificationModal({ isOpen, onClose, justification }: ViewJustificationModalProps) {
  const { urls } = useURL(justification?.id ?? "");
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            onClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-7xl "
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
                <div className="flex justify-center gap-4">
                  <div className="w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4 border-r-2 border-slate-300 pr-4">
                    {[
                      { label: "Asesor", value: justification.asesor, icon: <User className="h-4 w-4 text-blue-500" /> },
                      { label: "Fecha", value: justification.fecha.split("T")[0], icon: <Calendar className="h-4 w-4 text-purple-500" /> },
                      { label: "Nivel 1", value: <BadgeStatus estado={justification.nivel1} /> },
                      { label: "Nivel 2", value: justification.nivel2.split("_")[1] },
                      { label: "Nivel 3", value: justification.nivel3 },
                      { label: "Penalidad", value: justification.penalidad },
                      { label: "Descuento", value: justification.descuento },
                      { label: "Descripción", value: justification.descripcion },
                      { label: "Minutos Permiso", value: justification.minutos_permiso },
                      { label: "Observación", value: justification.observacion || "Sin observaciones" },
                    ].map((item) => (
                      <motion.div
                        key={item.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-2 rounded-xl shadow-md bg-neutral-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600"
                      >
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Imágenes */}
                  <div className="w-1/3">
                    <p className="mb-2 font-semibold">Pruebas</p>
                    {urls && urls.length > 0 ? (
                      <Image.PreviewGroup>
                        <div className="grid grid-cols-2 gap-2">
                          {urls.slice(0, 4).map((url, index) => (
                            <motion.div
                              key={url.urlPrueba}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="rounded-lg overflow-hidden cursor-pointer"
                            >
                              <Image
                                width={200}
                                height={150}
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
                      <p className="text-sm text-neutral-500">No hay pruebas disponibles</p>
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
