import { FormValues } from '@/app/dashboard/asistencia/ReporteCallMensual/ReporteCallMensualPage';
import { Calendar, ChevronDown } from 'lucide-react'
import React from 'react'
import { UseFormRegister } from 'react-hook-form';

interface Props {
    limpiarFiltros: () => void;
    register: UseFormRegister<FormValues>;
    downloadExcel: () => void;
}

export const Header = ({limpiarFiltros, register, downloadExcel}: Props) => {
    const now = new Date()
    const maxDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    return (
        <div className="flex flex-col gap-4">
            {/* Filtro por agencia, fechas, asesor */}
            <div className="rounded-xl bg-white px-4 py-4 sm:px-5 dark:bg-slate-800">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">
                                Reporte Asistencia Call
                            </h1>
                        </div>
                        <span className="flex-1" />
                        <button
                            className="text-xs sm:ml-auto bg-slate-100 text-slate-700 hover:bg-slate-200 hover:cursor-pointer rounded-2xl p-2 transition dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-950"
                            onClick={limpiarFiltros}
                        >
                            Limpiar Filtros
                        </button>
                        <button
                            className="text-xs sm:ml-auto bg-green-100 text-slate-700 hover:bg-green-200 hover:cursor-pointer rounded-2xl p-2 transition dark:bg-slate-700 dark:text-green-100 dark:hover:bg-green-950"
                            onClick={downloadExcel}
                        >
                            Exportar Excel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Asesor
                            </label>
                            <input
                                type="text"
                                {...register('asesor')}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-blue-400/60 dark:focus:ring-blue-400/30"
                                placeholder="Buscar por nombre de Asesor"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Agencia
                            </label>
                            <div className="relative">
                                <select
                                    id="agencia"
                                    {...register('agencia')}
                                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-blue-400/60 dark:focus:ring-blue-400/30"
                                >
                                    <option value="TODOS">Todos</option>
                                    <option value="EXPERTIS">EXPERTIS</option>
                                    <option value="EXPERTIS BPO">EXPERTIS BPO</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                {...register('fechaInicio')}
                                max={maxDate}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-blue-400/60 dark:focus:ring-blue-400/30"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                {...register('fechaFin')}
                                max={maxDate}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-blue-400/60 dark:focus:ring-blue-400/30"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
