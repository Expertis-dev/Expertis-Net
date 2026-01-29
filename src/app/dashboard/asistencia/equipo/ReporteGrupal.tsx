"use client"

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from "@/Provider/UserProvider";
import { useColaboradores } from "@/hooks/useColaboradores";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isToday, parseISO, isSameMonth } from "date-fns";
import { getSolicitudesAprobadas } from "@/services/vacaciones";
import { es } from "date-fns/locale";
import { getFeriado } from "@/lib/holidays";
import {
    Users,
    Search,
    FileSpreadsheet,
    Download,
    AlertCircle,
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

// --- CONFIGURACIÓN DE HORARIOS Y TOLERANCIAS ---
// Representa la hora de entrada y los minutos de gracia antes de marcar como tardanza.
interface HorarioConfig {
    entrada: string; // Formato HH:mm
    tolerancia: number; // Minutos adicionales permitidos
}

const HORARIOS_CONFIG: Record<string, HorarioConfig> = {
    "7:00": { entrada: "07:00", tolerancia: 10 },
    "7:10": { entrada: "07:10", tolerancia: 5 },
    "9:00": { entrada: "09:00", tolerancia: 10 },
};

// --- EXCEPCIONES GRUPALES (Eventos especiales por Supervisor/Fecha) ---
const EXCEPCIONES_GRUPALES = [
    {
        lider: "MELINA AYRE",
        fecha: "2026-01-19",
        tipo: "excepcion",
        sigla: "EM",
        clases: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    },
    {
        lider: "SANDY LOPEZ",
        fecha: "2026-01-19",
        tipo: "excepcion",
        sigla: "EM",
        clases: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    },
    {
        lider: "JORGE PALOMINO",
        fecha: "2026-01-20",
        tipo: "excepcion",
        sigla: "EM",
        clases: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    }, {
        lider: "KENNETH CUBA",
        fecha: "2026-01-20",
        tipo: "excepcion",
        sigla: "EM",
        clases: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    },
    {
        lider: "JOHAN MAYA",
        fecha: "2026-01-21",
        tipo: "excepcion",
        sigla: "EM",
        clases: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
    }
];

/**
 * Función provisional para asignar horarios base según el alias del usuario.
 * @param usuario - Alias del colaborador
 * @param idGrupoSupervisor - ID del grupo del supervisor logueado (opcional)
 * @todo En producción, estos valores deben recuperarse desde el perfil del empleado en la DB.
 */
const determinarHorarioBase = (usuario: string, idGrupoSupervisor?: number): { entrada: string; tolerancia: number } => {
    // Si el supervisor es del grupo 14 (BPO), todos sus colaboradores tienen horario 8:00 AM (Sin tolerancia)
    if (idGrupoSupervisor === 14) {
        return { entrada: "8:00", tolerancia: 0 };
    }

    const u = usuario.toUpperCase();

    if (u.includes("MAYA") || u.includes("AYRE")) {
        return { entrada: "7:00", tolerancia: 10 }; // 7:10 AM
    }

    // Colaboradores con horario base 8:00 AM
    if (
        u.includes("VELASQUEZ") ||
        u.includes("AGUANAR") ||
        u.includes("AGAMA") ||
        u.includes("DAVILA") ||
        u.includes("SUYO")
    ) {
        return { entrada: "8:00", tolerancia: 10 }; // 8:10 AM
    }

    return { entrada: "7:00", tolerancia: 10 }; // 7:10 AM por defecto
};

// --- HELPER: Expandir rango de vacaciones ---
const expandirRangoVacaciones = (fecInicial: string, fecFinal: string, referenceDate: Date): string[] => {
    try {
        const [y1, m1, d1] = fecInicial.split(/-|T/).map(Number);
        const [y2, m2, d2] = fecFinal.split(/-|T/).map(Number);
        const start = new Date(y1, m1 - 1, d1);
        const end = new Date(y2, m2 - 1, d2);
        const days = eachDayOfInterval({ start, end });
        return days
            .filter(day => isSameMonth(day, referenceDate))
            .map(day => format(day, 'yyyy-MM-dd'));
    } catch (error) {
        return [];
    }
};

// Interface para las props
interface ReporteProps {
    colaboradores: any[]; // Usar el tipo correcto si está importado, o any[]
}

const ReporteGrupal = ({ colaboradores }: ReporteProps) => {
    const { user } = useUser();
    // const { colaboradores, loading: loadingColab } = useColaboradores(); // ELIMINADO
    const loadingColab = false; // Ya vienen cargados
    const [searchTerm, setSearchTerm] = useState("");
    const [asistenciaData, setAsistenciaData] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentDate] = useState(new Date());
    const [colabIdMap, setColabIdMap] = useState<Record<string, number>>({});
    const [vacacionesMap, setVacacionesMap] = useState<Record<string, string[]>>({});
    const [descansosMap, setDescansosMap] = useState<Record<string, string[]>>({});
    const lastFetchedIds = React.useRef<string>("");

    // 1. Generar la lista de todos los días del mes para las cabeceras de la tabla
    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    /**
     * Sincroniza la asistencia grupal en dos pasos:
     * 1. Traduce los alias a idMovEmpleado (ID interno).
     * 2. Consulta el reporte masivo con la lista de IDs.
     */
    const fetchAsistenciaGrupal = useCallback(async (force = false) => {
        if (!colaboradores || colaboradores.length === 0) return;

        // Evitar llamadas duplicadas si el equipo no ha cambiado
        const currentAliases = JSON.stringify(colaboradores.map(c => c.usuario).sort());
        if (!force && currentAliases === lastFetchedIds.current) return;

        lastFetchedIds.current = currentAliases;
        setLoadingData(true);
        setError(null);

        try {


            // PASO 0: Obtener Vacaciones de cada colaborador (OPTIMIZADO: Por lotes para no saturar)
            const vMap: Record<string, string[]> = {};

            // Función auxiliar para procesar un solo colaborador
            const fetchVacacionesColab = async (c: any) => {
                if (!c.idEmpleado) return;
                try {
                    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerSolicitudes/${c.idEmpleado}`);
                    if (!resp.ok) return;
                    const json = await resp.json();
                    const solicitudes = json.data || [];

                    const diasSet = new Set<string>();
                    solicitudes.forEach((sol: any) => {
                        const estado = sol.estadoVacaciones?.trim().toUpperCase();
                        if (estado === "APROBADO" || estado === "I") {
                            const dias = expandirRangoVacaciones(sol.fecInicial, sol.fecFinal, currentDate);
                            dias.forEach(d => diasSet.add(d));
                        }
                    });

                    if (diasSet.size > 0) {
                        vMap[c.usuario] = Array.from(diasSet);
                    }
                } catch (e) {
                    console.error(`Error al obtener vacaciones para ${c.usuario}:`, e);
                }
            };

            // Procesar en lotes de 3 en 3 (Concurrency control)
            const CHUNK_SIZE = 3;
            for (let i = 0; i < colaboradores.length; i += CHUNK_SIZE) {
                const chunk = colaboradores.slice(i, i + CHUNK_SIZE);
                await Promise.all(chunk.map(c => fetchVacacionesColab(c)));
            }

            setVacacionesMap(vMap);

            setVacacionesMap(vMap);

            // PASO 0.5: Obtener Descansos Médicos Masivos
            const idsParaDM = colaboradores.map(c => c.idEmpleado).filter(Boolean);
            console.log("IDs para Descansos Médicos:", idsParaDM);

            try {
                const respDM = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerDMsPorEmpleados`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEmpleados: idsParaDM })
                });
                if (respDM.ok) {
                    const jsonDM = await respDM.json();
                    const listDM = jsonDM.data || [];
                    const dMap: Record<string, string[]> = {};

                    listDM.forEach((dm: any) => {
                        // Buscar usuario dueño del DM
                        const colabOwner = colaboradores.find(c => c.idEmpleado === dm.idEmpleado);
                        if (colabOwner) {
                            // Usamos fecha_inicio y fecha_fin que es lo que devuelve tu endpoint
                            const dias = expandirRangoVacaciones(dm.fecha_inicio, dm.fecha_fin, currentDate);
                            if (!dMap[colabOwner.usuario]) dMap[colabOwner.usuario] = [];
                            dMap[colabOwner.usuario] = [...new Set([...dMap[colabOwner.usuario], ...dias])];
                        }
                    });
                    setDescansosMap(dMap);
                }
            } catch (errorDM) {
                console.error("Error obteniendo DM:", errorDM);
            }

            // PASO 1: Traducir alias a idMovEmpleado (en paralelo para velocidad)
            const idMovPromises = colaboradores.map(async (c) => {
                const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerIdMovimientoPorAlias`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ alias: c.usuario })
                });
                const res = await resp.json();
                return { usuario: c.usuario, idMov: res.data };
            });

            const results = await Promise.all(idMovPromises);

            // Crear mapa de relación: usuario -> idMov
            const mapper: Record<string, number> = {};
            results.forEach(r => { if (r.idMov) mapper[r.usuario] = r.idMov; });
            setColabIdMap(mapper);

            const idsList = Object.values(mapper);
            if (idsList.length === 0) {
                setLoadingData(false);
                return;
            }

            // PASO 2: Consultar la asistencia grupal con los IDs de movimiento
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsistenciaGrupal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsList })
            });

            if (!response.ok) throw new Error("Error al obtener asistencia del grupo");

            const result = await response.json();
            setAsistenciaData(result.data || []);
        } catch (err) {
            console.error("Error en flujo de asistencia:", err);
            setError("No se pudo sincronizar la asistencia del equipo.");
            lastFetchedIds.current = "";
        } finally {
            setLoadingData(false);
        }
    }, [colaboradores]);

    useEffect(() => {
        if (!colaboradores || colaboradores.length === 0) return;
        fetchAsistenciaGrupal();
    }, [colaboradores, fetchAsistenciaGrupal]);

    /**
     * PROCESAMIENTO DE LA MATRIZ DE ASISTENCIA
     * Cruza la data plana del backend con los días del calendario.
     */
    const enrichedMatrix = useMemo(() => {
        const matrix: Record<string, any> = {};
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        colaboradores.forEach(colab => {
            const config = determinarHorarioBase(colab.usuario, user?.id_grupo);
            const currentIdMov = colabIdMap[colab.usuario];

            matrix[colab.usuario] = {
                horarioBase: config.entrada,
                asistencias: {}
            };

            // Buscar el objeto del empleado en la data del backend
            const empData = asistenciaData.find(reg => reg.idMovEmpleado === currentIdMov);
            const marcaciones = empData?.asistencia || [];

            daysInMonth.forEach(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const holidayName = getFeriado(dayStr);
                const weekend = isWeekend(day);
                const isPast = dayStr < todayStr;
                const isToday = dayStr === todayStr;

                // --- 0. VERIFICAR VACACIONES ---
                const vcs = vacacionesMap[colab.usuario] || [];
                if (vcs.includes(dayStr)) {
                    matrix[colab.usuario].asistencias[dayStr] = {
                        type: 'vacaciones',
                        label: 'VACACIONES'
                    };
                    return;
                }

                // --- 0.2 VERIFICAR DESCANSOS MÉDICOS ---
                const dms = descansosMap[colab.usuario] || [];
                if (dms.includes(dayStr)) {
                    matrix[colab.usuario].asistencias[dayStr] = {
                        type: 'excepcion',
                        sigla: 'DM',
                        clases: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300',
                        label: 'DESC. MÉDICO'
                    };
                    return;
                }

                // --- 1. VERIFICAR EXCEPCIÓN GRUPAL ---
                const exc = EXCEPCIONES_GRUPALES.find(e =>
                    e.lider.toUpperCase() === user?.usuario?.toUpperCase() &&
                    e.fecha === dayStr
                );

                if (exc) {
                    matrix[colab.usuario].asistencias[dayStr] = {
                        type: 'excepcion',
                        sigla: exc.sigla,
                        clases: exc.clases
                    };
                    return;
                }

                // Buscamos el registro para este día
                const record = marcaciones.find((m: any) => {
                    const fRaw = m.asistencia?.fecha || m.fecha || "";
                    if (!fRaw) return false;
                    const datePart = fRaw.split('T')[0].split(' ')[0];
                    let normalized = datePart;
                    if (datePart.includes('-') && datePart.split('-')[0].length === 2) {
                        const [d, mon, y] = datePart.split('-');
                        normalized = `${y}-${mon}-${d}`;
                    }
                    return normalized === dayStr;
                });

                // Extraemos la hora si existe el registro
                const horaRaw = record?.asistencia?.ingreso || record?.ingreso || "";

                if (horaRaw) {
                    // --- CASO 1: HAY ASISTENCIA ---
                    const horaMatch = horaRaw.match(/(\d{2}:\d{2})/);
                    const ingresoLimpio = horaMatch ? horaMatch[1] : null;

                    if (ingresoLimpio) {
                        const [h, m] = ingresoLimpio.split(':').map(Number);
                        const [baseH, baseM] = config.entrada.split(':').map(Number);
                        const minsIngreso = h * 60 + m;
                        const minsLimite = baseH * 60 + baseM + config.tolerancia;
                        const esTardanza = minsIngreso > minsLimite;

                        matrix[colab.usuario].asistencias[dayStr] = {
                            type: 'asistencia',
                            hora: ingresoLimpio,
                            esTardanza
                        };
                        return; // Salir del bucle diario si ya procesamos asistencia
                    }
                }

                // --- CASO 2: FERIADO ---
                if (holidayName) {
                    matrix[colab.usuario].asistencias[dayStr] = {
                        type: 'feriado',
                        label: holidayName
                    };
                }
                // --- CASO 3: FALTA (Día laborable pasado sin marcación) ---
                else if (!weekend && isPast) {
                    matrix[colab.usuario].asistencias[dayStr] = {
                        type: 'falta'
                    };
                }
            });
        });

        return matrix;
    }, [colaboradores, asistenciaData, daysInMonth, colabIdMap]);

    // 4. Filtrado por búsqueda
    const filteredColabs = useMemo(() => {
        return colaboradores.filter(c =>
            c.usuario.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [colaboradores, searchTerm]);

    if (loadingColab || (loadingData && asistenciaData.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Consultando asistencia del equipo...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users className="h-7 w-7 text-cyan-600" />
                        Reporte Equipo: <span className="text-cyan-600 font-medium">Asistencia Real</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Validación mensual por bloques de horario</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Buscar usuario..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => fetchAsistenciaGrupal(true)} disabled={loadingData} variant="outline" size="icon" className="h-10 w-10 shrink-0 dark:border-slate-700 dark:text-slate-300">
                        <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" className="gap-2 border-cyan-200 dark:border-cyan-900/50 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 h-10 px-4">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Matrix Card */}
            <Card className="shadow-xl border-none overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b dark:border-slate-800 flex flex-row items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-base font-semibold uppercase tracking-tight">
                            Consolidado {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-auto max-h-[650px] scrollbar-thin dark:scrollbar-thumb-slate-700">
                        <Table className="border-collapse">
                            <TableHeader className="sticky top-0 z-30 bg-white dark:bg-slate-950">
                                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 z-40 bg-white dark:bg-slate-950 border-r dark:border-slate-800 min-w-[180px] font-bold text-slate-700 dark:text-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        Usuario
                                    </TableHead>
                                    <TableHead className="sticky left-[180px] z-40 bg-slate-50 dark:bg-slate-900 border-r dark:border-slate-800 min-w-[90px] font-bold text-slate-700 dark:text-slate-200 text-center">
                                        Base
                                    </TableHead>
                                    {daysInMonth.map((day) => (
                                        <TableHead
                                            key={day.toString()}
                                            className={`min-w-[55px] text-center p-2 text-[10px] font-bold border-r dark:border-slate-800 ${isWeekend(day) ? 'bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'} ${isToday(day) ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' : ''}`}
                                        >
                                            <div className="uppercase mb-0.5 opacity-60">{format(day, 'EEE', { locale: es })}</div>
                                            <div className="text-sm font-black">{format(day, 'dd')}</div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredColabs.map((colab) => {
                                    const meta = enrichedMatrix[colab.usuario];
                                    return (
                                        <TableRow key={colab.usuario} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group border-b dark:border-slate-800">
                                            <TableCell className="sticky left-0 z-20 bg-white dark:bg-slate-950 border-r dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300 text-sm group-hover:bg-slate-50 dark:group-hover:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border dark:border-slate-700">
                                                        {colab.usuario.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="truncate">{colab.usuario}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="sticky left-[180px] z-20 bg-slate-50 dark:bg-slate-900 border-r dark:border-slate-800 text-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                                                <Badge variant="outline" className="font-mono text-[9px] bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                                    {meta?.horarioBase}
                                                </Badge>
                                            </TableCell>
                                            {daysInMonth.map((day) => {
                                                const dayStr = format(day, 'yyyy-MM-dd');
                                                const record = meta?.asistencias[dayStr];
                                                const weekend = isWeekend(day);

                                                return (
                                                    <TableCell
                                                        key={`${colab.usuario}-${dayStr}`}
                                                        className={`text-center p-0 border-r dark:border-slate-800 border-b dark:border-slate-800 h-12 ${weekend ? 'bg-slate-50/20 dark:bg-slate-800/10' : ''}`}
                                                        title={record ? (record.type === 'asistencia' ? `Entrada: ${record.hora} | Base: ${meta.horarioBase}` : record.label) : ''}
                                                    >
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            {record?.type === 'asistencia' ? (
                                                                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${record.esTardanza
                                                                    ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-900/50'
                                                                    : 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-900/50'
                                                                    }`}>
                                                                    {record.hora}
                                                                </span>
                                                            ) : record?.type === 'excepcion' ? (
                                                                <div className={`w-full h-full flex flex-col items-center justify-center border-x border-b-0 ${record.clases}`}>
                                                                    <span className="text-[10px] font-black leading-none">{record.sigla}</span>
                                                                    <span className="text-[6px] font-bold uppercase mt-0.5">{record.label}</span>
                                                                </div>
                                                            ) : record?.type === 'vacaciones' ? (
                                                                <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/40 w-full h-full justify-center border-x border-blue-100 dark:border-blue-900">
                                                                    <Umbrella className="h-4 w-4 text-blue-500 dark:text-blue-400 mb-0.5" />
                                                                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 tracking-tighter">VAC</span>
                                                                </div>
                                                            ) : record?.type === 'feriado' ? (
                                                                <div className="flex flex-col items-center opacity-60">
                                                                    <Umbrella className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                                                    <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400">FER</span>
                                                                </div>
                                                            ) : record?.type === 'falta' ? (
                                                                <div className="flex flex-col items-center bg-rose-50/50 dark:bg-rose-900/20 w-full h-full justify-center">
                                                                    <XCircle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 mb-0.5" />
                                                                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">Falta</span>
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
                    <span className="opacity-80">Falta</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-md border border-white/20 flex items-center justify-center">
                        <Umbrella className="h-2 w-2 text-white" />
                    </div>
                    <span className="opacity-80">Feriado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-md border border-white/20 flex items-center justify-center">
                        <span className="text-[7px] font-bold">EM</span>
                    </div>
                    <span className="opacity-80">Excepciones</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 rounded-md border border-blue-300 flex items-center justify-center">
                        <Umbrella className="h-2 w-2 text-blue-500" />
                    </div>
                    <span className="opacity-80">Vacaciones</span>
                </div>
                <div className="text-xs opacity-50 space-x-4 border-l border-white/10 pl-6">
                    <span>• Tolerancia 7:00 (10min)</span>
                    <span>• 7:10 (5min)</span>
                    <span>• 9:00 (10min)</span>
                </div>
            </div>
        </div>
    );
};

export default ReporteGrupal;
