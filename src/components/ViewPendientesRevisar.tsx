import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    User, FileText, Calendar, Clock, Hash, CalendarRange, Building, AlertCircle, CheckCircle
} from "lucide-react"
import { BadgeStatus } from "./BadgeStatus"
import { SolicitudesAprobadas } from '../types/Vacaciones'
import { Button } from './ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select'
import { LoadingModal } from './loading-modal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { toast } from 'sonner'
import { CargarActividad } from '@/services/CargarActividad'
import { useUser } from '@/Provider/UserProvider'

interface ViewJustificationModalProps {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly solicitud: SolicitudesAprobadas
}
type InfoSolicitud = {
    Truncas: number;
    Pendientes: number;
    Vencidas: number;
}
export const ViewPendientesRevisar = ({ isOpen, onClose, solicitud }: ViewJustificationModalProps) => {
    const [infoSolicitud, setInfoSolicitud] = useState<InfoSolicitud>({} as InfoSolicitud);
    const [estado, setEstado] = useState<string | null>(null);
    const { user } = useUser()
    const [openConfirm, setOpenConfirm] = useState(false);
    const [isModificar, setIsModificar] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerInfoVacaciones`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        idEmpleado: solicitud.idEmpleado,
                        fecMes: solicitud.codMes.split("T")[0]
                    })
                });
                const data = await response.json();
                setInfoSolicitud(data.data[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        if (isOpen) fetchData();
    }, [solicitud, isOpen])
    const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!estado) {
            toast.error("Debes seleccionar un estado")
            return;
        }
        setOpenConfirm(true);
    };
    const handleModificar = async () => {
        console.log("Cambiar estado a:", estado);
        setOpenConfirm(false);
        setIsModificar(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cambiarEstadoSolicitudVacaciones`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: solicitud.id,
                    estado: estado,
                    userInsert: user?.usuario
                }),
            });
            if (!response.ok) throw new Error("Error al cambiar el estado de la vacacion");
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "Actualizaciòn vacaciones",
                descripcion: `Se actualizo el estado a ${estado} de ${solicitud.alias}`,
                estado: "completed",
            })
            toast.success("Se actulizo el estado correctamente")
            setIsModificar(false)
            onClose()
        } catch (error) {
            console.log(error)
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "No se pudo actualizar las vacaciones",
                descripcion: `No se actualizo el estado a ${estado} de ${solicitud.alias}`,
                estado: "error",
            })
            toast.error("Error al actualizar las vacaciones")
            setIsModificar(false)
        }
    };
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
                        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                    >
                        <Card className="border-2 border-slate-200 dark:border-neutral-700 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-neutral-700">
                                <CardTitle className="flex items-center gap-2 pb-3 text-slate-800 dark:text-slate-100">
                                    <FileText className="h-5 w-5" />
                                    Detalles de la Solicitud
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4 py-2'>
                                {/* Sección de estadísticas de vacaciones */}
                                <div className="space-y-2">
                                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            {
                                                label: "Saldo de días de vacaciones",
                                                value: (infoSolicitud.Truncas || 0) + (infoSolicitud.Pendientes || 0) + (infoSolicitud.Vencidas || 0),
                                                icon: <CheckCircle className="h-4 w-4 text-green-500" />
                                            },
                                            {
                                                label: "Vacaciones Truncas",
                                                value: infoSolicitud.Truncas || 0,
                                                icon: <AlertCircle className="h-4 w-4 text-amber-500" />
                                            },
                                            {
                                                label: "Vacaciones Pendientes",
                                                value: infoSolicitud.Pendientes || 0,
                                                icon: <Clock className="h-4 w-4 text-blue-500" />
                                            },
                                            {
                                                label: "Vacaciones Vencidas",
                                                value: infoSolicitud.Vencidas || 0,
                                                icon: <AlertCircle className="h-4 w-4 text-red-500" />
                                            },
                                        ].map((item) => (
                                            <motion.div
                                                key={item.label}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="p-4 rounded-xl shadow-sm bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700"
                                            >
                                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
                                                    {item.icon}
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                                <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                                    {item.value}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

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
                                                value: <BadgeStatus estado={solicitud.estado} />,
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
                                        Detalles de las Vacaciones
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
                                <div className="space-y-3">
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
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        transition={{ type: "spring", duration: 0.3 }}
                                        className='flex items-center justify-center'
                                    >
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="bg-blue-600">
                                                    Modificar
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Modificar Solicitud de Vacaciones</DialogTitle>
                                                </DialogHeader>

                                                {/* FORMULARIO */}
                                                <form onSubmit={handleSubmitForm}>
                                                    <div className="grid gap-4">
                                                        <div className="grid gap-3">
                                                            <Label htmlFor="estado">Cambiar Estado</Label>

                                                            <Select onValueChange={(value) => setEstado(value)}>
                                                                <SelectTrigger className="w-full" id="estado">
                                                                    <SelectValue placeholder="Seleccionar un estado" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Estado</SelectLabel>
                                                                        <SelectItem value="APROBADO">APROBADO</SelectItem>
                                                                        <SelectItem value="RECHAZADO">RECHAZADO</SelectItem>
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <DialogFooter className="mt-4">
                                                        <DialogClose asChild>
                                                            <Button variant="outline" type="button">
                                                                Cancelar
                                                            </Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button type="submit">
                                                                Guardar cambios
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>

                                        {/* CONFIRMACIÓN */}
                                        <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                                            <AlertDialogContent className="sm:max-w-[425px]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        ¿Estás seguro de modificar el estado de este empleado a <b>{estado}</b>?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleModificar}>
                                                        Cambiar Estado
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <LoadingModal
                                            isOpen={isModificar}
                                            message={"Guardando los cambios"}
                                        />
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