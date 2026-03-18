"use client"
import { Incidencia } from '@/types/Incidencias'
import { useUser } from '@/Provider/UserProvider'
import { AlertTriangleIcon, NotebookPen, ScrollIcon, TimerIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Colaborador } from '../alertaIncidencias/TableAlertaIncidencias'

interface Props {
    incidencias: Incidencia[]
    setSelectedAmo: (incidencia: Incidencia[]) => void
}
type IncidenciasGroupedEntry = [string, Incidencia[]]
type TipoIncidenciaResumen = "Falta" | "Tardanza"

const getLastFecha = (items: Incidencia[]) =>
    items.length > 0 ? items[items.length - 1].fecha : ""

const buildResumenRows = (alias: string, items: Incidencia[]) => {
    const faltas = items.filter((incidencia) => incidencia.esFalta === 1 && incidencia.hayJustificacion === 0)
    const tardanzas = items.filter(
        (incidencia) => incidencia.esTardanza === 1 && incidencia.hayJustificacion === 0
    )

    const rows: {
        alias: string
        tipo: TipoIncidenciaResumen
        count: number
        lastFecha: string
        items: Incidencia[]
    }[] = []

    if (faltas.length > 0) {
        rows.push({
            alias,
            tipo: "Falta",
            count: faltas.length,
            lastFecha: getLastFecha(faltas),
            items: faltas,
        })
    }

    if (tardanzas.length > 0) {
        rows.push({
            alias,
            tipo: "Tardanza",
            count: tardanzas.length,
            lastFecha: getLastFecha(tardanzas),
            items: tardanzas,
        })
    }

    return rows
}

const getNivelSancion = (tipo: TipoIncidenciaResumen, count: number) => {
    if (tipo === "Tardanza") {
        if (count <= 3) return { label: "Leve", className: "text-gray-400 dark:text-gray-400" }
        if (count <= 6) return { label: "Moderada", className: "text-orange-400 dark:text-orange-400" }
        return { label: "Grave", className: "text-red-400 dark:text-red-400" }
    }

    if (count <= 6) return { label: "Moderada", className: "text-orange-400 dark:text-orange-400" }
    return { label: "Grave", className: "text-red-400 dark:text-red-400" }
}

const getEstado = (tipo: TipoIncidenciaResumen, count: number) => {
    if (tipo === "Tardanza") {
        if (count <= 3) {
            return { label: "AMON. VERBAL", className: "bg-yellow-500/80 text-white rounded-xl dark:bg-yellow-500/40" }
        }
        if (count <= 6) {
            return { label: "AMON. ESCRITA", className: "bg-orange-500/80 text-white rounded-xl dark:bg-orange-500/40" }
        }
        return { label: "REV. CONTRATO", className: "bg-red-500/80 text-white rounded-xl dark:bg-red-500/40" }
    }

    if (count <= 3) {
        return { label: "AMON. ESCRITA", className: "bg-orange-500/80 text-white rounded-xl dark:bg-orange-500/40" }
    }
    return { label: "REV. CONTRATO", className: "bg-red-500/80 text-white rounded-xl dark:bg-red-500/40" }
}

