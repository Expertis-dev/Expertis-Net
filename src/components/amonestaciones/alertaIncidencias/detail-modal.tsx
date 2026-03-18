import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import type { Incidencia } from "@/types/Incidencias";

interface DetailIncidenciaModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly incidencia: Incidencia | null;
}

const formatKey = (key: string) => {
  const withSpaces = key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
  return withSpaces.replace(/\b\w/g, (match) => match.toUpperCase());
};

const isBooleanLikeNumber = (key: string, value: unknown) =>
  typeof value === "number" && (key.startsWith("es") || key.startsWith("hay") || key === "descuento");

export function DetailIncidenciaModal({ isOpen, onClose, incidencia }: DetailIncidenciaModalProps) {
  if (!incidencia) {
    return null;
  }

  const estados = Object.entries(incidencia)
    .filter(([key, value]) => isBooleanLikeNumber(key, value))
    .map(([key, value]) => ({ key, value: value as number }));

  const infoBase = [
    { label: "Asesor", value: incidencia.alias },
    { label: "Agencia", value: incidencia.agencia },
    { label: "Fecha", value: incidencia.fecha },
    { label: "Horario", value: incidencia.horario },
    { label: "Hora ingreso", value: incidencia.horaIngreso ?? "-" },
    { label: "Hora salida", value: incidencia.horaSalida ?? "-" },
    { label: "Tipo", value: incidencia.tipo ?? "-" },
    { label: "Tipo ausencia", value: incidencia.tipoAusencia ?? "-" },
    { label: "Tipo subsidio", value: incidencia.tipoSubsidio ?? "-" },
    { label: "Tipo goce", value: incidencia.tipoGoce ?? "-" },
    { label: "Tipo justificacion", value: incidencia.tipoJustificacion ?? "-" },
    { label: "Minutos permiso", value: incidencia.minutos_permiso },
    { label: "Minutos tardanza", value: incidencia.minutosTardanza },
    { label: "Descuento", value: incidencia.descuento },
    { label: "Inicio gestion", value: incidencia.fechaInicioGestion },
    { label: "Fin gestion", value: incidencia.fechaFinGestion ?? "-" },
  ];

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
            className="w-full max-w-5xl"
          >
            <Card className="border-2 border-slate-200 dark:border-neutral-700 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-neutral-700">
                <CardTitle className="flex items-center gap-2 pb-3 text-slate-800 dark:text-slate-100">
                  <FileText className="h-5 w-5" />
                  Detalle de Incidencia - {incidencia.alias}
                </CardTitle>
              </CardHeader>

              <CardContent className="py-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="overflow-y-auto max-h-[50vh]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead colSpan={2} className="font-bold text-center bg-muted">
                            DATOS GENERALES
                          </TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead>Campo</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {infoBase.map((item) => (
                          <TableRow key={item.label}>
                            <TableCell className="font-medium">{item.label}</TableCell>
                            <TableCell>{item.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="overflow-y-auto max-h-[50vh]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead colSpan={2} className="font-bold text-center bg-muted">
                            ESTADOS (SI/NO)
                          </TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead>Campo</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estados.length > 0 ? (
                          estados.map((item) => (
                            <TableRow key={item.key}>
                              <TableCell className="font-medium">{formatKey(item.key)}</TableCell>
                              <TableCell>{item.value === 1 ? "SI": "NO"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                              No hay campos booleanos numericos
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
