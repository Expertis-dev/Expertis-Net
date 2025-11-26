import { Justificaciones } from "@/types/Justificaciones"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { Button } from "./ui/button"
import { LoadingModal } from "./loading-modal"
import { toast } from "sonner"
import { useUser } from "@/Provider/UserProvider"
import { CargarActividad } from "@/services/CargarActividad"

interface ViewJustificationModalProps {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly onCloseModal: () => void
    readonly justification: Justificaciones
}

export function ActualizarJustificaciones({
    isOpen,
    onClose,
    justification,
    onCloseModal
}: ViewJustificationModalProps) {
    const [descuento, setDescuento] = useState<string | null>(null)
    const [penalidad, setPenalidad] = useState<string | null>(null)
    const [showLoading, setShowLoading] = useState(false)
    const { user } = useUser()
    useEffect(() => {
        if (justification) {
            setDescuento(justification.descuento)
            setPenalidad(justification.penalidad)
        }
    }, [justification, isOpen])

    const handleDescuentoChange = (value: "SI" | "NO") => {
        setDescuento(prev => (prev === value ? null : value))
    }

    const handlePenalidadChange = (value: "SI" | "NO") => {
        setPenalidad(prev => (prev === value ? null : value))
    }
    const EditarJustificacion = async (e: React.FormEvent) => {
        e.preventDefault()
        if (showLoading) return
        setShowLoading(true)
        console.log(descuento, penalidad)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/editarJustifPorID/${justification.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    descuento, penalidad, usuario: user?.usuario
                })
            });
            const data = await response.json();
            console.log(data)
            CargarActividad({
                usuario: user?.usuario || "Desconocido",
                titulo: "Actualizo una Justificacion",
                descripcion: `Se actualizo la justificacion del asesor ${justification.asesor}`,
                estado: "completed",
            })
            onClose()
            setShowLoading(false)
            toast.success("Justificacion editada exitosamente")
        } catch (error) {
            console.error(error)
            toast.error("No se edito la Justificacion")
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
                    onClick={onCloseModal}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xs"
                    >
                        <Card className="border-2 border-slate-200 dark:border-neutral-700 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-neutral-700">
                                <CardTitle className="flex items-center gap-2 pb-3 text-slate-800 dark:text-slate-100">
                                    <FileText className="h-5 w-5" />
                                    Actualización de la Justificación
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="py-2 space-y-4">
                                <form className="space-y-4" onSubmit={EditarJustificacion}>
                                    {/* Descuento */}
                                    <div className="space-y-2">
                                        <Label>Descuento</Label>
                                        <div className="flex gap-4 w-full justify-evenly">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={descuento === "SI"}
                                                    onCheckedChange={() => handleDescuentoChange("SI")}
                                                />
                                                <Label>Si</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={descuento === "NO"}
                                                    onCheckedChange={() => handleDescuentoChange("NO")}
                                                />
                                                <Label>No</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Penalidad */}
                                    <div className="space-y-2">
                                        <Label>Penalidad</Label>
                                        <div className="flex gap-4 w-full justify-evenly">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={penalidad === "SI"}
                                                    onCheckedChange={() => handlePenalidadChange("SI")}
                                                />
                                                <Label>Si</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={penalidad === "NO"}
                                                    onCheckedChange={() => handlePenalidadChange("NO")}
                                                />
                                                <Label>No</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full flex justify-center">
                                        <Button
                                            type="submit"
                                            className={`
                                                        w-full
                                                        bg-[#1d3246] 
                                                        hover:bg-[#0e2031] 
                                                        dark:bg-slate-400 
                                                        dark:text-neutral-900 
                                                        dark:hover:bg-slate-600 
                                                        dark:hover:text-white 
                                                        text-white 
                                                        rounded-lg
                                                        shadow-md
                                                        transition 
                                                        duration-300 
                                                        ease-in-out 
                                                        transform 
                                                        hover:scale-100
                                                        active:scale-95 
                                                        `}>
                                            Guardar Cambios
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <LoadingModal isOpen={showLoading} message="Editando justificación..." />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
