import { Encuesta } from "@/types/encuesta";
import { RespuestasFetch } from "@/app/dashboard/encuesta/resultados/[id]/resultadosPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion"

interface Props {
    isOpen: boolean;
    onClose: () => void;
    encuesta: Encuesta,
    response: RespuestasFetch
}

export const ResponseModal = ({ isOpen, onClose, response, encuesta }: Props) => {
    
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
                        className="w-[70%]"
                    >
                        <Card className="border-0 shadow-2xl overflow-hidden bg-white dark:bg-slate-900">

                            {/* Employee Info */}
                            <div className="px-6 py-4 bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Encuestado</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{response.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{response.dni}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Fecha</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{(new Date().toISOString().split('T')[0].split("-")).reverse().join("/")}</p>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                <Table>

                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Pregunta</TableHead>
                                            <TableHead className="text-center">Respuesta(s)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {encuesta.preguntas.map((item, index) => (
                                            <TableRow
                                                key={item._id}
                                                className="animate-in slide-in-from-left-5 duration-300"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <TableCell className="w-0">{item.content}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="mx-auto max-w-md break-words whitespace-pre-wrap text-justify">
                                                        {(() => {
                                                            const v = response.responses[index + 1];
                                                            if (typeof v === "boolean") return v ? "SI" : "NO";
                                                            if (Array.isArray(v)) return v.join(", ");
                                                            return String(v ?? "");
                                                        })()}
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 h-10 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
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
