import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronDown, Clock, LayoutGrid, List } from "lucide-react";
import React, { JSX, useState } from "react";
import { Filters } from "./Filtro";

interface Props {
    filters: Filters
}
type EscuchaDetail = {
  id: string;
  name: string;
  campaign: string;
  supervisor: string;
  startTime: string;
  endTime: string;
  score: string;
  status: string;
  color: string;
};

type EscuchaLog = {
  id: string;
  isoDate: string;
  date: string;
  registros: number;
  color: string;
  bgColor: string;
  icon: JSX.Element;
  details: EscuchaDetail[];
};


const STATIC_LOGS: EscuchaLog[] = [
  {
    id: "esc-2026-04-15",
    isoDate: "2026-04-15",
    date: "15 Abr 2026",
    registros: 2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    icon: <CheckCircle2 className="w-5 h-5" />,
    details: [
      {
        id: "esc-001",
        name: "Luis Ramos",
        campaign: "Claro Postpago",
        supervisor: "Ana Torres",
        startTime: "09:10",
        endTime: "09:32",
        score: "96%",
        status: "Aprobado",
        color: "text-emerald-700 bg-emerald-500/10",
      },
      {
        id: "esc-002",
        name: "Mariela Soto",
        campaign: "Portabilidad",
        supervisor: "Ana Torres",
        startTime: "11:05",
        endTime: "11:28",
        score: "91%",
        status: "Aprobado",
        color: "text-emerald-700 bg-emerald-500/10",
      },
    ],
  },
  {
    id: "esc-2026-04-12",
    isoDate: "2026-04-12",
    date: "12 Abr 2026",
    registros: 2,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    icon: <AlertCircle className="w-5 h-5" />,
    details: [
      {
        id: "esc-003",
        name: "Kevin Salas",
        campaign: "Renovaciones",
        supervisor: "Julio Perez",
        startTime: "15:00",
        endTime: "15:21",
        score: "78%",
        status: "Observado",
        color: "text-amber-700 bg-amber-500/10",
      },
      {
        id: "esc-004",
        name: "Rosa Medina",
        campaign: "Prepago",
        supervisor: "Julio Perez",
        startTime: "16:40",
        endTime: "17:02",
        score: "88%",
        status: "En mejora",
        color: "text-sky-700 bg-sky-500/10",
      },
    ],
  },
];

const normalizeDate = (value: string, endOfDay = false) => {
  if (!value) return null;

  const parsedDate = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.getTime();
};
export const TableEscuchas = ({filters}: Props) => {
    const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
    const [expandedRows, setExpandedRows] = useState<string[]>(
        STATIC_LOGS.map((log) => log.id),
    );

    const searchValue = filters.searchTerm.trim().toLowerCase();
    const startDate = normalizeDate(filters.startDate);
    const endDate = normalizeDate(filters.endDate, true);

    const filteredLogs = STATIC_LOGS.map((log) => {
        const logDate = normalizeDate(log.isoDate);
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
                detail.campaign.toLowerCase().includes(searchValue) ||
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
                {totalFilteredRecords > 0 ? (
                    displayMode === "grid" ? (
                        filteredLogs.map((log) => (
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
                                                                Campana
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
                                                                Puntaje
                                                            </th>
                                                            <th className="pb-2 px-2">
                                                                Estado
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
                                                                            item.campaign
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
                                                                    <td className="py-2 px-2 font-bold">
                                                                        {
                                                                            item.score
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-2">
                                                                        <span
                                                                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.color}`}
                                                                        >
                                                                            {
                                                                                item.status
                                                                            }
                                                                        </span>
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
                                            Campana
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
                                            Puntaje
                                        </th>
                                        <th className="py-2 px-2 font-black">
                                            Estado
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
                                                    {detail.campaign}
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
                                                <td className="py-3 px-2 font-bold">
                                                    {detail.score}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${detail.color}`}
                                                    >
                                                        {detail.status}
                                                    </span>
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
