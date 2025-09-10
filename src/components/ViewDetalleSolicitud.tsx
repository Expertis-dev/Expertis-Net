import React from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, User, FileText } from "lucide-react"
import { BadgeStatus } from "./BadgeStatus"
import { SolicitudesAprobadas } from '../types/Vacaciones'
interface ViewJustificationModalProps {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly solicitud: SolicitudesAprobadas
}
export const ViewDetalleSolicitud = ({ isOpen, onClose, solicitud }: ViewJustificationModalProps) => {
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
                        className="w-full max-w-3xl "
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
                            <CardContent className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">

                                {[
                                    { label: "Empleado", value: solicitud.alias, icon: <User className="h-4 w-4 text-blue-500" /> },
                                    { label: "Area", value: solicitud.nombreArea },
                                    { label: "Estado", value: <BadgeStatus estado={solicitud.estadoVacaciones} /> },
                                    { label: "Fecha de Solicitud", value: solicitud.fecSolicitud.split("T")[0] },
                                    { label: "Fecha de Inicio", value: solicitud.fecInicial.split("T")[0] },
                                    { label: "Fecha Final", value: solicitud.fecFinal.split("T")[0] },
                                    { label: "Cantidad de Días", value: solicitud.cantDias },
                                    { label: "Cantidad de Días Habiles", value: solicitud.cantDiasHabiles },
                                    { label: "Cantidad de Días NO Habiles", value: solicitud.cantDiasNoHabiles },
                                    { label: "Detalle", value: solicitud.detalle },
                                    
                                    { label: "Mes", value: solicitud.codMes.split("T")[0] || "Sin observaciones" },
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
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
