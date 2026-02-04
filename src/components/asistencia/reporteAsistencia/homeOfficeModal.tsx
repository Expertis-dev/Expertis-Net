import { HomeOfficeModalProps } from "@/types/Bases"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../../ui/card";
import { Clock, LogIn, LogOut, Home, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

export const HomeOfficeFormModal = ({ isOpen, onClose, colab, onSuccess }: HomeOfficeModalProps) => {
    type HOForm = {
        horaInicio: string;
        horaSalida: string;
    }

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<HOForm>({
        mode: 'onSubmit'
    })

    const onClickButton = async (data: HOForm) => {
        // Enviar datos o procesarlos
        console.log('HomeOffice submit', data)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subirAsistenciaHomeOffice`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    nombre: colab.Nombre,
                    horaIngreso: data.horaInicio,
                    horaSalida: data.horaSalida
                })
            })

            if (response.ok) {
                // Llamar al callback para refrescar los datos
                if (onSuccess) {
                    await onSuccess()
                }
                onClose()
            } else {
                console.error('Error al guardar HomeOffice:', response.status)
            }
        } catch (error) {
            console.error('Error en la solicitud:', error)
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
                        className="max-w-md w-full"
                    >
                        <Card className="border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
                            {/* Header con gradiente */}
                            <div className="relative bg-gradient-to-r from-blue-900 to-blue-500 dark:from-blue-950 dark:to-slate-900 px-6 pt-6 pb-8">
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors p-1"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 bg-white/20 rounded-lg">
                                        <Home className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white">Home Office</h2>
                                        <p className="text-blue-100 text-sm font-medium">Registra tus horas de trabajo</p>
                                    </div>
                                </div>
                            </div>

                            {/* Employee Info */}
                            <div className="px-6 py-4 bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Colaborador</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{colab.Nombre}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{colab.Area}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Fecha</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{(new Date().toISOString().split('T')[0].split("-")).reverse().join("/")}</p>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                {/* Hora de Ingreso */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                                        <LogIn className="h-4 w-4 text-emerald-600" />
                                        Hora de Ingreso
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                        <Input
                                            type="time"
                                            step={60}
                                            aria-label="Hora de ingreso"
                                            className="pl-10 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            {...register('horaInicio', {
                                                required: 'La hora de ingreso es obligatoria',
                                                pattern: {
                                                    value: /^([01]?\d|2[0-3]):[0-5]\d$/,
                                                    message: 'Formato de hora inválido (HH:MM)'
                                                }
                                            })}
                                        />
                                    </div>
                                    {errors.horaInicio && (
                                        <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                                            <span>●</span> {String(errors.horaInicio?.message)}
                                        </p>
                                    )}
                                </div>

                                {/* Hora de Salida */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                                        <LogOut className="h-4 w-4 text-rose-600" />
                                        Hora de Salida
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                        <Input
                                            type="time"
                                            step={60}
                                            aria-label="Hora de salida"
                                            className="pl-10 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-rose-500 dark:focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all"
                                            {...register('horaSalida', {
                                                required: 'La hora de salida es obligatoria',
                                                pattern: {
                                                    value: /^([01]?\d|2[0-3]):[0-5]\d$/,
                                                    message: 'Formato de hora inválido (HH:MM)'
                                                }
                                            })}
                                        />
                                    </div>
                                    {errors.horaSalida && (
                                        <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                                            <span>●</span> {String(errors.horaSalida?.message)}
                                        </p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 h-10 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSubmit(onClickButton)}
                                        className="flex-1 h-10 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold shadow-lg shadow-blue-900/30 dark:shadow-blue-950/50 transition-all"
                                    >
                                        Guardar
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
