import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check, CheckCircle2, ClipboardCheck, Clock, LayoutGrid, List, MinusCircle, NotebookPen, X, Link, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Filters } from "./Filtro";
import { useUser } from "@/Provider/UserProvider";
import { ObservacionModal } from "./observacion/ObservacionModal";

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
    observacion?: string;
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
    link_audio?: Date | string;
    linkAudio?: string;
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
    link_audio: string;
    duracionAudio: string;
    formulario: Formulario[];
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
    observacion?: string;
}



const normalizeDate = (value: string, endOfDay = false) => {
  if (!value) return null;

  const parsedDate = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.getTime();
};

const fetchDetalleReporteEscucha = async (user: string, fechaInicio: string | null = null, fechaFin: string | null = null) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/detalle-reporte-escuchas/${user}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fechaInicio, fechaFin})
    });
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
  observacion?: string;
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
            link_audio: String(item.link_audio ?? item.linkAudio ?? ""),
            duracionAudio: item.duracion_audio
                ? String(item.duracion_audio)
                : item.tiempo_duracion || item.tiempo_duracion === 0
                  ? `${Math.floor(item.tiempo_duracion / 60)}m ${String(item.tiempo_duracion % 60).padStart(2, "0")}s`
                  : "N/A",
            formulario: Array.isArray(item.formulario) ? item.formulario : [],
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
      observacion: report.observacion ?? "",
    };
  });
}

