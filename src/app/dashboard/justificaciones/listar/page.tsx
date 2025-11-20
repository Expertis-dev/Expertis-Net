"use client"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Trash2, Upload, Filter, Pen } from "lucide-react"
import { ViewJustificationModal } from "@/components/view-justification-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { UploadProofModal } from "@/components/upload-proof-modal"
import { Justificaciones } from '../../../../types/Justificaciones';
import { useJustificaciones } from "@/hooks/useJustificaciones"
import { LoadingModal } from "@/components/loading-modal"
import { toast } from "sonner"
import { useUser } from "@/Provider/UserProvider"
import { ActualizarJustificaciones } from "@/components/ActualizarJustificaciones"

export default function ListarJustificaciones() {
  const { user } = useUser()
  const { justificaciones, fetchJustificaciones, isLoadingJustificaciones } = useJustificaciones();
  const [showLoading, setShowLoading] = useState(false)
  const [filters, setFilters] = useState({
    asesor: "",
    grupo: "",
    tipo: "Todos",
    tipo3: "",
  })
  const filteredData = useMemo(() => {
    let filtered = justificaciones
    if (filters.asesor) {
      filtered = filtered.filter(
        (item) =>
          item.asesor.toLowerCase().includes(filters.asesor.toLowerCase())
      )
    }
    if (filters.grupo) {
      filtered = filtered.filter(
        (item) =>
          item.grupo.toLowerCase().includes(filters.grupo.toLowerCase())
      )
    }
    if (filters.tipo !== "Todos") {
      filtered = filtered.filter((item) => item.nivel1 === filters.tipo)
    }
    if (filters.tipo3) {
      filtered = filtered.filter(
        (item) =>
          item.nivel3.toLowerCase().includes(filters.tipo3.toLowerCase())
      )
    }

    return filtered
  }, [justificaciones, filters])


  const [selectedJustification, setSelectedJustification] = useState<Justificaciones>({} as Justificaciones)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [setShowUppdateModal, setSetShowUppdateModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const handleView = (justification: Justificaciones) => {
    setSelectedJustification(justification)
    setShowViewModal(true)
  }
  const handleDelete = (id: number) => {
    setItemToDelete(id)
    setShowDeleteModal(true)
  }
  const handleEditar = (justification: Justificaciones) => {
    setSelectedJustification(justification)
    setSetShowUppdateModal(true)
  }

  const confirmDelete = async () => {
    if (itemToDelete) {
      setShowLoading(true)
      setShowDeleteModal(false)
      setItemToDelete(null)
      //const updated = filteredData.filter((item) => item.id !== itemToDelete)
      //setFilteredData(updated)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eliminarJustifPorID/${itemToDelete}`, {
          method: "DELETE",
        }).then((response) => {
          if (response.status === 200) {
            toast.success("Justificacion eliminada exitosamente");
          }
        })
        await fetchJustificaciones()
        setShowLoading(false)
      }
      catch (error) {
        toast.error("Error al eliminar la justificación")
        console.error("Error al eliminar la justificación:", error)
      }
      setShowLoading(false)
    }
  }

  const handleUploadProof = (justification: Justificaciones) => {
    setSelectedJustification(justification)
    setShowUploadModal(true)
  }
  const onCloseActualizarJustificaciones = async () => {
    await fetchJustificaciones()
    setSetShowUppdateModal(false)
  }
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Listar Justificaciones</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestiona y consulta todas las justificaciones</p>
        </div>
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({
                      asesor: "",
                      grupo: "",
                      tipo: "Todos",
                      tipo3: "",
                    })
                  }}
                  className="w-full bg-slate-300 text-black/80 hover:bg-slate-400 dark:bg-neutral-700 dark:hover:bg-neutral-800 dark:text-white"
                >
                  Limpiar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Asesor</Label>
                <Input
                  placeholder="Buscar..."
                  value={filters.asesor}
                  onChange={(e) => setFilters((prev) => ({ ...prev, asesor: e.target.value }))}
                  className="pr-10 w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Input
                  placeholder="Buscar..."
                  value={filters.grupo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, grupo: e.target.value }))}
                  className="pr-10 w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={filters.tipo}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="FALTA">Falta</SelectItem>
                    <SelectItem value="TARDANZA">Tardanza</SelectItem>
                    <SelectItem value="PERMISO">Permiso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subtipo</Label>
                <Input
                  placeholder="Buscar..."
                  value={filters.tipo3}
                  onChange={(e) => setFilters((prev) => ({ ...prev, tipo3: e.target.value }))}
                  className="pr-10 w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Justificaciones ({filteredData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Subtipo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="animate-in slide-in-from-left-5 duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TableCell>{item.fecha.split("T")[0]}</TableCell>
                      <TableCell className="font-medium">{item.asesor}</TableCell>
                      <TableCell>{item.grupo}</TableCell>
                      <TableCell>{item.nivel1}</TableCell>
                      <td className="w-40 p-1 align-middle">{item.nivel3}</td>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUploadProof(item)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {
                            user?.usuario === "MAYRA LLIMPE" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditar(item)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                              >
                                <Pen className="h-4 w-4" />
                              </Button>
                            )
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <LoadingModal isOpen={isLoadingJustificaciones} message="Trayendo justificaciones..." />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <ViewJustificationModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        justification={selectedJustification}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Justificación"
        message="¿Estás seguro de que deseas eliminar esta justificación? Esta acción no se puede deshacer."
      />
      <UploadProofModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        justification={selectedJustification}
      />
      <ActualizarJustificaciones
        isOpen={setShowUppdateModal}
        onClose={onCloseActualizarJustificaciones}
        justification={selectedJustification}
      />
      <LoadingModal isOpen={showLoading} message="Procesando justificación..." />
      
    </DashboardLayout >
  )
}
