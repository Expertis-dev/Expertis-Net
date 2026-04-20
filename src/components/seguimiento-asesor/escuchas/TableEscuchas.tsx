import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CheckCircle2, Clock, LayoutGrid, List } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Filters } from "./Filtro";
import { useUser } from "@/Provider/UserProvider";

interface Props {
    filters: Filters
}

export interface ReporteEscucha {
    id_reporte_escucha: number;
    fecha:              string;
    agencia:            string;
    supervisor:         string;
    min_num:            number;
    num_realizado:      number;
    escucha:            Escucha[];
}

export interface Escucha {
    turno:           string;
    asesor:          string;
    hora_fin:        string;
    formulario:      Formulario[];
    id_escucha:      number;
    link_audio:      string;
    fecha_audio:     Date;
    hora_inicio:     string;
    duracion_audio:  string;
    tiempo_duracion: number;
    campana?:        string;
    estado?:         string;
    score?:          string | number;
    color?:          string;
}

export type RawEscucha = Partial<Escucha> & {
    id?: number;
    turno_real?: string;
    nombre?: string;
    supervisor?: string;
    fecha_audio?: Date | string;
};

export interface Formulario {
    criterio:  string;
    respuesta: string;
}

interface EscuchaDetail {
    id: string;
    name: string;
    date: string;
    turno: string;
    supervisor: string;
    startTime: string;
    endTime: string;
    duracionAudio: string;
}

interface EscuchaLog {
    id: string;
    date: string;
    dateIso: string;
    registros: number;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    status: string;
    details: EscuchaDetail[];
}



const normalizeDate = (value: string, endOfDay = false) => {
  if (!value) return null;

  const parsedDate = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.getTime();
};

