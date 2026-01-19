"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from "@/Provider/UserProvider";
import {
    Loader2,
    User as UserIcon,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, getDay, eachDayOfInterval, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { getFeriado } from "@/lib/holidays";

interface Registro {
    fecha: string;
    horaIngreso: string | null;
    horaSalida: string | null;
    esFeriado?: string | null;
    esVacaciones?: boolean;
    esTardanza?: boolean;
}

interface StaffData {
    id: string;
    nombre: string;
    area: string;
    registros: Registro[];
}

interface Vacacion {
    fecInicial: string;
    fecFinal: string;
    estado: string;
    codMes: string;
}

const SUPERVISORES_INTERNOS = [
    "JORDAN MAYA",
    "JOHAN MAYA",
    "MELINA AYRE",
    "KENNETH CUBA",
    "JORGE PALOMINO",
    "SANDY LOPEZ",
    "LEONOR NAVARRO",
    "JORGE VASQUEZ"
];

// Función solicitada: Devuelve un array con todas las fechas (YYYY-MM-DD) entre fecinicial y fecFinal
const expandirRangoVacaciones = (fecInicial: string, fecFinal: string): string[] => {
    try {
        // Extraemos componentes (Año, Mes, Día) para evitar problemas de zona horaria (UTC vs Local)
        // Funciona con "2026-01-12" o "2026-01-12T00:00:00.000Z"
        const [y1, m1, d1] = fecInicial.split(/-|T/).map(Number);
        const [y2, m2, d2] = fecFinal.split(/-|T/).map(Number);

        const start = new Date(y1, m1 - 1, d1);
        const end = new Date(y2, m2 - 1, d2);
        const now = new Date();

        // Generar el intervalo (inclusive)
        const days = eachDayOfInterval({ start, end });

        // Solo retornamos los días que pertenecen al mes actual
        return days
            .filter(day => isSameMonth(day, now))
            .map(day => format(day, 'yyyy-MM-dd'));

    } catch (error) {
        console.error("Error al expandir rango de vacaciones:", error);
        return [];
    }
};

const ReporteAsistenciaStaff = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [staffData, setStaffData] = useState<StaffData | null>(null);
    const [diasVacaciones, setDiasVacaciones] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVacations = async () => {
            if (!user?.idEmpleado) return;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudes/${user.idEmpleado}`);
                const result = await response.json();
                const solicitudes = result.data || [];

                // Usamos un Set para unificar todos los días sin duplicados
                const todosLosDias = new Set<string>();

                solicitudes.forEach((sol: Vacacion) => {
                    const dias = expandirRangoVacaciones(sol.fecInicial, sol.fecFinal);
                    dias.forEach(d => todosLosDias.add(d));
                });

                const arrayUnificado = Array.from(todosLosDias).sort();
                setDiasVacaciones(arrayUnificado);

                console.log("--- RESULTADO UNIFICADO VACACIONES ---");
                console.log("Días involucrados este mes:", arrayUnificado);
                console.log("--------------------------------------");

            } catch (error) {
                console.error("Error al cargar historial de vacaciones:", error);
            }
        };

        fetchVacations();
    }, [user?.idEmpleado]);

    useEffect(() => {
        const fetchStaffAttendance = async () => {
            if (!user?.usuario) return;

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsistenciaStaff`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ alias: user.usuario })
                });

                if (!response.ok) throw new Error("Error en la respuesta del servidor");

                const result = await response.json();

                if (Array.isArray(result.data) && result.data.length > 0) {
                    setStaffData(result.data[0]);
                } else if (result.data && !Array.isArray(result.data)) {
                    setStaffData(result.data);
                } else {
                    setStaffData(null);
                }

            } catch (error) {
                console.error("Error al obtener asistencia staff:", error);
                setError("No se pudo cargar la información de asistencia.");
            } finally {
                setLoading(false);
            }
        };

        fetchStaffAttendance();
    }, [user?.usuario]);

    // Procesar datos: Filtrar por Lunes a Viernes (incluyendo feriados) y ordenar
    const processedRegistros = useMemo(() => {
        if (!staffData?.registros) return [];

        const isInterno = SUPERVISORES_INTERNOS.includes(user?.usuario?.toUpperCase() || "");

        return staffData.registros
            .map(reg => {
                // Normalizar la fecha del registro para comparación (YYYY-MM-DD)
                const dateKey = reg.fecha.split('T')[0];

                // Cálculo de tardanza si es supervisor interno (Límite 7:10 AM)
                let esTardanza = false;
                if (isInterno && reg.horaIngreso) {
                    const [h, m] = reg.horaIngreso.split(':').map(Number);
                    // Tardanza si es después de las 7:10 AM
                    esTardanza = h > 7 || (h === 7 && m > 10);
                }

                return {
                    ...reg,
                    esFeriado: getFeriado(reg.fecha),
                    esVacaciones: diasVacaciones.includes(dateKey),
                    esTardanza
                };
            })
            .filter(reg => {
                const date = parseISO(reg.fecha);
                const day = getDay(date);
                return day >= 1 && day <= 5; // Mon-Fri
            })
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [staffData, diasVacaciones, user?.usuario]);

    const stats = useMemo(() => {
        const total = processedRegistros.length;
        const faltas = processedRegistros.filter(r => !r.horaIngreso && !r.esFeriado && !r.esVacaciones).length;
        const tardanzas = processedRegistros.filter(r => r.esTardanza).length;
        const feriados = processedRegistros.filter(r => r.esFeriado).length;
        const vacsCount = processedRegistros.filter(r => r.esVacaciones).length;
        const asistencias = processedRegistros.filter(r => r.horaIngreso).length;

        return { total, faltas, asistencias, feriados, vacsCount, tardanzas };
    }, [processedRegistros]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                <p className="text-muted-foreground animate-pulse">Cargando reporte de staff...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <UserIcon className="h-6 w-6 text-cyan-600" />
                        Reporte de Asistencia Staff
                    </h1>
                    <p className="text-muted-foreground">
                        Bienvenido, <span className="font-semibold text-cyan-600">{staffData?.nombre || user?.usuario}</span>
                        {staffData?.area && <span className="text-xs ml-2 px-2 py-0.5 bg-muted rounded-full">{staffData.area}</span>}
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Cards de Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="hover:shadow-lg transition-all border-l-4 border-l-cyan-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Días Lab. (L-V)</p>
                                <h3 className="text-2xl font-bold">{stats.total}</h3>
                            </div>
                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-cyan-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Asistencias</p>
                                <h3 className="text-2xl font-bold text-green-600">{stats.asistencias}</h3>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Vacaciones</p>
                                <h3 className="text-2xl font-bold text-blue-600">{stats.vacsCount}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Feriados</p>
                                <h3 className="text-2xl font-bold text-orange-600">{stats.feriados}</h3>
                            </div>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <CalendarIcon className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-red-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Inasistencias</p>
                                <h3 className="text-2xl font-bold text-red-600">{stats.faltas}</h3>
                            </div>
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de Registros */}
            <Card className="shadow-md overflow-hidden border-none bg-white dark:bg-slate-900">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="h-4 w-4 text-cyan-600" />
                            Detalle de Asistencia
                        </CardTitle>
                        <Badge variant="outline" className="text-xs font-normal">
                            Solo Lunes a Viernes
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold py-4">Fecha</TableHead>
                                    <TableHead className="font-bold">Hora Ingreso</TableHead>
                                    <TableHead className="font-bold">Hora Salida</TableHead>
                                    <TableHead className="font-bold text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedRegistros.length > 0 ? (
                                    processedRegistros.map((row, idx) => {
                                        const isVacaciones = !!row.esVacaciones;
                                        const isFeriado = !!row.esFeriado;
                                        const isFalta = !row.horaIngreso && !isFeriado && !isVacaciones;
                                        const fechaObj = parseISO(row.fecha);

                                        return (
                                            <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="capitalize py-4 font-medium">
                                                    {format(fechaObj, 'EEEE dd/MM/yyyy', { locale: es })}
                                                    {isFeriado && (
                                                        <span className="block text-[10px] text-orange-600 font-semibold uppercase mt-0.5">
                                                            {row.esFeriado}
                                                        </span>
                                                    )}
                                                    {isVacaciones && (
                                                        <span className="block text-[10px] text-blue-600 font-semibold uppercase mt-0.5">
                                                            Vacaciones
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className={isFalta ? "text-red-400 italic" : "text-foreground"}>
                                                    {row.horaIngreso || (isFeriado || isVacaciones ? "--:--" : "No Marcó")}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {row.horaSalida || "--:--"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={
                                                        isVacaciones
                                                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-sm"
                                                            : isFeriado
                                                                ? "bg-orange-100 text-orange-700 hover:bg-orange-100 border-none shadow-sm"
                                                                : isFalta
                                                                    ? "bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-sm"
                                                                    : row.esTardanza
                                                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-sm"
                                                                        : "bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-sm"
                                                    }>
                                                        {isVacaciones ? "Vacaciones" : isFeriado ? "Feriado" : isFalta ? "Inasistencia" : row.esTardanza ? "Tardanza" : "Asistió"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            No se encontraron registros en días laborables.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReporteAsistenciaStaff;
