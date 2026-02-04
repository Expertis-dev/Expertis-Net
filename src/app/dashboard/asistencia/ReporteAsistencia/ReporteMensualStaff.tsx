"use client"
// Componente de Reporte Mensual de Asistencia para el Staff
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isToday, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { getFeriado } from "@/lib/holidays";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {

    Search,
    Download,
    RefreshCw,
    Umbrella,
    Clock,
    CalendarDays,
    LayoutGrid,
    TimerIcon,
    HomeIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmpleadoStaff } from '@/types/Empleado';
import { HomeOfficeFormModal } from '@/components/asistencia/reporteAsistencia/homeOfficeModal';
import { HomeOfficeResponse } from '@/types/HomeOffice';

// --- CONFIGURACIÓN DE GRUPOS ---
const GRUPOS_HORARIO = [
    { id: '6-3', label: 'Grupo 6am - 3pm', entrada: '06:00', salida: '15:00', tolerancia: 10 },
    { id: '7-5', label: 'Grupo 7am - 5pm', entrada: '07:00', salida: '17:00', tolerancia: 10 },
    { id: '8-5', label: 'Grupo 8am - 5pm', entrada: '08:00', salida: '17:00', tolerancia: 0 },
    { id: '9-6', label: 'Grupo 9am - 6pm', entrada: '09:00', salida: '18:00', tolerancia: 0 },
];

/**
 * ARCHIVO ESTÁTICO DE CONFIGURACIÓN DE EMPLEADOS POR GRUPO
 * Aquí puedes agregar o mover empleados entre grupos manualmente.
 */
const CONFIG_EMPLEADOS_ESTATICA: Record<string, string[]> = {
    '6-3': [
        "JAMES IZQUIERDO"
    ],
    '7-5': [
        "MELINA AYRE",
        "SANDY LOPEZ",
        "JORGE PALOMINO",
        "JOHAN MAYA",
        "KENNETH CUBA",
        "LEONOR NAVARRO",
        "JORGE VASQUEZ",
        "ROBERTO INZUA"
    ],
    '8-5': [
        "JOHN PULACHE",
        "ROBERT MAIGUIRI",
        "MAURO ADAUTO",
        "FIORELLA DIAZ",
    ],
    '9-6': [] // Se deja vacío ya que ahora es el grupo por defecto (fallback)
};

// --- TIPOS ---
interface TiemposDia {
    horaIngreso: string;
    horaSalida: string;
}

interface PersonalGlobal {
    Nombre: string;
    id: number;
    Area: string;
    tiempos: Record<string, TiemposDia | null>;
}

interface MatrixItem {
    horarioConfig: typeof GRUPOS_HORARIO[0];
    asistencias: Record<string, {
        type: string;
        label?: string;
        horaI?: string;
        horaS?: string;
        esTardanza?: boolean;
    }>;
}

interface VacacionItem {
    idEmpleado: number;
    estadoVacaciones: string;
    fecInicial: string;
    fecFinal: string;
    usrInsert: string;
}

interface DMItem {
    idEmpleado: number;
    fecha_inicio: string;
    fecha_fin: string;
}

interface ReporteProps {
    colaboradores: PersonalGlobal[];
}



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
    } catch {
        return [];
    }
};