const fetchDetalleReporteEscucha = async (user: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/detalle-reporte-escuchas/${user}`);
    const result = await response.json();
    return result?.data ?? result;
}

interface RawReporteEscucha {
  id_reporte_escucha?: number;
  id?: number;
  id_rep?: number;
  fecha?: string;
  agencia?: string;
  supervisor?: string;
  min_num?: number;
  num_realizado?: number;
  num_esperado?: number;
  realizadas?: number;
  escucha?: RawEscucha[];
}

const mapReporteEscuchaToLogs = (reports: RawReporteEscucha[]): EscuchaLog[] => {
  return reports.map((report) => {
    const fechaIso = report.fecha
      ? new Date(report.fecha).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const date = report.fecha
      ? new Date(report.fecha).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC"
        })
      : new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC"
        });
    const details: EscuchaDetail[] = (
        Array.isArray(report.escucha) ? report.escucha : []
    ).map((item: RawEscucha) => {
        const audioDate = item.fecha_audio
            ? typeof item.fecha_audio === "string"
                ? new Date(item.fecha_audio).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                  })
                : item.fecha_audio.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                  })
            : date;
        

        return {
            id: String(
                item.id_escucha ??
                    item.id ??
                    `${report.id_reporte_escucha ?? report.id}_${item.asesor ?? "unknown"}`,
            ),
            name: item.asesor ?? item.nombre ?? "Asesor desconocido",
            date: audioDate,
            turno: item.turno ?? item.turno_real ?? "N/A",
            supervisor: item.supervisor ?? report.supervisor ?? "N/A",
            startTime: item.hora_inicio ?? "--:--",
            endTime: item.hora_fin ?? "--:--",
            duracionAudio: item.duracion_audio
                ? String(item.duracion_audio)
                : item.tiempo_duracion || item.tiempo_duracion === 0
                  ? `${Math.floor(item.tiempo_duracion / 60)}m ${String(item.tiempo_duracion % 60).padStart(2, "0")}s`
                  : "N/A",
        };
    });

    return {
      id: String(report.id_reporte_escucha ?? report.id ?? report.id_rep ?? fechaIso),
      date,
      dateIso: fechaIso,
      registros: details.length,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: `${report.num_realizado ?? report.realizadas ?? details.length}/${report.min_num ?? report.num_esperado ?? details.length} Realizados`,
      details,
    };
  });
}

export const TableEscuchas = ({filters}: Props) => {
    const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [logs, setLogs] = useState<EscuchaLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const {user} = useUser()

    const searchValue = filters.searchTerm.trim().toLowerCase();
    const startDate = normalizeDate(filters.startDate);
    const endDate = normalizeDate(filters.endDate, true);

    useEffect(() => {
        if (!user?.usuario) return;

        let mounted = true;
        setIsLoading(true);

        fetchDetalleReporteEscucha(user.usuario)
            .then((raw) => {
                if (!mounted) return;
                const reports = Array.isArray(raw) ? raw : [raw];
                const mapped = mapReporteEscuchaToLogs(reports);
                setLogs(mapped);
                // setExpandedRows(mapped.map((log, i, arr) => i === arr.length - 1 ? log.id : ""));
            })
            .catch((error) => {
                console.error("Error al cargar escuchas:", error);
                if (mounted) setLogs([]);
            })
            .finally(() => {
                if (mounted) setIsLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [user?.usuario]);

    const filteredLogs = logs.map((log) => {
        const logDate = normalizeDate(log.dateIso || log.date);
        const matchesStartDate =
            startDate === null || (logDate !== null && logDate >= startDate);
        const matchesEndDate =
            endDate === null || (logDate !== null && logDate <= endDate);

        if (!matchesStartDate || !matchesEndDate) {
            return { ...log, details: [] };
        }

        const matchingDetails = log.details.filter((detail) => {
            if (!searchValue) return true;

            return (
                detail.name.toLowerCase().includes(searchValue) ||
                detail.turno.toLowerCase().includes(searchValue) ||
                detail.supervisor.toLowerCase().includes(searchValue)
            );
        });

        return {
            ...log,
            registros: matchingDetails.length,
            details: matchingDetails,
        };
    }).filter((log) => log.details.length > 0);

    const totalFilteredRecords = filteredLogs.reduce(
        (accumulator, log) => accumulator + log.details.length,
        0,
    );

    const toggleRow = (rowId: string) => {
        setExpandedRows((currentRows) =>
            currentRows.includes(rowId)
                ? currentRows.filter((id) => id !== rowId)
                : [...currentRows, rowId],
        );
    };
    return (
        <section className="bg-card rounded-2xl shadow-sm border border-border p-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Historial de Escuchas
                </h3>

                <div className="flex items-center gap-3">
                    <div className="bg-muted p-0.5 rounded-lg flex items-center">
                        <button
                            onClick={() => setDisplayMode("grid")}
                            className={`p-1.5 rounded-md transition-all ${displayMode === "grid" ? "bg-background shadow-xs text-primary" : "text-muted-foreground"}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setDisplayMode("list")}
                            className={`p-1.5 rounded-md transition-all ${displayMode === "list" ? "bg-background shadow-xs text-primary" : "text-muted-foreground"}`}
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 sidebar-scroll">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-muted-foreground">Cargando historial...</p>
                    </div>
                ) : totalFilteredRecords > 0 ? (
                    displayMode === "grid" ? (
                        filteredLogs.reverse().map((log) => (
                            <div
                                key={log.id}
                                className={`group border border-border rounded-xl overflow-hidden transition-all ${expandedRows.includes(log.id) ? "bg-muted/10" : ""}`}
                            >
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer select-none"
                                    onClick={() => toggleRow(log.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.bgColor} ${log.color}`}
                                        >
                                            {log.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-none">
                                                {log.date}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                {log.registros} registros
                                            </p>
                                        </div>
                                    </div>

                                    <motion.div
                                        animate={{
                                            rotate: expandedRows.includes(
                                                log.id,
                                            )
                                                ? 180
                                                : 0,
                                        }}
                                    >
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {expandedRows.includes(log.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-background/50 border-t border-border"
                                        >
                                            <div className="p-3 overflow-x-auto">
                                                <table className="w-full text-left min-w-[720px]">
                                                    <thead>
                                                        <tr className="text-[9px] text-muted-foreground uppercase font-black tracking-widest border-b border-border">
                                                            <th className="pb-2 px-2">
                                                                Asesor
                                                            </th>
                                                            <th className="pb-2 px-2">
                                                                Fecha Audio
                                                            </th>
                                                            <th className="pb-2 px-2">
                                                                Turno
                                                            </th>
                                                            <th className="pb-2 px-2">
                                                                Supervisor
                                                            </th>
                                                            <th className="pb-2 px-2">
                                                                H. Inicio
                                                            </th>
                                                            <th className="pb-2 px-2">
                                                                H. Fin
                                                            </th>
                                                            <th className="pb-2 px-2">
                                                                Duración
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-[12px]">
                                                        {log.details.map(
                                                            (item) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="hover:bg-muted/30 transition-colors"
                                                                >
                                                                    <td className="py-2 px-2 font-semibold text-primary">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-2 text-muted-foreground">
                                                                        {
                                                                            item.date
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-2 text-muted-foreground">
                                                                        {
                                                                            item.turno
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-2 text-muted-foreground">
                                                                        {
                                                                            item.supervisor
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-2 text-muted-foreground font-mono">
                                                                        {
                                                                            item.startTime
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-2 text-muted-foreground font-mono">
                                                                        {
                                                                            item.endTime
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-2 text-muted-foreground font-mono">
                                                                        {
                                                                            item.duracionAudio
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[840px]">
                                <thead>
                                    <tr className="text-[10px] uppercase text-muted-foreground border-b border-border">
                                        <th className="py-2 px-2 font-black">
                                            Fecha
                                        </th>
                                        <th className="py-2 px-2 font-black">
                                            Asesor
                                        </th>
                                        <th className="py-2 px-2 font-black">
                                            Turno
                                        </th>
                                        <th className="py-2 px-2 font-black">
                                            Supervisor
                                        </th>
                                        <th className="py-2 px-2 font-black">
                                            Inicio
                                        </th>
                                        <th className="py-2 px-2 font-black">
                                            Fin
                                        </th>
                                        <th className="py-2 px-2 font-black">
                                            Duración
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredLogs.flatMap((log) =>
                                        log.details.map((detail) => (
                                            <tr
                                                key={detail.id}
                                                className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="py-3 px-2 font-semibold">
                                                    {log.date}
                                                </td>
                                                <td className="py-3 px-2 text-primary font-semibold">
                                                    {detail.name}
                                                </td>
                                                <td className="py-3 px-2 text-muted-foreground">
                                                    {detail.turno}
                                                </td>
                                                <td className="py-3 px-2 text-muted-foreground">
                                                    {detail.supervisor}
                                                </td>
                                                <td className="py-3 px-2 font-mono text-muted-foreground">
                                                    {detail.startTime}
                                                </td>
                                                <td className="py-3 px-2 font-mono text-muted-foreground">
                                                    {detail.endTime}
                                                </td>
                                                <td className="py-3 px-2 text-muted-foreground font-mono">
                                                    {detail.duracionAudio}
                                                </td>
                                            </tr>
                                        )),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                        <Clock className="w-8 h-8 text-muted-foreground/60" />
                        <p className="text-sm font-bold text-foreground">
                            No hay registros para esos filtros.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Ajusta la busqueda o el rango de fechas para ver las
                            escuchas estaticas.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};
