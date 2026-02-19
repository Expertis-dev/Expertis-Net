"use client"
import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUser } from "@/Provider/UserProvider"
import { getSolicitudesAprobadas, getSolicitudesProceso } from "../../../../services/vacaciones"
import { ArraySolicitudesAprobadas, SolicitudesAprobadas } from "../../../../types/Vacaciones"
import { BadgeStatus } from "@/components/BadgeStatus"
import { ListaColaboradores } from "@/services/ListaColaboradores"
import { Loading } from "@/components/Loading"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { ChevronDownIcon, Eye } from "lucide-react"
import { ViewPendientesRevisar } from "@/components/ViewPendientesRevisar"

export default function SolicitudesEquipo() {
    const { user } = useUser()

    const [empleadoBuscar, setEmpleadoBuscar] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [openCalendar, setOpenCalendar] = useState(false)
    const [isVer, setIsVer] = useState(false);
    const [solicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudesAprobadas[]>([]);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudesAprobadas>({} as SolicitudesAprobadas);
    const [solicitudesAprobadas, setSolicitudesAprobadas] = useState<ArraySolicitudesAprobadas | null>(null)
    const [filterSolicitudesAprobadas, setFilterSolicitudesAprobadas] = useState<ArraySolicitudesAprobadas | null>(null)

    useEffect(() => {
        const ObtenerInfo = async () => {
            const idColaboradores = await ListaColaboradores(user?.usuario)
            const pendientes = await getSolicitudesProceso({ lista: idColaboradores })
            const aprobadas = await getSolicitudesAprobadas({ lista: idColaboradores })
            setSolicitudesPendientes(pendientes)
            setSolicitudesAprobadas(aprobadas)
            setFilterSolicitudesAprobadas(aprobadas)
        }
        ObtenerInfo()
    }, [user])
    useEffect(() => {
        if (!solicitudesAprobadas) return
        let data = [...solicitudesAprobadas]
        if (empleadoBuscar.trim() !== "") {
            const value = empleadoBuscar.toLowerCase()
            data = data.filter((solicitud: SolicitudesAprobadas) =>
                solicitud.alias.toLowerCase().includes(value)
            )
        }
        if (dateRange?.from) {
            const fromYMD = dateRange.from.toISOString().split("T")[0]
            data = data.filter(
                (solicitud: SolicitudesAprobadas) => solicitud.fecSolicitud.split("T")[0] >= fromYMD
            )
        }
        if (dateRange?.to) {
            const toYMD = dateRange.to.toISOString().split("T")[0]
            data = data.filter(
                (solicitud: SolicitudesAprobadas) => solicitud.fecSolicitud.split("T")[0] <= toYMD
            )
        }
        setFilterSolicitudesAprobadas(data)
    }, [empleadoBuscar, dateRange, solicitudesAprobadas])
    const limpiarFiltros = () => {
        setEmpleadoBuscar("")
        setDateRange(undefined)
        setFilterSolicitudesAprobadas(solicitudesAprobadas)
    }
    if (solicitudesPendientes === null && solicitudesAprobadas === null) {
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

    return (
        <div className="space-y-4 animate-in fade-in-50 duration-700">
            {/* ----- SOLICITUDES EN PROCESO ----- */}
            <Card className="animate-in fade-in-50 duration-500">
                <CardHeader className="">
                    <CardTitle className="text-lg font-semibold text-foreground">
                        Solicitudes en Proceso
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-medium">Fecha de Solicitud</TableHead>
                                <TableHead className="font-medium">Fecha de Inicio</TableHead>
                                <TableHead className="font-medium">Fecha Final</TableHead>
                                <TableHead className="font-medium">Empleado</TableHead>
                                <TableHead className="font-medium">Estado</TableHead>
                                <TableHead className="font-medium">Cantidad de Días</TableHead>
                                <TableHead className="font-medium">Accion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {solicitudesPendientes && solicitudesPendientes.length > 0 ? (
                                solicitudesPendientes.map((solicitud: SolicitudesAprobadas, index: number) => (
                                    <TableRow
                                        key={`${solicitud.id}`}
                                        className="animate-in slide-in-from-left-5 duration-300"
                                        style={{ animationDelay: `${index * 100} ms` }}
                                    >
                                        <TableCell className="font-medium">
                                            {solicitud.fecSolicitud.split("T")[0]}
                                        </TableCell>
                                        <TableCell>{solicitud.fecInicial.split("T")[0]}</TableCell>
                                        <TableCell>{solicitud.fecFinal.split("T")[0]}</TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {solicitud.alias}
                                        </TableCell>
                                        <TableCell>
                                            <BadgeStatus estado={solicitud.estado} />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {solicitud.cantDias}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSolicitudSeleccionada(solicitud);
                                                    setIsVer(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No hay solicitudes pendientes
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ----- SOLICITUDES APROBADAS ----- */}
            <Card className="animate-in fade-in-50 duration-500">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                        Solicitudes Aprobadas
                    </CardTitle>
                    <div className="grid grid-cols-3 gap-8 my-2">
                        {/* Filtro por empleado */}
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
                        <div className="flex items-end w-1/2">
                            <Button
                                type="button"
                                onClick={limpiarFiltros}
                                className="w-full bg-slate-300 text-black/80 hover:bg-slate-400 dark:bg-neutral-700 dark:hover:bg-neutral-800 dark:text-white"
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-medium">Fecha de Solicitud</TableHead>
                                <TableHead className="font-medium">Fecha de Inicio</TableHead>
                                <TableHead className="font-medium">Fecha Final</TableHead>
                                <TableHead className="font-medium">Empleado</TableHead>
                                <TableHead className="font-medium">Estado</TableHead>
                                <TableHead className="font-medium">Cantidad de Días</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filterSolicitudesAprobadas && filterSolicitudesAprobadas.length > 0 ? (
                                filterSolicitudesAprobadas.map((solicitud: SolicitudesAprobadas, index: number) => (
                                    <TableRow
                                        key={`${solicitud.idVacacionesSolicitudes}`}
                                        className="animate-in slide-in-from-left-5 duration-300"
                                        style={{ animationDelay: `${index * 100} ms` }}
                                    >
                                        <TableCell className="font-medium">
                                            {solicitud.fecSolicitud.split("T")[0]}
                                        </TableCell>
                                        <TableCell>{solicitud.fecInicial.split("T")[0]}</TableCell>
                                        <TableCell>{solicitud.fecFinal.split("T")[0]}</TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {solicitud.alias}
                                        </TableCell>
                                        <TableCell>
                                            <BadgeStatus estado={solicitud.estadoVacaciones} />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {solicitud.cantDias}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No hay solicitudes aprobadas
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ViewPendientesRevisar isOpen={isVer} onClose={() => setIsVer(false)} solicitud={solicitudSeleccionada} />
        </div>
    )
}
