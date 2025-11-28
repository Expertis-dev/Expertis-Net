"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Calendar } from "lucide-react"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { BadgeStatus } from "@/components/BadgeStatus"
import { useSolicitudes } from "@/hooks/useSolicitudes"
import { Loading } from "@/components/Loading"
import { Solicitudes } from "@/types/Vacaciones"
import { CargarActividad } from "@/services/CargarActividad"
import { useUser } from "@/Provider/UserProvider"
import { toast } from "sonner"


export default function MisSolicitudes() {
  const { solicitudes, isloadingSolicitudes, fetchSolicitudes } = useSolicitudes()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Solicitudes | null>(null)
  const { user } = useUser()
  const handleDelete = (solicitud: Solicitudes) => {
    setItemToDelete(solicitud)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eliminarSolicitudVacacionesPendiente`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: itemToDelete.id,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al cambiar el estado de la vacación");
      }
      CargarActividad({
        usuario: user?.usuario || "Desconocido",
        titulo: "Eliminar solicitud vacaciones",
        descripcion: `Se eliminó la solicitud de la vacación de ${itemToDelete.fecInicial.split("T")[0]} al ${itemToDelete.fecFinal.split("T")[0]}`,
        estado: "completed",
      });
      toast.success("Se eliminó correctamente la solicitud");
      setShowDeleteModal(false);
      setItemToDelete(null);
      await fetchSolicitudes();
    } catch (error) {
      console.error("Error al eliminar la solicitud:", error);
      CargarActividad({
        usuario: user?.usuario || "Desconocido",
        titulo: "Error al eliminar solicitud vacaciones",
        descripcion: `No se pudo eliminar la solicitud de la vacación de ${itemToDelete.fecInicial.split("T")[0]} al ${itemToDelete.fecFinal.split("T")[0]}.`,
        estado: "error",
      });
      toast.error("Ocurrió un error al eliminar la solicitud. Intente nuevamente.");
    }
  };

  const canDelete = (estado: string) => estado === "PENDIENTE"
  if (isloadingSolicitudes || solicitudes === undefined) {
    return (
      <div className="h-[72vh] -translate-x-10">
        <Loading />
      </div>
    )
  }
  return (
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
                  {solicitudes.filter((s) => s.estadoVacaciones === "PENDIENTE").length}
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
                  {solicitudes.filter((s) => s.estadoVacaciones === "RECHAZADO").length}
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
                {solicitudes.map((item, index) => (
                  <TableRow
                    key={`${item.idVacacionesSolicitudes}`}
                    className="animate-in slide-in-from-left-5 duration-300"
                    style={{ animationDelay: `${index * 100} ms` }}
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
                        onClick={() => handleDelete(item)}
                        disabled={!canDelete(item.estadoVacaciones)}
                        className={`${canDelete(item.estadoVacaciones)
                          ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          : "text-slate-400 cursor-not-allowed"
                          }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Solicitud"
        message="¿Estás seguro de que deseas eliminar esta solicitud de vacaciones? Esta acción no se puede deshacer."
      />
    </motion.div>


  )
}