export const CasosTable = ({ incidencias, setSelectedAmo }: Props) => {
    const { user } = useUser()
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([])

    const { incidenciasGroupedByAsesorEntries, resumen } = useMemo(() => {
        const filteredIncidencias = incidencias
            .filter(i => colaboradores.some((c) => c.usuario === i.alias))
            .map(v => ({ ...v, tipoIncidencia: v.hayJustificacion === 1 ? "JUSTIFICADO" : "DETECTADA" }));
        const incidenciasGroupedByAsesor = Object.groupBy(filteredIncidencias, (i) => i.alias)
        const entries = Object.entries(incidenciasGroupedByAsesor) as IncidenciasGroupedEntry[]

        const totalFaltas = filteredIncidencias.filter((v) => (v.esFalta === 1 && v.hayJustificacion !== 1)).length
        const totalTardanzas = filteredIncidencias.filter((v) => v.esTardanza === 1 && v.hayJustificacion !== 1).length

        const asesorCountByThreshold = (min: number, max?: number) => {
            return entries
                .map(([, items]) =>
                    items?.filter(
                        (v) => (v.esFalta === 1 && v.hayJustificacion !== 1) || (v.esTardanza === 1 && v.hayJustificacion === 0)
                    ).length || 0
                )
                .filter((count) => (max ? count >= min && count <= max : count >= min))
                .length
        }

        const resumen = {
            totalFaltas,
            totalTardanzas,
            totalRevisionContrato: asesorCountByThreshold(7),
            totalAmonEscrita: asesorCountByThreshold(4, 6),
        }

        return { incidenciasGroupedByAsesorEntries: entries, filteredIncidencias, resumen }
    }, [incidencias, colaboradores])

    useEffect(() => {
        const usuario = user?.usuario
        if (!usuario) return

        const fetchColab = async (aliasAsesor: string): Promise<Colaborador[]> => {
            const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/obtenerListaColaboradores`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ usuario: aliasAsesor })
            }).then(res => res.json())
            return data
        }

        fetchColab(usuario).then(setColaboradores)
    }, [user?.usuario])
    return (
        <>
            <div className="grid grid-cols-2 xl:grid-cols-4 auto-cols-max gap-5 mt-2">
                <div
                    className="flex flex-col border border-gray-200 p-6 rounded-3xl dark:border-gray-700 dark:bg-zinc-900"
                >
                    <div className="flex flex-row justify-between -mt-4 ">
                        <h3 className="font-light text-gray-600 self-center dark:text-gray-300">CANTIDAD FALTAS</h3>
                        <div className="bg-red-200 p-2 rounded-xl max-h-10.5 dark:bg-red-500/20">
                            <AlertTriangleIcon
                                className="self-center text-red-500 dark:text-red-300"
                            />
                        </div>
                    </div>
                    <div className="flex flex-row pb-3 gap-3">
                        <p className="text-4xl text-gray-900 dark:text-gray-100">
                            {
                                resumen.totalFaltas
                            }
                        </p>
                    </div>
                    <p className="font-extralight text-sm text-gray-700 dark:text-gray-300">Total</p>
                </div>
                <div
                    className="flex flex-col border border-gray-200 p-6 rounded-3xl dark:border-gray-700 dark:bg-zinc-900"
                >
                    <div className="flex flex-row justify-between -mt-4 ">
                        <h3 className="font-light text-gray-600 self-center dark:text-gray-300">CANTIDAD TARDANZAS</h3>
                        <div className="bg-orange-200 p-2 rounded-xl max-h-10.5 dark:bg-orange-500/20">
                            <TimerIcon
                                className="self-center text-orange-500 dark:text-orange-300"
                            />
                        </div>
                    </div>
                    <div className="flex flex-row pb-3 gap-3">
                        <p className="text-4xl text-gray-900 dark:text-gray-100">
                            {resumen.totalTardanzas}
                        </p>
                    </div>
                    <p className="font-extralight text-sm text-gray-700 dark:text-gray-300">Total</p>
                </div>
                <div
                    className="flex flex-col border border-gray-200 p-6 rounded-3xl dark:border-gray-700 dark:bg-zinc-900"
                >
                    <div className="flex flex-row justify-between -mt-4 ">
                        <h3 className="font-light text-gray-600 self-center dark:text-gray-300">Empleados con REVISION CONTRATO</h3>
                        <div className="bg-red-200 p-2 rounded-xl max-h-10.5 dark:bg-red-500/20">
                            <ScrollIcon
                                className="self-center text-red-500 dark:text-red-300"
                            />
                        </div>
                    </div>
                    <div className="flex flex-row pb-3 gap-3">
                        <p className="text-4xl text-gray-900 dark:text-gray-100">
                            {resumen.totalRevisionContrato}
                        </p>
                    </div>
                    <p className="font-extralight text-sm text-gray-700 dark:text-gray-300">Total</p>
                </div>
                <div
                    className="flex flex-col border border-gray-200 p-6 rounded-3xl dark:border-gray-700 dark:bg-zinc-900"
                >
                    <div className="flex flex-row justify-between -mt-4 ">
                        <h3 className="font-light text-gray-600 self-center dark:text-gray-300">Empleados con AMONESTACION ESCRITA</h3>
                        <div className="bg-orange-200 p-2 rounded-xl max-h-10.5 dark:bg-orange-500/20">
                            <NotebookPen
                                className="self-center text-orange-500 dark:text-orange-300"
                            />
                        </div>
                    </div>
                    <div className="flex flex-row pb-3 gap-3">
                        <p className="text-4xl text-gray-900 dark:text-gray-100">
                            {resumen.totalAmonEscrita}
                        </p>
                    </div>
                    <p className="font-extralight text-sm text-gray-700 dark:text-gray-300">Total</p>
                </div>

            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm mt-4 dark:border-gray-700 dark:bg-zinc-900">
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Listado de casos</h2>
                    {/* <div className="flex flex-wrap gap-3">
                        <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                            <FilterIcon className="h-4 w-4" />
                            Filtros
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                            <DownloadIcon className="h-4 w-4" />
                            Exportar
                        </button>
                    </div> */}
                </div>
                <div className="grid grid-cols-6 gap-2 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 justify-items-center dark:bg-zinc-950 dark:text-gray-400">
                    <p>Empleado</p>
                    <p>Fecha ultima incidencia</p>
                    <p>Ocurrencias</p>
                    <p>Nivel Sanción</p>
                    <p>Estado</p>
                    <p className="text-right">Acciones</p>
                </div>
                {
                    incidenciasGroupedByAsesorEntries
                        .flatMap(([alias, items]) => buildResumenRows(alias, items || []))
                        .map((row, i, arr) => {
                            const nivelSancion = getNivelSancion(row.tipo, row.count)
                            const estado = getEstado(row.tipo, row.count)
                            const badgeClass =
                                row.tipo === "Falta"
                                    ? "bg-red-200 text-red-700 dark:bg-red-400/20 dark:text-red-200"
                                    : "bg-orange-200 text-orange-700 dark:bg-orange-400/20 dark:text-orange-200"

                            return (
                                <div key={`${row.alias}_${row.tipo}`} className={`grid grid-cols-6 gap-2 px-6 py-1 text-sm text-gray-500 dark:text-gray-300 border-b hover:dark:bg-zinc-700 ${arr.length - 1 === i ? "rounded-b-2xl" : ""}`}>
                                    <div className="flex flex-col text-black dark:text-gray-100">
                                        <p className="font-semibold my-auto">
                                            {row.alias}
                                        </p>
                                    </div>
                                    <p className="self-center text-black dark:text-gray-100 justify-self-center">{row.lastFecha}</p>
                                    <div className="px-1 self-center flex justify-center gap-2 text-[12px] flex-row mx-auto">
                                        <p className={`py-1 px-2 rounded-xl justify-self-center ${badgeClass}`}>
                                            {row.count} {row.tipo === "Falta" ? "Falta" : "Tard."}
                                        </p>
                                    </div>
                                    <p className={`self-center justify-self-center ${nivelSancion.className}`}>
                                        {nivelSancion.label}
                                    </p>
                                    <div className="px-1 self-center justify-self-center text-[12px]">
                                        <p className={`py-1 px-2 ${estado.className}`}>
                                            {estado.label}
                                        </p>
                                    </div>
                                    <div
                                        onClick={() => setSelectedAmo(row.items)}
                                        className="cursor-pointer text-blue-500 hover:underline self-center dark:text-blue-300 justify-self-center "
                                    >
                                        Ver Detalle
                                    </div>
                                </div>
                            )
                        })
                }
            </div>
        </>
    )
}
