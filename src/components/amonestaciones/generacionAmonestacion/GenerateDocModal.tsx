import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ArrowRightIcon, CheckCircle, DownloadIcon, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import Link from "next/link";

interface Props {
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

export const GenerateDocModal = ({ isOpen, onClose }: Props) => {
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
                    >
                        <Card className="w-full max-w-sm">
                            <CardContent className="p-4 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2"
                                >
                                    <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
                                </motion.div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">La amonestacion se ha guardado correctaente y se ha vinculado</p>
                                <div className="flex flex-col max-w-80 mx-auto mt-6">
                                    <div className="flex flex-row justify-between border rounded-t-sm border-gray-200 dark:border-zinc-700 px-3">
                                        <p className="text-sm my-1 text-gray-600">Empleado</p>
                                        <p className="text-sm my-1">Sebastian</p>
                                    </div>
                                    <div className="flex flex-row justify-between border border-gray-200 dark:border-zinc-700 px-3">
                                        <p className="text-sm my-1 text-gray-600">Tipo</p>
                                        <p className="text-sm my-1">Amonestacion Escrita</p>
                                    </div>
                                    <div className="flex flex-row justify-between border rounded-b-sm border-gray-200 dark:border-zinc-700 px-3">
                                        <p className="text-sm my-1 text-gray-600">Categoria</p>
                                        <p className="text-sm my-1 text-orange-500">Tardanza</p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-self-center gap-2 mt-4">
                                    <button 
                                        onClick={() => {
                                            onClose()
                                        }}
                                        className="flex flex-row text-sm bg-blue-600 py-2 px-7 rounded-sm text-white justify-center cursor-pointer"
                                    >
                                        <DownloadIcon className="self-center"/>
                                        <p className="ml-2 self-center">Descargar Documento PDF</p>
                                    </button>
                                    <Link 
                                        href={"/dashboard/amonestaciones/visorDocumentos"}
                                        className="flex flex-row text-sm py-2 px-7 rounded-sm justify-center border">
                                        <p className="mr-2">Ver detalle del caso</p>
                                        <ArrowRightIcon className="self-center mt-0.5" size={18}/>
                                    </Link>
                                    <button 
                                        className="flex flex-row text-xs justify-center text-gray-600"
                                    >
                                        <p onClick={() => onClose()} className="hover:underline hover:font-semibold hover:text-gray-800 cursor-pointer">Finalizar</p>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
