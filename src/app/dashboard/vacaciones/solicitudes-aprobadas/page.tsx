"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Filter, X } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface SolicitudAprobada {
    id: string
    fechaSolicitud: string
    fechaInicio: string
    fechaFinal: string
    empleado: string
    estado: "APROBADO"
    cantidadDias: number
    area: string
}

const mockData: SolicitudAprobada[] = [
    {
        id: "1",
        fechaSolicitud: "2025-08-14",
        fechaInicio: "2025-10-01",
        fechaFinal: "2025-10-15",
        empleado: "MAURICIO MARTINEZ",
        estado: "APROBADO",
        cantidadDias: 15,
        area: "JUDICIAL",
    },
    {
        id: "2",
        fechaSolicitud: "2025-08-14",
        fechaInicio: "2025-10-01",
        fechaFinal: "2025-10-15",
        empleado: "MAURICIO MARTINEZ",
        estado: "APROBADO",
        cantidadDias: 15,
        area: "JUDICIAL",
    },
    {
        id: "3",
        fechaSolicitud: "2025-09-04",
        fechaInicio: "2025-09-01",
        fechaFinal: "2025-09-30",
        empleado: "KENNETH CUBA",
        estado: "APROBADO",
        cantidadDias: 30,
        area: "OPERACIONES",
    },
    {
        id: "4",
        fechaSolicitud: "2025-09-05",
        fechaInicio: "2025-09-01",
        fechaFinal: "2025-09-30",
        empleado: "GIANFRANCO PINEDO",
        estado: "APROBADO",
        cantidadDias: 30,
        area: "CALL",
    },
    {
        id: "5",
        fechaSolicitud: "2025-08-25",
        fechaInicio: "2025-09-01",
        fechaFinal: "2025-09-30",
        empleado: "JUAN LOZA",
        estado: "APROBADO",
        cantidadDias: 30,
        area: "CALL",
    },
]
const getStatusBadge = (estado: string) => {
    switch (estado) {
        case "APROBADO":
            return (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                    Aprobado
                </Badge>
            )
        case "PENDIENTE":
            return (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                    Pendiente
                </Badge>
            )
        case "RECHAZADO":
            return (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                    Rechazado
                </Badge>
            )
        default:
            return <Badge variant="secondary">{estado}</Badge>
    }
}
export default function SolicitudesAprobadas() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filtroJefes, setFiltroJefes] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const filteredData = mockData.filter((solicitud) => {
        const matchesSearch = solicitud.empleado.toLowerCase().includes(searchTerm.toLowerCase())
        // Simple filter logic - you can customize this based on your business logic
        const matchesFilter = !filtroJefes || solicitud.area === "JUDICIAL"
        return matchesSearch && matchesFilter
    })

    const totalPages = 34 // Based on your image
    const visiblePages = [1, 2, 3, 4, 5]

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in-0 duration-500">
                <p className="text-2xl font-bold">Solicitudes Aprobadas</p>
                <div className="flex flex-col space-y-4">
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-80">
                            <Input
                                type="text"
                                placeholder="Buscar por empleado"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={filtroJefes ? "default" : "outline"}
                                onClick={() => setFiltroJefes(!filtroJefes)}
                                className={`transition-all duration-200 ${filtroJefes
                                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                                    : "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                                    }`}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtro Solo Jefes
                            </Button>

                            {(searchTerm || filtroJefes) && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setFiltroJefes(false)
                                    }}
                                    className="transition-all duration-200 hover:bg-gray-50"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Quitar Filtro
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Table */}
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Fecha de Solicitud</TableHead>
                            <TableHead className="font-semibold">Fecha de Inicio</TableHead>
                            <TableHead className="font-semibold">Fecha Final</TableHead>
                            <TableHead className="font-semibold">Empleado</TableHead>
                            <TableHead className="font-semibold">Estado</TableHead>
                            <TableHead className="font-semibold">Cantidad de Días</TableHead>
                            <TableHead className="font-semibold">Área</TableHead>
                            <TableHead className="font-semibold">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((solicitud, index) => (
                            <TableRow
                                key={solicitud.id}
                                className="animate-in slide-in-from-left-5 duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <TableCell className="font-medium">{solicitud.fechaSolicitud}</TableCell>
                                <TableCell>{solicitud.fechaInicio}</TableCell>
                                <TableCell>{solicitud.fechaFinal}</TableCell>
                                <TableCell className="font-medium text-foreground">{solicitud.empleado}</TableCell>
                                <TableCell>{getStatusBadge(solicitud.estado)}</TableCell>
                                <TableCell className="text-center font-medium">{solicitud.cantidadDias}</TableCell>
                                <TableCell className="font-medium text-foreground">{solicitud.area}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Pagination */}
                <div className="flex justify-center items-center space-x-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="transition-all duration-200 hover:bg-gray-50"
                    >
                        ‹
                    </Button>

                    {visiblePages.map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`transition-all duration-200 ${currentPage === page
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                }`}
                        >
                            {page}
                        </Button>
                    ))}

                    <span className="text-gray-500 text-sm">...</span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="transition-all duration-200 hover:bg-gray-50"
                    >
                        {totalPages}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="transition-all duration-200 hover:bg-gray-50"
                    >
                        ›
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    )
}
