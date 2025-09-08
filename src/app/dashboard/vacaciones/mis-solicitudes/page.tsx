"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar } from "lucide-react"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

// Datos de ejemplo
const solicitudes = [
  {
    id: 1,
    fechaSolicitud: "2024-01-10",
    fechaInicio: "2024-02-15",
    fechaFin: "2024-02-25",
    numeroDias: 11,
    diasHabiles: 8,
    diasNoHabiles: 3,
    estado: "Aprobado",
  },
  {
    id: 2,
    fechaSolicitud: "2024-01-08",
    fechaInicio: "2024-03-01",
    fechaFin: "2024-03-07",
    numeroDias: 7,
    diasHabiles: 5,
    diasNoHabiles: 2,
    estado: "Pendiente",
  },
  {
    id: 3,
    fechaSolicitud: "2024-01-05",
    fechaInicio: "2024-01-20",
    fechaFin: "2024-01-22",
    numeroDias: 3,
    diasHabiles: 3,
    diasNoHabiles: 0,
    estado: "Rechazado",
  },
]

export default function MisSolicitudes() {
  const [data, setData] = useState(solicitudes)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  const handleDelete = (id: number) => {
    setItemToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      const updated = data.filter((item) => item.id !== itemToDelete)
      setData(updated)
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
            Aprobado
          </Badge>
        )
      case "Pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            Pendiente
          </Badge>
        )
      case "Rechazado":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const canDelete = (estado: string) => estado === "Pendiente"

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Mis Solicitudes</h1>
          <p className="text-slate-600 dark:text-slate-400">Consulta el estado de tus solicitudes de vacaciones</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {data.filter((s) => s.estado === "Aprobado").length}
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
                    {data.filter((s) => s.estado === "Pendiente").length}
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
                    {data.filter((s) => s.estado === "Rechazado").length}
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
            <CardTitle>Historial de Solicitudes ({data.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {data.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>{item.fechaSolicitud}</TableCell>
                      <TableCell>{item.fechaInicio}</TableCell>
                      <TableCell>{item.fechaFin}</TableCell>
                      <TableCell className="text-center">{item.numeroDias}</TableCell>
                      <TableCell className="text-center">{item.diasHabiles}</TableCell>
                      <TableCell className="text-center">{item.diasNoHabiles}</TableCell>
                      <TableCell>{getStatusBadge(item.estado)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
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