const ReporteMensualStaff = ({ colaboradores }: ReporteProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(GRUPOS_HORARIO[3].id); // Default 9-6
    const [selectedArea, setSelectedArea] = useState<string>("TODAS");


    const [currentDate] = useState(new Date());
    const [vacacionesMap, setVacacionesMap] = useState<Record<string, string[]>>({});
    const [descansosMap, setDescansosMap] = useState<Record<string, string[]>>({});
    // HomeOffice: key => NOMBRE_UPPER, value => array of tiempos normalizados { fecha: 'yyyy-MM-dd', horaIngreso, horaSalida }
    const [homeOffice, setHomeOffice] = useState<Record<string, { fecha: string; horaIngreso: string | null; horaSalida: string | null }[]>>({})
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [empleado, setEmpleado] = useState<PersonalGlobal>()

    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const areasDisponibles = useMemo(() => {
        const areas = colaboradores.map(c => c.Area).filter(Boolean);
        return ["TODAS", ...new Set(areas)].sort();
    }, [colaboradores]);

    // Filtrar colaboradores que pertenecen al grupo actual según el archivo estático
    const colaboradoresDelGrupo = useMemo(() => {
        // Filtrar primero los que no tienen área y los que no tienen NINGÚN registro en todo el mes


        const conRegistrosYArea = colaboradores.filter(c => {
            const tieneArea = c.Area && c.Area.trim() !== "";
            // Verificamos si tiene al menos un marcado de ingreso válido en cualquier día del mes
            const tieneMarcadoPositivo = Object.values(c.tiempos).some(t =>
                t && t.horaIngreso && t.horaIngreso.trim() !== "" && t.horaIngreso !== "No marcó Ingreso"
            );

            const nombreUpper = (c.Nombre || "").toString().trim().toUpperCase();
            const enVacaciones = (vacacionesMap[nombreUpper] || []).length > 0;
            const enDescansoMedico = (descansosMap[nombreUpper] || []).length > 0;
            const enHomeOffice = (homeOffice[nombreUpper] || []).length > 0;

            return tieneArea && (tieneMarcadoPositivo || enVacaciones || enDescansoMedico || enHomeOffice);
        });

        if (selectedGroup === '9-6') {
            const nombresAsignados = Object.entries(CONFIG_EMPLEADOS_ESTATICA)
                .filter(([id]) => id !== '9-6')
                .flatMap(([, names]) => names.map(n => n.toUpperCase()));

            return conRegistrosYArea.filter((c: PersonalGlobal) => {
                const nombre = c.Nombre.toUpperCase();
                return !nombresAsignados.some((name: string) => nombre.includes(name));
            });
        }

        const nombresEnGrupo = CONFIG_EMPLEADOS_ESTATICA[selectedGroup] || [];
        return conRegistrosYArea.filter((c: PersonalGlobal) => {
            const nombre = c.Nombre.toUpperCase();
            return nombresEnGrupo.some((name: string) => nombre.includes(name.toUpperCase()));
        });
    }, [colaboradores, selectedGroup, vacacionesMap, descansosMap, homeOffice]);

    const fetchVacaciones = useCallback(async () => {
        if (!colaboradores || colaboradores.length === 0) return;

        try {

            //// Traer ids de usuario mediante nombre del empleado usando endpoint DONE
            const nombreEmpleado = colaboradores
                .map(c => c.Nombre)

            const idsEmpleados = await Promise.all(nombreEmpleado.map(async (c): Promise<number | undefined | string> => {
                try {
                    const id = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerIdEmpleadoPorAlias`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ asesor: c.trim() }),
                    })
                        .then(res => res.json())
                        .then(id => id.data[0].idEmpleado)
                    return id !== undefined ? id : c
                } catch {
                    return c;
                }
            }))
            const respVacaciones = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerVacacionesPorEmpleados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idEmpleados: idsEmpleados })
            });

            const empleadosStaffResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerEmpleadosStaff`)
            const empleadosStaffData: EmpleadoStaff[] = (await empleadosStaffResponse.json()).data;
            // TODO traer info de usuarios con id


            //// Verificar que se muestren los datos de vacaciones en la tabla

            if (respVacaciones.ok) {
                const json = await respVacaciones.json();
                const vMap: Record<string, string[]> = {};
                (json.data || []).forEach((vac: VacacionItem) => {
                    if (vac.estadoVacaciones?.trim().toUpperCase() === "APROBADO") {
                        //// FIXED: Nombre y usrInsert no deberian estar relacionados
                        const colabOwner = empleadosStaffData.find((c) => c.idEmpleado[0] === vac.idEmpleado);
                        if (colabOwner) {
                            const key = colabOwner.EMPLEADO.toUpperCase();
                            const dias = expandirRangoVacaciones(vac.fecInicial, vac.fecFinal, currentDate);
                            vMap[key] = [...new Set([...(vMap[key] || []), ...dias])];
                        }
                    }
                });
                setVacacionesMap(vMap);
            }



            // TODO traer descansos medicos

            try {
                const respDM = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerDMsPorEmpleados`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEmpleados: idsEmpleados })
                })
                const descansosMedicosData = await respDM.json()
                const listDM: [] = descansosMedicosData.data || [];
                const RecordDescansosMedicos: Record<string, string[]> = {};
                listDM.forEach((dm: DMItem) => {

                    const colabOwner = empleadosStaffData.find(c => c.idEmpleado[0] === dm.idEmpleado);
                    if (colabOwner) {
                        const aliasOwner = colabOwner.EMPLEADO || colabOwner.EMPLEADO;
                        const aliasKey = (aliasOwner || "").toString().trim().toUpperCase();

                        const dias = expandirRangoVacaciones(dm.fecha_inicio, dm.fecha_fin, currentDate);
                        if (!RecordDescansosMedicos[aliasKey]) RecordDescansosMedicos[aliasKey] = [];

                        RecordDescansosMedicos[aliasKey] = [...new Set([...RecordDescansosMedicos[aliasKey], ...dias])];
                    }
                })
                setDescansosMap(RecordDescansosMedicos)
            } catch {
                console.log("Fallo al traer los datos de Descansos médicos")
            }
            

        } catch (e) {
            console.error("Error fetching vacations:", e);
        }
    }, [colaboradores, currentDate]);

    const fetchHomeOffice = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerAsistenciaHomeOffice`)
            const json: HomeOfficeResponse = await res.json()
            const data = json.data
            const RecordHomeOffice: Record<string, { fecha: string; horaIngreso: string | null; horaSalida: string | null }[]> = {}
            data.forEach((em) => {
                const alias = (em.nombre || "").toString().trim().toUpperCase();
                if (!RecordHomeOffice[alias]) RecordHomeOffice[alias] = [];

                const normalized = (em.tiempos || []).map(t => {
                    // Extraer fecha directamente del string o parsear sin asumir UTC
                    // Si t.fecha es "2026-02-04" o "2026-02-04T...", extraer la parte yyyy-MM-dd
                    const fechaStr = t.fecha.split('T')[0]; // Obtiene "2026-02-04"
                    // Parsear en zona horaria local sin UTC
                    const [y, m, d] = fechaStr.split('-').map(Number);
                    const dateLocal = new Date(y, m - 1, d); // Crea fecha en zona local
                    return {
                        fecha: format(dateLocal, 'yyyy-MM-dd'),
                        horaIngreso: t.horaIngreso || null,
                        horaSalida: t.horaSalida || null,
                    };
                });

                // Merge unique by fecha
                const merged = [...(RecordHomeOffice[alias] || []), ...normalized];
                const uniqueByFecha: Record<string, { fecha: string; horaIngreso: string | null; horaSalida: string | null }> = {};
                merged.forEach(m => uniqueByFecha[m.fecha] = m);
                RecordHomeOffice[alias] = Object.values(uniqueByFecha);
            })

            setHomeOffice(RecordHomeOffice)
        } catch (error) {
            console.log("Fallo al traer los datos de HomeOffice", error)
        }
    }, [])

    useEffect(() => {
        // Solo ejecutar cuando el modal se cierra (pasamos de true a false)
        if (!isModalOpen) {
            setIsLoading(true);
            Promise.all([fetchHomeOffice(), fetchVacaciones()]).then(() => {
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        }
    }, [fetchVacaciones, fetchHomeOffice, isModalOpen]);


    const enrichedMatrix = useMemo(() => {
        const matrix: Record<string, MatrixItem> = {};
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const config = GRUPOS_HORARIO.find((g) => g.id === selectedGroup)!;
        colaboradoresDelGrupo.forEach((colab: PersonalGlobal) => {
            const nombreKey = colab.Nombre;
            const nombreUpper = (nombreKey || "").toString().trim().toUpperCase();
            matrix[nombreKey] = { horarioConfig: config, asistencias: {} };

            daysInMonth.forEach(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const diaNum = format(day, 'd'); // 1, 2, 3...
                const keyTiempos = `dia_${diaNum}`;

                const holidayName = getFeriado(dayStr);
                const weekend = isWeekend(day);

                // Vacaciones
                if ((vacacionesMap[nombreUpper] || []).includes(dayStr)) {
                    matrix[nombreKey].asistencias[dayStr] = { type: 'vacaciones', label: 'VAC' };
                    // return;
                }

                const descansosMedicos: string[] = descansosMap[nombreUpper] || [];

                if (descansosMedicos.includes(dayStr)) {
                    matrix[nombreKey].asistencias[dayStr] = {
                        type: "dm",
                        label: 'DM'
                    };
                    return;
                }

                // HomeOffice: si hay registro de HO para el día, mostrar como asistencia con horas
                const hoList = homeOffice[nombreUpper] || [];
                const hoForDay = hoList.find(h => h.fecha === dayStr);
                if (hoForDay) {
                    matrix[nombreKey].asistencias[dayStr] = {
                        type: "homeoffice",
                        horaI: hoForDay.horaIngreso || undefined,
                        horaS: hoForDay.horaSalida || undefined
                    };
                    return;
                }

                const record = colab.tiempos[keyTiempos];
                const hI = record?.horaIngreso || "";
                const hS = record?.horaSalida || "";

                if (hI && hI !== "No marcó Ingreso") {
                    const matchI = hI.match(/(\d{2}:\d{2})/);
                    if (matchI) {
                        const [h, m] = matchI[1].split(':').map(Number);
                        const [bH, bM] = config.entrada.split(':').map(Number);
                        const minsIngreso = h * 60 + m;
                        const minsLimite = bH * 60 + bM + config.tolerancia;
                        matrix[nombreKey].asistencias[dayStr] = {
                            type: 'asistencia',
                            horaI: matchI[1],
                            horaS: hS,
                            esTardanza: minsIngreso > minsLimite
                        };
                        return;
                    }
                }

                if (holidayName) {
                    matrix[nombreKey].asistencias[dayStr] = { type: 'feriado', label: 'FER' };
                } else if (!weekend && dayStr < todayStr) {
                    matrix[nombreKey].asistencias[dayStr] = { type: 'falta' };
                }
            });
        });
        return matrix;
    }, [colaboradoresDelGrupo, daysInMonth, vacacionesMap, descansosMap, homeOffice, selectedGroup]);

    const handleExportExcel = () => {
        const allValidColabs = colaboradores.filter(c => {
            const tieneArea = c.Area && c.Area.trim() !== "";
            const tieneMarcadoPositivo = Object.values(c.tiempos).some(t =>
                t && t.horaIngreso && t.horaIngreso.trim() !== "" && t.horaIngreso !== "No marcó Ingreso"
            );
            return tieneArea && tieneMarcadoPositivo;
        });

        const activeDays = daysInMonth.filter(day => format(day, 'i') !== '7');

        // Construcción de la matriz de datos para Excel (AOA - Array of Arrays)
        // Fila 1: Headers de días
        const row1 = ["Colaborador", "Área"];
        // Fila 2: Sub-headers (Ingreso/Salida)
        const row2 = ["", ""];

        activeDays.forEach(day => {
            row1.push(format(day, 'dd/MM'), ""); // El espacio vacío es para la fusión horizontal
            row2.push("Ingreso", "Salida");
        });

        const aoaData = [row1, row2];

        allValidColabs.forEach(colab => {
            const rowData = [colab.Nombre, colab.Area];
            activeDays.forEach(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const diaNum = format(day, 'd');
                const keyTiempos = `dia_${diaNum}`;
                const record = colab.tiempos[keyTiempos];

                const holiday = getFeriado(dayStr);
                const vacs = vacacionesMap[colab.Nombre.toUpperCase()] || [];
                const hos = homeOffice[colab.Nombre.toUpperCase()] || [];
                const hoForDay = hos.find(h => h.fecha === dayStr);

                let ingreso = "-";
                let salida = "-";

                if (vacs.includes(dayStr)) {
                    ingreso = "VAC";
                    salida = "VAC";
                } else if (hoForDay) {
                    ingreso = hoForDay.horaIngreso || "HOME";
                    salida = hoForDay.horaSalida || "HOME";
                } else if (holiday) {
                    ingreso = "FERIADO";
                    salida = "FERIADO";
                } else if (record?.horaIngreso && record.horaIngreso !== "No marcó Ingreso") {
                    ingreso = record.horaIngreso;
                    salida = record.horaSalida || "S/MARCADO";
                } else if (!isWeekend(day) && dayStr < format(new Date(), 'yyyy-MM-dd')) {
                    ingreso = "FALTA";
                    salida = "FALTA";
                }

                rowData.push(ingreso, salida);
            });
            aoaData.push(rowData);
        });

        if (aoaData.length <= 2) {
            alert("No hay datos para exportar.");
            return;
        }

        const worksheet = XLSX.utils.aoa_to_sheet(aoaData);

        // Configuración de las celdas combinadas (Merges)
        const merges: XLSX.Range[] = [
            { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Colaborador (Vertical)
            { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Área (Vertical)
        ];

        // Combinar cada día horizontalmente sobre sus columnas de Ingreso y Salida
        activeDays.forEach((_, idx) => {
            const colStart = 2 + (idx * 2);
            merges.push({
                s: { r: 0, c: colStart },
                e: { r: 0, c: colStart + 1 }
            });
        });

        worksheet['!merges'] = merges;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, `Reporte_Global_Staff_${format(currentDate, 'yyyy-MM', { locale: es })}.xlsx`);
    };

    const filteredColabs = useMemo(() => {
        return colaboradoresDelGrupo.filter((c: PersonalGlobal) => {
            const matchesSearch = c.Nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesArea = selectedArea === "TODAS" || c.Area === selectedArea;
            return matchesSearch && matchesArea;
        });
    }, [colaboradoresDelGrupo, searchTerm, selectedArea]);

    const onCLickTimerButton = (colab: PersonalGlobal) => {
        setIsModalOpen(true)
        setEmpleado(colab)
    }

    return (
        <div className="p-4 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            {/* Header Moderno */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-900 rounded-2xl shadow-lg shadow-blue-900/30">
                            <CalendarDays className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                REPORTE <span className="text-blue-900 dark:text-blue-400 uppercase">Mensual Staff</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                Control de Entradas y Salidas • {format(currentDate, 'MMMM yyyy', { locale: es })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Filtro por Área */}
                    <div className="relative flex-1 sm:min-w-[200px]">
                        <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-900/20 transition-all dark:text-slate-200 appearance-none cursor-pointer"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                        >
                            {areasDisponibles.map(area => (
                                <option key={area} value={area}>
                                    {area === "TODAS" ? "Todas las Áreas" : area}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1 sm:min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Buscar por nombre..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-900/20 transition-all dark:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-2xl h-11 w-11 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-900 dark:border-slate-800"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className={`h-4 w-4`} />
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        className="bg-blue-900 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-600 text-white rounded-2xl px-6 h-11 gap-2 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/20"
                    >
                        <Download className="h-4 w-4" />
                        Exportar Excel
                    </Button>
                </div>
            </div>

            {/* Selector de Grupos con Tabs */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 inline-flex w-full overflow-hidden">
                <Tabs value={selectedGroup} onValueChange={setSelectedGroup} className="w-full">
                    <TabsList className="w-full h-auto p-1 bg-transparent flex flex-wrap gap-1">
                        {GRUPOS_HORARIO.map(grupo => (
                            <TabsTrigger
                                key={grupo.id}
                                value={grupo.id}
                                className="flex-1 py-3 rounded-2xl data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/30 transition-all font-bold text-xs uppercase tracking-tighter"
                            >
                                <Clock className="h-4 w-4 mr-2 hidden sm:inline" />
                                {grupo.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Matriz Reporte */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <RefreshCw className="h-10 w-10 text-blue-900 animate-spin" />
                    <p className="text-slate-500 font-medium">Sincronizando registros mensuales...</p>
                </div>
            ) : (
            <Card className="rounded-none border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-0">
                    <div className="relative overflow-auto max-h-[70vh] scrollbar-thin dark:scrollbar-thumb-slate-800">
                        <Table className="border-collapse">
                            <TableHeader className="sticky top-0 z-40">
                                <TableRow className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-50 border-b dark:border-slate-800">
                                    <TableHead className="sticky left-0 z-50 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white min-w-[220px] py-6 font-black uppercase text-[10px] tracking-widest border-r border-slate-200 dark:border-slate-800">
                                        Colaborador
                                    </TableHead>
                                    {daysInMonth.map((day) => (
                                        <TableHead
                                            key={day.toString()}
                                            className={`min-w-[70px] text-center p-0 border-r border-slate-200 dark:border-slate-800 ${isWeekend(day) ? 'bg-slate-100/50 dark:bg-slate-800/50' : ''}`}
                                        >
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-white/40 space-y-0.5">
                                                <span className="text-[9px] font-bold uppercase">{format(day, 'EEE', { locale: es })}</span>
                                                <span className={`text-sm font-black ${isToday(day) ? 'text-blue-900 dark:text-blue-400' : 'text-slate-700 dark:text-white'}`}>{format(day, 'dd')}</span>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredColabs.length > 0 ? filteredColabs.map((colab) => {
                                    const personalName = colab.Nombre;
                                    const item = enrichedMatrix[personalName];

                                    if (!item) return null;

                                    return (
                                        <TableRow key={colab.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <TableCell className="sticky left-0 z-30 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-r dark:border-slate-800 py-4 shadow-[10px_0_15px_-5px_rgba(0,0,0,0.02)] transition-colors">
                                                <div className="flex flex-col ">
                                                    <div className='flex justify-between '>
                                                        <span className="text-sm font-bold pt-1.5 text-slate-800 dark:text-slate-200 truncate max-w-[200px] leading-tight mr-4">
                                                            {personalName}
                                                        </span>
                                                        <Button variant="secondary" size="icon" title='Click para agregar horas de HomeOffice' className='group flex bg-gray-300 hover:border-1 hover:border-gray-500 hover:bg-blue-800 hover:shadow-2xl hover:text-white dark:hover:text-black dark:hover:bg-gray-500 dark:bg-blue-900' onClick={() => onCLickTimerButton(colab)}><TimerIcon className='stroke-current' /></Button>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{colab.Area}</span>
                                                </div>
                                            </TableCell>

                                            {daysInMonth.map((day) => {
                                                const dayStr = format(day, 'yyyy-MM-dd');
                                                const record = item.asistencias[dayStr];
                                                const weekend = isWeekend(day);

                                                return (
                                                    <TableCell
                                                        key={`${colab.id}-${dayStr}`}
                                                        className={`p-0 border-r dark:border-slate-800 text-center relative h-16 ${weekend ? 'bg-slate-50/30 dark:bg-slate-800/10' : ''} ${record?.type === 'falta' ? 'bg-slate-200 dark:bg-slate-800/40' : ''}`}
                                                    >
                                                        {record?.type === 'asistencia' ? (
                                                            <div className="flex flex-col items-center justify-center gap-1 h-full px-1">
                                                                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-lg transition-colors ${record.esTardanza
                                                                    ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-sm dark:bg-transparent dark:border-transparent dark:shadow-none dark:text-rose-500'
                                                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm dark:bg-transparent dark:border-transparent dark:shadow-none dark:text-emerald-500'}`}>
                                                                    {record.horaI}
                                                                </span>
                                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">
                                                                    {record.horaS}
                                                                </span>
                                                            </div>
                                                        ) : record?.type === 'vacaciones' ? (
                                                            <div className="flex h-full px-1 py-1">
                                                                <div className="flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-900/20 rounded-xl w-full h-full border border-blue-100 dark:border-blue-900/50">
                                                                    <Umbrella className="h-3 w-3 text-blue-500 mb-0.5" />
                                                                    <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase">Vac</span>
                                                                </div>
                                                            </div>
                                                        ) : record?.type === 'homeoffice' ? (
                                                            <div className="flex flex-col items-center justify-center gap-1 h-full px-1">
                                                                <HomeIcon color='purple'/>
                                                                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 shadow-sm dark:bg-transparent dark:border-transparent dark:text-purple-400`}>
                                                                    {record.horaI || 'S/MARCADO'}
                                                                </span>
                                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">
                                                                    {record.horaS || ''}
                                                                </span>
                                                            </div>
                                                        ) : record?.type === 'feriado' ? (
                                                            <div className="flex flex-col items-center justify-center opacity-40 grayscale h-full">
                                                                <span className="text-[8px] font-black text-orange-600 dark:text-orange-400">FERIADO</span>
                                                            </div>
                                                        ) : record?.type === 'falta' ? (
                                                            <div className="h-full w-full bg-slate-200 dark:bg-slate-800/60" />
                                                        ) : record?.type === "dm" ? (
                                                            <div className="flex flex-col items-center bg-indigo-50 dark:bg-indigo-900/40 w-full h-full justify-center border-x border-indigo-100 dark:border-indigo-900">
                                                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 leading-none">DM ó</span>
                                                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 leading-none">LIC</span>
                                                            </div>
                                                        ) : !weekend && (
                                                            <div className="h-1 w-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" />
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={daysInMonth.length + 1} className="h-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                            No hay empleados asignados a este grupo en la configuración estática.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Card>
            )}
            <HomeOfficeFormModal isOpen={isModalOpen} onClose={ () => setIsModalOpen(false)} colab={empleado!}/>
        </div>
    );
};

export default ReporteMensualStaff;
