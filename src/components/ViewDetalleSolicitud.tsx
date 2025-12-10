import React from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, FileText, Calendar, Hash, Building, CalendarRange } from "lucide-react"
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
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-4xl"
                    >
                        <Card className="border-2 border-slate-200 dark:border-neutral-700 shadow-xl">
                            <CardHeader className="flex flex-row items-center  justify-between border-b border-slate-200 dark:border-neutral-700">
                                <CardTitle className="flex items-center gap-2 pb-3 text-slate-800 dark:text-slate-100">
                                    <FileText className="h-5 w-5" />
                                    Detalle de la Solicitud
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 space-y-2">
                                {/* Sección de información del empleado */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Información del Empleado
                                    </h3>
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {[
                                            {
                                                label: "Empleado",
                                                value: solicitud.alias,
                                                icon: <User className="h-4 w-4 text-blue-500" />
                                            },
                                            {
                                                label: "Área",
                                                value: solicitud.nombreArea,
                                                icon: <Building className="h-4 w-4 text-purple-500" />
                                            },
                                            {
                                                label: "Estado",
                                                value: <BadgeStatus estado={solicitud.estadoVacaciones} />,
                                                icon: null
                                            },
                                            {
                                                label: "Fecha de Solicitud",
                                                value: solicitud.fecSolicitud.split("T")[0],
                                                icon: <Calendar className="h-4 w-4 text-amber-500" />
                                            },
                                        ].map((item) => (
                                            <motion.div
                                                key={item.label}
                                                whileHover={{ scale: 1.01 }}
                                                className="p-3 flex items-center justify-between rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
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

                                {/* Sección de detalles de las vacaciones */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <CalendarRange className="h-4 w-4" />
                                        Período de Vacaciones
                                    </h3>
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {[
                                            {
                                                label: "Fecha de Inicio",
                                                value: solicitud.fecInicial.split("T")[0],
                                                icon: <Calendar className="h-4 w-4 text-green-500" />
                                            },
                                            {
                                                label: "Fecha Final",
                                                value: solicitud.fecFinal.split("T")[0],
                                                icon: <Calendar className="h-4 w-4 text-red-500" />
                                            },
                                            {
                                                label: "Cantidad de Días",
                                                value: solicitud.cantDias,
                                                icon: <Hash className="h-4 w-4 text-blue-500" />
                                            },
                                            {
                                                label: "Días Hábiles",
                                                value: solicitud.cantDiasHabiles,
                                                icon: <Hash className="h-4 w-4 text-green-500" />
                                            },
                                            {
                                                label: "Días No Hábiles",
                                                value: solicitud.cantDiasNoHabiles,
                                                icon: <Hash className="h-4 w-4 text-amber-500" />
                                            },
                                            {
                                                label: "Mes",
                                                value: solicitud.codMes.split("T")[0] || "Sin especificar",
                                                icon: <Calendar className="h-4 w-4 text-purple-500" />
                                            },
                                        ].map((item) => (
                                            <motion.div
                                                key={item.label}
                                                whileHover={{ scale: 1.01 }}
                                                className="p-3 flex items-center justify-between rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
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

                                {/* Sección de observaciones/detalle */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Observaciones
                                    </h3>
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="p-4 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                                    >
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            Detalle adicional
                                        </div>
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                                            {solicitud.detalle || "No hay observaciones adicionales"}
                                        </div>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}