"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Calendar } from "lucide-react"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { BadgeStatus } from "@/components/BadgeStatus"
import { useSolicitudes } from "@/hooks/useSolicitudes"


export default function MisSolicitudes() {
  const { solicitudes } = useSolicitudes()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    setItemToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const canDelete = (estado: string) => estado === "Pendiente"

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Mis Solicitudes</h1>
          <p className="text-slate-600 dark:text-slate-400">Consulta el estado de tus solicitudes de vacaciones</p>
        </div>
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {solicitudes.filter((s) => s.estadoVacaciones === "APROBADO").length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Aprobadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {solicitudes.filter((s) => s.estadoVacaciones === "Pendiente").length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Pendientes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {solicitudes.filter((s) => s.estadoVacaciones === "Rechazado").length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Rechazadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Solicitudes ({solicitudes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Total Días</TableHead>
                    <TableHead>Días Hábiles</TableHead>
                    <TableHead>Días No Hábiles</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudes.map((item) => (
                    <motion.tr
                      key={item.idVacacionesSolicitudes}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>{item.fecSolicitud.split("T")[0]}</TableCell>
                      <TableCell>{item.fecInicial.split("T")[0]}</TableCell>
                      <TableCell>{item.fecFinal.split("T")[0]}</TableCell>
                      <TableCell className="text-center">{item.cantDias}</TableCell>
                      <TableCell className="text-center">{item.cantDiasHabiles}</TableCell>
                      <TableCell className="text-center">{item.cantDiasNoHabiles}</TableCell>
                      <TableCell>
                        <BadgeStatus estado={item.estadoVacaciones} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.idVacacionesSolicitudes)}
                          disabled={!canDelete(item.estado)}
                          className={`${
                            canDelete(item.estado)
                              ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                              : "text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Solicitud"
        message="¿Estás seguro de que deseas eliminar esta solicitud de vacaciones? Esta acción no se puede deshacer."
      />
    </DashboardLayout>
  )
}
