"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
    Search,
    Calendar as CalendarIcon,
    FileSpreadsheet,
    RotateCcw
} from "lucide-react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SolicitudesTotales } from "@/types/Vacaciones"
import { BadgeStatus } from "@/components/BadgeStatus"
import { Loading } from "@/components/Loading"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPermisosFromStorage, tienePermiso } from "@/components/dashboard-layout"

export default function ReporteGeneralVacaciones() {
    const [solicitudes, setSolicitudes] = useState<SolicitudesTotales[]>([])
    const [loading, setLoading] = useState(true)
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    useEffect(() => {
        // Validar permisos
        const permisos = getPermisosFromStorage()
        const canSee = tienePermiso(permisos, "Vacaciones", "ReporteGeneral-ver")
        setHasPermission(canSee)

        if (!canSee) {
            setLoading(false)
            return
        }

        const fetchAllSolicitudes = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vacaciones/getSolicitudesPendientesyAprobadasTotales`)
                const data = await response.json()
                console.log(data.data)
                setSolicitudes(data.data || [])
                setLoading(false)
            } catch (error) {
                console.error("Error al cargar las solicitudes:", error)
                setLoading(false)
            }
        }
        fetchAllSolicitudes()
    }, [])

    const filteredSolicitudes = useMemo(() => {
        return solicitudes.filter((sol) => {
            const matchesSearch = (sol.ALIAS_EMPLEADO || "").toLowerCase().includes(searchTerm.toLowerCase())

            if (!startDate && !endDate) return matchesSearch;

            // Lógica de solapamiento (Overlap):
            // Una vacación se muestra si su rango [Inicio, Fin] tiene algún punto en común con el rango del filtro [Desde, Hasta]
            const solStart = new Date(sol.FECHA_INCIO_VACACIONES)
            const solEnd = new Date(sol.FECHA_FIN_VACACIONES)
            const filterStart = startDate ? new Date(startDate) : null
            const filterEnd = endDate ? new Date(endDate) : null

            if (filterStart) filterStart.setHours(0, 0, 0, 0)
            if (filterEnd) filterEnd.setHours(23, 59, 59, 999)

            const matchesStartDate = filterStart ? solEnd >= filterStart : true
            const matchesEndDate = filterEnd ? solStart <= filterEnd : true

            return matchesSearch && matchesStartDate && matchesEndDate
        }).sort((a, b) => new Date(b.FECHA_INCIO_VACACIONES).getTime() - new Date(a.FECHA_INCIO_VACACIONES).getTime())
    }, [solicitudes, searchTerm, startDate, endDate])

    const aprobadas = useMemo(() => filteredSolicitudes.filter(s => s.ESTADO_VACACIONES === "APROBADO"), [filteredSolicitudes])
    const pendientes = useMemo(() => filteredSolicitudes.filter(s => s.ESTADO_VACACIONES === "PENDIENTE"), [filteredSolicitudes])

    const handleExportExcel = (data: SolicitudesTotales[], type: string) => {
        if (data.length === 0) {
            alert("No hay datos para exportar")
            return
        }

        const headers = ["DNI", "Empleado", "Fecha Inicio", "Fecha Final", "Días", "Estado"]
        const exportData = data.map(sol => [
            sol.DNI,
            sol.ALIAS_EMPLEADO,
            sol.FECHA_INCIO_VACACIONES.split("T")[0],
            sol.FECHA_FIN_VACACIONES.split("T")[0],
            sol.DIAS_GOZADOS_TOTALES,
            sol.ESTADO_VACACIONES
        ])

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exportData])
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Vacaciones")

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const excelBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        saveAs(excelBlob, `Reporte_Vacaciones_${type}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    }

    if (loading) return (
        <div className="h-[72vh] flex flex-col items-center justify-center space-y-4">
            <Loading />
            <p className="text-sm text-muted-foreground animate-pulse">Cargando reporte general...</p>
        </div>
    )

    if (hasPermission === false) {
        return (
            <div className="h-[72vh] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-full">
                    <RotateCcw className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Acceso Denegado</h2>
                <p className="text-sm text-muted-foreground">No tienes los permisos necesarios para ver este reporte.</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-1 md:p-3 space-y-3"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-foreground leading-tight">Reporte General</h1>
                    <p className="text-xs text-muted-foreground">Consolidado de solicitudes de vacaciones.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportExcel(filteredSolicitudes, "Filtrado")}
                        className="h-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                        Exportar Excel
                    </Button>
                </div>
            </div>

            <Card className="border shadow-sm bg-card overflow-hidden">
                <CardContent className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Empleado</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Nombre..."
                                    className="pl-8 h-9 text-sm bg-background border-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Desde</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    type="date"
                                    className="pl-8 h-9 text-sm bg-background border-input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Hasta</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    type="date"
                                    className="pl-8 h-9 text-sm bg-background border-input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-9 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setSearchTerm("")
                                    setStartDate("")
                                    setEndDate("")
                                }}
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="aprobadas" className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <TabsList className="bg-muted p-1 rounded-lg h-9 border">
                        <TabsTrigger value="aprobadas" className="rounded-md px-4 h-7 data-[state=active]:bg-background shadow-sm text-xs font-semibold">
                            Aprobadas
                            <Badge className="ml-1.5 bg-emerald-500/10 text-emerald-600 border-none px-1.5 py-0 text-[10px] dark:bg-emerald-500/20 dark:text-emerald-400">{aprobadas.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="pendientes" className="rounded-md px-4 h-7 data-[state=active]:bg-background shadow-sm text-xs font-semibold">
                            Pendientes
                            <Badge className="ml-1.5 bg-amber-500/10 text-amber-600 border-none px-1.5 py-0 text-[10px] dark:bg-amber-500/20 dark:text-amber-400">{pendientes.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="aprobadas" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border shadow-sm bg-card">
                        <ScrollArea className="h-[45vh] w-full">
                            <TableContainer data={aprobadas} />
                        </ScrollArea>
                    </Card>
                </TabsContent>

                <TabsContent value="pendientes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border shadow-sm bg-card">
                        <ScrollArea className="h-[45vh] w-full">
                            <TableContainer data={pendientes} />
                        </ScrollArea>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}

function TableContainer({ data }: { data: SolicitudesTotales[] }) {
    return (
        <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 border-b">
                <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="font-bold text-xs">DNI</TableHead>
                    <TableHead className="font-bold py-2 text-xs">Empleado</TableHead>
                    <TableHead className="font-bold text-xs">Fecha Inicio</TableHead>
                    <TableHead className="font-bold text-xs">Fecha Final</TableHead>
                    <TableHead className="font-bold text-xs">Días</TableHead>
                    <TableHead className="font-bold text-center text-xs">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length > 0 ? data.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b last:border-0 h-10">
                        <TableCell className="text-muted-foreground text-xs">{item.DNI || "---"}</TableCell>
                        <TableCell className="font-semibold text-foreground py-2 text-xs capitalize">{item.ALIAS_EMPLEADO}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{item.FECHA_INCIO_VACACIONES ? item.FECHA_INCIO_VACACIONES.split("T")[0] : "---"}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{item.FECHA_FIN_VACACIONES ? item.FECHA_FIN_VACACIONES.split("T")[0] : "---"}</TableCell>
                        <TableCell className="py-2">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-foreground text-xs">{item.DIAS_GOZADOS_TOTALES}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">días</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center py-2">
                            <BadgeStatus estado={item.ESTADO_VACACIONES} />
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <Search className="h-5 w-5 text-slate-300" />
                                <p className="text-xs text-slate-400 font-medium">Sin registros</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
