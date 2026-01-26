"use client"

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useColaboradores } from "@/hooks/useColaboradores";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { getFeriado } from "@/lib/holidays";
import {
    Users,
    Search,
    FileSpreadsheet,
    Download,
    Loader2,
    RefreshCw,
    XCircle,
    Umbrella
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// --- CONFIGURACIÓN DE HORARIOS ---
const HORARIO_STAFF_ESTANDAR = { entrada: "09:00", tolerancia: 10 };
const HORARIO_STAFF_SUPERVISOR = { entrada: "07:00", tolerancia: 10 };

const SUPERVISORES_ESP = [
    "JORDAN MAYA",
    "JOHAN MAYA",
    "MELINA AYRE",
    "KENNETH CUBA",
    "JORGE PALOMINO",
    "SANDY LOPEZ",
    "LEONOR NAVARRO",
    "JORGE VASQUEZ",
    "MAYRA LLIMPE"
];

const ReporteStaff = () => {
    const { colaboradores, loading: loadingColab } = useColaboradores();
    const [searchTerm, setSearchTerm] = useState("");
    const [asistenciaData, setAsistenciaData] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate] = useState(new Date());
    const [colabIdMap, setColabIdMap] = useState<Record<string, number>>({});
    const lastFetchedIds = React.useRef<string>("");

    // 1. Generar la lista de todos los días del mes para las cabeceras de la tabla
    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    /**
     * Sincroniza la asistencia grupal de Staff:
     * Envía directamente la lista de alias al servidor.
     */
    const fetchAsistenciaStaff = useCallback(async (force = false) => {
        if (!colaboradores || colaboradores.length === 0) return;

        // Extraemos los alias. Si el campo 'alias' existe lo usamos, de lo contrario usamos 'usuario'.
        const aliasList = colaboradores.map(c => (c as any).alias || c.usuario);
        const currentAliasesHash = JSON.stringify(aliasList.sort());

        if (!force && currentAliasesHash === lastFetchedIds.current) return;

        lastFetchedIds.current = currentAliasesHash;
        setLoadingData(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsistenciaStaffGrupal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aliases: aliasList })
            });

            if (!response.ok) throw new Error("Error al obtener asistencia de staff");

            const result = await response.json();
            setAsistenciaData(result.data || []);
        } catch (err) {
            console.error("Error en Reporte Staff:", err);
            setError("No se pudo sincronizar la asistencia del staff.");
            lastFetchedIds.current = "";
        } finally {
            setLoadingData(false);
        }
    }, [colaboradores]);

    useEffect(() => {
        fetchAsistenciaStaff();
    }, [fetchAsistenciaStaff]);

    /**
     * PROCESAMIENTO DE LA MATRIZ STAFF
     * Cruza la data con la hora base fija de 9:00 AM.
     */
    const enrichedMatrix = useMemo(() => {
        const matrix: Record<string, any> = {};
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        colaboradores.forEach(colab => {
            const currentAlias = ((colab as any).alias || colab.usuario || "").toString().trim();
            const isSupEsp = SUPERVISORES_ESP.includes(currentAlias.toUpperCase());
            const config = isSupEsp ? HORARIO_STAFF_SUPERVISOR : HORARIO_STAFF_ESTANDAR;

            matrix[currentAlias] = {
                horarioBase: config.entrada,
                asistencias: {}
            };

            // Búsqueda Robusta: trim + toUpperCase
            const empData = asistenciaData.find(reg => {
                const idServidor = (reg.nombre || reg.alias || reg.usuario || "").toString().trim().toUpperCase();
                const idLocal = currentAlias.toUpperCase();

                // Intento 1: Coincidencia exacta
                if (idServidor === idLocal) return true;

                // Intento 2: ¿Uno contiene al otro? (por si falta un apellido o hay segundo nombre)
                if (idServidor.length > 3 && idLocal.length > 3) {
                    return idServidor.includes(idLocal) || idLocal.includes(idServidor);
                }

                return false;
            });

            const marcaciones = empData?.asistencia || empData?.registros || [];

            daysInMonth.forEach(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const holidayName = getFeriado(dayStr);
                const weekend = isWeekend(day);
                const isPast = dayStr < todayStr;

                const record = marcaciones.find((m: any) => {
                    const fRaw = m.fecha || m.asistencia?.fecha || "";
                    if (!fRaw) return false;
                    // El servidor manda "2026-01-02", tomamos solo la fecha
                    const datePart = fRaw.split('T')[0].split(' ')[0];
                    return datePart === dayStr;
                });

                // Priorizamos 'horaIngreso' que es lo que muestra la imagen
                const horaRaw = record?.horaIngreso || record?.ingreso || record?.asistencia?.ingreso || "";

                if (horaRaw) {
                    const horaMatch = horaRaw.match(/(\d{2}:\d{2})/);
                    const ingresoLimpio = horaMatch ? horaMatch[1] : null;

                    if (ingresoLimpio) {
                        const [h, m] = ingresoLimpio.split(':').map(Number);
                        const [baseH, baseM] = config.entrada.split(':').map(Number);
                        const minsIngreso = h * 60 + m;
                        const minsLimite = baseH * 60 + baseM + config.tolerancia;
                        const esTardanza = minsIngreso > minsLimite;

                        matrix[currentAlias].asistencias[dayStr] = {
                            type: 'asistencia',
                            hora: ingresoLimpio,
                            esTardanza
                        };
                        return;
                    }
                }

                if (holidayName) {
                    matrix[currentAlias].asistencias[dayStr] = { type: 'feriado', label: holidayName };
                } else if (!weekend && isPast) {
                    matrix[currentAlias].asistencias[dayStr] = { type: 'falta' };
                }
            });
        });

        return matrix;
    }, [colaboradores, asistenciaData, daysInMonth]);

    const filteredColabs = useMemo(() => {
        return colaboradores.filter(c => {
            const name = (c as any).alias || c.usuario;
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [colaboradores, searchTerm]);

    if (loadingColab || (loadingData && asistenciaData.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Consultando asistencia Staff...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users className="h-7 w-7 text-indigo-600" />
                        Reporte Staff: <span className="text-indigo-600 font-medium">Consolidado</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Control de asistencia - Horario Staff (9:00 AM)</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Buscar staff..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => fetchAsistenciaStaff(true)} disabled={loadingData} variant="outline" size="icon" className="h-10 w-10 shrink-0 dark:border-slate-700 dark:text-slate-300">
                        <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" className="gap-2 border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 h-10 px-4">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Matrix Card */}
            <Card className="shadow-xl border-none overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b dark:border-slate-800 flex flex-row items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-base font-semibold uppercase tracking-tight">
                            Asistencia Mensual Staff
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-auto max-h-[650px] scrollbar-thin dark:scrollbar-thumb-slate-700">
                        <Table className="border-collapse">
                            <TableHeader className="sticky top-0 z-30 bg-white dark:bg-slate-950">
                                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 z-40 bg-white dark:bg-slate-950 border-r dark:border-slate-800 min-w-[180px] font-bold text-slate-700 dark:text-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        Colaborador
                                    </TableHead>
                                    <TableHead className="sticky left-[180px] z-40 bg-slate-50 dark:bg-slate-900 border-r dark:border-slate-800 min-w-[90px] font-bold text-slate-700 dark:text-slate-200 text-center">
                                        Horario
                                    </TableHead>
                                    {daysInMonth.map((day) => (
                                        <TableHead
                                            key={day.toString()}
                                            className={`min-w-[55px] text-center p-2 text-[10px] font-bold border-r dark:border-slate-800 ${isWeekend(day) ? 'bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'} ${isToday(day) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : ''}`}
                                        >
                                            <div className="uppercase mb-0.5 opacity-60">{format(day, 'EEE', { locale: es })}</div>
                                            <div className="text-sm font-black">{format(day, 'dd')}</div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredColabs.map((colab) => {
                                    const currentAlias = (colab as any).alias || colab.usuario;
                                    const meta = enrichedMatrix[currentAlias];

                                    return (
                                        <TableRow key={colab.usuario} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group border-b dark:border-slate-800">
                                            <TableCell className="sticky left-0 z-20 bg-white dark:bg-slate-950 border-r dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300 text-sm group-hover:bg-slate-50 dark:group-hover:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border dark:border-indigo-800">
                                                        {currentAlias.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="truncate">{currentAlias}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="sticky left-[180px] z-20 bg-slate-50 dark:bg-slate-900 border-r dark:border-slate-800 text-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                                                <Badge variant="outline" className="font-mono text-[9px] bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                                    {meta?.horarioBase}
                                                </Badge>
                                            </TableCell>
                                            {daysInMonth.map((day) => {
                                                const dayStr = format(day, 'yyyy-MM-dd');
                                                const record = meta?.asistencias?.[dayStr];
                                                const weekend = isWeekend(day);

                                                return (
                                                    <TableCell
                                                        key={`${colab.usuario}-${dayStr}`}
                                                        className={`text-center p-0 border-r dark:border-slate-800 border-b dark:border-slate-800 h-12 ${weekend ? 'bg-slate-50/20 dark:bg-slate-800/10' : ''}`}
                                                        title={record ? (record.type === 'asistencia' ? `Entrada: ${record.hora}` : record.label) : ''}
                                                    >
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            {record?.type === 'asistencia' ? (
                                                                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${record.esTardanza
                                                                    ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-900/50'
                                                                    : 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-900/50'
                                                                    }`}>
                                                                    {record.hora}
                                                                </span>
                                                            ) : record?.type === 'feriado' ? (
                                                                <div className="flex flex-col items-center opacity-60">
                                                                    <Umbrella className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                                                    <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400">FER</span>
                                                                </div>
                                                            ) : record?.type === 'falta' ? (
                                                                <div className="flex flex-col items-center bg-rose-50/50 dark:bg-rose-900/20 w-full h-full justify-center">
                                                                    <XCircle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 mb-0.5" />
                                                                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">No Marcó</span>
                                                                </div>
                                                            ) : (
                                                                !weekend ? <span className="text-slate-200 dark:text-slate-700 text-xs text-center w-full">--</span> : null
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Footer / Legend */}
            <div className="flex flex-wrap items-center gap-6 px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl shadow-lg text-sm border dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full border border-white/20"></div>
                    <span className="opacity-80">Puntual</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full border border-white/20"></div>
                    <span className="opacity-80">Tardanza</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-600 rounded-md border border-white/20 flex items-center justify-center">
                        <XCircle className="h-2 w-2 text-white" />
                    </div>
                    <span className="opacity-80">No Marcó</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-md border border-white/20 flex items-center justify-center">
                        <Umbrella className="h-2 w-2 text-white" />
                    </div>
                    <span className="opacity-80">Feriado</span>
                </div>
                <div className="text-xs opacity-50 space-x-4 border-l border-white/10 pl-6">
                    <span className="font-bold text-white/70">Horarios:</span>
                    <span>• Supervisores: 7:00 AM (10min)</span>
                    <span>• Staff Gral: 9:00 AM (10min)</span>
                </div>
            </div>
        </div>
    );
};

export default ReporteStaff;
