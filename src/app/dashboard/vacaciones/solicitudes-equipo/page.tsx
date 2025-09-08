"use client"
import { DashboardLayout } from '@/components/dashboard-layout'
import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Solicitud {
    id: string
    fechaSolicitud: string
    fechaInicio: string
    fechaFinal: string
    empleado: string
    estado: "PENDIENTE" | "APROBADO"
    cantidadDias: number
}

const solicitudesPendientes: Solicitud[] = [
    {
        id: "1",
        fechaSolicitud: "2025-09-01",
        fechaInicio: "2025-09-15",
        fechaFinal: "2025-09-17",
        empleado: "CAROLINA PICHILINGUE",
        estado: "PENDIENTE",
        cantidadDias: 3,
    },
]

const solicitudesAprobadas: Solicitud[] = [
    {
        id: "2",
        fechaSolicitud: "2025-07-30",
        fechaInicio: "2025-07-30",
        fechaFinal: "2025-08-07",
        empleado: "YVAN LUCERO",
        estado: "APROBADO",
        cantidadDias: 9,
    },
    {
        id: "3",
        fechaSolicitud: "2025-06-30",
        fechaInicio: "2025-07-21",
        fechaFinal: "2025-07-27",
        empleado: "CAROLINA PICHILINGUE",
        estado: "APROBADO",
        cantidadDias: 7,
    },
    {
        id: "4",
        fechaSolicitud: "2025-05-26",
        fechaInicio: "2025-06-09",
        fechaFinal: "2025-06-15",
        empleado: "CAROLINA PICHILINGUE",
        estado: "APROBADO",
        cantidadDias: 7,
    },
]

interface SolicitudesTableProps {
    title: string
    solicitudes: Solicitud[]
    showActions?: boolean
}
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
function SolicitudesTable({ title, solicitudes, showActions = false }: SolicitudesTableProps) {
    return (
        <Card className="animate-in fade-in-50 duration-500">
            <CardHeader className="">
                <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-10">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-medium">Fecha de Solicitud</TableHead>
                            <TableHead className="font-medium">Fecha de Inicio</TableHead>
                            <TableHead className="font-medium">Fecha Final</TableHead>
                            <TableHead className="font-medium">Empleado</TableHead>
                            <TableHead className="font-medium">Estado</TableHead>
                            <TableHead className="font-medium">Cantidad de Días</TableHead>
                            {showActions && <TableHead className="font-medium">Acción</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {solicitudes.map((solicitud, index) => (
                            <TableRow
                                key={solicitud.id}
                                className="animate-in slide-in-from-left-5 duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <TableCell className="font-medium">{solicitud.fechaSolicitud}</TableCell>
                                <TableCell>{solicitud.fechaInicio}</TableCell>
                                <TableCell>{solicitud.fechaFinal}</TableCell>
                                <TableCell className="font-medium text-foreground">{solicitud.empleado}</TableCell>
                                <TableCell>{getStatusBadge(solicitud.estado)}
                                </TableCell>
                                <TableCell className="font-medium">{solicitud.cantidadDias}</TableCell>
                                {showActions && (
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                                        >
                                            Ver
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function Pagination() {
    const [currentPage, setCurrentPage] = useState(1)

    return (
        <div className="flex items-center justify-center gap-2 mt-6 animate-in fade-in-50 duration-500 delay-300">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="transition-all duration-200 hover:scale-105"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
                className="transition-all duration-200 hover:scale-105"
            >
                1
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                disabled={currentPage === 10}
                className="transition-all duration-200 hover:scale-105"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
export default function SolicitudesEquipo() {
    return (
        <DashboardLayout>
            <div className="space-y-4 animate-in fade-in-50 duration-700">
                <SolicitudesTable title="Solicitudes en Proceso" solicitudes={solicitudesPendientes} showActions={true} />
                <SolicitudesTable title="Solicitudes Aprobadas" solicitudes={solicitudesAprobadas} />
                <Pagination />
            </div>
        </DashboardLayout>
    )
}
