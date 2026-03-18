import { Incidencia } from '@/app/dashboard/amonestaciones/alertaIncidencias/page';
import { AlertTriangleIcon, ArrowLeft, ChartNoAxesCombinedIcon, EyeIcon, Gavel, LucideCalendarDays, TimerOffIcon } from 'lucide-react';
import React, { useState } from 'react'
import { DetailIncidenciaModal } from '../alertaIncidencias/detail-modal';

interface Props {
    selectedAmo: Incidencia[],
    setSelectedAmo: (incidencia: Incidencia[]) => void
}

const getFechaToDate = (fecha: string) => {
    const [dia, mes, anio] = fecha.split("-")
    const parsed = new Date()
    parsed.setDate(Number(dia))
    parsed.setMonth(Number(mes) - 1)
    parsed.setFullYear(Number(anio))
    return parsed
}

const getTipoAmonestacion = (items: Incidencia[]) => {
    if (items.some((inc) => inc.esFalta === 1)) return "FALTA"
    if (items.some((inc) => inc.esTardanza === 1)) return "TARDANZA"
    return "INCIDENCIA"
}

const getLimit = (tipo: string) => (tipo === "TARDANZA" ? 7 : 6)

const formatFechaCorta = (fecha: string) => {
    const date = getFechaToDate(fecha)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
}

