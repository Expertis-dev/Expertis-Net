"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, Upload, Search, Filter } from "lucide-react"
import { ViewJustificationModal } from "@/components/view-justification-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { UploadProofModal } from "@/components/upload-proof-modal"

// Datos de ejemplo
interface Justification {
  id: number
  fecha: string
  asesor: string
  grupo: string
  tipo: string
  tipo2: string
  estado: string
  observacion: string
}

const justificaciones = [
  {
    id: 1,
    fecha: "2024-01-15",
    asesor: "Juan Pérez",
    grupo: "Ventas A",
    tipo: "Falta",
    tipo2: "Justificada",
    estado: "Aprobado",
    observacion: "Cita médica programada",
  },
  {
    id: 2,
    fecha: "2024-01-14",
    asesor: "María García",
    grupo: "Ventas B",
    tipo: "Tardanza",
    tipo2: "Injustificada",
    estado: "Pendiente",
    observacion: "Problemas de transporte",
  },
  {
    id: 3,
    fecha: "2024-01-13",
    asesor: "Carlos López",
    grupo: "Soporte",
    tipo: "Permiso",
    tipo2: "Personal",
    estado: "Rechazado",
    observacion: "Trámites personales",
  },
]

export default function ListarJustificaciones() {
  const [filteredData, setFilteredData] = useState(justificaciones)
  const [filters, setFilters] = useState({
    asesor: "Todos",
    grupo: "Todos",
    tipo: "Todos",
    tipo2: "Todos",
    search: "",
  })
  const [selectedJustification, setSelectedJustification] = useState<Justification>({} as Justification)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  const handleFilter = () => {
    let filtered = justificaciones

    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.asesor.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.grupo.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.tipo.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.asesor !== "Todos") {
      filtered = filtered.filter((item) => item.asesor.includes(filters.asesor))
    }

    if (filters.grupo !== "Todos") {
      filtered = filtered.filter((item) => item.grupo.includes(filters.grupo))
    }

    if (filters.tipo !== "Todos") {
      filtered = filtered.filter((item) => item.tipo === filters.tipo)
    }

    if (filters.tipo2 !== "Todos") {
      filtered = filtered.filter((item) => item.tipo2 === filters.tipo2)
    }

    setFilteredData(filtered)
  }

  const handleView = (justification: Justification) => {
    setSelectedJustification(justification)
    setShowViewModal(true)
  }

  const handleDelete = (id: number) => {
    setItemToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      const updated = filteredData.filter((item) => item.id !== itemToDelete)
      setFilteredData(updated)
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const handleUploadProof = (justification: Justification) => {
    setSelectedJustification(justification)
    setShowUploadModal(true)
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aprobado</Badge>
      case "Pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendiente</Badge>
        )
      case "Rechazado":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rechazado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Listar Justificaciones</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestiona y consulta todas las justificaciones</p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label>Búsqueda General</Label>
                <div className="relative">
                  <Input
                    placeholder="Buscar..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asesor</Label>
                <Select
                  value={filters.asesor}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, asesor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Juan">Juan Pérez</SelectItem>
                    <SelectItem value="María">María García</SelectItem>
                    <SelectItem value="Carlos">Carlos López</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select
                  value={filters.grupo}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, grupo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Ventas A">Ventas A</SelectItem>
                    <SelectItem value="Ventas B">Ventas B</SelectItem>
                    <SelectItem value="Soporte">Soporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={filters.tipo}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Falta">Falta</SelectItem>
                    <SelectItem value="Tardanza">Tardanza</SelectItem>
                    <SelectItem value="Permiso">Permiso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subtipo</Label>
                <Select
                  value={filters.tipo2}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, tipo2: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Justificada">Justificada</SelectItem>
                    <SelectItem value="Injustificada">Injustificada</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleFilter}
                  className="w-full bg-[#001529] hover:bg-[#002040] dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  Filtrar
                </Button>
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
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell className="font-medium">{item.asesor}</TableCell>
                      <TableCell>{item.grupo}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.tipo2}</TableCell>
                      <TableCell>{getStatusBadge(item.estado)}</TableCell>
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
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
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
    </DashboardLayout>
  )
}
