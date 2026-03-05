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
    Filter,
    Download
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    esDescansoMedico?: boolean;
    esTardanza?: boolean;
    esJustificado?: boolean;
    detalleJustificacion?: string;
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

interface DescansoMedico {
    idAusenciasLaborables: number;
    idEmpleado: number;
    tipoAusencia: string;
    fecha_inicio: string;
    fecha_fin: string;
    numDias: number;
    datos_especificos: string;
    estado: string;
    fecInsert: string;
    fecUpdate: string | null;
    fecDelete: string | null;
    usrInsert: string | null;
    usrUpdate: string | null;
    usrDelete: string | null;
}

export interface JustificacionRegistro {
    fecha: string;
    nivel1?: string;
    nivel2?: string;
    nivel3?: string;
    descripcion?: string;
    observacion?: string;
    asesor: string;
    codigoEmpleado: number;
}

const obtenerJustificaciones = (nombre: string) => {
    const response = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/justificacion/${nombre}`)
        .then(async r => await r.json());
    return response;
};


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

const expandirRangoDm = (fecInicial: string, fecFinal: string, referenceDate: Date): string[] => {
    try {
        const [y1, m1, d1] = fecInicial.split(/-|T/).map(Number);
        const [y2, m2, d2] = fecFinal.split(/-|T/).map(Number);
        const start = new Date(y1, m1 - 1, d1);
        const end = new Date(y2, m2 - 1, d2);
        const days = eachDayOfInterval({ start, end });
        return days
            .filter(day => isSameMonth(day, referenceDate))
            .map(day => format(day, 'yyyy-MM-dd'));
    } catch (e) {
        console.error("Error al expandir rango de vacaciones:", e);
        return [];
    }
};

// Lista de supervisores internos con horario especial (07:00 AM)
const SUPERVISORES_INTERNOS = [
    "JORDAN MAYA",
    "JOHAN MAYA",
    "MELINA AYRE",
    "KENNETH CUBA",
    "JORGE PALOMINO",
    "SANDY LOPEZ",
    "LEONOR NAVARRO",
    "JORGE VASQUEZ",
    "MAYRA LLIMPE",
    "ANTHONY TORRES"
];

const STAFF_830AM = [
    "ROBERT MANGUINURI",
    "ANGEL MARTINEZ"
];

const getDescansosMedicos = async (idEmpleado: number) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerDMsPorEmpleados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idEmpleados: [idEmpleado] })
        }).then(async r => await r.json())
        console.log(response)
        return response
    } catch (error) {
        console.log(error)
    }
}

const ReporteAsistenciaStaff = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [staffData, setStaffData] = useState<StaffData | null>(null);
    const [diasVacaciones, setDiasVacaciones] = useState<string[]>([]);
    const [DM, setDM] = useState<DescansoMedico[]>([])
    const [justificaciones, setJustificaciones] = useState<JustificacionRegistro[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentDate] = useState(new Date());

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
        if (user?.idEmpleado) {
            getDescansosMedicos(user.idEmpleado).then((r: { data: DescansoMedico[] }) => {
                const data = Array.isArray(r?.data) ? r.data : [];
                setDM(data)
            })
        } else {
            setDM([]);
        }
        fetchVacations()
    }, [user?.idEmpleado]);

    useEffect(() => {
        const fetchJustificaciones = async () => {
            if (!user?.usuario) return;
            try {
                const data = await obtenerJustificaciones(user.usuario);
                setJustificaciones(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Error al obtener justificaciones:", e);
                setJustificaciones([]);
            }
        };
        fetchJustificaciones();
    }, [user?.usuario]);

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

    // Determinar si el usuario actual es supervisor interno
    const esSupervisorInterno = useMemo(() => {
        if (!user?.usuario) return false;
        return SUPERVISORES_INTERNOS.includes(user.usuario.toUpperCase());
    }, [user?.usuario]);

    // Horario base según tipo de usuario
    const horarioConfig = useMemo(() => {
        if (user?.id_grupo === 14) {
            return { entrada: "08:00", tolerancia: 0 }; // 08:00 AM (Sin tolerancia)
        }
        const aliasUpper = user?.usuario?.toUpperCase() || "";
        if (aliasUpper === "JAMES IZQUIERDO") {
            return { entrada: "06:00", tolerancia: 10 }; // 06:10 AM
        }
        if (STAFF_830AM.includes(aliasUpper)) {
            return { entrada: "08:30", tolerancia: 0 }; // 08:30 AM
        }
        if (esSupervisorInterno) {
            return { entrada: "07:00", tolerancia: 10 }; // 07:10 AM
        }
        return { entrada: "09:00", tolerancia: 10 }; // 09:10 AM
    }, [esSupervisorInterno, user?.id_grupo, user?.usuario]);

    // Procesar datos: Filtrar por Lunes a Viernes (incluyendo feriados) y ordenar
    const processedRegistros = useMemo(() => {
        if (!staffData?.registros) return [];

        const dmDays = new Set<string>();
        DM.forEach(dm => {
            const dias = expandirRangoDm(dm.fecha_inicio, dm.fecha_fin, currentDate);
            dias.forEach(d => dmDays.add(d));
        });

        const justificacionesPorDia = new Map<string, JustificacionRegistro[]>();
        (justificaciones || []).forEach(j => {
            const d = parseISO(j.fecha);
            if (!isSameMonth(d, currentDate)) return;
            const key = format(d, 'yyyy-MM-dd');
            const list = justificacionesPorDia.get(key) || [];
            list.push(j);
            justificacionesPorDia.set(key, list);
        });

        const data = staffData.registros
            .map(reg => {
                // Normalizar la fecha del registro para comparación (YYYY-MM-DD)
                const dateKey = reg.fecha.split('T')[0];
                const justificacionesDelDia = justificacionesPorDia.get(dateKey) || [];
                const justificacionPrincipal = justificacionesDelDia[0];
                const detalleJustificacion = justificacionPrincipal?.nivel2
                    || justificacionPrincipal?.nivel3
                    || justificacionPrincipal?.descripcion
                    || "Justificado";


                // Calcular si hay tardanza
                let esTardanza = false;
                if (reg.horaIngreso) {
                    const horaMatch = reg.horaIngreso.match(/(\d{2}:\d{2})/);
                    if (horaMatch) {
                        const [h, m] = horaMatch[1].split(':').map(Number);
                        const [baseH, baseM] = horarioConfig.entrada.split(':').map(Number);
                        const minsIngreso = h * 60 + m;
                        const minsLimite = baseH * 60 + baseM + horarioConfig.tolerancia;
                        esTardanza = minsIngreso > minsLimite;
                    }

                }

                return {
                    ...reg,
                    esFeriado: getFeriado(reg.fecha),
                    esVacaciones: diasVacaciones.includes(dateKey),
                    esDescansoMedico: dmDays.has(dateKey),
                    esTardanza,
                    esJustificado: justificacionesDelDia.length > 0,
                    detalleJustificacion
                };
            })
            .filter(reg => {
                const date = parseISO(reg.fecha);
                const day = getDay(date);
                return day >= 1 && day <= 5; // Mon-Fri
            })
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        return data
    }, [DM, staffData, diasVacaciones, horarioConfig, currentDate, justificaciones]);

    const handleExportExcel = () => {
        if (!processedRegistros || processedRegistros.length === 0) {
            alert("No hay registros para exportar.");
            return;
        }

        const headers = ["Fecha", "Hora Ingreso", "Hora Salida", "Estado", "Justificación"];
        const data = processedRegistros.map(row => {
            const isVacaciones = !!row.esVacaciones;
            const isFeriado = !!row.esFeriado;
            const isDescansoMedico = !!row.esDescansoMedico;
            const isFalta = !row.horaIngreso && !isFeriado && !isVacaciones && !isDescansoMedico;

            let estado = "Puntual";
            if (isVacaciones) estado = "Vacaciones";
            else if (isFeriado) estado = `Feriado (${row.esFeriado})`;
            else if (isDescansoMedico) estado = "Descanso Medico";
            else if (isFalta) estado = "Inasistencia";
            else if (row.esTardanza) estado = "Tardanza";

            return [
                format(parseISO(row.fecha), 'EEEE dd/MM/yyyy', { locale: es }),
                row.horaIngreso || (isFeriado || isVacaciones || isDescansoMedico ? "--:--" : "No Marcó"),
                row.horaSalida || "--:--",
                estado,
                row.esJustificado ? (row.detalleJustificacion || "Justificado") : ""
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mi Asistencia");

        // Ajustar anchos
        worksheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 25 }];

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(excelBlob, `Mi_Asistencia_${staffData?.nombre || user?.usuario}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const stats = useMemo(() => {
        const total = processedRegistros.length;
        const faltas = processedRegistros.filter(r => !r.horaIngreso && !r.esFeriado && !r.esVacaciones && !r.esDescansoMedico).length;
        const tardanzas = processedRegistros.filter(r => r.esTardanza).length;
        const feriados = processedRegistros.filter(r => r.esFeriado).length;
        const vacsCount = processedRegistros.filter(r => r.esVacaciones).length;
        const dmsCount = processedRegistros.filter(r => r.esDescansoMedico).length;
        const asistencias = processedRegistros.filter(r => r.horaIngreso).length;

        return { total, faltas, asistencias, feriados, vacsCount, dmsCount, tardanzas };
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
                    <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                            Horario Base: {horarioConfig.entrada} (Tolerancia: +0 min)
                        </Badge>
                        {esSupervisorInterno && (
                            <Badge className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                Supervisor Interno
                            </Badge>
                        )}
                    </div>
                </div>

                <Button
                    onClick={handleExportExcel}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 h-10 px-4 rounded-xl shadow-md transition-all"
                >
                    <Download className="h-4 w-4" />
                    Exportar Excel
                </Button>
            </div>

            {error && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Cards de Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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

                <Card className="hover:shadow-lg transition-all border-l-4 border-l-teal-500 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Desc. Medico</p>
                                <h3 className="text-2xl font-bold text-teal-600">{stats.dmsCount}</h3>
                            </div>
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                                <Clock className="h-5 w-5 text-teal-600" />
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
                                    <TableHead className="font-bold text-center">Justificación</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedRegistros.length > 0 ? (
                                    processedRegistros.map((row, idx) => {
                                        const isVacaciones = !!row.esVacaciones;
                                        const isFeriado = !!row.esFeriado;
                                        const isDescansoMedico = !!row.esDescansoMedico;
                                        const isFalta = !row.horaIngreso && !isFeriado && !isVacaciones && !isDescansoMedico;
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
                                                    {isDescansoMedico && (
                                                        <span className="block text-[10px] text-green-700 font-bold uppercase mt-0.5">
                                                            Descanso Medico
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className={
                                                    isFalta
                                                        ? "text-red-400 italic"
                                                        : row.horaIngreso
                                                            ? (() => {
                                                                const horaMatch = row.horaIngreso?.match(/(\d{2}:\d{2})/);
                                                                if (!horaMatch) return "text-emerald-600 font-semibold";
                                                                const [h, m] = horaMatch[1].split(':').map(Number);
                                                                const [baseH, baseM] = horarioConfig.entrada.split(':').map(Number);
                                                                const minsIngreso = h * 60 + m;
                                                                const minsBase = baseH * 60 + baseM;
                                                                const minsTarde = minsIngreso - minsBase;
                                                                if (minsTarde <= 0) return "text-emerald-600 font-semibold";
                                                                return minsTarde > 15
                                                                    ? "text-red-600 font-semibold"
                                                                    : "text-amber-600 font-semibold";
                                                            })()
                                                            : "text-foreground"
                                                }>
                                                    {row.horaIngreso || (isFeriado || isVacaciones || isDescansoMedico ? "--:--" : "No Marcó")}
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
                                                                : isDescansoMedico
                                                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-sm"
                                                                    : isFalta
                                                                        ? "bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-sm"
                                                                        : row.esTardanza
                                                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-sm"
                                                                            : "bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-sm"
                                                    }>

                                                        {isVacaciones ? "Vacaciones" : isFeriado ? "Feriado" : isDescansoMedico ? "Descanso Medico" : isFalta ? "Inasistencia" : row.esTardanza ? "Tardanza" : "Puntual"}

                                                    </Badge >
                                                </TableCell >
                                                <TableCell className="text-center">
                                                    {row.esJustificado ? (
                                                        <Badge className="bg-blue-100 text-blue-700 border-none" title={row.detalleJustificacion}>
                                                            {row.detalleJustificacion || "Justificado"}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow >
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            No se encontraron registros en días laborables.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody >
                        </Table >
                    </div >
                </CardContent >
            </Card >
        </div >
    );
};

export default ReporteAsistenciaStaff;




