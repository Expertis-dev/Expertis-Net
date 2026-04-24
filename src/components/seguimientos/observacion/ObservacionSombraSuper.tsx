import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Props {
    observacion: {
        isOpen: boolean;
        observacion: string;
    };
    setObservacion: (arg: {
        isOpen: boolean;
        observacion: string;
    }) => void;
}

export const ObservacionSombraSuper = ({observacion, setObservacion} : Props) => {

    const onClose = () => {
        setObservacion({...observacion, isOpen: false});
    };

    return (
        <AnimatePresence>
            {observacion.isOpen && (
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
                                    <p className="text-wrap">{observacion.observacion || ""}</p>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onClose}
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
    );
};
