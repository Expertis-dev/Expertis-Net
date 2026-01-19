"use client"
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useUser } from "@/Provider/UserProvider";

interface AsistenciaRegistro {
    idAsesor: number;
    fecha: string;
    horaInicio_EnLaCola: string;
    horaInicio_Desconectado: string;
}

interface DiaLaboral {
    fecha: string;
    esLaborable: boolean;
}

// Función auxiliar para parsear fechas sin desfase de zona horaria (UTC vs Local)
const parseAsLocal = (dateString: string) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Clasifica si una marcación de entrada es tardanza o puntual según el grupo del usuario
 */
const calcularEsTardanza = (horas: number, minutos: number, id_grupo?: number): boolean => {
    // Grupo 14: Entrada 8:00 AM (con 10 min de tolerancia)
    if (id_grupo === 14) {
        return horas > 8 || (horas === 8 && minutos > 10);
    }
    // Default: Entrada 7:00 AM (con 10 min de tolerancia)
    return horas > 7 || (horas === 7 && minutos > 10);
};

/**
 * Retorna el texto del estado de asistencia
 */
const obtenerEstadoAsistencia = (esTardanza: boolean): string => {
    return esTardanza ? "Tardanza" : "Puntual";
};

export default function ReporteMensual() {
    const { user } = useUser();

    // Estados para filtros
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    // Estados para datos y carga
    const [asistencias, setAsistencias] = useState<AsistenciaRegistro[]>([]);
    const [diasLaborales, setDiasLaborales] = useState<DiaLaboral[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Función para obtener datos desde el backend
    const fetchAsistencia = useCallback(async () => {
        if (!user?.usuario) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Obtener el ID de Movimiento por el alias (usuario)
            const respId = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerIdMovimientoPorAlias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alias: user.usuario })
            });

            const resId = await respId.json();
            console.log(resId.data);
            // Asumimos que el ID viene en resId.idMovEmpleado o resId.data.idMovEmpleado
            const currentId = resId.data || resId.data;

            if (!currentId) {
                throw new Error("No se pudo obtener el ID de movimiento para este usuario.");
            }

            // 2. Usar el ID obtenido para las consultas de asistencia y días laborales
            const rolRaw = localStorage.getItem("rol");
            const rol = rolRaw ? rolRaw.replace(/"/g, "") : "";

            const endpointAsistencia = rol === "SUPERVISOR" && user?.id_grupo === 14
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsistenciaMensualDeSupervisor/${currentId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsistenciaMensualDeAsesor/${currentId}`;

            const [respAsistencia, respLaborales] = await Promise.all([
                fetch(endpointAsistencia),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerDiasLaborales/${currentId}`)
            ]);

            const [resAsist, resLab] = await Promise.all([
                respAsistencia.json(),
                respLaborales.json()
            ]);

            setAsistencias(resAsist.data || []);
            setDiasLaborales(resLab.data || []);

            console.log("Datos cargados correctamente para:", user.usuario, "con ID:", currentId);
        } catch (err) {
            console.error("Error al cargar asistencia:", err);
            setError(err instanceof Error ? err.message : "No se pudo cargar la información de asistencia.");
        } finally {
            setLoading(false);
        }
    }, [user?.usuario, user?.id_grupo]);

    // Cargar datos al iniciar o cambiar fechas
    useEffect(() => {
        fetchAsistencia();
    }, [fetchAsistencia, startDate, endDate]);

    // Lógica para procesar los datos obtenidos (Cruzando asistencia vs días laborales)
    const processedData = useMemo(() => {
        const start = parseAsLocal(startDate);
        const end = parseAsLocal(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        // 1. Filtrar días laborables en el rango
        const filtradosLab = diasLaborales.filter(lab => {
            const date = parseAsLocal(lab.fecha);
            date.setHours(0, 0, 0, 0);
            return date >= start && date <= end;
        });

        // Si no hay días laborables, usamos las asistencias como fallback
        const baseDays = filtradosLab.length > 0 ? filtradosLab : asistencias.filter(a => {
            const d = parseAsLocal(a.fecha);
            d.setHours(0, 0, 0, 0);
            return d >= start && d <= end;
        }).map(a => ({ fecha: a.fecha, esLaborable: true }));

        return baseDays.map(dia => {
            const itemDate = parseAsLocal(dia.fecha);

            // Buscar marcación para este día
            const registro = asistencias.find(asist => {
                const asistDate = parseAsLocal(asist.fecha);
                return asistDate.toDateString() === itemDate.toDateString();
            });

            const extractTime = (isoString: string) => {
                if (!isoString) return { horas: 0, minutos: 0, display: "--:--" };
                const timePart = isoString.split('T')[1] || "00:00:00";
                const [h, m, s] = timePart.split(':');
                return {
                    horas: parseInt(h),
                    minutos: parseInt(m),
                    display: `${h}:${m}:${s ? s.substring(0, 2) : "00"}`
                };
            };

            if (registro) {
                const entryTime = extractTime(registro.horaInicio_EnLaCola);
                const exitTime = extractTime(registro.horaInicio_Desconectado);

                // Usamos las funciones aisladas para clasificar la asistencia
                const esTardanza = calcularEsTardanza(entryTime.horas, entryTime.minutos, user?.id_grupo);
                const estado = obtenerEstadoAsistencia(esTardanza);

                return {
                    fecha: dia.fecha,
                    fechaFormateada: format(itemDate, 'EEEE dd/MM/yyyy', { locale: es }),
                    entrada: entryTime.display,
                    salida: exitTime.display,
                    estado: estado,
                    esTardanza,
                    esFalta: false,
                    entradaDecimal: entryTime.horas + entryTime.minutos / 60
                };
            } else {
                // Si es día laborable pero no hay registro -> FALTA
                return {
                    fecha: dia.fecha,
                    fechaFormateada: format(itemDate, 'EEEE dd/MM/yyyy', { locale: es }),
                    entrada: "No marca",
                    salida: "No marca",
                    estado: "Falta",
                    esTardanza: false,
                    esFalta: true,
                    entradaDecimal: null
                };
            }
        }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }, [asistencias, diasLaborales, startDate, endDate, user?.id_grupo]);

    const stats = useMemo(() => {
        const total = processedData.length;
        const faltas = processedData.filter(d => d.esFalta).length;
        const tardanzas = processedData.filter(d => d.esTardanza).length;
        const asistenciasReales = total - faltas;
        const puntuales = asistenciasReales - tardanzas;
        const percentPuntual = asistenciasReales > 0 ? ((puntuales / asistenciasReales) * 100).toFixed(0) : 0;
        return { total, faltas, tardanzas, puntuales, percentPuntual };
    }, [processedData]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                <p className="text-muted-foreground animate-pulse">Obteniendo registros de asistencia...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header y Filtros */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <CalendarIcon className="h-6 w-6 text-cyan-600" />
                        Mi Asistencia
                    </h1>
                    <p className="text-muted-foreground">Bienvenido, {user?.usuario || 'Cargando...'}</p>
                </div>

                <Card className="p-3 border-none shadow-md bg-muted/40">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="start" className="text-xs font-semibold">Desde:</Label>
                            <Input
                                id="start" type="date" value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-8 text-sm w-40"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="end" className="text-xs font-semibold">Hasta:</Label>
                            <Input
                                id="end" type="date" value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-8 text-sm w-40"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {error && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Cards de Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Días Lab.</p>
                                <h3 className="text-2xl font-bold">{stats.total}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-red-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Faltas</p>
                                <h3 className="text-2xl font-bold text-red-600">{stats.faltas}</h3>
                            </div>
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tardanzas</p>
                                <h3 className="text-2xl font-bold text-orange-600">{stats.tardanzas}</h3>
                            </div>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Puntuales</p>
                                <h3 className="text-2xl font-bold text-green-600">{stats.puntuales}</h3>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 shadow-md">
                    <CardHeader><CardTitle className="text-sm font-semibold">Hora de Ingreso</CardTitle></CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="fecha" tickFormatter={(val) => format(parseAsLocal(val), 'dd')} fontSize={10} />
                                <YAxis domain={[6, 10]} fontSize={10} tickFormatter={(val) => `${val}:00`} />
                                <Tooltip
                                    formatter={(value: number) => {
                                        if (!value) return ["--", "Hora de Ingreso"];
                                        return [`${Math.floor(value)}:${Math.round((value % 1) * 60).toString().padStart(2, '0')}`, 'Hora de Ingreso'];
                                    }}
                                    labelFormatter={(label) => format(parseAsLocal(label), 'dd MMMM yyyy', { locale: es })}
                                />
                                <Bar dataKey="entradaDecimal" radius={[4, 4, 0, 0]}>
                                    {processedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.esTardanza ? '#ea580c' : '#0891b2'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-md overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold">Fecha</TableHead>
                                    <TableHead className="font-bold">Entrada</TableHead>
                                    <TableHead className="font-bold">Salida</TableHead>
                                    <TableHead className="font-bold text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedData.length > 0 ? (
                                    processedData.map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="capitalize py-3">{row.fechaFormateada}</TableCell>
                                            <TableCell className={row.esFalta ? "text-red-400 italic" : "font-medium"}>
                                                {row.entrada}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{row.salida}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={
                                                    row.esFalta ? "bg-red-100 text-red-700 border-none" :
                                                        row.esTardanza ? "bg-orange-100 text-orange-700 border-none" :
                                                            "bg-green-100 text-green-700 border-none"
                                                }>
                                                    {row.estado}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            No se encontraron registros.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
