import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import type { DetailModalProps } from "@/types/Bases";

export function DetailModal({ isOpen, onClose, detalle }: DetailModalProps) {
  // Guard clause - si no hay detalle, no renderizar nada
  if (!detalle || !detalle.gestionesDetalladas.length) {
    return null;
  }

  console.log("DETALLE EN MODAL", detalle);

  const nombreAsesor = detalle.gestionesDetalladas[0]?.asesor || "Desconocido";

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
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="flex items-center gap-2 pb-3 text-slate-800 dark:text-slate-100">
                  <FileText className="h-5 w-5" />
                  Detalle de Gestiones del Asesor - {nombreAsesor}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="py-2 space-y-2">
                <div className="grid grid-cols-3 gap-4 h-[50vh]">
                  {/* Tabla de clientes gestionados */}
                  <div className="col-span-2 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead colSpan={6} className="font-bold text-center bg-muted">
                            CLIENTES GESTIONADOS
                          </TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead>Documento</TableHead>
                          <TableHead>Cartera</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Nivel 1</TableHead>
                          <TableHead>Nivel 2</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detalle.gestionesDetalladas.map((item, index) => (
                          <TableRow
                            key={`${item.documento}-${index}`}
                            className="animate-in slide-in-from-left-5 duration-300"
                          >
                            <TableCell>{item.documento}</TableCell>
                            <TableCell className="font-medium">{item.cartera}</TableCell>
                            <TableCell>
                              {item.fechaLlamada.split('T')[0]}
                            </TableCell>
                            <TableCell>
                              {item.hora.split('.')[0]}
                            </TableCell>
                            <TableCell>{item.nvl1}</TableCell>
                            <TableCell>{item.nvl2}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Tabla de clientes no gestionados */}
                  <div className="overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead colSpan={2} className="font-bold text-center bg-muted">
                            CLIENTES NO GESTIONADOS
                          </TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead>Documento</TableHead>
                          <TableHead>Cartera</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detalle.gestionesNoGestionadas.length > 0 ? (
                          detalle.gestionesNoGestionadas.map((item, index) => (
                            <TableRow
                              key={`${item.documento}-${index}`}
                              className="animate-in slide-in-from-left-5 duration-300"
                            >
                              <TableCell>{item.documento}</TableCell>
                              <TableCell className="font-medium">{item.cartera}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                              No hay clientes no gestionados
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}