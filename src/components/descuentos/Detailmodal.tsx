"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import React from 'react'
import { Descuentos } from '@/app/dashboard/asistencia/descuentos/DescuentoEquipo';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText, X } from 'lucide-react';

interface Props {
  isOpen: boolean,
  details: Descuentos[] | undefined,
  onClose: () => void
}

export const Detailmodal = ({ details = [], isOpen, onClose }: Props) => {

  const hasData = details.length > 0;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-zinc-900/30 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl"
          >
            <Card className="shadow-2xl rounded-2xl overflow-hidden">
              
              {/* HEADER */}
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Detalle de Descuentos ({details.length})
                </CardTitle>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>

              {/* CONTENT */}
              <CardContent className="p-0">
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className='text-center'>Fecha</TableHead>
                        <TableHead className='text-center'>Motivo</TableHead>
                        <TableHead className='text-center'>Monto</TableHead>
                        <TableHead className='text-center'>Tardanza (min)</TableHead>
                        <TableHead className='text-center'>Permiso (min)</TableHead>
                        {/* <TableHead>Estado</TableHead> */}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {hasData ? (
                        details.map((item, index) => (
                          <TableRow key={`${item.alias}-${index}`} className='text-center'>
                            <TableCell>{item.fecha}</TableCell>

                            <TableCell className="font-medium">
                              {item.motivo}
                            </TableCell>

                            <TableCell>
                              S/ {item.monto.toFixed(2)}
                            </TableCell>

                            <TableCell>
                              {item.minutosTardanza ?? "-"}
                            </TableCell>

                            <TableCell>
                              {item.minutosPermiso ?? "-"}
                            </TableCell>

                            {/* <TableCell>
                              <span className="px-2 py-1 text-xs rounded-md bg-muted">
                                {item.estado || "—"}
                              </span>
                            </TableCell> */}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            No hay datos disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>

            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}