export const DetalleIncidencia = ({ selectedAmo, setSelectedAmo }: Props) => {
    if (!selectedAmo || selectedAmo.length === 0) return null

    const total = selectedAmo.length
    const first = selectedAmo[0]
    const tipoAmonestacion = getTipoAmonestacion(selectedAmo)
    const limit = getLimit(tipoAmonestacion)
    const percent = Math.min(100, Math.round((total / limit) * 100))
    const justificadas = selectedAmo.filter((inc) => inc.hayJustificacion === 1).length
    const injustificadas = total - justificadas
    const lastFecha = formatFechaCorta(selectedAmo[selectedAmo.length - 1].fecha)
    const mesRevision = getFechaToDate(first.fecha).toLocaleDateString("es-ES", { month: "long", year: "numeric" })

    const [incidenciaModalOpen, setIncidenciaModalOpen] = useState<{isOpen: boolean, incidencia: Incidencia | null}>({
        isOpen: false,
        incidencia: null,
    })

    return (
        <>
            <p className='flex flex-row cursor-pointer text-sm mb-2' onClick={() => setSelectedAmo([])}>
                <ArrowLeft size={15} className='self-center'/>
                    Volver
            </p>
            <div className="flex flex-col border border-gray-200 rounded-xl p-3 dark:border-gray-700 dark:bg-zinc-900">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{first.alias}</h1>
                <p className="text-gray-500 dark:text-gray-400">Agencia: {first.agencia}</p>
            </div>
            <div className="grid grid-cols-3 grid-rows-4 gap-5 mt-5 items-stretch">
                <div className="row-span-1 h-full">
                    <div className="flex flex-col rounded-xl border border-gray-200 p-4 h-full dark:border-gray-700 dark:bg-zinc-900">
                        <h2 className="font-light text-sm text-gray-600 dark:text-gray-300">TOTAL AMONESTACIONES</h2>
                        <p className="font-bold text-4xl my-3 text-gray-900 dark:text-gray-100">{total}</p>
                        <p className="text-gray-400 font-light mb-2 dark:text-gray-400">Acumuladas este mes</p>
                    </div>
                </div>
                <div className="row-span-1 h-full bg-radial ">
                    <div className="flex flex-col bg-linear-to-r from-white from-60% to-orange-600/10 to-100%  rounded-xl border border-gray-200 p-4 h-full dark:border-gray-700 dark:from-zinc-900 dark:to-orange-500/10">
                        <div className="flex flex-row">
                            <AlertTriangleIcon className="text-orange-600" />
                            <h2 className="ml-2 font-light text-sm self-center text-gray-700 dark:text-gray-200">TIPO AMONESTACION</h2>
                        </div>
                        <p className="font-semibold text-4xl mt-6 text-orange-600">{tipoAmonestacion}</p>
                    </div>
                </div>
                <div className="row-span-1 h-full">
                    <div className="flex flex-col rounded-xl border border-gray-200 p-4 h-full dark:border-gray-700 dark:bg-zinc-900">
                        <div className="flex flex-row">
                            <LucideCalendarDays className="text-blue-600" />
                            <h2 className="ml-2 font-light text-sm self-center text-gray-700 dark:text-gray-200">MES DE REVISIÓN</h2>
                        </div>
                        <p className="font-semibold text-3xl my-3 text-gray-900 dark:text-gray-100">{mesRevision}</p>
                    </div>
                </div>
                <div className="row-span-3 col-span- p-5 border rounded-xl border-gray-200 dark:border-gray-700 dark:bg-zinc-900">
                    <div className="flex flex-row gap-2 mb-6">
                        <ChartNoAxesCombinedIcon className="text-blue-600" />
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Progreso de Sanciones</h2>
                    </div>
                    <div className="rounded-full border-10 border-orange-600 w-35 h-35 justify-self-center mt-15">
                        <div className="flex flex-col items-center my-4 mt-8">
                            <h2 className="text-3xl font-bold ">
                                {total} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{limit}</span>
                            </h2>
                            <p className="text-gray-500 text-xs dark:text-gray-400">INCIDENTES</p>
                        </div>
                    </div>
                    <p className="text-base text-gray-700 text-center my-4 w-40 mx-auto dark:text-gray-300">
                        Haz alcanzado el <span className="text-red-600 font-semibold">{percent}%</span> del limite de tolerancia para rescision contractual
                    </p>
                    <div className="flex flex-col mb-4">
                        <div className="flex flex-row justify-between text-sm">
                            <p className="text-gray-800 dark:text-gray-200">{tipoAmonestacion} Injustificadas</p>
                            <p>{injustificadas}/{limit}</p>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full dark:bg-zinc-800">
                            <div className="bg-orange-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((injustificadas / limit) * 100))}%` }} />
                        </div>
                    </div>
                    <div className="flex flex-col mb-4">
                        <div className="flex flex-row justify-between text-sm">
                            <p className="text-gray-800 dark:text-gray-200">{tipoAmonestacion} Justificadas</p>
                            <p>{justificadas}</p>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full dark:bg-zinc-800">
                            <div className="bg-green-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((justificadas / limit) * 100))}%` }} />
                        </div>
                    </div>
                </div>
                <div className="row-span-3 col-span-2 border rounded-2xl p-5 flex flex-col h-full dark:border-gray-700 dark:bg-zinc-900">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Historial de incidentes</h2>
                    <div className="mt-3 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] place-items-center gap-3 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 text-center dark:bg-zinc-950 dark:text-gray-400">
                        <p>Tipo incidente</p>
                        <p>Fecha</p>
                        <p>Minutos</p>
                        <p>Registrado por</p>
                        <p>Accion</p>
                    </div>
                    {selectedAmo.map((incidencia, index) => {
                        const esFalta = incidencia.esFalta === 1
                        const minutos = incidencia.minutosTardanza
                        return (
                            <div key={`${incidencia.alias}_${incidencia.fecha}_${index}`} className="mt-2 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] place-items-center gap-3 px-3 py-2 text-sm text-center">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center justify-center rounded-sm p-1 ${esFalta ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300" : "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"}`}>
                                        {esFalta ? <Gavel /> : <TimerOffIcon />}
                                    </span>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{esFalta ? "Falta" : "Tardanza"}</p>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">{formatFechaCorta(incidencia.fecha)}</p>
                                <div className="inline-flex items-center gap-1 rounded-full bg-yellow-200 px-2 py-0.5 w-fit whitespace-nowrap justify-self-center dark:bg-yellow-400/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 dark:bg-yellow-300"></span>
                                    <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-200">{minutos ? `${minutos} min` : "-"}</span>
                                </div>
                                <p className="text-gray-700 justify-self-center dark:text-gray-200">{incidencia.alias}</p>
                                <div className="flex justify-center justify-self-center cursor-pointer">
                                    <EyeIcon 
                                        onClick={() => setIncidenciaModalOpen({incidencia: incidencia, isOpen: true})}
                                        className="text-gray-500 dark:text-gray-300" 
                                    />
                                </div>
                                <DetailIncidenciaModal
                                    incidencia={incidenciaModalOpen.incidencia}
                                    isOpen={incidenciaModalOpen.isOpen}
                                    onClose={() => setIncidenciaModalOpen({incidencia: null, isOpen: false})}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}
