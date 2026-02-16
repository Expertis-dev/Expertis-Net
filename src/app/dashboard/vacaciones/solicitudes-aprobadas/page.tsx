"use client"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDownIcon, Eye, Filter, X } from "lucide-react"
import { BadgeStatus } from "@/components/BadgeStatus"

import { ViewDetalleSolicitud } from "@/components/ViewDetalleSolicitud"
import { useSolicitudesTotales } from "@/hooks/useSolicitudesTotales"
import type { SolicitudesAprobadas } from "../../../../types/Vacaciones"
import { Loading } from "@/components/Loading"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import type { DateRange } from "react-day-picker"
import * as XLSX from 'xlsx'
import { saveAs } from "file-saver";
import { format } from 'date-fns'
import { es } from "date-fns/locale"

export default function SolicitudesAprobadas() {
    const { solicitudesTotales, isloadingSolicitudesTotales } = useSolicitudesTotales()
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectSolicitud, setSelectSolicitud] = useState<SolicitudesAprobadas>({} as SolicitudesAprobadas)
    const [filtroJefes, setFiltroJefes] = useState(false)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [empleadoBuscar, setEmpleadoBuscar] = useState("")
    const filteredData = useMemo(() => {
        let solicitudesApro = solicitudesTotales;
        if (solicitudesApro.length > 0 && empleadoBuscar.trim() !== "") {
            const term = empleadoBuscar.toLowerCase();
            solicitudesApro = solicitudesApro.filter(
                (item) => (item.alias ?? "").toLowerCase().includes(term)
            );
        }
        if (solicitudesApro.length > 0 && dateRange?.from) {
            const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
            const toDate = dateRange.to
                ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate())
                : undefined;
            solicitudesApro = solicitudesApro.filter((item) => {
                const solicitudDateRaw = new Date(item.fecSolicitud);
                const solicitudDate = new Date(
                    solicitudDateRaw.getFullYear(),
                    solicitudDateRaw.getMonth(),
                    solicitudDateRaw.getDate()
                );
                if (!toDate) {
                    return solicitudDate >= fromDate;
                }
                return solicitudDate >= fromDate && solicitudDate <= toDate;
            });
        }
        if (solicitudesApro.length > 0 && filtroJefes) {
            solicitudesApro = solicitudesApro.filter(
                (item) => item.idEmpleado === item.idJefe
            );
        }
        return solicitudesApro;
    }, [solicitudesTotales, empleadoBuscar, dateRange, filtroJefes]);
    if (isloadingSolicitudesTotales || solicitudesTotales === undefined) {
        return (
            <div className="h-[72vh] -translate-x-10">
                <Loading />
            </div>
        )
    }

    const getLabelRangoFechas = () => {
        if (dateRange?.from && dateRange?.to) {
            return `${dateRange.from.toLocaleDateString("es-PE")} - ${dateRange.to.toLocaleDateString("es-PE")}`
        }
        if (dateRange?.from && !dateRange?.to) {
            return `Desde ${dateRange.from.toLocaleDateString("es-PE")}`
        }
        return "Seleccionar rango de fechas"
    }

    const onClickDownloadExcel = () => {
        const rows: any[][] = filteredData.map((o) => {
            return [
                o.fecSolicitud.split("T")[0], 
                o.fecInicial.split("T")[0], 
                o.fecFinal.split("T")[0], 
                o.alias, 
                o.estadoVacaciones, 
                o.cantDias, 
                o.nombreArea
            ]
        });
        const aoaData: string[][] = [
            [
                "Fecha de Solicitud",
                "Fecha de Inicio",
                "Fecha Final",
                "Empleado",
                "Estado",
                "Cantidad de Días",
                "Área",
            ], // COLUMNAS
            ...rows
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "solicitudes aprobadas");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, `solicitudes_aprobadas_${format((new Date), 'yyyy-MM', { locale: es })}.xlsx`);
    }

    return (
        <div className="space-y-6 animate-in fade-in-0 duration-500">
            <div className="flex justify-between">
                <p className="text-2xl font-bold">Solicitudes Aprobadas</p>
                <Button onClick={onClickDownloadExcel}>Exportar Excel</Button>
            </div>
            <div className="flex flex-col space-y-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="grid grid-cols-3 gap-8 my-2">

                        <div className="space-y-2">
                            <Label>Buscar Empleado</Label>
                            <Input
                                value={empleadoBuscar}
                                onChange={(e) => setEmpleadoBuscar(e.target.value)}
                                placeholder="Escribe el nombre o alias"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rango de Fecha de Solicitud</Label>
                            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between font-normal"
                                    >
                                        {getLabelRangoFechas()}
                                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        captionLayout="dropdown"
                                        selected={dateRange}
                                        onSelect={(range) => setDateRange(range)}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
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

                        {(empleadoBuscar || filtroJefes || dateRange?.from) && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEmpleadoBuscar("")
                                    setFiltroJefes(false)
                                    setDateRange(undefined)
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
