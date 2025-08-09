"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar } from "lucide-react"

const asesores = [
  "Juan Pérez",
  "María García",
  "Carlos López",
  "Ana Martínez",
  "Pedro Rodríguez",
  "Laura Sánchez",
  "Miguel Torres",
  "Carmen Ruiz",
]
interface HistorialVacaciones {
  id: number
  codMes: string
  fechaInicio: string
  fechaFin: string
  diasTomados: number
  diasHabiles: number
  diasNoHabiles: number
  estado: string
  fechaSolicitud: string
}

// Datos de ejemplo
const historialVacaciones = {
  "Juan Pérez": [
    {
      id: 1,
      codMes: "2024-01",
      fechaInicio: "2024-01-15",
      fechaFin: "2024-01-25",
      diasTomados: 11,
      diasHabiles: 8,
      diasNoHabiles: 3,
      estado: "Aprobado",
      fechaSolicitud: "2024-01-01",
    },
    {
      id: 2,
      codMes: "2024-03",
      fechaInicio: "2024-03-10",
      fechaFin: "2024-03-15",
      diasTomados: 6,
      diasHabiles: 4,
      diasNoHabiles: 2,
      estado: "Pendiente",
      fechaSolicitud: "2024-02-20",
    },
  ],
  "María García": [
    {
      id: 3,
      codMes: "2024-02",
      fechaInicio: "2024-02-05",
      fechaFin: "2024-02-12",
      diasTomados: 8,
      diasHabiles: 6,
      diasNoHabiles: 2,
      estado: "Aprobado",
      fechaSolicitud: "2024-01-15",
    },
  ],
}

export default function SolicitudesAsesor() {
  const [selectedAsesor, setSelectedAsesor] = useState("")
  const [filteredAsesores, setFilteredAsesores] = useState<string[]>([])
  const [showAsesores, setShowAsesores] = useState(false)
  const [historial, setHistorial] = useState<HistorialVacaciones[]>([])

  const handleAsesorChange = (value: string) => {
    setSelectedAsesor(value)
    if (value) {
      const filtered = asesores.filter((asesor) => asesor.toLowerCase().includes(value.toLowerCase()))
      setFilteredAsesores(filtered)
      setShowAsesores(true)
    } else {
      setShowAsesores(false)
      setHistorial([])
    }
  }

  const selectAsesor = (asesor: string) => {
    setSelectedAsesor(asesor)
    setShowAsesores(false)

    // Cargar historial del asesor
    const asesorHistorial = historialVacaciones[asesor as keyof typeof historialVacaciones] || []
    setHistorial(asesorHistorial)
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

  const totalDiasAprobados = historial
    .filter((item) => item.estado === "Aprobado")
    .reduce((sum, item) => sum + item.diasTomados, 0)

  const totalDiasHabiles = historial
    .filter((item) => item.estado === "Aprobado")
    .reduce((sum, item) => sum + item.diasHabiles, 0)

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#001529] dark:text-white mb-2">Solicitudes Asesor</h1>
          <p className="text-slate-600 dark:text-slate-400">Consulta el historial de vacaciones de los asesores</p>
        </div>

        {/* Búsqueda de Asesor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Buscar Asesor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 relative">
              <Label htmlFor="asesor">Asesor</Label>
              <div className="relative">
                <Input
                  id="asesor"
                  placeholder="Buscar asesor..."
                  value={selectedAsesor}
                  onChange={(e) => handleAsesorChange(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              {showAsesores && filteredAsesores.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-40 overflow-y-auto"
                >
                  {filteredAsesores.map((asesor) => (
                    <button
                      key={asesor}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => selectAsesor(asesor)}
                    >
                      {asesor}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas del Asesor */}
        {selectedAsesor && historial.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalDiasAprobados}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Días Aprobados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalDiasHabiles}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Días Hábiles</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{historial.length}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Solicitudes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabla de Historial */}
        {selectedAsesor && (
          <Card>
            <CardHeader>
              <CardTitle>
                Historial de Vacaciones - {selectedAsesor} ({historial.length} registros)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historial.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cód. Mes</TableHead>
                        <TableHead>Fecha Inicio</TableHead>
                        <TableHead>Fecha Fin</TableHead>
                        <TableHead>Días Tomados</TableHead>
                        <TableHead>Días Hábiles</TableHead>
                        <TableHead>Días No Hábiles</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Solicitud</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historial.map((item) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell className="font-medium">{item.codMes}</TableCell>
                          <TableCell>{item.fechaInicio}</TableCell>
                          <TableCell>{item.fechaFin}</TableCell>
                          <TableCell className="text-center">{item.diasTomados}</TableCell>
                          <TableCell className="text-center">{item.diasHabiles}</TableCell>
                          <TableCell className="text-center">{item.diasNoHabiles}</TableCell>
                          <TableCell>{getStatusBadge(item.estado)}</TableCell>
                          <TableCell>{item.fechaSolicitud}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedAsesor
                      ? "No se encontraron registros para este asesor"
                      : "Selecciona un asesor para ver su historial"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