export const TableEscuchas = ({filters}: Props) => {
    const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [logs, setLogs] = useState<EscuchaLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLogDetail, setSelectedLogDetail] = useState<EscuchaDetail | null>(null)

    const [observacionModal, setObservacionModal] = useState({
        isOpen: false,
        observacion: "",
        id_escucha: -1
    })

    const {user} = useUser()

    const searchValue = filters.searchTerm.trim().toLowerCase();
    const startDate = normalizeDate(filters.startDate);
    const endDate = normalizeDate(filters.endDate, true);

    useEffect(() => {
        if (!user?.usuario) return;

        let mounted = true;
        setIsLoading(true);

        fetchDetalleReporteEscucha(user.usuario, filters.startDate, filters.endDate)
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
    }, [user?.usuario, filters, observacionModal]);

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
                            <div key={log.id} className="flex flex-row gap-2">
                                <div
                                    className={`group border border-border rounded-xl overflow-hidden transition-all flex-10/12 ${expandedRows.includes(log.id) ? "bg-muted/10" : ""}`}
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
                                                                <th className="pb-2 px-2">Acción</th>
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
                                                                                item.startTime.split("T")[1].split(".")[0].slice(0,-3)
                                                                            }
                                                                        </td>
                                                                        <td className="py-2 px-2 text-muted-foreground font-mono">
                                                                            {
                                                                                item.endTime.split("T")[1].split(".")[0].slice(0,-3)
                                                                            }
                                                                        </td>
                                                                        <td className="py-2 px-2 text-muted-foreground font-mono">
                                                                            {Math.floor(+item.duracionAudio / 60)}:{+item.duracionAudio % 60 < 10 ? `0${+item.duracionAudio % 60}` : +item.duracionAudio % 60}
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                    setSelectedLogDetail(item);
                                                                                }}
                                                                                className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:scale-105 transition-all"
                                                                            >
                                                                                Detalle
                                                                            </button>
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
                                <div 
                                    className="content-center p-2 rounded-2xl border border-sky-400 dark:border-sky-700 flex-1/12 hover:bg-sky-400 dark:hover:bg-sky-700 hover:text-sky-100 text-sky-600 cursor-pointer max-h-16"
                                    onClick={() => {
                                        const parsedId = Number(log.id);
                                        setObservacionModal({
                                            isOpen: true,
                                            observacion: log.observacion ?? "",
                                            id_escucha: Number.isFinite(parsedId) ? parsedId : -1,
                                        });
                                    }}
                                >
                                    <NotebookPen className="mx-auto"/>
                                </div>
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
                                        <th className="py-2 px-2 font-black text-right">
                                            Acción
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
                                                    {detail.startTime.split("T")[1].split(".")[0].slice(0, -3)}
                                                </td>
                                                <td className="py-3 px-2 font-mono text-muted-foreground">
                                                    {detail.endTime.split("T")[1].split(".")[0].slice(0, -3)}
                                                </td>
                                                <td className="py-3 px-2 text-muted-foreground font-mono">
                                                    {Math.floor(+detail.duracionAudio / 60)}:{+detail.duracionAudio % 60 < 10 ? `0${+detail.duracionAudio % 60}` : +detail.duracionAudio % 60}
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    <button
                                                        onClick={() => setSelectedLogDetail(detail)}
                                                        className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold hover:scale-105 transition-all"
                                                    >
                                                        Detalle
                                                    </button>
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
            <AnimatePresence>
                {selectedLogDetail && (
                <>
                    <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedLogDetail(null)}
                    className="fixed inset-0 bg-background/20 z-[80] backdrop-blur-[1px]"
                    />
                    <motion.div
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl z-[90] overflow-hidden flex flex-col"
                    >
                    <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                        <div>
                        <h2 className="text-sm font-black flex items-center gap-2 uppercase">
                            <ClipboardCheck className="w-5 h-5 text-primary" />
                            Hoja de Evaluación
                        </h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase mt-0.5">Asesor: <span className="text-foreground">{selectedLogDetail.name}</span></p>
                        </div>
                        <button onClick={() => setSelectedLogDetail(null)} className="p-2.5 hover:bg-muted rounded-full">
                        <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="px-5 py-2 text-xs">
                        {selectedLogDetail.link_audio ? (
                            <>
                            <a
                                href={selectedLogDetail.link_audio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline break-all flex flex-row gap-2"
                                >
                                Abrir enlace del audio
                                <Link size={20}/>
                            </a>
                            </>
                        ) : (
                            <span className="text-muted-foreground">Sin link de audio</span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 sidebar-scroll">
                        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                        <h3 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Criterios de Sesión</h3>
                        <div className="space-y-4">
                            {(selectedLogDetail.formulario || []).map((item: Formulario, idx: number) => {
                            const isPositive: boolean = item.respuesta === 'SI'
                            const isNegative: boolean = item.respuesta === 'NO'
                            if (item.criterio === "detalle"){
                                return (
                                <div key={idx} className="space-y-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                                    <p className="text-[11px] font-bold leading-snug text-foreground/80 uppercase tracking-wide">{item.criterio}</p>
                                    <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2">
                                        <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                                            {item.respuesta || "Sin detalle registrado."}
                                        </p>
                                    </div>
                                </div>
                                )
                            }
                            return (
                                <div key={idx} className="space-y-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                                <div className="flex justify-between gap-4">
                                    <p className="text-[11px] font-bold leading-snug text-foreground/80">{item.criterio}</p>
                                    <div className="flex gap-1 shrink-0">
                                    {isPositive ? (
                                        <span className="p-1.5 bg-emerald-500 rounded-lg text-white self-center"><Check className="w-3 h-3" /></span>
                                    ) : isNegative ? (
                                        <span className="p-1.5 bg-red-500 rounded-lg text-white self-center"><XIcon className="w-3 h-3" /></span>
                                    ) : (
                                        <span className="p-1.5 bg-orange-500 rounded-lg text-white self-center"><MinusCircle className="w-3 h-3" /></span>
                                    )}
                                    </div>
                                </div>
                                </div>
                            )
                            })}
                        </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border">
                        <button onClick={() => setSelectedLogDetail(null)} className="w-full py-3 bg-primary text-primary-foreground font-black text-xs uppercase rounded-2xl hover:opacity-90 transition-all shadow-md">
                        Finalizar Revisión
                        </button>
                    </div>
                    </motion.div>
                </>
                )}
            </AnimatePresence>
            <ObservacionModal
                observacionModal={observacionModal}
                setObservacionModal={setObservacionModal}
            />
        </section>
    );
};



