"use client"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Filter, X } from "lucide-react"
import { BadgeStatus } from "@/components/BadgeStatus"

import { ViewDetalleSolicitud } from "@/components/ViewDetalleSolicitud"
import { useSolicitudesTotales } from "@/hooks/useSolicitudesTotales"
import type { SolicitudesAprobadas } from "../../../../types/Vacaciones"
import { Loading } from "@/components/Loading"
export default function SolicitudesAprobadas() {
    const { solicitudesTotales, isloadingSolicitudesTotales } = useSolicitudesTotales()
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectSolicitud, setSelectSolicitud] = useState<SolicitudesAprobadas>({} as SolicitudesAprobadas)
    const [searchTerm, setSearchTerm] = useState("")
    const [filtroJefes, setFiltroJefes] = useState(false)
    const filteredData = useMemo(() => {
        let solicitudesApro = solicitudesTotales;
        if (solicitudesApro.length > 0 && searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            solicitudesApro = solicitudesApro.filter(
                (item) => (item.alias ?? "").toLowerCase().includes(term)
            );
        }
        if (solicitudesApro.length > 0 && filtroJefes) {
            solicitudesApro = solicitudesApro.filter(
                (item) => item.idEmpleado === item.idJefe
            );
        }
        return solicitudesApro;
    }, [solicitudesTotales, searchTerm, filtroJefes]);
    if (isloadingSolicitudesTotales || solicitudesTotales === undefined) {
        return (
            <div className="h-[72vh] -translate-x-10">
                <Loading />
            </div>
        )
    }
    return (
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
                    <TableRow>
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
                    {solicitudesTotales && filteredData.map((solicitud, index) => (
                        <TableRow
                            key={solicitud.idVacacionesSolicitudes}
                            className="animate-in slide-in-from-left-5 duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <TableCell className="font-medium">{solicitud.fecSolicitud.split("T")[0]}</TableCell>
                            <TableCell>{solicitud.fecInicial.split("T")[0]}</TableCell>
                            <TableCell>{solicitud.fecFinal.split("T")[0]}</TableCell>
                            <TableCell className="font-medium text-foreground">{solicitud.alias}</TableCell>
                            <TableCell>
                                <BadgeStatus estado={solicitud.estadoVacaciones} />
                            </TableCell>
                            <TableCell className="text-center font-medium">{solicitud.cantDias}</TableCell>
                            <td className="w-32  font-medium">{solicitud.nombreArea}</td>
                            <TableCell>
                                <Button
                                    onClick={() => {
                                        setShowViewModal(true)
                                        setSelectSolicitud(solicitud)
                                    }}
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
            <ViewDetalleSolicitud
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                solicitud={selectSolicitud}
            />
        </div>

    )
}
