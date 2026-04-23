import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    observacionModal: {
        isOpen: boolean;
        observacion: string;
        id_escucha: number;
    };
    setObservacionModal: Dispatch<SetStateAction<{
        isOpen: boolean;
        observacion: string;
        id_escucha: number;
    }>>;
}

const actualizarObservacion = async (idEscucha: number, observacion: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asignarObservacion/${idEscucha}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({observacion: observacion})
    })
    return res.ok
}

export const ObservacionModal = ({observacionModal, setObservacionModal} : Props) => {
    type ObservacionForm = {
        observacion: string;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = useMemo<ObservacionForm>(() => {
        return { observacion: observacionModal.observacion ?? "" };
    }, [observacionModal.observacion]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ObservacionForm>({
        mode: "onSubmit",
        defaultValues,
    });

    useEffect(() => {
        if (!observacionModal.isOpen) return;
        reset(defaultValues);
    }, [observacionModal.isOpen, defaultValues, reset]);

    const onClose = () => {
        setObservacionModal((prev) => ({ ...prev, isOpen: false }));
    };

    const onSubmit = async (data: ObservacionForm) => {
        const escuchaId = observacionModal.id_escucha;
        if (!Number.isFinite(escuchaId) || escuchaId < 0) {
            toast.error("No se encontró el ID de la escucha.");
            return;
        }

        setIsSubmitting(true);
        try {
            const ok = await actualizarObservacion(escuchaId, data.observacion);
            if (!ok) {
                toast.error("No se pudo guardar la observación.");
                return;
            }

            toast.success("Observación guardada.");
            setObservacionModal((prev) => ({
                ...prev,
                isOpen: false,
                observacion: data.observacion,
            }));
        } catch (error) {
            console.error("Error al guardar observación:", error);
            toast.error("Ocurrió un error al guardar la observación.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {observacionModal.isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg"
                    >
                        <Card className="max-h-[92vh] overflow-y-auto">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-black">
                                    Observación
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    aria-label="Cerrar"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="observacion">Observación</Label>
                                    <Textarea
                                        id="observacion"
                                        placeholder="Escribe tu observación..."
                                        className="min-h-32"
                                        aria-invalid={Boolean(errors.observacion)}
                                        {...register("observacion", {
                                            validate: (value) =>
                                                value.trim().length > 0 ||
                                                "La observación es obligatoria",
                                        })}
                                    />
                                    {errors.observacion?.message && (
                                        <p className="text-xs font-semibold text-red-500">
                                            {String(errors.observacion.message)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        className="flex-1 bg-[#0e1924] hover:bg-[#002040] dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Subiendo..." : "Subir"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
