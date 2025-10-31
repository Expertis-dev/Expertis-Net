import { motion, AnimatePresence } from "framer-motion"
import { Image } from "antd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, FileText, Shield, AlertCircle, DollarSign, Clock, Eye, FileWarning } from "lucide-react"
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl"
          >
            <Card className="border-2 border-slate-200 dark:border-neutral-700 shadow-xl">
              <CardHeader className="flex flex-row items-center  justify-between border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="flex items-center gap-2 pb-3 text-slate-800 dark:text-slate-100">
                  <FileText className="h-5 w-5" />
                  Detalles de Justificación
                </CardTitle>
              </CardHeader>

              <CardContent className="py-2 space-y-2">
                <div className="grid grid-cols-5  gap-2 overflow-y-auto max-h-[70vh]  lg:gap-6 px-2">
                  {/* Información de la justificación */}
                  <div className="w-full  space-y-2 col-span-3">
                    {/* Información básica */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Información Básica
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          {
                            label: "Asesor",
                            value: justification.asesor,
                            icon: <User className="h-4 w-4 text-blue-500" />
                          },
                          {
                            label: "Fecha",
                            value: justification.fecha.split("T")[0],
                            icon: <Calendar className="h-4 w-4 text-purple-500" />
                          },
                          {
                            label: "Minutos de Permiso",
                            value: justification.minutos_permiso,
                            icon: <Clock className="h-4 w-4 text-amber-500" />
                          },
                        ].map((item) => (
                          <motion.div
                            key={item.label}
                            whileHover={{ scale: 1.01 }}
                            className="p-3 flex items-center gap-4 justify-between rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                          >
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                              {item.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Niveles de aprobación */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Niveles de Aprobación
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          {
                            label: "Nivel 1",
                            value: <BadgeStatus estado={justification.nivel1} />,
                            icon: <Shield className="h-4 w-4 text-blue-500" />
                          },
                          {
                            label: "Nivel 2",
                            value: justification.nivel2.split("_")[1],
                            icon: <Shield className="h-4 w-4 text-green-500" />
                          },
                        ].map((item) => (
                          <motion.div
                            key={item.label}
                            whileHover={{ scale: 1.01 }}
                            className="p-3 flex items-center justify-between gap-4 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                          >
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                              {item.value}
                            </div>
                          </motion.div>
                        ))}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="col-span-2 p-3 flex items-center justify-between gap-4 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                        >
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Shield className="h-5 w-5 text-purple-500" />
                            <span className="font-medium w-12">Nivel 3</span>
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {justification.nivel3}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Información de penalización */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <FileWarning className="h-4 w-4" />
                        Información de Penalización
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          {
                            label: "Penalidad",
                            value: justification.penalidad,
                            icon: <AlertCircle className="h-4 w-4 text-red-500" />
                          },
                          {
                            label: "Descuento",
                            value: justification.descuento,
                            icon: <DollarSign className="h-4 w-4 text-amber-500" />
                          },
                        ].map((item) => (
                          <motion.div
                            key={item.label}
                            whileHover={{ scale: 1.01 }}
                            className="p-3 flex items-center justify-between gap-4 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                          >
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                              {item.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Descripción y observaciones */}
                    <div className="grid grid-cols-2 space-x-2">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Descripción
                        </h3>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="p-3 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {justification.descripcion || "Sin descripción"}
                          </div>
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Observaciones
                        </h3>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="p-3 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {justification.observacion || "Sin observaciones"}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  {/* Panel de imágenes */}
                  <div className="w-full space-y-4 col-span-2">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Pruebas Adjuntas
                      </h3>

                      {urls && urls.length > 0 ? (
                        <Image.PreviewGroup>
                          <div className="grid grid-cols-2 gap-3">
                            {urls.map((url, index) => (
                              <motion.div
                                key={url.urlPrueba}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-lg overflow-hidden cursor-pointer border-2 border-slate-200 dark:border-neutral-700"
                              >
                                <Image
                                  width={200}
                                  height={150}
                                  src={url.urlPrueba}
                                  alt={`Prueba ${index + 1}`}
                                  className="object-cover w-full h-32"
                                  placeholder={
                                    <div className="w-full h-32 bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                                      <Eye className="h-6 w-6 text-slate-400" />
                                    </div>
                                  }
                                />
                              </motion.div>
                            ))}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {urls.length} imagen(es) - Haz clic para ampliar
                          </div>
                        </Image.PreviewGroup>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="p-6 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-center"
                        >
                          <Eye className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">No hay pruebas disponibles</p>
                        </motion.div>
                      )}
                    </div>
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